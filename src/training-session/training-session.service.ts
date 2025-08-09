import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Between,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from "typeorm";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bullmq";
import { TrainingSession } from "./entities/training-session.entity";
import { Mcq } from "src/mcq/entities/mcq.entity";
import { Progress } from "src/progress/entities/progress.entity";
import { CreateTrainingSessionDto } from "./types/dtos/create-training-session.dto";
import { TrainingSessionStatus } from "./types/enums/training-session.enum";
import { TrainingSessionFilters } from "./types/interfaces/training-session-filters.interface";
import { McqType, McqDifficulty } from "src/mcq/dto/mcq.type";
import { TrainingSessionReminderEmail } from "src/mail/types/training-session-reminder-email.interface";
import { AssistantDeterminedFields } from "./assistant-determined-fields.interface";
import { UserService } from "src/user/services/user.service";
import { UserProfileService } from "src/user/services/user-profile.service";
import { ProgressService } from "src/progress/progress.service";
import { McqService } from "src/mcq/mcq.service";
import { RedisService } from "src/redis/redis.service";
import { AdaptiveEngineService } from "src/adaptive-engine/adaptive-engine.service";
import { DateUtils } from "common/utils/date.util";
import { createSessionLink } from "common/utils/url.util";
import { RedisKeys } from "common/utils/redis-keys.util";
import { default_offset, default_page } from "shared/constants/pagination";
import { PaginationInterface } from "shared/interfaces/pagination.interface";
import { AccuracyThresholdConfigInterface } from "shared/interfaces/accuracy-threshold-config.interface";
import { ModeDefiner } from "src/mode/types/enums/mode-definier.enum";
import { NotificationType } from "src/notification/types/enums/notification-type.enum";
import { NotificationStatus } from "src/notification/types/enums/notification-status.enum";
import { NotificationChannel } from "src/notification/types/enums/notification-channel.enum";

/**
 * Service responsible for managing training sessions in the e-learning platform
 *
 * Handles the full lifecycle of training sessions including:
 * - Creation and configuration of sessions
 * - Retrieval and filtering of sessions
 * - Assignment of MCQs based on user progress and adaptive learning
 * - Session status management
 * - Performance evaluation and results
 */
@Injectable()
export class TrainingSessionService {
  constructor(
    @InjectRepository(TrainingSession)
    private readonly trainingSessionRepository: Repository<TrainingSession>,
    @InjectQueue("email-queue") private emailQueue: Queue,
    @InjectQueue("notification-queue") private notificationQueue: Queue,
    private readonly userService: UserService,
    private readonly userProfileService: UserProfileService,
    private readonly progressService: ProgressService,
    private readonly mcqService: McqService,
    private readonly redisService: RedisService,
    private readonly adaptiveEngineService: AdaptiveEngineService,
  ) {}

  /**
   * Creates a new training session for a user with configured parameters
   *
   * @param userId - The ID of the user creating the session
   * @param createTrainingSessionDto - Data transfer object containing session configuration
   * @returns The ID of the successfully created training session
   * @throws BadRequestException if the session configuration is invalid
   */
  async create(
    userId: string,
    createTrainingSessionDto: CreateTrainingSessionDto,
  ) {
    this.validateSessionCreation(createTrainingSessionDto);

    const sessionParams = await this.defineTrainingSessionParams(
      { userId, courseId: createTrainingSessionDto.course },
      createTrainingSessionDto,
    );

    const trainingSession = this.trainingSessionRepository.create({
      ...sessionParams,
      course: { id: createTrainingSessionDto.course },
      user: { id: userId },
    });

    const savedSession =
      await this.trainingSessionRepository.save(trainingSession);

    if (createTrainingSessionDto.status === TrainingSessionStatus.SCHEDULED) {
      await this.scheduleReminderEmail(
        { userId, sessionId: savedSession.id },
        savedSession,
      );
    }

    return savedSession.id;
  }

  /**
   * Retrieves paginated training sessions based on provided filters
   *
   * @param filters - Optional criteria to filter sessions
   * @param pagination - Pagination parameters for result limiting
   * @returns Paginated list of training sessions matching the criteria
   */
  async findSessionsPaginated(
    filters: TrainingSessionFilters = {},
    pagination: PaginationInterface = {
      page: default_page,
      offset: default_offset,
    },
  ) {
    const [sessions, total] = await this.trainingSessionRepository.findAndCount(
      {
        where: this.generateWhereClauseFromFilters(filters),
        skip: (pagination.page - 1) * pagination.offset,
        take: pagination.offset,
      },
    );

    return {
      data: sessions,
      total,
      page: pagination.page,
      offset: pagination.offset,
      total_pages: Math.ceil(total / pagination.offset),
    };
  }

  /**
   * Finds a single training session by user ID and/or session ID
   *
   * @param params - Parameters object containing userId and/or sessionId
   * @param options - Query options including relations to include
   * @returns The found training session or null if not found
   */
  findOneSession(
    params: { userId?: string; sessionId?: string },
    options: { relation: string[] } = { relation: [] },
  ) {
    const whereClause = {};

    if (params.sessionId) {
      whereClause["id"] = params.sessionId;
    }

    if (params.userId) {
      whereClause["user"] = { id: params.userId };
    }

    return this.trainingSessionRepository.findOne({
      where: whereClause,
      relations: options.relation,
    });
  }

  /**
   * Retrieves a session and updates its status if needed
   *
   * @param params - Parameters object containing userId and/or sessionId
   * @returns The training session with related course
   * @throws NotFoundException if session is not found
   */
  async getSession(params: { userId?: string; sessionId?: string }) {
    const { sessionId } = params;
    const session = await this.findOneSession(params, { relation: ["course"] });

    if (!session) {
      throw new NotFoundException("Session not found");
    }

    const shouldUpdateStatus = [
      TrainingSessionStatus.SCHEDULED,
      TrainingSessionStatus.PENDING,
    ].includes(session.status);

    if (shouldUpdateStatus) {
      await this.updateSessionStatus(
        sessionId,
        TrainingSessionStatus.IN_PROGRESS,
      );
    }

    return session;
  }

  /**
   * Retrieves MCQs for a training session that haven't been attempted by the user
   *
   * @param userId - The ID of the user
   * @param sessionId - The ID of the training session
   * @returns Paginated list of MCQs for the session with appropriate time limits
   */
  async getSessionMcqs(userId: string, sessionId: string) {
    const session = await this.getSession({ sessionId, userId });

    const { mode } =
      await this.userProfileService.getAuthenticatedUserProfileById(userId);
    const isAssistantMode =
      mode.include_qcm_definer === ModeDefiner.ASSISTANT ||
      mode.include_qcs_definer === ModeDefiner.ASSISTANT ||
      mode.include_qroc_definer === ModeDefiner.ASSISTANT ||
      mode.time_limit_definer === ModeDefiner.ASSISTANT ||
      mode.number_of_questions_definer === ModeDefiner.ASSISTANT ||
      mode.randomize_questions_order_definer === ModeDefiner.ASSISTANT ||
      mode.randomize_options_order_definer === ModeDefiner.ASSISTANT ||
      mode.difficulty_definer === ModeDefiner.ASSISTANT;

    // Get previously attempted MCQs to exclude them
    const attempted_progress_list = await this.progressService.findProgress(
      { user: userId, session: sessionId },
      {
        relations: ["mcq"],
        select: { mcq: { id: true }, id: true },
        distinct: true,
      },
    );

    const attemptedMcqIds = attempted_progress_list.map(
      (progress: Progress) => progress.mcq.id,
    );

    // Get dynamic session parameters based on adaptive learning
    const dynamicSessionParams = await this.defineTrainingSessionParams(
      { userId, courseId: session.course.id },
      undefined,
      session,
    );

    // Get MCQs based on session filters
    const { selected_types, randomize, time_limit, randomize_options } =
      this.getSessionFilters(dynamicSessionParams);

    // Determine difficulty level: prefer session parameter if provided,
    // otherwise map the learner's ability to a difficulty
    const adaptiveLearner = await this.adaptiveEngineService.getAdaptiveLearner({
      userId,
      courseId: session.course.id,
    });

    let difficultyFilter: McqDifficulty;
    if (dynamicSessionParams.difficulty) {
      difficultyFilter = dynamicSessionParams.difficulty as McqDifficulty;
    } else if (adaptiveLearner.ability < 0.3) {
      difficultyFilter = McqDifficulty.easy;
    } else if (adaptiveLearner.ability < 0.7) {
      difficultyFilter = McqDifficulty.medium;
    } else {
      difficultyFilter = McqDifficulty.hard;
    }

    let unattempted_mcqs = await this.mcqService.findMcqsPaginated(
      {
        course: session.course.id,
        exclude_ids: attemptedMcqIds,
        type: selected_types,
        difficulty: difficultyFilter,
      },
      { offset: 1 },
      { randomize, populate: ["options"] },
    );
    if (unattempted_mcqs.data.length === 0) {
      unattempted_mcqs = await this.mcqService.findMcqsPaginated(
        {
          course: session.course.id,
          exclude_ids: attemptedMcqIds,
          type: selected_types,
        },
        { offset: 1 },
        { randomize, populate: ["options"] },
      );
      if (unattempted_mcqs.data.length === 0) {
        return {
          data: [],
        };
      }
    }

    unattempted_mcqs.data = this.applyFiltersToMcqs(unattempted_mcqs.data, {
      time_limit,
      randomize_options,
    });

    if (isAssistantMode && unattempted_mcqs.data.length > 0) {
      await this.notificationQueue.add("assistant-push", {
        userId,
        sessionId,
        mcqId: unattempted_mcqs.data[0].id,
      });
    }

    // Determine if all MCQs have been attempted
    const is_final =
      attempted_progress_list.length + unattempted_mcqs.data.length >=
      session.number_of_questions;
    return {
      ...unattempted_mcqs,
      is_final,
    };
  }

  /**
   * Marks a training session as completed and evaluates the results
   *
   * @param userId - The ID of the user
   * @param sessionId - The ID of the training session
   * @returns Evaluation results including metrics like success ratio and time spent
   * @throws NotFoundException if session is not found
   * @throws BadRequestException if session hasn't started yet
   */
  async completeSession(userId: string, sessionId: string) {
    const session = await this.findOneSession({ userId, sessionId });

    if (!session) {
      throw new NotFoundException("Training Session not found");
    }

    if (session.status === TrainingSessionStatus.SCHEDULED) {
      throw new BadRequestException("Training Session has not started yet");
    }

    if (session.status !== TrainingSessionStatus.COMPLETED) {
      await this.updateSessionStatus(
        sessionId,
        TrainingSessionStatus.COMPLETED,
      );
    }

    const evaluationMetrics = await this.evaluateSessionResults(
      userId,
      sessionId,
    );
    await this.trainingSessionRepository.update(sessionId, {
      status: TrainingSessionStatus.COMPLETED,
      completed_at: new Date(),
      total_mcqs: evaluationMetrics.total_mcqs_solved,
      correct_answers: evaluationMetrics.correct_answers,
      incorrect_answers: evaluationMetrics.incorrect_answers,
      accuracy: evaluationMetrics.avg_success_ratio,
      xp_earned: evaluationMetrics.xp_earned,
    });
    return evaluationMetrics;
  }

  /**
   * Updates the status of a training session
   *
   * @param id - The ID of the training session
   * @param status - The new status to set
   * @returns Result of the update operation
   */
  updateSessionStatus(id: string, status: TrainingSessionStatus) {
    return this.trainingSessionRepository.update(id, { status });
  }

  /**
   * Removes a training session
   *
   * @param params - Parameters object containing userId and sessionId
   * @returns True if deletion was successful
   * @throws NotFoundException if session is not found
   */
  async remove(params: { userId: string; sessionId: string }) {
    const result = await this.trainingSessionRepository.delete({
      id: params.sessionId,
      user: { id: params.userId },
    });

    if (result.affected === 0) {
      throw new NotFoundException("Session not found");
    }

    return true;
  }

  /**
   * Validates training session creation parameters
   *
   * @param createTrainingSessionDto - DTO containing session details
   * @throws BadRequestException if validation fails
   * @private
   */
  private validateSessionCreation(
    createTrainingSessionDto: CreateTrainingSessionDto,
  ) {
    const { scheduled_at, status } = createTrainingSessionDto;
    const isScheduled = status === TrainingSessionStatus.SCHEDULED;

    if (scheduled_at && !isScheduled) {
      throw new BadRequestException(
        "Scheduled date can only be set if the status is SCHEDULED",
      );
    }

    if (isScheduled && !scheduled_at) {
      throw new BadRequestException(
        "Scheduled date is required when status is SCHEDULED",
      );
    }

    if (isScheduled) {
      DateUtils.validateDate(scheduled_at, true);
    }
  }

  /**
   * Generates a TypeORM where clause from the provided filters
   *
   * @param filters - Session filters to convert to database query
   * @returns TypeORM where clause object
   * @private
   */
  private generateWhereClauseFromFilters(
    filters: TrainingSessionFilters = {},
  ): FindOptionsWhere<TrainingSession> {
    const whereClause: FindOptionsWhere<TrainingSession> = {};

    // Handle string filters with partial matching
    if (filters.title) {
      whereClause.title = ILike(`%${filters.title}%`);
    }

    // Handle boolean filters
    const booleanFields = [
      "qcm",
      "qcs",
      "randomize_questions_order",
      "randomize_options_order",
    ];

    booleanFields.forEach((field) => {
      if (filters[field] !== undefined) {
        whereClause[field] = filters[field];
      }
    });

    // Handle enum filters
    if (filters.status) {
      whereClause.status = filters.status;
    }

    // Handle date filters
    if (filters.scheduled_at) {
      whereClause.scheduled_at = filters.scheduled_at;
    }

    if (filters.completed_at) {
      whereClause.completed_at = filters.completed_at;
    }

    // Handle numeric range filters
    this.addNumericFilters(whereClause, filters);

    // Handle relations
    if (filters.user) {
      whereClause.user = { id: filters.user };
    }

    if (filters.course) {
      whereClause.course = { id: filters.course };
    }

    return whereClause;
  }

  /**
   * Adds numeric range filters to where clause
   *
   * @param whereClause - The where clause to modify
   * @param filters - The filters containing numeric ranges
   * @private
   */
  private addNumericFilters(
    whereClause: FindOptionsWhere<TrainingSession>,
    filters: TrainingSessionFilters,
  ) {
    const numericRanges = [
      {
        field: "time_limit",
        min: filters.time_limit_min,
        max: filters.time_limit_max,
      },
      {
        field: "number_of_questions",
        min: filters.number_of_questions_min,
        max: filters.number_of_questions_max,
      },
    ];

    numericRanges.forEach(({ field, min, max }) => {
      const minVal = Number(min);
      const maxVal = Number(max);

      if (!isNaN(minVal) && !isNaN(maxVal)) {
        whereClause[field] = Between(minVal, maxVal);
      } else if (!isNaN(minVal)) {
        whereClause[field] = MoreThanOrEqual(minVal);
      } else if (!isNaN(maxVal)) {
        whereClause[field] = LessThanOrEqual(maxVal);
      }
    });
  }

  /**
   * Schedules a reminder email for a scheduled training session
   *
   * @param params - Parameters object identifying the user and session
   * @param session - The training session
   * @throws BadRequestException if scheduled time is not in the future
   * @private
   */
  private async scheduleReminderEmail(
    params: { userId: string; sessionId: string },
    session: TrainingSession,
  ): Promise<void> {
    const { userId, sessionId } = params;
    const user = await this.userService.getAuthenticatedUser(userId);

    const reminderEmailData: TrainingSessionReminderEmail = {
      email: user.email,
      name: user.name,
      session_title: session.title,
      time_limit: session.time_limit,
      number_of_questions: session.number_of_questions,
      session_link: createSessionLink(sessionId),
    };

    const notificationDto = {
      content: `Reminder: Your training session "${session.title}" is scheduled for ${session.scheduled_at.toLocaleString()}.`,
      notification_type: NotificationType.LEARNING_REMINDER, // Assuming NotificationType enum exists
      status: NotificationStatus.PENDING, // Assuming NotificationStatus enum exists
      channel: NotificationChannel.IN_APP, // Assuming NotificationChannel enum exists
    };
    const delay = session.scheduled_at.getTime() - Date.now();

    if (delay <= 0) {
      throw new BadRequestException("Scheduled time must be in the future");
    }

    await this.emailQueue.add(
      "send-training-session-reminder",
      { mailDto: reminderEmailData },
      { delay },
    );
    await this.notificationQueue.add(
      "create-notification",
      { userId, notificationDto },
      { delay },
    );
  }

  /**
   * Extracts selected question types and other filter parameters from session config
   *
   * @param sessionParams - Session parameters containing filter configuration
   * @returns Object with filter parameters for MCQ selection
   * @private
   */
  private getSessionFilters(sessionParams: Partial<TrainingSession>) {
    const selected_types: McqType[] = [];

    if (sessionParams.qcm) {
      selected_types.push(McqType.qcm);
    }

    if (sessionParams.qcs) {
      selected_types.push(McqType.qcs);
    }

    if (sessionParams.qroc) {
      selected_types.push(McqType.qroc);
    }

    // If no specific question type is selected, default to QCM to avoid empty
    // type filters which would return zero MCQs
    if (selected_types.length === 0) {
      selected_types.push(McqType.qcm);
    }

    return {
      selected_types,
      randomize: sessionParams.randomize_questions_order,
      randomize_options: sessionParams.randomize_options_order,
      time_limit: sessionParams.time_limit,
      number_of_questions: sessionParams.number_of_questions,
    };
  }

  /**
   * Applies session time limit to MCQs or keeps original time limits
   *
   * @param mcqs - The MCQs to modify
   * @param filters - Filters to apply (time_limit and randomize_options)
   * @returns MCQs with applied filters
   * @private
   */
  private applyFiltersToMcqs(
    mcqs: Mcq[],
    filters: { time_limit?: number; randomize_options?: boolean },
  ): Mcq[] {
    return mcqs.map((mcq: Mcq) => {
      const mcqCopy = { ...mcq } as Mcq;

      // Apply time limit filter
      if (filters.time_limit) {
        mcqCopy.estimated_time = filters.time_limit;
      }

      // Apply randomize options filter
      if (filters.randomize_options && mcqCopy.options.length > 1) {
        mcqCopy.options = [...mcqCopy.options].sort(() => Math.random() - 0.5);
      }

      return mcqCopy;
    });
  }

  /**
   * Evaluates the results of a completed training session
   *
   * @param userId - The ID of the user
   * @param sessionId - The ID of the training session
   * @returns Object containing evaluation metrics
   * @private
   */
private async evaluateSessionResults(userId: string, sessionId: string) {
    const attempts = await this.progressService.findProgress(
      { user: userId, session: sessionId },
      {
        relations: ["mcq"],
        select: {
          success_ratio: true,
          time_spent: true,
          gained_xp: true,
          mcq: { id: true },
          is_skipped: true,
        },
        distinct: true,
      },
    );

    const thresholdConfig = await this.getAccuracyThresholdConfig();
    const { correct_threshold, performance_bands } = thresholdConfig;

    // Initialize evaluation metrics
    const evaluationMetrics = {
      correct_answers: 0,
      incorrect_answers: 0,
      skipped_mcqs: 0,
      time_spent: 0,
      xp_earned: 0,
      total_mcqs_solved: attempts.length, // THIS IS THE TOTAL INCLUDING SKIPPED
      avg_success_ratio: 0,
    };

    let total_success_ratio = 0;
    let answered_mcqs_count = 0; // Tracks only MCQs that were explicitly answered

    // Calculate metrics from attempts
    attempts.forEach((attempt) => {
      evaluationMetrics.xp_earned += attempt.gained_xp || 0;

      // Handle skipped MCQs first
      if (attempt.is_skipped) {
        evaluationMetrics.skipped_mcqs++;
      } else {
        // Only process attempts that were NOT skipped for accuracy metrics
        const successRatio = attempt.success_ratio || 0;
        total_success_ratio += successRatio;
        answered_mcqs_count++; // Increment count for answered MCQs

        evaluationMetrics.time_spent += attempt.time_spent || 0;

        if (successRatio >= correct_threshold) {
          evaluationMetrics.correct_answers++;
        } else {
          // If not skipped and not correct, it's incorrect
          evaluationMetrics.incorrect_answers++;
        }
      }
    });

    // Calculate average success ratio only based on answered MCQs
    if (answered_mcqs_count > 0) {
      evaluationMetrics.avg_success_ratio =
        total_success_ratio / answered_mcqs_count;
    } else {
      evaluationMetrics.avg_success_ratio = 0; // No answered MCQs, so average is 0
    }

    return evaluationMetrics;
}

  /**
   * Gets the accuracy threshold configuration from Redis
   *
   * @returns Accuracy threshold configuration
   * @private
   */
  private getAccuracyThresholdConfig(): Promise<AccuracyThresholdConfigInterface> {
    return this.redisService.get(
      RedisKeys.getRedisAccuracyThresholdConfig(),
      true,
    ) as Promise<AccuracyThresholdConfigInterface>;
  }

  /**
   * Defines training session parameters based on user profile, adaptive engine,
   * and existing settings
   *
   * @param params - Object containing userId and courseId
   * @param createTrainingSessionDto - Optional DTO for new session creation
  * @param existingSession - Optional existing session to update
   * @returns Session parameters with appropriate values, including
   * difficulty when enabled by the current mode
  * @private
  */
  private async defineTrainingSessionParams(
    params: { userId: string; courseId: string },
    createTrainingSessionDto?: CreateTrainingSessionDto,
    existingSession?: TrainingSession,
  ) {
    const { userId, courseId } = params;
    let sessionData: Record<string, any> = {};

    // Get user profile for mode settings
    const { mode } =
      await this.userProfileService.getAuthenticatedUserProfileById(userId);
    const assistantDeterminedFields: AssistantDeterminedFields[] = [];

    // Initialize session data from existing session or DTO
    if (existingSession) {
      sessionData = {
        qcm: existingSession.qcm,
        qcs: existingSession.qcs,
        qroc: existingSession.qroc || false,
        time_limit: existingSession.time_limit,
        number_of_questions: existingSession.number_of_questions,
        randomize_questions_order: existingSession.randomize_questions_order,
        randomize_options_order: existingSession.randomize_options_order,
        difficulty: (existingSession as any).difficulty,
      };
    } else if (createTrainingSessionDto) {
      sessionData = { ...createTrainingSessionDto };
    }

    // Configure fields based on mode settings
    this.configureSessionField(
      mode.include_qcm_definer,
      "qcm",
      assistantDeterminedFields,
      "Whether to include Multiple Choice Questions",
    );

    this.configureSessionField(
      mode.include_qcs_definer,
      "qcs",
      assistantDeterminedFields,
      "Whether to include QCS questions",
    );

    this.configureSessionField(
      mode.include_qroc_definer,
      "qroc",
      assistantDeterminedFields,
      "Whether to include QROC questions",
    );

    this.configureSessionField(
      mode.time_limit_definer,
      "time_limit",
      assistantDeterminedFields,
      "Time limit for the training session in minutes",
      30,
    );

    this.configureSessionField(
      mode.number_of_questions_definer,
      "number_of_questions",
      assistantDeterminedFields,
      "Number of questions in the training session",
      20,
    );

    this.configureSessionField(
      mode.randomize_questions_order_definer,
      "randomize_questions_order",
      assistantDeterminedFields,
      "Whether to randomize the order of questions",
    );

    this.configureSessionField(
      mode.randomize_options_order_definer,
      "randomize_options_order",
      assistantDeterminedFields,
      "Whether to randomize the order of answer options",
    );

    // Difficulty can be user defined or determined by the assistant
    this.configureSessionField(
      mode.difficulty_definer,
      "difficulty",
      assistantDeterminedFields,
      "Difficulty level of the MCQs for this session",
      McqDifficulty.medium,
    );

    // If time_limit is set to ORIGINAL, use null to indicate using original MCQ time limits
    if (mode.time_limit_definer === ModeDefiner.ORIGINAL) {
      sessionData.time_limit = null;
    }

    // If there are fields to be determined by adaptive engine
    if (assistantDeterminedFields.length > 0) {
      const adaptiveDeterminedValues =
        await this.defineTrainingSessionParamsUsingAdapativeEngine(
          { userId, courseId },
          assistantDeterminedFields,
        );

      // Apply adaptive values to session data
      Object.assign(sessionData, adaptiveDeterminedValues);
    }

    return sessionData;
  }

  /**
   * Configures a session field based on the provided mode definer
   *
   * @param modeDefiner - The mode definer for the field
   * @param fieldName - The name of the field to configure
   * @param assistantDeterminedFields - Array to collect fields for adaptive engine
   * @param description - Description of the field for the adaptive engine
   * @param example - Example value for the adaptive engine
   * @private
   */
  private configureSessionField(
    modeDefiner: ModeDefiner,
    fieldName: string,
    assistantDeterminedFields: AssistantDeterminedFields[],
    description: string,
    example?: any,
  ) {
    if (modeDefiner === ModeDefiner.ASSISTANT) {
      assistantDeterminedFields.push({
        field: fieldName,
        type: typeof example !== "undefined" ? typeof example : "boolean",
        example: example !== undefined ? example : true,
        description,
      });
    }
    // For USER and ORIGINAL modes, no action needed here as they're handled elsewhere
  }

  /**
   * Determines session parameters using the adaptive engine based on user performance
   *
   * @param params - Object containing userId and courseId
   * @param assistantDeterminedFields - Fields that need to be determined by adaptive engine
   * @returns Object with adaptively determined field values
   * @private
   */
  private async defineTrainingSessionParamsUsingAdapativeEngine(
    params: { userId: string; courseId: string },
    assistantDeterminedFields: AssistantDeterminedFields[],
  ) {
    if (!assistantDeterminedFields?.length) {
      return {}; // No fields need to be determined
    }

    const { userId, courseId } = params;
    const adaptiveLearner = await this.adaptiveEngineService.getAdaptiveLearner(
      {
        userId,
        courseId,
      },
    );

    const result: Record<string, any> = {};

    // Process each field based on adaptive learning model
    for (const field of assistantDeterminedFields) {
      switch (field.field) {
        // Question type inclusion decisions based on mastery
        case "qcm":
          result[field.field] = true; // Always include QCM for all users
          break;
        case "qcs":
          result[field.field] = adaptiveLearner.mastery > 0.4; // Include for intermediate and advanced
          break;
        case "qroc":
          result[field.field] = adaptiveLearner.mastery > 0.7; // Include only for advanced users
          break;

        // Time-related decisions based on ability
        case "time_limit":
          // Lower ability users get more time
          const baseTime = 60;
          const abilityFactor = 1 - adaptiveLearner.ability * 0.5; // Factor between 0.5-1.0
          result[field.field] = Math.round(baseTime * abilityFactor);
          break;

        // Question count based on mastery
        case "number_of_questions":
          // More advanced users can handle more questions (5-25 range)
          result[field.field] = Math.min(
            Math.max(Math.round(5 + adaptiveLearner.mastery * 20), 5),
            25,
          );
          break;

        case "difficulty":
          // Map ability to a starting difficulty level
          if (adaptiveLearner.ability < 0.3) {
            result[field.field] = McqDifficulty.easy;
          } else if (adaptiveLearner.ability < 0.7) {
            result[field.field] = McqDifficulty.medium;
          } else {
            result[field.field] = McqDifficulty.hard;
          }
          break;

        // Randomization based on mastery level
        case "randomize_questions_order":
        case "randomize_options_order":
          // More advanced users get more randomization
          result[field.field] = adaptiveLearner.mastery > 0.5;
          break;
      }
    }

    return result;
  }
}
