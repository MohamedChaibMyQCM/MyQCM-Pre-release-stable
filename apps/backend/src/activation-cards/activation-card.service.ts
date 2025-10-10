import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateActivationCardDto } from "./types/dtos/create-activation-card.dto";
import { UpdateActivationCardDto } from "./types/dtos/update-activation-card.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { ActivationCard } from "./entities/activation-card.entity";
import { FindOptionsWhere, Repository } from "typeorm";
import { PaginationInterface } from "shared/interfaces/pagination.interface";
import { ActivationCardFilters } from "./types/interfaces/ActivationCardFilters.interface";
import { PaginatedResponse } from "shared/interfaces/paginated.response.interface";
import { randomBytes } from "crypto";
import { ConsumeActivationCardDto } from "./types/dtos/consume-activation-card.dto";
import { UserSubscriptionService } from "src/user/services/user-subscription.service";
import { UserSubscriptionSource } from "src/user/types/enums/user-subscription-source.enum";
import { DateUtils } from "common/utils/date.util";
import { Queue } from "bullmq";
import { InjectQueue } from "@nestjs/bull";
import { IConsumeActivationCardEmail } from "src/mail/types/cunsome-activation-card-email.interface";
import { UserService } from "src/user/services/user.service";
import { UserSubscription } from "src/user/entities/user-subscription.entity";
import { format } from "date-fns";
import { NotificationType } from "src/notification/types/enums/notification-type.enum";
import { CreateNotificationDto } from "src/notification/types/dtos/create-notification.dto";
import { NotificationStatus } from "src/notification/types/enums/notification-status.enum";
import { NotificationChannel } from "src/notification/types/enums/notification-channel.enum";

/**
 * Service for managing activation cards used for redeeming user subscriptions
 */
@Injectable()
export class ActivationCardService {
  constructor(
    @InjectRepository(ActivationCard)
    private readonly activationCardsRepository: Repository<ActivationCard>,
    private readonly userSubscriptionService: UserSubscriptionService,
    private readonly userService: UserService,
    @InjectQueue("email-queue") private emailQueue: Queue,
    @InjectQueue("notification-queue") private notificationQueue: Queue,
  ) {}

  /**
   * Checks if an activation card with the given code exists
   * @param code - The activation card code to check
   * @returns The activation card's ID if found, otherwise null
   */
  async checkIfCodeExists(code: string) {
    return this.activationCardsRepository.findOne({
      where: {
        code,
      },
      select: ["id"], // Only select the ID field for minimal data transfer
    });
  }

  /**
   * Checks if an activation card with the given ID exists
   * @param id - The activation card ID to check
   * @returns The activation card's ID if found, otherwise null
   */
  async checkIfCardExistsById(id: string) {
    return this.activationCardsRepository.findOne({
      where: {
        id,
      },
      select: ["id"], // Only select the ID field for minimal data transfer
    });
  }

  /**
   * Finds an activation card by its code
   * @param code - The activation card code to search for
   * @returns The complete activation card entity if found, otherwise null
   */
  async findOneByCode(code: string, populate: boolean = false) {
    return this.activationCardsRepository.findOne({
      where: {
        code,
      },
      relations: populate ? ["plan"] : [],
    });
  }

  /**
   * Generates a unique, formatted activation card code
   * @returns A 24-character code in the format XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
   */
  generateFastGiftCardCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const buffer = randomBytes(24);

    let code = "";
    for (let i = 0; i < 24; i++) {
      code += chars[buffer[i] % chars.length];
      if ((i + 1) % 4 === 0 && i !== 23) code += "-";
    }
    return code;
  }

  /**
   * Creates a new activation card
   * @param createActivationCardDto - Data for creating a new activation card
   * @returns The newly created activation card entity
   * @throws BadRequestException if expiration date is invalid or if code generation fails
   */
  async createNewActivationCard(
    createActivationCardDto: CreateActivationCardDto,
  ) {
    // Validate expiration date once, early return on error
    if (createActivationCardDto.expires_at) {
      DateUtils.validateDate(createActivationCardDto.expires_at, true);
    }

    // Use a more efficient code generation approach with retries
    let code: string;
    let retry_count = 0;
    const MAX_RETRIES = 5;

    do {
      code = this.generateFastGiftCardCode();

      if (!(await this.checkIfCodeExists(code))) {
        break;
      }

      retry_count++;
      // Prevent infinite loops (in case db fails) with a retry limit
      if (retry_count >= MAX_RETRIES) {
        throw new BadRequestException(
          "Unable to generate a unique activation code. Please try again.",
        );
      }
    } while (true);

    const card = this.activationCardsRepository.create({
      ...createActivationCardDto,
      code,
      plan: { id: createActivationCardDto.plan },
    });

    const saved_card = await this.activationCardsRepository.save(card);

    // Use destructuring to remove plan from the returned object
    const { plan, ...cleanCard } = saved_card;
    return cleanCard as ActivationCard;
  }

  /**
   * Retrieves a paginated list of activation cards with optional filtering
   * @param filters - Optional filters to apply to the query
   * @param pagination - Pagination parameters
   * @returns A paginated response containing activation cards
   */
  async findAllActivationCardsPaginated(
    filters: ActivationCardFilters = {},
    pagination: PaginationInterface = { page: 1, offset: 10 },
  ): Promise<PaginatedResponse<ActivationCard>> {
    // Build the where clause based on filters
    const where_clause: FindOptionsWhere<ActivationCard> = {};
    const relations = [];
    // Handle boolean filter
    if (filters.is_redeemed !== undefined) {
      where_clause.is_redeemed = filters.is_redeemed;
    }

    // Handle plan filter - could be an ID or an object reference
    if (filters.plan) {
      relations.push("plan");
      if (typeof filters.plan === "string") {
        where_clause.plan = { id: filters.plan };
      } else {
        where_clause.plan = filters.plan;
      }
    }

    // Handle redeemed_by filter - could be an ID or an object reference
    if (filters.redeemed_by) {
      relations.push("redeemed_by");
      if (typeof filters.redeemed_by === "string") {
        where_clause.redeemed_by = { id: filters.redeemed_by };
      } else {
        where_clause.redeemed_by = filters.redeemed_by;
      }
    }

    // Handle date filters
    if (filters.redeemed_at) {
      where_clause.redeemed_at = DateUtils.createDateRange(filters.redeemed_at);
    }

    if (filters.expires_at) {
      where_clause.expires_at = DateUtils.createDateRange(filters.expires_at);
    }

    // Query with pagination parameters
    const [cards, total] = await this.activationCardsRepository.findAndCount({
      where: where_clause,
      skip: (pagination.page - 1) * pagination.offset,
      take: pagination.offset,
      relations,
    });
    return {
      data: cards,
      total,
      page: pagination.page,
      offset: pagination.offset,
      total_pages: Math.ceil(total / pagination.offset),
    };
  }

  /**
   * Finds an activation card by its ID
   * @param id - The activation card ID to search for
   * @param populate - Whether to include related entities
   * @returns The activation card entity if found, otherwise null
   */
  async findOne(id: string, populate = false) {
    return this.activationCardsRepository.findOne({
      where: { id },
      relations: populate ? ["plan"] : [],
    });
  }

  /**
   * Consumes (redeems) an activation card and creates a subscription for the user
   * @param userId - The ID of the user redeeming the card
   * @param consumeActivationCardDto - The DTO containing the card code
   * @returns True if redemption was successful
   * @throws BadRequestException if card is invalid, already redeemed, or expired
   */
  async consumeActivationCard(
    userId: string,
    consumeActivationCardDto: ConsumeActivationCardDto,
  ) {
    const user = await this.userService.getAuthenticatedUser(userId);
    const card = await this.findOneByCode(
      consumeActivationCardDto.code.toUpperCase(),
      true,
    );
    if (!card) {
      throw new BadRequestException("Invalid activation card code");
    }
    if (card.is_redeemed) {
      throw new BadRequestException("Activation card already redeemed");
    }
    if (card.expires_at && new Date() > card.expires_at) {
      throw new BadRequestException("Activation card expired");
    }
    let new_subscription: UserSubscription;
    // give the user the subscription and update the card to be redeemed
    await this.activationCardsRepository.manager.transaction(
      async (transactionManager) => {
        new_subscription =
          await this.userSubscriptionService.createSubscription(
            userId,
            {
              plan: card.plan.id,
              source: UserSubscriptionSource.ACTIVATION_CARD,
            },
            transactionManager,
          );
        await transactionManager.update(ActivationCard, card.id, {
          is_redeemed: true,
          redeemed_at: new Date(),
          redeemed_by: user,
        });
        const mailDto: IConsumeActivationCardEmail = {
          email: user.email,
          name: user.name,
          plan_name: new_subscription.plan.name,
          activation_code: card.code,
          activation_date: format(
            new_subscription.start_date || new Date(),
            "PPpp",
          ),
          expiration_date: format(new_subscription.end_date, "PPpp"),
        };
        await this.emailQueue.add("send-consume-activation-card-email", {
          mailDto,
        });
        const notificationDto: CreateNotificationDto = {
          content: `Your activation card has been redeemed successfully. Your subscription to ${new_subscription.plan.name} is now active.`,
          notification_type: NotificationType.ACTIVATION_CODE_REDEEMED,
          status: NotificationStatus.PENDING,
          channel: NotificationChannel.IN_APP,
        };
        await this.notificationQueue.add("create-notification", {
          userId,
          notificationDto,
        });
      },
    );
    return new_subscription;
  }

  /**
   * Updates an activation card
   * @param id - The ID of the activation card to update
   * @param updateActivationCardDto - The updated data for the activation card
   * @returns True if update was successful
   * @throws BadRequestException if card is not found or if expiration date is invalid
   */
  async update(id: string, updateActivationCardDto: UpdateActivationCardDto) {
    if (!(await this.checkIfCardExistsById(id))) {
      throw new BadRequestException(`Activation card with ID ${id} not found`);
    }

    // Validate expiration date if provided
    if (updateActivationCardDto.expires_at) {
      DateUtils.validateDate(updateActivationCardDto.expires_at, true);
    }

    // Handle plan reference if provided
    const updateData = { ...updateActivationCardDto };

    // Update the card
    await this.activationCardsRepository.update(id, updateData);

    return true;
  }

  /**
   * Removes an activation card
   * @param id - The ID of the activation card to remove
   * @returns True if removal was successful
   * @throws BadRequestException if card is not found
   */
  async remove(id: string) {
    const deleted = await this.activationCardsRepository.delete({
      id,
    });

    if (deleted.affected === 0) {
      throw new BadRequestException(
        `Activation card with ID ${id} not found or already redeemed`,
      );
    }

    return true;
  }
}
