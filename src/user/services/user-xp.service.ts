import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserXp } from "../entities/user-xp.entity";
import { EntityManager, Repository } from "typeorm";
import { RedisService } from "src/redis/redis.service";
import { RedisKeys } from "common/utils/redis-keys.util";
import { DefaultXPLevelsConfig } from "config/default-levels.config";

/**
 * Service responsible for managing user experience points.
 * Provides methods to create, find, retrieve, and update user XP records.
 */
@Injectable()
export class UserXpService {
  /**
   * Creates an instance of UserXpService.
   * @param userXpRepository - Repository for UserXp entity operations
   */
  constructor(
    @InjectRepository(UserXp)
    private readonly userXpRepository: Repository<UserXp>,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Creates a new XP record for a user
   *
   * @param userId - The unique identifier of the user
   * @param transactionManager - Optional entity manager for transaction support
   * @returns A Promise resolving to the created UserXp object
   */
  async createUserXp(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<UserXp> {
    const new_user_xp = this.userXpRepository.create({
      user: { id: userId },
    });
    const { user, ...result } = transactionManager
      ? await transactionManager.save(new_user_xp)
      : await this.userXpRepository.save(new_user_xp);
    return result as UserXp;
  }

  async calculateUserRank(userXp: number | string) {
    const xp_value = typeof userXp === "string" ? parseInt(userXp) : userXp;

    const rank_result = await this.userXpRepository.query(`
      WITH user_stats AS (
        SELECT 
          COUNT(*) as total_users,
          (SELECT COUNT(*) FROM user_xp WHERE xp > ${xp_value}) as users_above
      )
      SELECT 
        total_users,
        users_above + 1 as rank_position
      FROM user_stats
    `);

    const { total_users, rank_position } = rank_result[0];

    // (lower percentage = higher rank)
    const top_percentile = Math.ceil((rank_position / total_users) * 100);

    // Ensure we dont show 0 at least 1
    const rank_percentile = Math.max(1, Math.min(99, top_percentile));

    return {
      rank_position,
      total_users,
      rank_percentile: `${rank_percentile}%`,
    };
  }
  async CalculateUserLevel(userXp: number | string) {
    let user_level = 0;
    const xp_levels =
      (await this.redisService.get(RedisKeys.getRedisXpLevelsConfig(), true)) ||
      DefaultXPLevelsConfig;
    for (const level of xp_levels) {
      if (userXp >= level.xp) {
        user_level = level.level;
      } else {
        break;
      }
    }
    return user_level;
  }

  //this usage transaction manager specially for the set profile when we need to add xp
  /**
   * Finds an existing XP record for a user.
   * @param userId - The unique identifier of the user
   * @returns A Promise resolving to the UserXp object if found, otherwise null
   */
  async findUserXp(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<UserXp> {
    if (transactionManager) {
      return transactionManager.findOne(UserXp, {
        where: {
          user: { id: userId },
        },
      });
    }
    return this.userXpRepository.findOne({
      where: {
        user: { id: userId },
      },
    });
  }

  /**
   * Gets a user's XP record or creates one if it doesn't exist.
   * @param userId - The unique identifier of the user
   * @returns A Promise resolving to the user's XP record
   */
  async getUserXP(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<UserXp> {
    const userXp = await this.findUserXp(userId, transactionManager);
    if (!userXp) {
      throw new ConflictException("User xp doesnt exists");
    }
    return userXp;
  }

  async getUserXpWithLevel(
    userId: string,
    options?: {
      include_level?: boolean;
      include_rank?: boolean;
    },
  ) {
    const user_xp = await this.getUserXP(userId);
    return {
      ...user_xp,
      level: options?.include_level
        ? await this.CalculateUserLevel(user_xp.xp)
        : undefined,
      ranking: options?.include_rank
        ? await this.calculateUserRank(user_xp.xp)
        : undefined,
    };
  }
  /**
   * Increments a user's XP by the specified amount.
   * @param userId - The unique identifier of the user
   * @param xp - The amount of XP to add to the user's current total
   * @returns A Promise resolving to the updated UserXp object
   */
  async incrementUserXP(
    userId: string,
    xp: number,
    transactionManager?: EntityManager,
  ): Promise<UserXp> {
    if (xp == 0) return;
    const user_xp = await this.getUserXP(userId, transactionManager);
    user_xp.xp += xp;
    return transactionManager
      ? await transactionManager.save(user_xp)
      : await this.userXpRepository.save(user_xp);
  }
}
