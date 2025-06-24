import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { EmailQueueProcessor } from "./email-queue.processor";
import { RedisConfig } from "config/redis-config";
import { MailModule } from "src/mail/mail.module";
import { NotificationQueueProcessor } from "./notification-queue.processor";
import { NotificationModule } from "src/notification/notification.module";
@Module({
  imports: [
    BullModule.forRoot({
      redis: RedisConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: 100,
      },
    }),
    BullModule.registerQueue(
      {
        name: "email-queue",
      },
      {
        name: "notification-queue",
      },
    ),
    MailModule,
    NotificationModule,
  ],
  providers: [EmailQueueProcessor, NotificationQueueProcessor],
  exports: [BullModule],
})
export class QueueModule {}
