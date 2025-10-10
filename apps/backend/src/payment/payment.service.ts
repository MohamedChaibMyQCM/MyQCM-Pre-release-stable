import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ChargilyClient } from "@chargily/chargily-pay";
import { Request, Response } from "express";
import { CreatePaymentDto } from "./types/dtos/create-payment.dto";
import { PlanService } from "src/plan/plan.service";
import { verifySignature } from "@chargily/chargily-pay";
import { Payment } from "./entities/payment.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { getEnvOrFatal } from "common/utils/env.util";
import {
  ChargilyEventDataInterface,
  ChargilyEventInterface,
} from "./types/interfaces/chargily-event.interface";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import { UserSubscriptionService } from "src/user/services/user-subscription.service";
import { PaymentStatus } from "./types/enums/payment-status.enum";
import { UserSubscriptionSource } from "src/user/types/enums/user-subscription-source.enum";
import { DateUtils } from "common/utils/date.util";

/**
 * Service responsible for handling payment processing with Chargily Pay integration.
 * Manages payment checkouts, webhook events, and subscription updates.
 */
@Injectable()
export class PaymentService {
  private readonly api_secret_key = getEnvOrFatal<string>(
    "CHARGILY_API_SECRET_KEY",
  );
  private readonly success_url = getEnvOrFatal<string>("CHARGILY_SUCCESS_URL");
  private readonly failure_url = "https://google.com";
  private readonly currency = "dzd";
  private client: ChargilyClient;

  /**
   * Creates an instance of PaymentService.
   * Initializes the Chargily client with API key and mode.
   *
   * @param paymentRepository - Repository for payment entities
   * @param planService - Service for managing subscription plans
   * @param userSubscriptionService - Service for managing user subscriptions
   */
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly planService: PlanService,
    private readonly userSubscriptionService: UserSubscriptionService,
  ) {
    this.client = new ChargilyClient({
      api_key: this.api_secret_key,
      mode: getEnvOrFatal("CHARGILY_MODE"), // Use 'live' for production
    });
  }

  /**
   * Creates a checkout session for a user to purchase a subscription plan.
   * Validates user eligibility, creates a Chargily checkout, records the payment attempt,
   * and redirects the user to the checkout URL.
   *
   * @param user - JWT payload containing user information
   * @param createPaymentDto - Data transfer object containing payment details
   * @param res - Express response object for redirecting the user
   * @returns Promise resolving to true if checkout was successfully created
   * @throws ConflictException if user tries to pay for default plan or already has active subscription
   */
  async createCheckout(
    user: JwtPayload,
    createPaymentDto: CreatePaymentDto,
    res: Response,
  ) {
    // Find plan details
    const plan = await this.planService.findPlan({
      planId: createPaymentDto.plan,
    });

    if (plan.is_default) {
      throw new ConflictException("User can not pay for default plan");
    }

    // Find user's current subscription
    const user_subscription =
      await this.userSubscriptionService.findUserCurrentSubscription(user.id);

    if (!user_subscription.plan.is_default) {
      throw new ConflictException("User already has an active subscription");
    }

    // Create a checkout session via Chargily client
    const response = await this.client.createCheckout({
      amount: plan.price,
      currency: this.currency,
      success_url: this.success_url,
      failure_url: this.failure_url,
    });

    // Create payment record
    const payment = this.paymentRepository.create({
      user: { id: user.id },
      plan,
      amount: plan.price,
      checkout_id: response.id,
      status: PaymentStatus.PENDING,
    });

    await this.paymentRepository.save(payment);

    // Redirect to checkout URL
    res.redirect(response.checkout_url);

    return true;
  }

  /**
   * Handles incoming webhooks from Chargily payment gateway.
   * Validates the webhook signature, processes the event based on its type,
   * and sends appropriate HTTP response.
   *
   * @param req - Express request object containing webhook payload and headers
   * @param res - Express response object
   */
  async handleWebhook(req: Request, res: Response) {
    const signature = req.get("signature") || "";
    const payload = (req as any).rawBody;

    if (!signature) {
      res.status(400).send("Signature header is missing");
      return;
    }

    try {
      if (!verifySignature(payload, signature, this.api_secret_key)) {
        res.status(403).send("Invalid signature");
        return;
      }

      const event: ChargilyEventInterface = req.body;

      await this.handleEvent(event);

      res.status(200).send("Webhook received");
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  }

  /**
   * Routes payment events to appropriate handlers based on event type.
   *
   * @param event - Chargily event containing type and payment data
   * @private
   */
  private async handleEvent(event: ChargilyEventInterface) {
    // separated handlers for easy later manipulation
    switch (event.type) {
      case PaymentStatus.PAID:
        await this.handleCheckoutPaid(event.data);
        break;
      case PaymentStatus.FAILED:
        await this.handleCheckoutFailed(event.data);
        break;
      case PaymentStatus.CANCELED:
        await this.handleCheckoutCanceled(event.data);
        break;
      case PaymentStatus.EXPIRED:
        await this.handleCheckoutExpired(event.data);
        break;
      default:
        throw new Error(
          `Unsupported event type: ${event.type} , checkout_id : ${event.id}`,
        );
    }
  }

  /**
   * Processes a successful payment event.
   * Updates payment record with transaction details and creates a user subscription.
   *
   * @param checkout - Data from the Chargily payment event
   * @returns Promise resolving to true if payment was successfully processed
   * @private
   */
  private async handleCheckoutPaid(checkout: ChargilyEventDataInterface) {
    // Find the payment record by checkout id
    const payment = await this.findPaymentByCheckoutId(checkout.id);

    // Update the payment with data from the checkout event
    const updatedPayment = {
      ...payment,
      status: PaymentStatus.PAID,
      payment_method: checkout.payment_method,
      deposit_transaction_id: checkout.deposit_transaction_id,
      livemode: checkout.livemode,
      fees: checkout.fees,
      fees_on_customer: checkout.fees_on_customer,
      fees_on_merchant: checkout.fees_on_merchant,
      paid_at: DateUtils.getCurrentDate(),
    };
    Object.assign(payment, updatedPayment);

    // Save the changes in a transaction
    await this.paymentRepository.manager.transaction(
      async (transactionManager) => {
        await transactionManager.save(payment);

        await this.userSubscriptionService.createSubscription(
          payment.user.id,
          {
            plan: payment.plan.id,
            source: UserSubscriptionSource.CHARGILY,
          },
          transactionManager,
        );
      },
    );

    return true;
  }

  /**
   * Handles an expired checkout event.
   * Updates the payment status to EXPIRED.
   *
   * @param checkout - Data from the Chargily payment event
   * @returns Promise resolving to the updated payment entity
   */
  async handleCheckoutExpired(checkout: ChargilyEventDataInterface) {
    const payment = await this.findPaymentByCheckoutId(checkout.id);
    const updated_payment = {
      status: PaymentStatus.EXPIRED,
    };
    Object.assign(payment, updated_payment);
    return this.paymentRepository.save(payment);
  }

  /**
   * Handles a canceled checkout event.
   * Updates the payment status to CANCELED.
   *
   * @param checkout - Data from the Chargily payment event
   * @returns Promise resolving to the updated payment entity
   */
  async handleCheckoutCanceled(checkout: ChargilyEventDataInterface) {
    const payment = await this.findPaymentByCheckoutId(checkout.id);
    const updated_payment = {
      status: PaymentStatus.CANCELED,
    };
    Object.assign(payment, updated_payment);
    return this.paymentRepository.save(payment);
  }

  /**
   * Handles a failed checkout event.
   * Updates the payment status to FAILED.
   *
   * @param checkout - Data from the Chargily payment event
   * @returns Promise resolving to the updated payment entity
   * @private
   */
  private async handleCheckoutFailed(checkout: ChargilyEventDataInterface) {
    const payment = await this.findPaymentByCheckoutId(checkout.id);
    const updated_payment = {
      status: PaymentStatus.FAILED,
    };
    Object.assign(payment, updated_payment);
    return this.paymentRepository.save(payment);
  }

  /**
   * Retrieves a payment record by its checkout ID.
   *
   * @param checkoutId - The checkout ID to search for
   * @returns Promise resolving to the payment entity with user and plan relations
   * @throws NotFoundException if payment with the given checkout ID is not found
   */
  async findPaymentByCheckoutId(checkoutId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { checkout_id: checkoutId },
      relations: ["user", "plan"],
    });

    if (!payment) {
      throw new NotFoundException("Payment was not found");
    }

    return payment;
  }
}
