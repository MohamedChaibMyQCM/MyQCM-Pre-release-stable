// notification.service.ts
import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { Notification } from "./entities/notification.entity";
import { Subject as RxjsSubject } from "rxjs";
import { NotificationFilters } from "./types/interfaces/notification-filters.interface";
import { PaginationInterface } from "shared/interfaces/pagination.interface";
import { PaginatedResponse } from "shared/interfaces/paginated.response.interface";
import { SortInterface } from "shared/interfaces/sort.interface";
import { CreateNotificationDto } from "./types/dtos/create-notification.dto";
import { NotificationStatus } from "./types/enums/notification-status.enum";
import { User } from "src/user/entities/user.entity";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  // A map to hold Rxjs Subjects for each connected user, allowing real-time SSE notifications.
  private readonly notificationSubjects: Map<
    string,
    RxjsSubject<MessageEvent>
  > = new Map();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  /**
   * Subscribes a user to the notification stream.
   * If a subject for the user doesn't exist, it creates one.
   * @param userId The ID of the user to subscribe.
   * @returns The Rxjs Subject for the user's notification stream.
   */
  async subscribe(userId: string): Promise<RxjsSubject<MessageEvent>> {
    if (!this.notificationSubjects.has(userId)) {
      this.notificationSubjects.set(userId, new RxjsSubject<MessageEvent>());
    }
    return this.notificationSubjects.get(userId);
  }

  /**
   * Unsubscribes a user from the notification stream.
   * Completes the subject and removes it from the map.
   * @param userId The ID of the user to unsubscribe.
   */
  async unsubscribe(userId: string): Promise<void> {
    const subject = this.notificationSubjects.get(userId);
    if (subject) {
      subject.complete(); // Important to complete the subject to clean up resources
      this.notificationSubjects.delete(userId);
    }
  }

  /**
   * Sends a real-time notification to a specific user if they are currently subscribed (have an active SSE connection).
   * @param userId The ID of the user to send the notification to.
   * @param notification The Notification entity to send.
   * @returns True if the notification was sent to the subject, false otherwise.
   * @throws Error if the notification object is null or undefined.
   */
  async sendNotification(userId: string, notification: Notification): Promise<boolean> {
    if (!notification) {
      throw new Error("Notification cannot be null or undefined");
    }
    const subject = this.notificationSubjects.get(userId);
    if (subject) {
      // Create a MessageEvent to send over the SSE connection
      const message = new MessageEvent("notification", {
        data: JSON.stringify(notification), // Stringify the notification object for sending
      });
      subject.next(message); // Emit the message to the subscribed user
      return true; // Indicate successful sending to this specific subject
    }
    return false; // Indicate that the user was not currently subscribed
  }

  /**
   * Creates and persists a new notification for a specific user, then attempts to send it in real-time.
   * @param userId The ID of the user the notification is for.
   * @param createNotificationDto The DTO containing the notification details.
   * @param transactionManager Optional - An EntityManager if this operation is part of a larger transaction.
   * @returns The newly created and saved Notification entity.
   */
  async createNotification(
    userId: string,
    createNotificationDto: CreateNotificationDto,
    transactionManager?: EntityManager,
  ): Promise<Notification> {
    // Create a new notification entity from the DTO
    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      send_at: new Date(), // Set the send timestamp to now
      user: { id: userId }, // Associate the notification with the user
    });

    let savedNotification: Notification;
    // Save the notification to the database, either within a transaction or directly
    if (transactionManager) {
      savedNotification = await transactionManager.save(notification);
    } else {
      savedNotification = await this.notificationRepository.save(notification);
    }

    // Attempt to send the notification immediately via SSE if the user is subscribed
    await this.sendNotification(userId, savedNotification);
    return savedNotification; // Return the saved notification
  }

  /**
   * Sends a notification to all users who are currently subscribed (i.e., have an active SSE connection).
   * This method will create a separate notification record in the database for each subscribed user.
   *
   * If you need to send notifications to *all* users registered in your system (even if not currently online),
   * you would need access to a `UserRepository` or similar service to fetch all user IDs.
   *
   * @param createNotificationDto The DTO containing the notification details to be sent to all subscribed users.
   * @returns A Promise that resolves to `true` if all notifications were processed successfully (created and attempted to send), `false` if any failed.
   */
  async sendNotificationToAllUsers(
    createNotificationDto: CreateNotificationDto,
  ): Promise<boolean> {
    if (this.notificationSubjects.size === 0) {
      this.logger.warn("No users currently subscribed to receive notifications via SSE.");
    }

    const failedSends: string[] = [];
    const userIds = await this.userRepository.find({
      select: ["id"], // Only fetch user IDs to minimize data transfer
    });
    // Iterate over the keys (user IDs) of all currently subscribed users
    for (const userId of userIds.map(user => user.id)) {
      try {
        const savedNotification = await this.createNotification(
          userId,
          createNotificationDto,
        );
        this.logger.log(
          `Notification created and attempted to send for subscribed user ${userId}: ${savedNotification.id}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to create and send notification for subscribed user ${userId}:`,
          error,
        );
        failedSends.push(userId); // Track users for whom notification failed
      }
    }

    if (failedSends.length > 0) {
      this.logger.error(
        `Notifications failed for the following subscribed users: ${failedSends.join(
          ", ",
        )}`,
      );
      throw new InternalServerErrorException('Failed to send notifications to some or all users');
    }
    return true; 
  }

  /**
   * Finds a single notification based on notification ID and/or user ID.
   * @param params An object containing either `notificationId` or `userId` or both.
   * @returns The found Notification entity or null if not found.
   */
  async findNotification(params: { notificationId?: string; userId?: string }): Promise<Notification | null> {
    return this.notificationRepository.findOne({
      where: {
        ...(params.notificationId ? { id: params.notificationId } : {}),
        ...(params.userId ? { user: { id: params.userId } } : {}),
      },
    });
  }

  /**
   * Finds notifications for a specific user with pagination, filtering, and sorting.
   * @param userId - The unique identifier of the user whose notifications to retrieve.
   * @param filters - Optional filters to apply to the notifications query.
   * @param pagination - Optional pagination parameters with default page 1 and offset 10.
   * @param sort - Optional sorting parameters with default field 'createdAt' and order 'DESC'.
   * @returns A paginated response containing notifications data, total count, and pagination info.
   */
  async findNotificationsByUserIdPaginated(
    userId: string,
    filters: NotificationFilters = {},
    pagination: PaginationInterface = { page: 1, offset: 10 },
    sort: SortInterface = { field: "createdAt", order: "DESC" },
  ): Promise<PaginatedResponse<Notification>> {
    const [notifications, total] =
      await this.notificationRepository.findAndCount({
        where: {
          user: { id: userId },
          ...filters,
        },
        order: {
          [sort.field || "createdAt"]: sort.order || "DESC", // Apply sorting
        },
        skip: (pagination.page - 1) * pagination.offset, // Calculate offset for pagination
        take: pagination.offset, // Limit the number of results
      });
    return {
      data: notifications,
      total,
      page: pagination.page,
      offset: pagination.offset,
      total_pages: Math.ceil(total / pagination.offset), // Calculate total pages
    };
  }

  /**
   * Retrieves a single notification by its ID and the ID of the user who owns it.
   * @param params An object containing `notificationId` and `userId`.
   * @returns The retrieved notification.
   * @throws NotFoundException if the notification doesn't exist or doesn't belong to the user.
   */
  async getNotification(params: { notificationId?: string; userId?: string }): Promise<Notification> {
    const notification = await this.findNotification({
      notificationId: params.notificationId,
      userId: params.userId,
    });
    if (!notification) {
      throw new NotFoundException("Notification not found");
    }
    return notification;
  }

  /**
   * Changes the status of a specific notification (e.g., from unread to read).
   * @param params An object containing `notificationId` and `userId`.
   * @param status The new status to set for the notification.
   * @returns The updated notification with its new status.
   * @throws NotFoundException if the notification doesn't exist or doesn't belong to the user.
   */
  async changeNotificationStatus(
    params: { notificationId: string; userId: string },
    status: NotificationStatus,
  ): Promise<Notification> {
    const notification = await this.findNotification({
      notificationId: params.notificationId,
      userId: params.userId,
    });
    if (!notification) {
      throw new NotFoundException("Notification not found");
    }
    notification.status = status; // Update the status
    return this.notificationRepository.save(notification); // Save the updated notification
  }
}
