import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserProfile } from "../entities/user-profile.entity";
import { Repository } from "typeorm";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import { UserStreakService } from "./user-streak.service";
import { UserXpService } from "./user-xp.service";
import { UserSubscriptionService } from "./user-subscription.service";
import { UserActivityService } from "./user-activity.service";
import { UserActivityType } from "../types/enums/user-activity-type.enum";
import { UserSubscriptionSource } from "../types/enums/user-subscription-source.enum";
import { CreateUserProfileDto } from "../types/dtos/create-user-profile.dto";
import { UserNotificationSettingsService } from "./user-notification-settings.service";
import { UpdateUserProfileDto } from "./update-user-profile.dto";
import { NotificationType } from "src/notification/types/enums/notification-type.enum";
import { NotificationChannel } from "src/notification/types/enums/notification-channel.enum";
import { InjectQueue } from "@nestjs/bull/dist/decorators/inject-queue.decorator";
import { Queue } from "bull";

/**
 * Service responsible for managing user profile operations.
 * Handles creation, retrieval, and management of user profiles,
 * including relationships with university and faculty entities.
 */
@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    private readonly userStreakService: UserStreakService,
    private readonly userXpService: UserXpService,
    private readonly userActivityService: UserActivityService,
    private readonly userSubscriptionService: UserSubscriptionService,
    private readonly userNotificationSettingsService: UserNotificationSettingsService,
    @InjectQueue("notification-queue") private notificationQueue: Queue,
  ) {}

  async hasUserProfile(userId: string): Promise<boolean> {
    const user_profile = await this.userProfileRepository.findOne({
      where: {
        user: { id: userId },
      },
      select: ["id"],
    });
    return !!user_profile;
  }

  /**
   * Finds a user profile by user ID.
   *
   * @param userId - The unique identifier of the user
   * @returns A Promise that resolves to the user profile or undefined if not found
   */
  async findUserProfileById(
    userId: string,
    options?: {
      relations?: string[];
    },
  ): Promise<UserProfile | undefined> {
    return this.userProfileRepository.findOne({
      where: {
        user: { id: userId },
      },
      relations: options?.relations ? options.relations : [],
    });
  }

  /**
   * Gets a user profile by user ID and throws an exception if not found.
   *
   * @param userId - The unique identifier of the user
   * @returns A Promise that resolves to the user profile
   * @throws BadRequestException if the profile is not found
   */
  async getUserProfileById(userId: string): Promise<UserProfile> {
    const user_profile = await this.findUserProfileById(userId, {
      relations: ["unit", "university"],
    });
    if (!user_profile) {
      throw new BadRequestException("Profile not found");
    }
    return user_profile;
  }

  /**
   * Gets an authenticated user profile by user ID and throws an exception if not found.
   *
   * @param userId - The unique identifier of the user
   * @returns A Promise that resolves to the user profile
   * @throws UnauthorizedException if the profile is not found
   */
  async getAuthenticatedUserProfileById(userId: string): Promise<UserProfile> {
    const user_profile = await this.findUserProfileById(userId, {
      relations: ["unit", "university"],
    });
    if (!user_profile) {
      throw new UnauthorizedException("Profile not found");
    }
    return user_profile;
  }
  /**
   * Creates a new user profile with university and faculty associations.
   *
   * @param user - JWT payload containing user information
   * @param createUserProfileDto - Data transfer object containing profile details
   * @throws BadRequestException if a profile already exists for the user
   * @returns A Promise that resolves when the profile is created
   */
  async createUserProfile(
    user: JwtPayload,
    createUserProfileDto: CreateUserProfileDto,
  ): Promise<UserProfile> {
    // Fetch university and faculty in parallel
    const { id: userId } = user;

    // Check if profile already exists
    const existing_profile = await this.hasUserProfile(user.id);
    if (existing_profile) {
      throw new BadRequestException("Profile already exists");
    }

    // Create and save new profile
    const new_user_profile = this.userProfileRepository.create({
      ...createUserProfileDto,
      university: { id: createUserProfileDto.university },
      unit: { id: createUserProfileDto.unit },
      user: { id: userId },
      mode: { id: createUserProfileDto.mode },
    });
    return this.userProfileRepository.manager.transaction(
      async (transactionManager) => {
        // using transaction to make sure everything is set up (all or nothing) to avoid any problems
        const saved_profile = await transactionManager.save(new_user_profile);
        const notificationDto = {
          notification_type: NotificationType.WELCOME,
          content: `Welcome to MyQCM DZ! You're all set to start mastering your medical exams with AI-powered MCQs, progress tracking, and more , Let's get started .`,
          channel: NotificationChannel.IN_APP,
        };
        await this.notificationQueue.add("create-notification", {
          userId,
          notificationDto,
        });
        await this.userStreakService.createStreak(userId, transactionManager);
        await this.userXpService.createUserXp(userId, transactionManager);
        await this.userNotificationSettingsService.createNotificationSettings(
          userId,
          transactionManager,
        );
        await this.userSubscriptionService.createSubscription(
          userId,
          {
            plan: null,
            source: UserSubscriptionSource.DEFAULT,
          },
          transactionManager,
        ); // null referes default plan btw ><
        await this.userActivityService.recordActivity(
          userId,
          UserActivityType.PROFILE_SETUP,
          transactionManager,
        );

        return saved_profile;
      },
    );
  }

  /**
   * Updates an existing user profile with new data.
   *
   * @param userId - The unique identifier of the user whose profile is being updated
   * @param updateUserProfileDto - Data transfer object containing updated profile details
   * @throws UnauthorizedException if the profile is not found
   * @throws BadRequestException if validation fails
   * @returns A Promise that resolves to the updated user profile
   */
  async updateUserProfile(
    userId: string,
    updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<UserProfile> {
    // Find existing profile and throw error if not found
    const userProfile = await this.getAuthenticatedUserProfileById(userId);

    // Create a new object for the updates to avoid modifying the DTO directly
    const updates: any = { ...updateUserProfileDto };

    // Handle entity references properly
    if (updateUserProfileDto.university) {
      updates.university = { id: updateUserProfileDto.university };
    }

    if (updateUserProfileDto.unit) {
      updates.unit = { id: updateUserProfileDto.unit };
    }

    if (updateUserProfileDto.mode) {
      updates.mode = { id: updateUserProfileDto.mode };
    }

    Object.assign(userProfile, updates);

    // Save the updated profile
    const savedProfile = await this.userProfileRepository.save(userProfile);

    return savedProfile;
  }
}
