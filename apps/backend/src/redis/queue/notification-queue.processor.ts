import { Processor, Process } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { Notification } from "src/notification/entities/notification.entity";
import { NotificationService } from "src/notification/notification.service";
import { CreateNotificationDto } from "src/notification/types/dtos/create-notification.dto";

@Injectable()
@Processor("notification-queue")
export class NotificationQueueProcessor {
  constructor(private readonly notificationService: NotificationService) {}

  @Process("send-notification")
  async sendNotification(
    job: Job<{ userId: string; notification: Notification }>,
  ) {
    try {
      const { userId, notification } = job.data;
      return await this.notificationService.sendNotification(
        userId,
        notification,
      );
    } catch (error) {
      Logger.error(
        `Failed to send notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Process("create-notification")
  async createNotification(
    job: Job<{ userId: string; notificationDto: CreateNotificationDto }>,
  ) {
    try {
      const { userId, notificationDto } = job.data;
      return await this.notificationService.createNotification(
        userId,
        notificationDto,
      );
    } catch (error) {
      Logger.error(
        `Failed to create notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
