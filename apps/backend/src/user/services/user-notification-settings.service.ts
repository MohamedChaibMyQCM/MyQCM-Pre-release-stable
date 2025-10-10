import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserNotificationSettings } from "../entities/user-notification-settings.entity";
import { EntityManager, Repository } from "typeorm";
import { ToggleNotificationSettingDto } from "../types/dtos/toggle-notification-setting.dto";

/**
 * Service responsible for managing user notification preferences and settings
 * Provides functionality to create, retrieve, and update notification configurations
 */
@Injectable()
export class UserNotificationSettingsService {
  constructor(
    @InjectRepository(UserNotificationSettings)
    private readonly userNotificationSettingsRepository: Repository<UserNotificationSettings>,
  ) {}

  /**
   * Creates default notification settings for a new user
   *
   * @param userId - The unique identifier of the user
   * @param transactionManager - Optional transaction manager for database operations
   * @returns A promise resolving to the created notification settings (without user reference)
   */
  async createNotificationSettings(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<UserNotificationSettings> {
    const notification_settings =
      this.userNotificationSettingsRepository.create({
        user: { id: userId },
      });

    const { user, ...settingsWithoutUser } = transactionManager
      ? await transactionManager.save(notification_settings)
      : await this.userNotificationSettingsRepository.save(
          notification_settings,
        );

    return settingsWithoutUser as UserNotificationSettings;
  }

  /**
   * Finds notification settings for a specific user
   *
   * @param userId - The unique identifier of the user
   * @param select - Optional object specifying which fields to select
   * @returns A promise resolving to the user's notification settings or undefined if not found
   */
  async findOneByUserId(
    userId: string,
    select?: Partial<Record<keyof UserNotificationSettings, boolean>>,
  ): Promise<UserNotificationSettings | undefined> {
    return this.userNotificationSettingsRepository.findOne({
      where: {
        user: { id: userId },
      },
      select: select
        ? (Object.keys(select).filter(
            (key) => select[key],
          ) as (keyof UserNotificationSettings)[])
        : undefined,
    });
  }

  /**
   * Retrieves notification settings for an authenticated user
   * Throws an exception if settings don't exist
   *
   * @param userId - The unique identifier of the authenticated user
   * @returns A promise resolving to the user's notification settings
   * @throws ConflictException if notification settings are not found
   */
  async getAuthenticatedUserNotificationSettings(
    userId: string,
  ): Promise<UserNotificationSettings> {
    const notification_settings = await this.findOneByUserId(userId);

    if (!notification_settings) {
      Logger.warn(`User ${userId} does not have notifications settings`);
      throw new ConflictException("Notification settings not found");
    }

    return notification_settings;
  }

  /**
   * Updates a specific notification setting for a user
   *
   * @param userId - The unique identifier of the user
   * @param toggleNotificationSettingDto - DTO containing the setting to toggle its value
   * @returns A promise resolving to the updated notification settings
   */
  async toggleNotificationSetting(
    userId: string,
    toggleNotificationSettingDto: ToggleNotificationSettingDto,
  ): Promise<UserNotificationSettings> {
    const { setting } = toggleNotificationSettingDto;
    const notification_settings =
      await this.getAuthenticatedUserNotificationSettings(userId);

    if (!Object.prototype.hasOwnProperty.call(notification_settings, setting)) {
      throw new ConflictException(`Invalid setting: ${setting}`);
    }

    notification_settings[setting] = !notification_settings[setting];
    return this.userNotificationSettingsRepository.save(notification_settings);
  }

  /**
   * Updates multiple notification settings for a user at once
   *
   * @param userId - The unique identifier of the user
   * @param settings - Object containing settings to update with their new values
   * @returns A promise resolving to the updated notification settings
   */
  async updateNotificationSettings(
    userId: string,
    settings: Partial<Omit<UserNotificationSettings, "id" | "user">>,
  ): Promise<UserNotificationSettings> {
    const notification_settings =
      await this.getAuthenticatedUserNotificationSettings(userId);

    // Apply updates
    Object.assign(notification_settings, settings);

    return this.userNotificationSettingsRepository.save(notification_settings);
  }
}
