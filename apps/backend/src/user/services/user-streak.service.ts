import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserStreak } from "../entities/user-streak.entity";
import { EntityManager, Repository } from "typeorm";
import { UserActivityService } from "./user-activity.service";
import { DatabaseDateUtils } from "common/utils/database-date.util";

/**
 * Service responsible for managing user streak functionality.
 * Handles user streak creation, retrieval, incrementation, and reset operations.
 */
@Injectable()
export class UserStreakService {
  constructor(
    @InjectRepository(UserStreak)
    private readonly userStreakRepository: Repository<UserStreak>,
    private readonly userActivityService: UserActivityService,
  ) {}

  /**
   * Create new user streak entity.
   *
   * @param userId - The unique identifier of the user
   * @param transactionManager - Optional entity manager for transaction support
   * @returns A Promise that resolves to the user's streak record
   */
  async createStreak(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<UserStreak> {
    const newStreak = this.userStreakRepository.create({
      user: { id: userId },
    });

    const savedStreak = transactionManager
      ? await transactionManager.save(newStreak)
      : await this.userStreakRepository.save(newStreak);

    const { user, ...streakWithoutUser } = savedStreak;
    return streakWithoutUser as UserStreak;
  }

  /**
   * Finds a user's streak record by their user ID.
   *
   * @param userId - The unique identifier of the user
   * @returns A Promise that resolves to the user's streak record or undefined if not found
   */
  async findStreakByUserId(userId: string): Promise<UserStreak | null> {
    return this.userStreakRepository.findOne({
      where: {
        user: { id: userId },
      },
    });
  }

  /**
   * Gets a user's streak record by user id, creating one if it doesn't exist.
   *
   * @param userId - The unique identifier of the user
   * @returns A Promise that resolves to the user's streak record
   */
  async getAuthenticatedUserStreak(userId: string): Promise<UserStreak> {
    const streak = await this.findStreakByUserId(userId);
    if (!streak) {
      Logger.warn(`User ${userId} does not have streak record`);
      throw new ConflictException("User Streak doesn't exist");
    }

    const today = DatabaseDateUtils.getTodayDate();

    // Check if streak was already updated today
    if (DatabaseDateUtils.isSameDay(streak.last_streak_date, today)) {
      return streak; // Streak already updated today, no need to process further
    }

    const { data } = await this.userActivityService.findActivitiesPaginated(
      { user: userId },
      { offset: 1 },
    );

    const latest_activity = data[0];

    // No activities or gap greater than 1 day - reset streak
    if (
      !latest_activity ||
      DatabaseDateUtils.getDaysBetween(latest_activity.createdAt, today) > 1
    ) {
      return this.resetStreak(streak, today);
    }

    // Today is consecutive day from latest activity - increment streak
    if (DatabaseDateUtils.isConsecutiveDay(latest_activity.createdAt, today)) {
      return this.incrementCurrentStreak(streak, today);
    }

    // Activity from today but already counted or other cases
    return streak;
  }

  /**
   * Resets the user's streak.
   *
   * @param streak - The user's streak record
   * @param today - Today's date
   * @returns A Promise that resolves to the updated UserStreak entity
   */
  private async resetStreak(
    streak: UserStreak,
    today: Date,
  ): Promise<UserStreak> {
    streak.current_streak = 1;
    streak.longest_streak = Math.max(1, streak.longest_streak);
    streak.last_streak_date = today;
    return this.userStreakRepository.save(streak);
  }

  /**
   * Increments the user's current streak.
   *
   * @param streak - The user's streak record
   * @param today - Today's date
   * @returns A Promise that resolves to the updated UserStreak entity
   */
  private async incrementCurrentStreak(
    streak: UserStreak,
    today: Date,
  ): Promise<UserStreak> {
    streak.current_streak += 1;
    streak.longest_streak = Math.max(
      streak.current_streak,
      streak.longest_streak,
    );
    streak.last_streak_date = today;
    return this.userStreakRepository.save(streak);
  }
}
