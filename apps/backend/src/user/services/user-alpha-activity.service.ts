import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, EntityManager } from "typeorm";
import { UserAlphaActivity } from "../entities/user-alpha-activity.entity";
import { UserXpService } from "./user-xp.service";
import { RedisService } from "src/redis/redis.service";
import { RedisKeys } from "common/utils/redis-keys.util";
import {
  AlphaXpCalculationResult,
  AlphaXpConfigInterface,
} from "shared/interfaces/alpha-xp-config.interface";
import { DefaultAlphaXpConfig } from "config/default-alpha-xp.config";

/**
 * Service for managing alpha feature activities and XP rewards
 */
@Injectable()
export class UserAlphaActivityService {
  constructor(
    @InjectRepository(UserAlphaActivity)
    private readonly alphaActivityRepository: Repository<UserAlphaActivity>,
    private readonly userXpService: UserXpService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Get alpha XP configuration from Redis or use default
   */
  private async getAlphaXpConfig(): Promise<AlphaXpConfigInterface> {
    const config = await this.redisService.get(
      RedisKeys.getRedisAlphaXpConfig(),
      true,
    );
    return config || DefaultAlphaXpConfig;
  }

  /**
   * Start tracking a new alpha feature session
   */
  async startAlphaSession(
    userId: string,
    featureId: string,
    featureName: string,
  ): Promise<UserAlphaActivity> {
    const activity = this.alphaActivityRepository.create({
      user: { id: userId },
      feature_id: featureId,
      feature_name: featureName,
      started_at: new Date(),
    });

    return await this.alphaActivityRepository.save(activity);
  }

  /**
   * Calculate XP based on time spent (in seconds)
   */
  private calculateTimeSpentXp(
    timeSpentSeconds: number,
    config: AlphaXpConfigInterface,
  ): number {
    const minutes = Math.floor(timeSpentSeconds / 60);

    if (minutes < config.timeSpentReward.minMinutes) {
      return 0;
    }

    const calculatedXp = minutes * config.timeSpentReward.xpPerMinute;
    return Math.min(calculatedXp, config.timeSpentReward.maxXp);
  }

  /**
   * Calculate XP based on feedback quality
   */
  private calculateFeedbackQualityXp(
    rating: number,
    feedbackText: string,
    config: AlphaXpConfigInterface,
  ): number {
    // Base XP from rating
    let xp = 0;
    const { feedbackQualityReward } = config;

    switch (rating) {
      case 1:
        xp = feedbackQualityReward.rating1Xp;
        break;
      case 2:
        xp = feedbackQualityReward.rating2Xp;
        break;
      case 3:
        xp = feedbackQualityReward.rating3Xp;
        break;
      case 4:
        xp = feedbackQualityReward.rating4Xp;
        break;
      case 5:
        xp = feedbackQualityReward.rating5Xp;
        break;
      default:
        xp = 0;
    }

    // Add bonus for detailed text feedback
    if (
      feedbackText &&
      feedbackText.trim().length >= feedbackQualityReward.minTextLength
    ) {
      xp += feedbackQualityReward.withTextBonus;
    }

    return xp;
  }

  /**
   * Calculate total XP rewards for an alpha activity
   */
  async calculateAlphaXp(
    timeSpentSeconds: number,
    rating: number,
    feedbackText: string,
  ): Promise<AlphaXpCalculationResult> {
    const config = await this.getAlphaXpConfig();

    const testingXp = config.testingReward.baseXp;
    const timeSpentXp = this.calculateTimeSpentXp(timeSpentSeconds, config);
    const feedbackQualityXp = this.calculateFeedbackQualityXp(
      rating,
      feedbackText,
      config,
    );

    const totalXp = testingXp + timeSpentXp + feedbackQualityXp;

    return {
      testingXp,
      timeSpentXp,
      feedbackQualityXp,
      totalXp,
      breakdown: {
        testing: `+${testingXp} XP for testing alpha feature`,
        timeSpent: `+${timeSpentXp} XP for ${Math.floor(timeSpentSeconds / 60)} minutes spent`,
        feedbackQuality: `+${feedbackQualityXp} XP for ${rating}-star feedback${
          feedbackText &&
          feedbackText.trim().length >= config.feedbackQualityReward.minTextLength
            ? " with detailed comments"
            : ""
        }`,
      },
    };
  }

  /**
   * Complete an alpha session and award XP
   */
  async completeAlphaSession(
    activityId: string,
    userId: string,
    rating: number,
    feedbackText: string,
  ): Promise<{
    activity: UserAlphaActivity;
    xpCalculation: AlphaXpCalculationResult;
  }> {
    return await this.alphaActivityRepository.manager.transaction(
      async (transactionManager: EntityManager) => {
        // Find the activity
        const activity = await transactionManager.findOne(UserAlphaActivity, {
          where: { id: activityId, user: { id: userId } },
        });

        if (!activity) {
          throw new NotFoundException("Alpha activity not found");
        }

        if (activity.xp_awarded) {
          throw new Error("XP already awarded for this activity");
        }

        // Calculate time spent
        const completedAt = new Date();
        const timeSpentSeconds = Math.floor(
          (completedAt.getTime() - activity.started_at.getTime()) / 1000,
        );

        // Calculate XP
        const xpCalculation = await this.calculateAlphaXp(
          timeSpentSeconds,
          rating,
          feedbackText,
        );

        // Update activity
        activity.time_spent_seconds = timeSpentSeconds;
        activity.feedback_rating = rating;
        activity.feedback_text = feedbackText;
        activity.testing_xp = xpCalculation.testingXp;
        activity.time_spent_xp = xpCalculation.timeSpentXp;
        activity.feedback_quality_xp = xpCalculation.feedbackQualityXp;
        activity.total_xp_earned = xpCalculation.totalXp;
        activity.completed_at = completedAt;
        activity.xp_awarded = true;

        await transactionManager.save(activity);

        // Award XP to user
        await this.userXpService.incrementUserXP(
          userId,
          xpCalculation.totalXp,
          transactionManager,
        );

        return {
          activity,
          xpCalculation,
        };
      },
    );
  }

  /**
   * Get user's alpha activities history
   */
  async getUserAlphaActivities(
    userId: string,
    featureId?: string,
  ): Promise<UserAlphaActivity[]> {
    const where: any = { user: { id: userId } };
    if (featureId) {
      where.feature_id = featureId;
    }

    return await this.alphaActivityRepository.find({
      where,
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Check if user has already completed an alpha feature
   */
  async hasCompletedFeature(
    userId: string,
    featureId: string,
  ): Promise<boolean> {
    const count = await this.alphaActivityRepository.count({
      where: {
        user: { id: userId },
        feature_id: featureId,
        xp_awarded: true,
      },
    });

    return count > 0;
  }

  /**
   * Get XP configuration for display to users
   */
  async getAlphaXpConfigForDisplay(): Promise<AlphaXpConfigInterface> {
    return await this.getAlphaXpConfig();
  }
}
