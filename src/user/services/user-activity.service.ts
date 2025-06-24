import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserActivity } from "../entities/user-activity.entity";
import { Between, EntityManager, FindOptionsWhere, Repository } from "typeorm";
import { DateUtils } from "common/utils/date.util";
import { UserActivityType } from "../types/enums/user-activity-type.enum";
import { ActivityFilter } from "../types/interfaces/user-activity-filters.interface";
import { PaginationInterface } from "shared/interfaces/pagination.interface";
import { default_offset, default_page } from "shared/constants/pagination";
import { PaginatedResponse } from "shared/interfaces/paginated.response.interface";

@Injectable()
export class UserActivityService {
  constructor(
    @InjectRepository(UserActivity)
    private readonly userActivityRepository: Repository<UserActivity>,
  ) {}
  /**
   * record a  new user user activity .
   *
   * @param userId - The unique identifier of the user
   * @param activity_type - The activity type (SIGNUP , MCQ_ATTEMPTED, OTHERS)
   * @returns A Promise that resolves to the user's  activity record
   */
  async recordActivity(
    userId: string,
    activity_type: UserActivityType,
    transactionManager?: EntityManager,
  ): Promise<UserActivity> {
    const user_activity = this.userActivityRepository.create({
      user: { id: userId },
      activity_type,
    });
    return transactionManager
      ? await transactionManager.save(user_activity)
      : await this.userActivityRepository.save(user_activity);
  }

  async findActivitiesPaginated(
    filters: ActivityFilter = {},
    pagination: PaginationInterface = {
      page: default_page,
      offset: default_offset,
    },
  ): Promise<PaginatedResponse<UserActivity>> {
    const { page, offset } = {
      page: default_page,
      offset: default_offset,
      ...pagination,
    };
    const [activities, total] = await this.userActivityRepository.findAndCount({
      where: this.generateWhereClauseFromFilters(filters),
      skip: (page - 1) * offset,
      take: offset,
      order: {
        createdAt: "DESC",
      },
    });
    return {
      data: activities,
      total,
      page: page,
      offset: offset,
      total_pages: Math.ceil(total / offset),
    };
  }
  /**
   * Find all user activities for a given user, optionally filtering by date range.
   *
   * @param userId - The unique identifier of the user.
   * @param filter - An optional object containing start_date and end_date to filter activities within a specific date range.
   * @returns A Promise that resolves to an array of the user's activity records.
   */
  async findUserActivities(
    userId: string,
    filter?: ActivityFilter,
  ): Promise<UserActivity[]> {
    const whereCondition: FindOptionsWhere<UserActivity> = {
      user: { id: userId },
    };

    if (filter?.start_date && filter?.end_date) {
      whereCondition.createdAt = Between(filter.start_date, filter.end_date);
    }

    // Apply activity type filter if provided
    if (filter?.activity_type) {
      whereCondition.activity_type = filter.activity_type;
    }
    return await this.userActivityRepository.find({
      where: whereCondition,
      cache: true, // Enable query caching for frequently accessed data
    });
  }

  /**
   *  get all user activities by user id.
   *
   * @param userId - The unique identifier of the user
   * @returns A Promise that resolves to the user's activities record
   */
  async getUserThisWeekActivities(
    user_id: string,
  ): Promise<Record<string, UserActivity[]>> {
    const { start_of_week, end_of_week } = DateUtils.getCurrentWeekRange();

    if (!start_of_week || !end_of_week) {
      throw new Error("Invalid week date range");
    }

    const user_activities = await this.findUserActivities(user_id, {
      start_date: start_of_week,
      end_date: end_of_week,
    });

    const grouped_activities = new Map<string, UserActivity[]>();

    // Pre-populate with all days of the week to ensure complete data
    const current_date = new Date(start_of_week);
    const formatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });

    while (current_date <= end_of_week) {
      const day_name = formatter.format(current_date); // Get the day name
      grouped_activities.set(day_name, []);
      current_date.setDate(current_date.getDate() + 1);
    }

    // Group activities by day name
    for (const activity of user_activities) {
      const day_name = formatter.format(activity.createdAt); // Convert activity date to day name
      const existing_activities = grouped_activities.get(day_name) || [];
      existing_activities.push(activity);
      grouped_activities.set(day_name, existing_activities);
    }

    return Object.fromEntries(grouped_activities);
  }

  /**
   * Generates a TypeORM where clause based on the provided filters
   * @param filters - The filters to apply to the query
   * @returns A TypeORM compatible where clause object
   * @private
   */
  private generateWhereClauseFromFilters(
    filters: ActivityFilter = {},
  ): FindOptionsWhere<UserActivity> {
    let whereClause: FindOptionsWhere<UserActivity> = {};

    if (filters.user) {
      whereClause.user = { id: filters.user };
    }

    if (filters.activity_type) {
      whereClause.activity_type = filters.activity_type;
    }

    return whereClause;
  }
}
