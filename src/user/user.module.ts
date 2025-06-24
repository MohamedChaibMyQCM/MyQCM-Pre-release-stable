import { Module } from "@nestjs/common";
import { UserService } from "./services/user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserProfile } from "./entities/user-profile.entity";
import { PlanModule } from "src/plan/plan.module";
import { QueueModule } from "src/redis/queue/queue.module";
import { RedisModule } from "src/redis/redis.module";
import { UserStreakService } from "./services/user-streak.service";
import { UserController } from "./controllers/user.controller";
import { UserProfileController } from "./controllers/user-profile.controller";
import { UserStreakController } from "./controllers/user-streak.controller";
import { UserProfileService } from "./services/user-profile.service";
import { UserStreak } from "./entities/user-streak.entity";
import { UserActivityService } from "./services/user-activity.service";
import { UserActivityController } from "./controllers/user-activity.controller";
import { UserActivity } from "./entities/user-activity.entity";
import { UserXpController } from "./controllers/user-xp.controller";
import { UserXpService } from "./services/user-xp.service";
import { UserXp } from "./entities/user-xp.entity";
import { UserSubscriptionService } from "./services/user-subscription.service";
import { UserSubscriptionController } from "./controllers/user-subscription.controller";
import { UserSubscription } from "./entities/user-subscription.entity";
import { UserNotificationSettingsController } from "./controllers/user-notification-settings.controller";
import { UserNotificationSettingsService } from "./services/user-notification-settings.service";
import { UserNotificationSettings } from "./entities/user-notification-settings.entity";
import { NotificationModule } from "src/notification/notification.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserProfile,
      UserActivity,
      UserStreak,
      UserXp,
      UserSubscription,
      UserNotificationSettings,
    ]),
    RedisModule,
    QueueModule,
    PlanModule,
  ],
  controllers: [
    UserController,
    UserProfileController,
    UserStreakController,
    UserActivityController,
    UserXpController,
    UserSubscriptionController,
    UserNotificationSettingsController,
  ],
  providers: [
    UserService,
    UserProfileService,
    UserStreakService,
    UserActivityService,
    UserXpService,
    UserSubscriptionService,
    UserNotificationSettingsService,
  ],
  exports: [
    UserService,
    UserProfileService,
    UserStreakService,
    UserActivityService,
    UserXpService,
    UserSubscriptionService,
    UserNotificationSettingsService,
  ],
})
export class UserModule {}
