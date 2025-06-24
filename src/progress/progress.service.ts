import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Progress } from "./entities/progress.entity";
import {
  Between,
  EntityManager,
  FindOptionsSelect,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from "typeorm";
import { CreateProgressInterface } from "./types/interfaces/create-progress.interface";
import {
  ProgressCountByMultiFilterInterface,
  ProgressCountBySingleFiltersInterface,
} from "./types/interfaces/progress-count-filters.interface";
import { PaginationInterface } from "shared/interfaces/pagination.interface";
import { ProgressFilters } from "./types/interfaces/progress-filters.interface";
import { calculateAccuracyTrend } from "common/utils/calculation.util";
import { DateUtils } from "common/utils/date.util";
import { RedisService } from "src/redis/redis.service";
import { RedisKeys } from "common/utils/redis-keys.util";
import { AccuracyThresholdConfigInterface } from "shared/interfaces/accuracy-threshold-config.interface";

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Progress)
    private readonly progressRepository: Repository<Progress>,
    private readonly redisService: RedisService,
  ) {}

  // ---------------------- SECTION 1 -------------------------------------
  /**
   * Create a new progress record for a user
   *
   * @param {string} userId - The ID of the user creating the progress
   * @param {CreateProgressInterface} createProgressInterface - Details of the progress to be created
   * @returns {Promise<void>}
   */
  async createUserProgress(
    userId: string,
    createProgressInterface: CreateProgressInterface,
    transactionManager?: EntityManager,
  ) {
    const { mcq, unit, course, subject, session, ...progressData } =
      createProgressInterface;

    const progress = this.progressRepository.create({
      ...progressData,
      user: { id: userId },
      mcq: { id: mcq },
      unit: { id: unit },
      course: { id: course },
      subject: { id: subject },
      session: { id: session },
    });

    return transactionManager
      ? await transactionManager.save(progress)
      : await this.progressRepository.save(progress);
  }

  /**
   * Find a specific progress record for a user
   *
   * @param {string} progressId - The ID of the progress record
   * @param {User} user - The user who owns the progress record
   * @returns {Promise<Progress>} The found progress record
   */
  async findOneProgress(params: {
    progressId: string;
    userId: string;
  }): Promise<Progress> {
    return this.progressRepository.findOne({
      where: {
        ...(params.progressId ? { id: params.progressId } : {}),
        ...(params.userId ? { user: { id: params.userId } } : {}),
      },
    });
  }

  /**
   * get a specific progress record for a user
   *
   * @param {string} progressId - The ID of the progress record
   * @param {User} user - The user who owns the progress record
   * @returns {Promise<Progress>} The found progress record
   * @throws {NotFoundException} If the progress record is not found
   */
  async getOneProgress(params: {
    progressId: string;
    userId: string;
  }): Promise<Progress> {
    const progress = await this.findOneProgress(params);
    if (!progress) {
      throw new NotFoundException("Progress not found");
    }
    return progress;
  }

  // ----------------------- SECTION 2 ------------------------------------------------------
  /**
   * Find paginated progress records with optional filtering
   *
   * @param {ProgressFilters} filters - Filters to apply to the progress search
   * @param {PaginationInterface} pagination - Pagination settings (default: page 1, 10 items per page)
   * @param {Object} [options] - Additional options for the query
   * @param {boolean} [options.populate=false] - Whether to populate related MCQ data
   * @returns {Promise<{
   *   progress: Progress[],
   *   pages: number,
   *   total: number,
   *   page: number,
   *   offset: number
   * }>} Paginated progress results
   */
  async findProgressPaginated(
    filters: ProgressFilters,
    pagination: PaginationInterface = { page: 1, offset: 10 },
    options?: {
      populate: boolean;
    },
  ) {
    const relations = options?.populate ? ["mcq"] : [];
    const [progress, total] = await this.progressRepository.findAndCount({
      where: this.generateWhereClauseFromFilters(filters),
      relations,
      take: pagination.offset,
      skip: (pagination.page - 1) * pagination.offset,
    });
    return {
      progress,
      pages: Math.ceil(total / pagination.offset),
      total,
      page: pagination.page,
      offset: pagination.offset,
    };
  }

  /**
   * Finds a progress record.
   *
   * @param params - Search parameters
   * @param params.userId - Optional user ID to search by
   * @param params.sessionId - Optional session ID to search by
   * @param options - Query options
   * @param options.select - Optional object specifying which fields to select from the Progress entity
   * @returns A Promise that resolves to the matching Progress entity or null if not found
   */
  async findProgress(
    filters: ProgressFilters,
    options: {
      select?: FindOptionsSelect<Progress>;
      relations?: string[];
      distinct?: true;
    } = {},
  ): Promise<Progress[] | any> {
    const mcqs = await this.progressRepository.find({
      where: this.generateWhereClauseFromFilters(filters),
      relations: options.relations && options.relations,
      select: options.select,
    });
    console.log(mcqs);
    if (options.distinct) {
      return Array.from(
        new Map(mcqs.map((item) => [item.mcq.id, item])).values(),
      );
    }
    return mcqs;
  }

  // ----------------- SECTION 3: Analytics and Statistics

  /**
   * Provides comprehensive user analytics combining both progress and summary information.
   *
   * @param userId - The unique identifier of the user
   * @param options - Configuration options for the analytics
   * @returns Combined analytics object with current progress and historical summary
   */
  async getUserAnalytics(
    userId: string,
    options: {
      recent_quiz_limit?: number;
      week_comparison_period?: number;
      include_trend_data?: boolean;
    } = {},
  ) {
    const {
      recent_quiz_limit = 5,
      week_comparison_period = 7,
      include_trend_data = true,
    } = options;

    // Calculate date ranges
    const { start_of_week: currentWeekStart, end_of_week: currentWeekEnd } =
      DateUtils.getCurrentWeekRange();

    // Calculate previous week and month ranges
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(
      previousWeekStart.getDate() - week_comparison_period,
    );

    const previousWeekEnd = new Date(currentWeekEnd);
    previousWeekEnd.setDate(previousWeekEnd.getDate() - week_comparison_period);

    const lastMonthDate = new Date(currentWeekStart);
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

    // Create a single comprehensive query for most metrics
    const baseQuery = this.progressRepository
      .createQueryBuilder("progress")
      .innerJoinAndSelect("progress.subject", "subject")
      .innerJoinAndSelect("progress.mcq", "mcq")
      .where("progress.userId = :userId", { userId });

    // Perform different queries based on time periods
    const [
      allTimeRecords,
      lastMonthRecords,
      currentWeekRecords,
      previousWeekRecords,
      accuracyTrendData,
    ] = await Promise.all([
      // All-time records for comprehensive metrics
      baseQuery.clone().getMany(),

      // Last month records for recent activity
      baseQuery
        .clone()
        .andWhere("progress.createdAt >= :lastMonthDate", { lastMonthDate })
        .getMany(),

      // Current week records for weekly comparison
      baseQuery
        .clone()
        .andWhere(
          "progress.createdAt BETWEEN :currentWeekStart AND :currentWeekEnd",
          { currentWeekStart, currentWeekEnd },
        )
        .getMany(),

      // Previous week records for weekly comparison
      baseQuery
        .clone()
        .andWhere(
          "progress.createdAt BETWEEN :previousWeekStart AND :previousWeekEnd",
          { previousWeekStart, previousWeekEnd },
        )
        .getMany(),

      // Accuracy trend data (only if requested)
      include_trend_data
        ? this.progressRepository
            .createQueryBuilder("progress")
            .where("progress.userId = :userId", { userId })
            .select([
              "DATE(progress.createdAt) as date",
              "AVG(progress.success_ratio) as daily_accuracy",
              "SUM(progress.time_spent) as daily_time_spent",
            ])
            .groupBy("date")
            .orderBy("date", "ASC")
            .limit(30)
            .getRawMany()
        : Promise.resolve([]),
    ]);

    // Get accuracy threshold config from Redis
    const { correct_threshold, performance_bands } =
      (await this.redisService.get(
        RedisKeys.getRedisAccuracyThresholdConfig(),
        true,
      )) as AccuracyThresholdConfigInterface;

    // Calculate subject metrics from all-time records
    const subjectMetrics = this.calculateSubjectMetrics(allTimeRecords);

    // Calculate overall metrics
    const overallMetrics = this.calculateOverallMetrics(
      allTimeRecords,
      accuracyTrendData,
    );

    // Calculate recent activity metrics
    const recentActivityMetrics = this.calculateRecentActivityMetrics(
      lastMonthRecords,
      recent_quiz_limit,
      correct_threshold,
      performance_bands,
    );

    // Calculate weekly comparison
    const weeklyComparisonMetrics = this.calculateWeeklyComparisonMetrics(
      currentWeekRecords,
      previousWeekRecords,
    );

    return {
      // Overall performance metrics (from getUserSummary)
      overall_summary: overallMetrics,

      // Subject strengths (from getUserSummary)
      subject_strengths: subjectMetrics.subject_strengths,

      // Recent activity metrics (from getUserProgress)
      recent_activity: {
        progress_by_module: recentActivityMetrics.module_progress,
        performance: recentActivityMetrics.performance_metrics,
        recent_quizzes: recentActivityMetrics.recent_quizzes,
      },

      // Weekly comparison (from getUserProgress)
      weekly_comparison: weeklyComparisonMetrics,

      // Historical trend data (if requested)
      accuracy_trend: include_trend_data ? accuracyTrendData : undefined,
    };
  }

  //------------------------ SECTION 4: Counting and Aggregation -----------------

  /**
   * Calculate subject-level metrics from progress records
   */
  private calculateSubjectMetrics(progressRecords: Progress[]) {
    const subjectRecordsMap = new Map<
      string,
      {
        id: string;
        name: string;
        records: Progress[];
      }
    >();

    for (const record of progressRecords) {
      const subjectId = record.subject.id;
      if (!subjectRecordsMap.has(subjectId)) {
        subjectRecordsMap.set(subjectId, {
          id: subjectId,
          name: record.subject.name,
          records: [],
        });
      }
      subjectRecordsMap.get(subjectId).records.push(record);
    }

    const subject_strengths = [];
    const module_progress = [];

    for (const [_, subject] of subjectRecordsMap.entries()) {
      const subjectRecords = subject.records;
      const recordCount = subjectRecords.length;
      if (recordCount === 0) continue;

      let totalSuccessRatio = 0;
      let sumSquaredDiff = 0;
      let totalTime = 0;
      const uniqueMcqIds = new Set<string>();

      for (const record of subjectRecords) {
        totalSuccessRatio += record.success_ratio || 0;
        totalTime += record.time_spent || 0;
        uniqueMcqIds.add(record.mcq.id);
      }

      const avgSuccessRatio = totalSuccessRatio / recordCount;

      for (const record of subjectRecords) {
        sumSquaredDiff += Math.pow(
          (record.success_ratio || 0) - avgSuccessRatio,
          2,
        );
      }

      const stdDev = Math.sqrt(sumSquaredDiff / recordCount);

      subject_strengths.push({
        subject: subject.name,
        subject_id: subject.id,
        strength: this.calculateSubjectStrength(
          avgSuccessRatio * 100,
          stdDev * 100,
        ),
        attempts: recordCount,
        unique_mcqs: uniqueMcqIds.size,
        total_time: Number(totalTime.toFixed(2)),
        average_time: Number((totalTime / recordCount).toFixed(2)),
      });

      module_progress.push({
        subject: subject.name,
        uniqueMcqCount: uniqueMcqIds.size,
      });
    }

    return {
      subject_strengths,
      module_progress,
    };
  }

  /**
   * Calculate overall performance metrics
   */
  private calculateOverallMetrics(allRecords: Progress[], trendData: any[]) {
    if (!allRecords.length) {
      return {
        total_mcqs_attempted: 0,
        unique_mcqs: 0,
        total_time_spent: 0,
        average_time_spent: 0,
        overall_accuracy: {
          percentage: 0,
          trend: 0,
        },
      };
    }

    // Calculate unique MCQs
    const uniqueMcqsCount = new Set(allRecords.map((record) => record.mcq.id))
      .size;

    // Calculate time metrics
    const totalTimeSpent = allRecords.reduce(
      (sum, record) => sum + (record.time_spent || 0),
      0,
    );
    const averageTimeSpent = totalTimeSpent / allRecords.length;

    // Calculate weighted accuracy (by subject attempts)
    const subjectAttemptsMap = allRecords.reduce(
      (map, record) => {
        const subjectId = record.subject.id;
        if (!map[subjectId]) {
          map[subjectId] = {
            attempts: 0,
            successTotal: 0,
          };
        }
        map[subjectId].attempts++;
        map[subjectId].successTotal += record.success_ratio || 0;
        return map;
      },
      {} as Record<string, { attempts: number; successTotal: number }>,
    );

    let totalAttempts = 0;
    let weightedAccuracySum = 0;

    Object.values(subjectAttemptsMap).forEach((data) => {
      const subjectAvgAccuracy = data.successTotal / data.attempts;
      weightedAccuracySum += subjectAvgAccuracy * data.attempts;
      totalAttempts += data.attempts;
    });

    const overallAccuracy =
      totalAttempts > 0 ? weightedAccuracySum / totalAttempts : 0;

    return {
      total_mcqs_attempted: allRecords.length,
      unique_mcqs: uniqueMcqsCount,
      total_time_spent: Number(totalTimeSpent.toFixed(2)),
      average_time_spent: Number(averageTimeSpent.toFixed(2)),
      overall_accuracy: {
        percentage: Number((overallAccuracy * 100).toFixed(2)),
        trend: calculateAccuracyTrend(trendData),
      },
    };
  }

  /**
   * Calculate recent activity metrics
   */
  private calculateRecentActivityMetrics(
    recentRecords: Progress[],
    recent_quiz_limit: number,
    correctThreshold: number,
    performanceBands: any,
  ) {
    // Sort records by creation date (descending)
    const sortedRecords = [...recentRecords].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    // Recent quizzes
    const recentQuizzes = sortedRecords
      .slice(0, recent_quiz_limit)
      .map((record) => ({
        subject: record.subject.name,
        accuracy: (record.success_ratio * 100).toFixed(2),
        date: record.createdAt,
      }));

    // Calculate performance metrics
    const totalAttempts = recentRecords.length;
    const correctMcqs = recentRecords.filter(
      (record) => record.success_ratio >= correctThreshold,
    ).length;
    const incorrectMcqs = totalAttempts - correctMcqs;

    // Calculate overall accuracy
    const overallAccuracy =
      totalAttempts > 0 ? (correctMcqs / totalAttempts) * 100 : 0;

    // Determine performance band
    let performanceBand = "poor";
    if (overallAccuracy >= performanceBands.excellent * 100) {
      performanceBand = "excellent";
    } else if (overallAccuracy >= performanceBands.good * 100) {
      performanceBand = "good";
    } else if (overallAccuracy >= performanceBands.fair * 100) {
      performanceBand = "fair";
    }

    return {
      recent_quizzes: recentQuizzes,
      performance_metrics: {
        total_attempted_mcqs: totalAttempts,
        correct_mcqs: correctMcqs,
        incorrect_mcqs: incorrectMcqs,
        overall_accuracy: overallAccuracy,
        performance_band: performanceBand,
      },
      module_progress:
        this.calculateSubjectMetrics(recentRecords).module_progress,
    };
  }

  /**
   * Calculate weekly comparison metrics
   */
  private calculateWeeklyComparisonMetrics(
    currentWeekRecords: Progress[],
    previousWeekRecords: Progress[],
  ) {
    // Calculate accuracies
    const calculateAccuracy = (records: Progress[]) =>
      records.length > 0
        ? records.reduce(
            (sum, record) => sum + (record.success_ratio || 0),
            0,
          ) / records.length
        : 0;

    const currentWeekAccuracy = calculateAccuracy(currentWeekRecords);
    const previousWeekAccuracy = calculateAccuracy(previousWeekRecords);

    // Calculate accuracy change
    const accuracyChange = currentWeekAccuracy - previousWeekAccuracy;
    const accuracyChangePercentage =
      previousWeekAccuracy > 0
        ? (accuracyChange / previousWeekAccuracy) * 100
        : 0;

    return {
      current_week_accuracy: (currentWeekAccuracy * 100).toFixed(2),
      previous_week_accuracy: (previousWeekAccuracy * 100).toFixed(2),
      accuracy_change: accuracyChangePercentage.toFixed(2),
      current_week_attempts: currentWeekRecords.length,
      previous_week_attempts: previousWeekRecords.length,
    };
  }

  /**
   * Count the number of MCQ progress records based on single filters (one user , one unit , one subject.....)
   *
   * @param {ProgressCountBySingleFiltersInterface} countFilters - Filters to apply to the count
   * @param {Object} options - Additional options for counting
   * @param {boolean} [options.distinct=false] - Whether to count distinct MCQs
   * @returns {Promise<number>} The number of MCQ progress records
   */
  async countMcqsProgressBySingleFilter(
    countFilters: ProgressCountBySingleFiltersInterface,
    options: { distinct: boolean } = { distinct: false },
  ): Promise<number> {
    let query = this.progressRepository
      .createQueryBuilder("progress")
      .select(
        options.distinct
          ? "COUNT(DISTINCT progress.mcqId)"
          : "COUNT(progress.mcqId)",
        "count",
      );

    //add count conditions
    if (countFilters.user) {
      query = query.where("progress.userId = :userId", {
        userId: countFilters.user,
      });
    }
    if (countFilters.unit) {
      query = query.andWhere("progress.unitId = :unitId", {
        unitId: countFilters.unit,
      });
    }
    if (countFilters.course) {
      query = query.andWhere("progress.courseId = :courseId", {
        courseId: countFilters.course,
      });
    }
    if (countFilters.subject) {
      query = query.andWhere("progress.subjectId = :subjectId", {
        subjectId: countFilters.subject,
      });
    }
    return Number((await query.getRawOne()).count) || 0;
  }

  /**
   * Count the number of MCQ progress records based on multiple filters (many users , many units , many subjects.....)
   *
   * @param {ProgressCountByMultiFilterInterface} countFilters - Filters to apply to the count
   * @param {Object} options - Additional options for counting
   * @param {boolean} [options.distinct=false] - Whether to count distinct MCQs
   * @returns {Promise<number>} The number of MCQ progress records
   */
  async countMcqsProgressByMultipleFilters(
    countFilters: ProgressCountByMultiFilterInterface,
    options: { distinct: boolean } = { distinct: false },
  ): Promise<
    { unitId?: string; courseId?: string; subjectId?: string; count: number }[]
  > {
    let query = this.progressRepository
      .createQueryBuilder("progress")
      .select(
        options.distinct
          ? "COUNT(DISTINCT progress.mcqId)"
          : "COUNT(progress.mcqId)",
        "count",
      );

    if (countFilters.user) {
      query = query.where("progress.userId = :userId", {
        userId: countFilters.user,
      });
    }

    if (countFilters.units && countFilters.units.length > 0) {
      query = query
        .addSelect("progress.unitId", "unitId")
        .andWhere("progress.unitId IN (:...units)", {
          units: countFilters.units,
        })
        .groupBy("progress.unitId");
    }

    if (countFilters.courses && countFilters.courses.length > 0) {
      query = query
        .addSelect("progress.courseId", "courseId")
        .andWhere("progress.courseId IN (:...courses)", {
          courses: countFilters.courses,
        })
        .groupBy("progress.courseId");
    }

    if (countFilters.subjects && countFilters.subjects.length > 0) {
      query = query
        .addSelect("progress.subjectId", "subjectId")
        .andWhere("progress.subjectId IN (:...subjects)", {
          subjects: countFilters.subjects,
        })
        .groupBy("progress.subjectId");
    }
    return query.getRawMany();
  }

  /**
   * Calculate total XP gained by users based on multiple filters (units, courses, subjects, etc.)
   *
   * @param {ProgressCountByMultiFilterInterface} xpFilters - Filters to apply to the XP calculation
   * @returns {Promise<{ unitId?: string; courseId?: string; subjectId?: string; totalXp: number }[]>} Array of XP results grouped by the specified dimensions
   */
  async calculateXpByMultipleFilters(
    xpFilters: ProgressCountByMultiFilterInterface,
  ): Promise<
    {
      unitId?: string;
      courseId?: string;
      subjectId?: string;
      totalXp: number;
    }[]
  > {
    let query = this.progressRepository
      .createQueryBuilder("progress")
      .select("SUM(progress.gained_xp)", "totalXp");

    if (xpFilters.user) {
      query = query.where("progress.userId = :userId", {
        userId: xpFilters.user,
      });
    }

    if (xpFilters.units && xpFilters.units.length > 0) {
      query = query
        .addSelect("progress.unitId", "unitId")
        .andWhere("progress.unitId IN (:...units)", {
          units: xpFilters.units,
        })
        .groupBy("progress.unitId");
    }

    if (xpFilters.courses && xpFilters.courses.length > 0) {
      query = query
        .addSelect("progress.courseId", "courseId")
        .andWhere("progress.courseId IN (:...courses)", {
          courses: xpFilters.courses,
        })
        .groupBy("progress.courseId");
    }

    if (xpFilters.subjects && xpFilters.subjects.length > 0) {
      query = query
        .addSelect("progress.subjectId", "subjectId")
        .andWhere("progress.subjectId IN (:...subjects)", {
          subjects: xpFilters.subjects,
        })
        .groupBy("progress.subjectId");
    }

    return query.getRawMany();
  }

  /**
   * Calculate total XP gained by a user based on single filters (one unit, one subject, etc.)
   *
   * @param {ProgressCountBySingleFiltersInterface} xpFilters - Filters to apply to the XP calculation
   * @returns {Promise<number>} The total XP gained
   */
  async calculateXpBySingleFilter(
    xpFilters: ProgressCountBySingleFiltersInterface,
  ): Promise<number> {
    let query = this.progressRepository
      .createQueryBuilder("progress")
      .select("SUM(progress.gained_xp)", "totalXp");

    // Add XP calculation conditions
    if (xpFilters.user) {
      query = query.where("progress.userId = :userId", {
        userId: xpFilters.user,
      });
    }

    if (xpFilters.unit) {
      query = query.andWhere("progress.unitId = :unitId", {
        unitId: xpFilters.unit,
      });
    }

    if (xpFilters.course) {
      query = query.andWhere("progress.courseId = :courseId", {
        courseId: xpFilters.course,
      });
    }

    if (xpFilters.subject) {
      query = query.andWhere("progress.subjectId = :subjectId", {
        subjectId: xpFilters.subject,
      });
    }

    const result = await query.getRawOne();
    return Number(result?.totalXp || 0);
  }
  // ------------------- SECTION 5: Helper Methods ---------------------
  /**
   * Get accuracy trend over time
   * @param userId - The ID of the user
   * @param limit - Number of recent records to consider
   * @returns Array of accuracy points
   */
  async getAccuracyOverTime(userId: string, limit: number = 30) {
    return this.progressRepository.find({
      where: {
        user: { id: userId },
      },
      select: ["id", "createdAt", "success_ratio"],
      order: {
        createdAt: "ASC",
      },
      take: limit,
    });
  }

  /**
   * Generate a where clause for filtering progress records
   *
   * @private
   * @param {ProgressFilters} [filters={}] - Filters to apply to the query
   * @returns {FindOptionsWhere<Progress>} Generated where clause for TypeORM query
   */
  private generateWhereClauseFromFilters(
    filters: ProgressFilters = {},
  ): FindOptionsWhere<Progress> {
    let where_clause: FindOptionsWhere<Progress> = {};

    // Filter by user
    if (filters.user) {
      where_clause.user = { id: filters.user };
    }

    if (filters.session) {
      where_clause.session = { id: filters.session };
    }
    // Filter by unit
    if (filters.unit) {
      where_clause.unit = { id: filters.unit };
    }

    // Filter by course
    if (filters.course) {
      where_clause.course = { id: filters.course };
    }

    // Filter by subject
    if (filters.subject) {
      where_clause.subject = { id: filters.subject };
    }

    // Filter by MCQ
    if (filters.mcq) {
      where_clause.mcq = { id: filters.mcq };
    }

    // Filter by time spent
    if (
      filters.time_spent_min !== undefined &&
      filters.time_spent_max !== undefined &&
      !isNaN(Number(filters.time_spent_min)) &&
      !isNaN(Number(filters.time_spent_max))
    ) {
      where_clause.time_spent = Between(
        Number(filters.time_spent_min),
        Number(filters.time_spent_max),
      );
    } else if (
      filters.time_spent_min !== undefined &&
      !isNaN(Number(filters.time_spent_min))
    ) {
      where_clause.time_spent = MoreThanOrEqual(Number(filters.time_spent_min));
    } else if (
      filters.time_spent_max !== undefined &&
      !isNaN(Number(filters.time_spent_max))
    ) {
      where_clause.time_spent = LessThanOrEqual(Number(filters.time_spent_max));
    }

    // Filter by success ratio
    if (
      filters.success_ratio_min !== undefined &&
      filters.success_ratio_max !== undefined &&
      !isNaN(Number(filters.success_ratio_min)) &&
      !isNaN(Number(filters.success_ratio_max))
    ) {
      where_clause.success_ratio = Between(
        Number(filters.success_ratio_min),
        Number(filters.success_ratio_max),
      );
    } else if (
      filters.success_ratio_min !== undefined &&
      !isNaN(Number(filters.success_ratio_min))
    ) {
      where_clause.success_ratio = MoreThanOrEqual(
        Number(filters.success_ratio_min),
      );
    } else if (
      filters.success_ratio_max !== undefined &&
      !isNaN(Number(filters.success_ratio_max))
    ) {
      where_clause.success_ratio = LessThanOrEqual(
        Number(filters.success_ratio_max),
      );
    }

    // Filter by response (for QROC type)
    if (filters.response) {
      where_clause.response = ILike(`%${filters.response}%`);
    }

    // Filter by feedback
    if (filters.feedback) {
      where_clause.feedback = ILike(`%${filters.feedback}%`);
    }

    return where_clause;
  }
  /**
   * Calculates the strength of a subject based on accuracy and deviation.
   *
   * @param accuracy - The accuracy percentage (0-100) for the subject
   * @param deviation - The deviation or inconsistency in performance
   * @returns A weighted score between 0-100 representing subject strength,
   *          where 70% of the score comes from accuracy and 30% from consistency
   * @example
   * // Returns 85.0 (70% of 100 + 30% of 50)
   * calculateSubjectStrength(100, 50);
   */
  private calculateSubjectStrength(
    accuracy: number,
    deviation: number,
  ): number {
    const consistency_factor = Math.max(0, 100 - deviation);
    return Number((accuracy * 0.7 + consistency_factor * 0.3).toFixed(2));
  }
}
