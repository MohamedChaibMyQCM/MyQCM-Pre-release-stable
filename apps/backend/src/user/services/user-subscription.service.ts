import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserSubscription } from "../entities/user-subscription.entity";
import {
  Repository,
  LessThanOrEqual,
  EntityManager,
  IsNull,
  In,
  MoreThan,
} from "typeorm";
import { UserSubscriptionFilter } from "../types/interfaces/user-subscription-filter.interface";
import { PlanService } from "src/plan/plan.service";
import { PlanPeriod } from "src/plan/types/dtos/plan.type";
import { CreateUserSubscriptionInterface } from "../types/interfaces/create-user-subscription.interface";
import { UserSubscriptionUsageEnum } from "../types/enums/user-subscription-usage.enum";
import { UserXpService } from "./user-xp.service";
import { UserActivityService } from "./user-activity.service";
import { UserActivityType } from "../types/enums/user-activity-type.enum";

@Injectable()
export class UserSubscriptionService {
  constructor(
    @InjectRepository(UserSubscription)
    private readonly userSubscriptionRepository: Repository<UserSubscription>,
    private readonly userActivityService: UserActivityService,
    private readonly userXpService: UserXpService,
    private readonly planService: PlanService,
  ) {}
  /**
   * Create a new subscription for a user
   * @param userId The ID of the user
   * @param createUserSubscription Object containing subscription details (plan , end_date, source...)
   * @param transactionManager Optional transaction manager for database operations
   * @returns Promise resolving to the created UserSubscription
   */
  async createSubscription(
    userId: string,
    createUserSubscription: CreateUserSubscriptionInterface,
    transactionManager?: EntityManager,
  ): Promise<UserSubscription> {
    // Find the plan (either specified plan or default plan)
    const plan = createUserSubscription.plan
      ? await this.planService.getPlanById(createUserSubscription.plan)
      : await this.planService.getDefaultPlan();

    // Check if user already has an active subscription
    const existing_subscription =
      await this.findUserCurrentSubscription(userId);

    if (
      existing_subscription &&
      existing_subscription.plan &&
      existing_subscription.plan.is_default != true
    ) {
      throw new BadRequestException("User already has an active subscription"); // not allowing for upgrade or downgrade for now
    }

    // Calculate subscription dates
    let end_date: Date = new Date();
    switch (plan.period) {
      case PlanPeriod.MONTHLY:
        end_date.setMonth(end_date.getMonth() + 1);
        break;
      case PlanPeriod.HALF_YEARLY:
        end_date.setMonth(end_date.getMonth() + 6);
        break;
      case PlanPeriod.YEARLY:
        end_date.setFullYear(end_date.getFullYear() + 1);
        break;
      case PlanPeriod.INFINITE:
        end_date = null;
        break;
      default:
        end_date.setMonth(end_date.getMonth() + 1); // Default to monthly
    }

    // Create new subscription
    const new_subscription = this.userSubscriptionRepository.create({
      user: { id: userId },
      plan,
      source: createUserSubscription.source,
      end_date: end_date,
    });

    // Award XP to the user if the plan has a positive XP reward
    if (plan.xp_reward && plan.xp_reward > 0) {
      await this.userXpService.incrementUserXP(
        userId,
        plan.xp_reward,
        transactionManager,
      );
    }

    await this.userActivityService.recordActivity(
      userId,
      UserActivityType.SUBSCRIPTION,
      transactionManager,
    );
    return transactionManager
      ? await transactionManager.save(new_subscription)
      : await this.userSubscriptionRepository.save(new_subscription);
  }
  /**
   * Find a user subscription based on provided parameters and filters
   * @param params Object containing optional subscriptionId and userId
   * @param filters Additional filters to apply to the query
   * @returns Promise resolving to the found UserSubscription or null if not found
   */
  findSubscription(
    params: { subscriptionId?: string; userId?: string },
    filters: UserSubscriptionFilter = {},
  ): Promise<UserSubscription | null> {
    return this.userSubscriptionRepository.findOne({
      where: {
        ...(params.subscriptionId ? { id: params.subscriptionId } : {}),
        ...(params.userId ? { user: { id: params.userId } } : {}),
        ...(filters.start_date ? { start_date: filters.start_date } : {}),
        ...(filters.end_date
          ? { end_date: In([filters.end_date, IsNull()]) }
          : {}),
      },
    });
  }

  /**
   * Find the current active subscription for a user
   * Uses Algeria timezone for determining the current date
   * @param userId The ID of the user
   * @returns Promise resolving to the current UserSubscription or null if none exists
   */
  findUserCurrentSubscription(
    userId: string,
  ): Promise<UserSubscription | null> {
    const currentDate = new Date();
    return this.userSubscriptionRepository.findOne({
      where: [
        {
          user: { id: userId },
          start_date: LessThanOrEqual(currentDate),
          end_date: IsNull(), // Default plan (no expiry)
        },
        {
          user: { id: userId },
          start_date: LessThanOrEqual(currentDate),
          end_date: MoreThan(currentDate), // Active non-default plans
        },
      ],
      order: { start_date: "DESC" },
    });
  }
  /**
   * Find the current active subscription for a user
   * Uses Algeria timezone for determining the current date
   * @param userId The ID of the user
   * @throw BadRequestException if the user does not have an active subscription
   * @returns Promise resolving to the current UserSubscription or null if none exists
   */
  async getUserCurrentSubscription(userId: string) {
    const subscription = await this.findUserCurrentSubscription(userId);
    if (!subscription) {
      throw new BadRequestException(
        "User does not have an active subscription.",
      );
    }
    return subscription;
  }

  /**
   * Check the user's usage for a specific resource (e.g., MCQs or QROCs)
   * @param subscription The user's subscription object
   * @param usageType The type of usage to check (e.g., "mcqs" or "qrocs")
   * @returns The current usage count
   * @throws BadRequestException if the user has reached the limit
   * @throws BadRequestException if the usage type is invalid
   */
  async checkUserUsage(
    subscription: UserSubscription,
    usageType: UserSubscriptionUsageEnum,
  ) {
    const plan = subscription.plan;
    let usage = 0;

    // Using switch case for different usage types
    switch (usageType) {
      case UserSubscriptionUsageEnum.MCQS:
        usage = subscription.used_mcqs;
        if (plan.mcqs !== null && usage >= plan.mcqs) {
          throw new BadRequestException(
            "You have reached the maximum number of MCQs allowed for your plan.",
          );
        }
        break;

      case UserSubscriptionUsageEnum.QROCS:
        usage = subscription.used_qrocs;
        if (plan.qrocs !== null && usage >= plan.qrocs) {
          throw new BadRequestException(
            "You have reached the maximum number of QROCs allowed for your plan.",
          );
        }
        break;

      default:
        throw new BadRequestException("Invalid usage type specified.");
    }
    return usage;
  }
  /**
   * Increment the user's usage for a specific resource.
   *
   * @param subscription The user's subscription object
   * @param usageType - The type of usage to increment (e.g., "mcqs" or "qrocs").
   * @returns Promise resolving to the updated UserSubscription.
   * @throws BadRequestException if the user has reached the limit.
   */
  async incrementUsage(
    subscription: UserSubscription,
    usageType: UserSubscriptionUsageEnum,
    transactionManager: EntityManager, // enforce it because it will be only used by another service
  ): Promise<UserSubscription> {
    // Using switch case for different usage types
    switch (usageType) {
      case UserSubscriptionUsageEnum.MCQS:
        subscription.used_mcqs += 1;
        break;

      case UserSubscriptionUsageEnum.QROCS:
        subscription.used_qrocs += 1;
        break;

      default:
        throw new BadRequestException("Invalid usage type specified.");
    }

    // Save the updated subscription usage
    return transactionManager.save(subscription);
  }

  async addUsageCredits(
    userId: string,
    credits: { mcqs?: number; qrocs?: number },
    transactionManager: EntityManager,
  ): Promise<void> {
    const mcqs = Math.max(0, Math.floor(credits.mcqs ?? 0));
    const qrocs = Math.max(0, Math.floor(credits.qrocs ?? 0));

    if (mcqs === 0 && qrocs === 0) {
      return;
    }

    const currentDate = new Date();
    const subscription = await transactionManager.findOne(UserSubscription, {
      where: [
        {
          user: { id: userId },
          start_date: LessThanOrEqual(currentDate),
          end_date: IsNull(),
        },
        {
          user: { id: userId },
          start_date: LessThanOrEqual(currentDate),
          end_date: MoreThan(currentDate),
        },
      ],
      order: { start_date: "DESC" },
    });

    if (!subscription) {
      throw new BadRequestException(
        "User does not have an active subscription.",
      );
    }

    if (mcqs !== 0) {
      subscription.used_mcqs -= mcqs;
    }

    if (qrocs !== 0) {
      subscription.used_qrocs -= qrocs;
    }

    await transactionManager.save(subscription);
  }
}
