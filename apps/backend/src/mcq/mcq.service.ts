import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateMcqDto, CreateMcqInClinicalCase } from "./dto/create-mcq.dto";
import { UpdateMcqDto } from "./dto/update-mcq.dto";
import {
  McqApprovalStatus,
  McqType,
  McqDifficulty,
  McqTag,
  QuizType,
} from "./dto/mcq.type";
import { InjectRepository } from "@nestjs/typeorm";
import { Mcq } from "./entities/mcq.entity";
import {
  EntityManager,
  Repository,
  In,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
  ILike,
  FindOptionsWhere,
  Not,
} from "typeorm";
import { OptionService } from "src/option/option.service";
import { ClinicalCase } from "src/clinical_case/entities/clinical_case.entity";
import { WalletService } from "src/wallet/wallet.service";
import { TransactionService } from "src/transaction/transaction.service";
import { TransactionStatus } from "src/transaction/dto/transaction.type";
import { RedisService } from "src/redis/redis.service";
import { RedisKeys } from "common/utils/redis-keys.util";
import { TransactionConfigInterface } from "shared/interfaces/transaction-config.interface";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import { McqFilters } from "./types/interfaces/mcq-filters.interface";
import { PaginationInterface } from "shared/interfaces/pagination.interface";
import { default_offset, default_page } from "shared/constants/pagination";
import { PaginatedResponse } from "shared/interfaces/paginated.response.interface";
import { DateUtils } from "common/utils/date.util";
import { SubmitMcqAttemptDto } from "./dto/submit-mcq-attempt.dto";
import { AssistantService } from "src/assistant/assistant.service";
import { ProgressService } from "src/progress/progress.service";
import {
  McqCountByMultipleFiltersInterface,
  McqCountBySingleFiltersInterface,
} from "./types/interfaces/mcq-count-filters.interface";
import { McqCountReturnInterface } from "./types/interfaces/mcq-count-return.interface";
import { UserXpService } from "src/user/services/user-xp.service";
import { UserActivityService } from "src/user/services/user-activity.service";
import { XpConfigInterface } from "shared/interfaces/xp-config.interface";
import { UserActivityType } from "src/user/types/enums/user-activity-type.enum";
import { UserSubscriptionService } from "src/user/services/user-subscription.service";
import { UserSubscriptionUsageEnum } from "src/user/types/enums/user-subscription-usage.enum";
import { AdaptiveEngineService } from "src/adaptive-engine/adaptive-engine.service";
import { UserSubscription } from "src/user/entities/user-subscription.entity";
import { Progress } from "src/progress/entities/progress.entity";
import { McqBatchUploadMetadataDto } from "./dto/mcq-batch-upload.dto";
import * as XLSX from "xlsx";

@Injectable()
export class McqService {
  constructor(
    @InjectRepository(Mcq)
    private readonly mcqRepository: Repository<Mcq>,
    private readonly redisService: RedisService,
    private readonly optionService: OptionService,
    private readonly walletService: WalletService,
    private readonly transactionService: TransactionService,
    private readonly assistantService: AssistantService,
    private readonly progressService: ProgressService,
    private readonly userXpService: UserXpService,
    private readonly userActivityService: UserActivityService,
    private readonly userSubscriptionService: UserSubscriptionService,
    private readonly adapativeEngineService: AdaptiveEngineService,
  ) {}

  /**
   * Retrieves MCQs with pagination based on filters.
   *
   * @param {McqFilters} filters - Optional filtering criteria for the MCQs
   * @param {PaginationInterface} pagination - Pagination parameters with page number and offset
   * @param {number} pagination.page - The page number to retrieve (defaults to default_page)
   * @param {number} pagination.offset - The number of items per page (defaults to default_offset)
   *
   * @returns {Promise<PaginatedResponse<Mcq>>} A promise that resolves to a paginated response containing:
   *   - data: Array of Mcq objects that match the filters
   *   - total: Total count of all matching MCQs without pagination
   *   - page: Current page number
   *   - offset: Number of items per page
   *   - total_pages: Total number of pages available
   *
   * @example
   * // Get the first page of MCQs with default pagination
   * const result = await mcqService.findMcqsPaginated();
   *
   * // Get the second page with custom filters
   * const result = await mcqService.findMcqsPaginated(
   *   { category: 'science' },
   *   { page: 2, offset: 10 }
   * );
   */
  async findMcqsPaginated(
    filters: McqFilters = {},
    pagination: PaginationInterface = {
      page: default_page,
      offset: default_offset,
    },
    options?: {
      randomize?: boolean;
      randomizeOptions?: boolean;
      populate?: string[];
    },
  ): Promise<PaginatedResponse<Mcq>> {
    const { page, offset } = {
      page: default_page,
      offset: default_offset,
      ...pagination,
    };

    const { type: rawTypeFilter, ...restFilters } = filters;

    const qb = this.mcqRepository
      .createQueryBuilder("mcq")
      .where(this.generateWhereClauseFromFilters(restFilters))
      .skip((page - 1) * offset)
      .take(offset);

    if (rawTypeFilter) {
      const typeFilters = Array.isArray(rawTypeFilter)
        ? rawTypeFilter
        : [rawTypeFilter];
      const normalizedTypes = typeFilters
        .filter((value) => value != null)
        .map((value) => value.toString().toLowerCase());

      if (normalizedTypes.length > 0) {
        const allowNullAsQcm = normalizedTypes.includes(McqType.qcm);
        const lowerClause = "(LOWER(CAST(mcq.type AS TEXT)) IN (:...normalizedTypes))";
        const clauses = [lowerClause];
        if (allowNullAsQcm) {
          clauses.push("mcq.type IS NULL");
        }
        qb.andWhere(`(${clauses.join(" OR ")})`, {
          normalizedTypes,
        });
      }
    }

    // Always load options if we need to randomize them
    const populateOptions = options?.populate || [];
    if (options?.randomizeOptions && !populateOptions.includes("options")) {
      populateOptions.push("options");
    }

    // Populate additional relations if provided
    if (populateOptions.length > 0) {
      populateOptions.forEach((relation) => {
        qb.leftJoinAndSelect(`mcq.${relation}`, relation);
      });
    }

    if (options?.randomize) {
      qb.addSelect("RANDOM()", "rand").orderBy("rand");
    } else {
      qb.orderBy("mcq.createdAt", "DESC");
    }

    const [mcqs, total] = await qb.getManyAndCount();

    return {
      data: mcqs,
      total,
      page,
      offset,
      total_pages: Math.ceil(total / offset),
    };
  }

  /**
   * Fetches MCQs by a specific freelancer with pagination support.
   *
   * @param freelancerId - The unique identifier of the freelancer
   * @param type - Optional MCQ type filter
   * @param pagination - Pagination parameters with default values
   * @returns A promise that resolves to a paginated response containing MCQ objects
   *
   * @example
   * // Get all MCQs for a freelancer with default pagination
   * const mcqs = await mcqService.findMcqsByFreelancerPaginated('freelancer123');
   *
   * // Get only DPQCM type MCQs with custom pagination
   * const mcqs = await mcqService.findMcqsByFreelancerPaginated('freelancer123', McqType.dpqcm, { page: 2, offset: 20 });
   */
  async findMcqsByFreelancerPaginated(
    freelancerId: string,
    type?: McqType,
    pagination: PaginationInterface = {
      page: default_page,
      offset: default_offset,
    },
    extraFilters: Partial<McqFilters> = {},
    options?: {
      randomize?: boolean;
      randomizeOptions?: boolean;
      populate?: string[];
    },
  ): Promise<PaginatedResponse<Mcq>> {
    const filters: McqFilters = {
      freelancer: freelancerId,
      in_clinical_case: false,
      ...extraFilters,
    };

    if (type) {
      if (type === McqType.qcm || type === McqType.qcs) {
        filters.type = [McqType.qcm, McqType.qcs];
      } else {
        filters.type = type;
      }
    }

    return this.findMcqsPaginated(
      filters,
      {
        page: pagination.page,
        offset: pagination.offset,
      },
      options,
    );
  }

  async findManyByIds(mcqIds: string[]) {
    return this.mcqRepository.find({
      where: {
        id: In(mcqIds),
      },
      relations: ["options"],
    });
  }

  async findFallbackMcq(params: {
    moduleId: string;
    userId: string;
    notSeenMinutes: number;
    preferredDifficulty: McqDifficulty | string;
  }): Promise<Mcq | null> {
    const { moduleId, userId, notSeenMinutes, preferredDifficulty } = params;
    const notSeenDate = new Date(Date.now() - notSeenMinutes * 60 * 1000);

    const buildQuery = (difficulty?: McqDifficulty | string) => {
      const qb = this.mcqRepository
        .createQueryBuilder("mcq")
        .leftJoin(
          Progress,
          "progress",
          "progress.mcqId = mcq.id AND progress.userId = :userId",
          { userId },
        )
        .where("mcq.courseId = :moduleId", { moduleId })
        .andWhere(
          "(progress.id IS NULL OR progress.updatedAt <= :notSeenDate)",
          { notSeenDate },
        );

      if (difficulty) {
        qb.andWhere("mcq.difficulty = :difficulty", { difficulty });
      }

      return qb
        .orderBy("mcq.difficulty", "ASC")
        .addOrderBy("progress.updatedAt", "ASC", "NULLS FIRST")
        .addOrderBy("mcq.id", "ASC")
        .limit(1);
    };

    let mcq = await buildQuery(preferredDifficulty).getOne();
    if (!mcq) {
      mcq = await buildQuery().getOne();
    }

    if (!mcq) {
      return null;
    }

    const mcqWithOptions = await this.mcqRepository.findOne({
      where: { id: mcq.id },
      relations: ["options"],
    });

    return mcqWithOptions ?? mcq;
  }

  /**
   * Retrieves the count of different types of MCQs (Multiple Choice Questions).
   *
   * @returns {Promise<{
   *   qroc_today_count: number,
   *   qcm_today_count: number,
   *   qcm_total_count: number,
   *   qroc_total_count: number
   * }>} An object containing counts for:
   *   - QROC questions created today
   *   - QCM/QCS questions created today
   *   - Total QCM/QCS questions
   *   - Total QROC questions
   *
   * @description
   * This method queries the database to count different types of MCQs with the following filters:
   * - Only includes MCQs that are not part of clinical cases
   * - Counts are separated by type (QROC vs QCM/QCS)
   * - Today's counts are determined using day boundaries from DateUtils
   */
  async getMcqCount(): Promise<{
    qroc_today_count: number;
    qcm_today_count: number;
    qcm_total_count: number;
    qroc_total_count: number;
  }> {
    const { startOfDay, endOfDay } = DateUtils.getDayBoundaries();

    const results = await this.mcqRepository
      .createQueryBuilder("mcq")
      .select([
        "COUNT(CASE WHEN mcq.type = :qrocType AND mcq.createdAt BETWEEN :startDate AND :endDate THEN 1 END) AS qroc_today_count",
        "COUNT(CASE WHEN mcq.type IN (:...qcmTypes) AND mcq.createdAt BETWEEN :startDate AND :endDate THEN 1 END) AS qcm_today_count",
        "COUNT(CASE WHEN mcq.type IN (:...qcmTypes) THEN 1 END) AS qcm_total_count",
        "COUNT(CASE WHEN mcq.type = :qrocType THEN 1 END) AS qroc_total_count",
      ])
      .where("mcq.in_clinical_case = :inClinicalCase", {
        inClinicalCase: false,
      })
      .setParameters({
        qrocType: McqType.qroc,
        qcmTypes: [McqType.qcm, McqType.qcs],
        startDate: startOfDay,
        endDate: endOfDay,
      })
      .getRawOne();

    return {
      qroc_today_count: Number(results.qroc_today_count) || 0,
      qcm_today_count: Number(results.qcm_today_count) || 0,
      qcm_total_count: Number(results.qcm_total_count) || 0,
      qroc_total_count: Number(results.qroc_total_count) || 0,
    };
  }

  /**
   * Retrieves a single MCQ by ID and/or freelancer ID with optional relation loading.
   *
   * @param {Object} params - The search parameters
   * @param {string} [params.mcqId] - Optional MCQ ID to search for
   * @param {string} [params.freelancerId] - Optional freelancer ID to filter by
   * @param {boolean} populate - Whether to load related entities (options, faculty, etc.)
   * @returns {Promise<Mcq>} The found MCQ with requested relations
   * @throws {NotFoundException} When no MCQ is found with the given criteria
   */
  async findOneMcq(
    params: { mcqId?: string; freelancerId?: string },
    populate: boolean = false,
  ) {
    const relations = populate
      ? [
          "options",
          "faculty",
          "unit",
          "subject",
          "course",
          "university",
          "freelancer",
          "clinical_case",
        ]
      : [];
    const mcq = await this.mcqRepository.findOne({
      where: {
        ...(params.mcqId ? { id: params.mcqId } : {}),
        ...(params.freelancerId
          ? { freelancer: { id: params.freelancerId } }
          : {}),
      },
      relations,
    });
    return mcq;
  }
  async getOneMcq(
    params: { mcqId?: string; freelancerId?: string },
    populate: boolean = false,
  ) {
    const mcq = await this.findOneMcq(params, populate);
    if (!mcq) {
      throw new NotFoundException("MCQ not found");
    }
    return mcq;
  }

  /**
   * Retrieves a single Multiple Choice Question with correction information.
   *
   * This method fetches an MCQ by ID and includes the correct answers and option correctness
   * information that would typically be hidden from regular queries. It also provides
   * options for including related entities.
   *
   * @param mcqId - The unique identifier of the MCQ to retrieve
   * @param options - Optional configuration settings
   * @param options.includeRelations - Controls how related entities are included:
   *                                   - 'ids': Only includes the IDs of related entities
   *                                   - 'full': Includes complete entity objects
   *                                   - false: Doesn't include related entities
   *
   * @returns A Promise resolving to the MCQ entity with correction data
   * @throws Error When the MCQ with the given ID is not found
   */
  async getOneWithCorrection(
    mcqId: string,
    options?: {
      includeRelations?: "ids" | "full" | false;
    },
  ) {
    // Create the base query builder
    const queryBuilder = this.mcqRepository
      .createQueryBuilder("mcq")
      .leftJoinAndSelect("mcq.options", "option")
      .addSelect("mcq.answer")
      .addSelect("option.is_correct")
      .where("mcq.id = :mcqId", { mcqId });

    // Handle relation loading based on the option
    if (options?.includeRelations === "full") {
      // Load complete entity objects
      queryBuilder
        .leftJoinAndSelect("mcq.unit", "unit")
        .leftJoinAndSelect("mcq.subject", "subject")
        .leftJoinAndSelect("mcq.course", "course");
    } else if (options?.includeRelations === "ids") {
      // Load just the IDs
      queryBuilder
        .leftJoin("mcq.unit", "unit")
        .leftJoin("mcq.subject", "subject")
        .leftJoin("mcq.course", "course")
        .addSelect("unit.id")
        .addSelect("subject.id")
        .addSelect("course.id");
    }

    const mcq = await queryBuilder.getOne();

    if (!mcq) {
      throw new Error("MCQ not found");
    }

    return mcq;
  }

  /**
   * Creates a new Multiple Choice Question (MCQ) along with its options and associated transaction.
   *
   * This method performs the following operations within a transaction:
   * 1. Validates the MCQ data
   * 2. Creates and saves the MCQ with the provided data
   * 3. For QCM or QCS type MCQs, creates the associated options
   * 4. Creates a credit transaction for the freelancer
   *
   * @param {CreateMcqDto} createMcqDto - The data transfer object containing MCQ details
   * @param {Express.Multer.File} attachment - The file attachment for the MCQ
   * @param {JwtPayload} freelancer - The authenticated freelancer creating the MCQ
   * @returns {Promise<Mcq>} The created MCQ entity
   * @throws {Error} When validation fails or any step in the transaction fails
   */
  async create(
    createMcqDto: CreateMcqDto,
    attachment: Express.Multer.File,
    freelancer: JwtPayload,
  ): Promise<Mcq> {
    this.validateMcqDto(createMcqDto);
    return await this.mcqRepository.manager.transaction(
      async (transactionalManager) => {
        const mcq = this.mcqRepository.create({
          ...createMcqDto,
          freelancer: { id: freelancer.id },
          university: { id: createMcqDto.university },
          faculty: { id: createMcqDto.faculty },
          unit: { id: createMcqDto.unit },
          subject: { id: createMcqDto.subject },
          course: { id: createMcqDto.course },
          attachment: attachment ? attachment.path : null,
        });
        mcq.approval_status =
          createMcqDto.approval_status ?? McqApprovalStatus.APPROVED;
        await transactionalManager.save(mcq);

        if (
          (createMcqDto.type === McqType.qcm ||
            createMcqDto.type === McqType.qcs) &&
          createMcqDto.options
        ) {
          await Promise.all(
            createMcqDto.options.map((option) =>
              this.optionService.create(option, mcq, transactionalManager),
            ),
          );
        }
        const { transaction_amount } = (await this.redisService.get(
          RedisKeys.getRedisTransactionConfig(),
          true,
        )) as TransactionConfigInterface;
        await this.transactionService.createCreditTransaction(
          freelancer.id,
          {
            amount: transaction_amount,
            mcq,
            status: TransactionStatus.completed,
          },
          transactionalManager,
        );
        return mcq;
      },
    );
  }

  async batchUploadFromSpreadsheet(
    file: Express.Multer.File,
    metadata: McqBatchUploadMetadataDto,
    freelancer: JwtPayload,
  ): Promise<{
    created: number;
    failed: number;
    errors: { row: number; message: string }[];
    preview: {
      id: string;
      question: string;
      type: McqType;
      estimated_time: number;
      approval_status: McqApprovalStatus;
      difficulty: McqDifficulty;
      quiz_type: QuizType;
      options?: { content: string; is_correct: boolean }[];
      answer?: string;
      explanation?: string;
    }[];
  }> {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    const workbook = file.buffer
      ? XLSX.read(file.buffer, { type: "buffer" })
      : XLSX.readFile(file.path);

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new BadRequestException("Spreadsheet is empty");
    }

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!worksheet) {
      throw new BadRequestException("Spreadsheet is empty");
    }

    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      defval: "",
    });

    if (rawRows.length === 0) {
      throw new BadRequestException(
        "Spreadsheet does not contain any readable rows",
      );
    }

    const errors: { row: number; message: string }[] = [];
    let created = 0;
    const preview: {
      id: string;
      question: string;
      type: McqType;
      estimated_time: number;
      approval_status: McqApprovalStatus;
      difficulty: McqDifficulty;
      quiz_type: QuizType;
      options?: { content: string; is_correct: boolean }[];
      answer?: string;
      explanation?: string;
    }[] = [];

    for (let index = 0; index < rawRows.length; index++) {
      const rawRow = rawRows[index];
      const rowNumber = index + 2; // account for header row
      const normalizedRow = this.normalizeSpreadsheetRow(rawRow);

      if (this.isSpreadsheetRowEmpty(normalizedRow)) {
        continue;
      }

      try {
        const question = this.getSpreadsheetString(
          normalizedRow,
          "questiontext",
        );
        if (!question) {
          throw new Error("Question Text column is required");
        }

        const difficulty = this.parseSpreadsheetDifficulty(
          normalizedRow.get("difficulty"),
        );
        const quizType = this.parseSpreadsheetQuizType(
          normalizedRow.get("quiztype"),
        );
        const tag = this.parseSpreadsheetTag(normalizedRow.get("tag"));
        const promo = this.parseSpreadsheetPromo(normalizedRow.get("promo"));

        const estimatedTime = this.parseSpreadsheetEstimatedTime(
          normalizedRow.get("timesec"),
        );

        const answerText = this.getSpreadsheetString(
          normalizedRow,
          "answertext",
        );
        const explanation = this.getSpreadsheetString(
          normalizedRow,
          "explanation",
        );

        const correctIndexes = this.parseCorrectIndexes(
          normalizedRow.get("correctoptions"),
        );

        const options: { content: string; is_correct: boolean }[] = [];

        for (let optionIndex = 1; optionIndex <= 5; optionIndex++) {
          const key = `option${optionIndex}`;
          const content = this.getSpreadsheetString(normalizedRow, key);
          if (!content) {
            continue;
          }
          options.push({
            content,
            is_correct: correctIndexes.includes(optionIndex),
          });
        }

        const rawTypeLabel = this.getSpreadsheetString(
          normalizedRow,
          "questiontype",
        ).toLowerCase();

        const isQroc =
          rawTypeLabel.includes("qroc") ||
          rawTypeLabel.includes("qro") ||
          rawTypeLabel.includes("short") ||
          rawTypeLabel.includes("ouverte") ||
          rawTypeLabel.includes("open");

        let type: McqType;
        let answer: string | undefined;
        let finalExplanation: string | undefined =
          explanation || undefined;

        if (isQroc) {
          if (!answerText) {
            throw new Error("Answer Text is required for QROC questions");
          }
          type = McqType.qroc;
          answer = answerText;
          finalExplanation = undefined;
        } else {
          if (options.length < 2) {
            throw new Error("Provide at least two options for MCQ rows");
          }
          if (correctIndexes.length === 0) {
            throw new Error("Provide at least one correct option");
          }
          type = correctIndexes.length === 1 ? McqType.qcs : McqType.qcm;
          answer = undefined;
        }

        const dto: CreateMcqDto = {
          year_of_study: metadata.year_of_study,
          type,
          estimated_time: estimatedTime,
          mcq_tags: tag,
          quiz_type: quizType,
          keywords: undefined,
          question,
          answer,
          baseline: 1,
          options:
            type === McqType.qroc
              ? undefined
              : (options as unknown as CreateMcqDto["options"]),
          explanation: finalExplanation,
          difficulty,
          promo,
          university: metadata.university,
          faculty: metadata.faculty,
          unit: metadata.unit,
          subject: metadata.subject,
          course: metadata.course,
          approval_status: McqApprovalStatus.PENDING,
        };

        const mcq = await this.create(dto, null, freelancer);
        created += 1;
        preview.push({
          id: mcq.id,
          question,
          type,
          estimated_time: estimatedTime,
          approval_status: McqApprovalStatus.PENDING,
          difficulty,
          quiz_type: quizType,
          options:
            type === McqType.qroc
              ? undefined
              : options.map((option) => ({
                  content: option.content,
                  is_correct: option.is_correct,
                })),
          answer,
          explanation: finalExplanation,
        });
      } catch (error) {
        errors.push({
          row: rowNumber,
          message:
            error instanceof Error
              ? error.message
              : "Unable to import this row",
        });
      }
    }

    if (created === 0) {
      const message =
        errors.length > 0
          ? `No questions were imported. First error: row ${errors[0].row} - ${errors[0].message}`
          : "No valid rows found in spreadsheet";
      throw new BadRequestException(message);
    }

    return {
      created,
      failed: errors.length,
      errors,
      preview,
    };
  }

  /**
   * Creates a new MCQ entity when it's part of a clinical case.
   *
   * @param {CreateMcqInClinicalCase} createMcqInClinicalCaseDto - The data needed to create an MCQ in a clinical case
   * @param {ClinicalCase} clinicalCase - The clinical case this MCQ belongs to
   * @param {JwtPayload} freelancer - The authenticated freelancer creating the MCQ
   * @param {EntityManager} transactionalManager - The transaction manager to ensure atomicity
   * @returns {Promise<Mcq>} The newly created MCQ entity
   * @throws {BadRequestException} When validation of MCQ data fails
   */
  async createMcqInClinicalCase(
    createMcqInClinicalCaseDto: CreateMcqInClinicalCase,
    clinicalCase: ClinicalCase,
    freelancer: JwtPayload,
    transactionalManager: EntityManager,
  ) {
    const { course } = createMcqInClinicalCaseDto;

    this.validateMcqDto(createMcqInClinicalCaseDto);

    const mcq = this.mcqRepository.create({
      ...createMcqInClinicalCaseDto,
      clinical_case: clinicalCase,
      in_clinical_case: true,
      course: { id: course },
      freelancer: { id: freelancer.id },
    });

    const savedMcq = await transactionalManager.save(mcq);

    if (
      createMcqInClinicalCaseDto.type === McqType.qcm &&
      createMcqInClinicalCaseDto.options
    ) {
      await Promise.all(
        createMcqInClinicalCaseDto.options.map((option) =>
          this.optionService.create(option, savedMcq, transactionalManager),
        ),
      );
    }
    const { transaction_amount } = (await this.redisService.get(
      RedisKeys.getRedisTransactionConfig(),
      true,
    )) as TransactionConfigInterface;
    await this.transactionService.createCreditTransaction(
      freelancer.id,
      {
        amount: transaction_amount,
        mcq: savedMcq,
        status: TransactionStatus.completed,
      },
      transactionalManager,
    );

    return savedMcq;
  }

  /**
   * Processes and evaluates a user's attempt at answering an MCQ.
   *
   * @param {JwtPayload} user - The authenticated user making the attempt
   * @param {string} mcqId - The ID of the MCQ being attempted
   * @param {SubmitMcqAttemptDto} submitMcqAttemptDto - The attempt data including response and selected options
   * @returns {Promise<Object>} Evaluation results containing selected options, success ratio and feedback
   * @throws {NotFoundException} When the MCQ is not found
   * @throws {BadRequestException} When the submission doesn't follow MCQ type rules
   */
  async submiteMcqAttempt(
    user: JwtPayload,
    mcqId: string,
    submitMcqAttemptDto: SubmitMcqAttemptDto,
  ) {
    // Step 1: Fetch necessary data and validate subscription
    const { subscription, mcq, usageType } = await this.fetchDataAndValidate(
      user,
      mcqId,
    );

    if(submitMcqAttemptDto.is_skipped){
      const attemptResult = {
        is_skipped: true,
        success_ratio: 0, // A skipped MCQ has 0 success ratio
        is_correct: false,
        gained_xp: 0,     // No XP gained for skipping
        feedback: "MCQ skipped by user.",
        selected_options: [], // No options selected for a skipped MCQ
        response: null,  // No response for a skipped MCQ
      };
      await this.progressService.createUserProgress(
        user.id,
        {
          ...submitMcqAttemptDto,
          ...attemptResult,
          mcq: mcq.id,
          unit: mcq.unit.id,
          course: mcq.course.id,
          subject: mcq.subject.id,
        },
      );
      return 'MCQ attempt skipped successfully'
    }
    // Step 2: Validate attempt data against MCQ rules
    this.validateAttemptDto(submitMcqAttemptDto, mcq);

    // Step 3: Evaluate the attempt and generate results
    const attemptResult = await this.generateAttemptResult(
      submitMcqAttemptDto,
      mcq,
      subscription.plan.analysis,
    );
    // Step 4: Record progress and update user metrics (in a transaction)
    await this.recordProgressAndUpdateMetrics(
      user,
      mcq,
      submitMcqAttemptDto,
      attemptResult,
      attemptResult.gained_xp,
      subscription,
      usageType,
    );

    // Step 5: Prepare and return the final response
    return {
      ...attemptResult,
      explanation: subscription.plan.explanations ? mcq.explanation : null,
      options: mcq.options.length > 0 ? mcq.options : undefined,
      answer: mcq.answer ? mcq.answer : undefined,
    };
  }

  /**
   * Count the number of MCQs based on single filters (one unit, one course, one subject, one faculty, one university, one clinical case)
   *
   * @param {McqCountBySingleFiltersInterface} countFilters - array of Filters to apply to the count
   * @param {Object} options - Additional options for counting
   * @param {boolean} [options.distinct=false] - Whether to count distinct MCQs
   * @returns {Promise<number>} The number of MCQs
   */
  async countMcqsBySingleFilter(
    countFilters: McqCountBySingleFiltersInterface,
    options: {
      groupByType?: boolean;
    } = { groupByType: false },
  ): Promise<number | Record<McqType, number>> {
    let where: FindOptionsWhere<Mcq> = {};

    if (countFilters.unit) {
      where.unit = { id: countFilters.unit };
    }
    if (countFilters.course) {
      where.course = { id: countFilters.course };
    }
    if (countFilters.subject) {
      where.subject = { id: countFilters.subject };
    }
    if (countFilters.faculty) {
      where.faculty = { id: countFilters.faculty };
    }
    if (countFilters.university) {
      where.university = { id: countFilters.university };
    }
    if (countFilters.clinical_case) {
      where.clinical_case = { id: countFilters.clinical_case };
    }
    // If groupByType option is activated, return counts per MCQ type
    if (options?.groupByType) {
      // Initialize counts object with all MCQ types set to 0
      const typeCounts: Record<McqType, number> = {
        [McqType.qcm]: 0,
        [McqType.qcs]: 0,
        [McqType.qroc]: 0,
      };

      // Create query builder to group by type
      const queryBuilder = this.mcqRepository.createQueryBuilder("mcq");

      // Apply all where conditions from the filters
      Object.entries(where).forEach(([key, value]) => {
        if (typeof value === "object" && value !== null && "id" in value) {
          queryBuilder.andWhere(`mcq.${key}.id = :${key}Id`, {
            [`${key}Id`]: value.id,
          });
        } else {
          queryBuilder.andWhere(`mcq.${key} = :${key}`, { [key]: value });
        }
      });

      // Group by type and get counts
      const results = await queryBuilder
        .select("mcq.type", "type")
        .addSelect("COUNT(mcq.id)", "count")
        .groupBy("mcq.type")
        .getRawMany();

      // Fill the counts object with the query results
      results.forEach((result) => {
        typeCounts[result.type] = parseInt(result.count, 10);
      });

      return typeCounts;
    }

    // Default behavior: return total count
    return (await this.mcqRepository.count({ where })) || 0;
  }

  /**
   * Count the number of MCQs based on single filters (one unit, one course, one subject, one faculty, one university, one clinical case)
   *
   * @param {McqCountByMultipleFiltersInterface} countFilters - Filters to apply to the count
   * @param {Object} options - Additional options for counting
   * @param {boolean} [options.distinct=false] - Whether to count distinct MCQs
   * @returns {Promise<number>} The number of MCQs
   */
  async countMcqsByMultipleFilters(
    countFilters: McqCountByMultipleFiltersInterface,
  ): Promise<McqCountReturnInterface[]> {
    let query = this.mcqRepository
      .createQueryBuilder("mcq")
      .select("COUNT(mcq.id)", "count");

    if (countFilters.units && countFilters.units.length > 0) {
      query = query
        .addSelect("mcq.unitId", "unitId")
        .where("mcq.unitId IN (:...units)", { units: countFilters.units })
        .groupBy("mcq.unitId");
    }

    if (countFilters.courses && countFilters.courses.length > 0) {
      query = query
        .addSelect("mcq.courseId", "courseId")
        .andWhere("mcq.courseId IN (:...courses)", {
          courses: countFilters.courses,
        })
        .groupBy("mcq.courseId");
    }

    if (countFilters.subjects && countFilters.subjects.length > 0) {
      query = query
        .addSelect("mcq.subjectId", "subjectId")
        .andWhere("mcq.subjectId IN (:...subjects)", {
          subjects: countFilters.subjects,
        })
        .groupBy("mcq.subjectId");
    }

    if (countFilters.faculties && countFilters.faculties.length > 0) {
      query = query
        .addSelect("mcq.facultyId", "facultyId")
        .andWhere("mcq.facultyId IN (:...faculties)", {
          faculties: countFilters.faculties,
        })
        .groupBy("mcq.facultyId");
    }

    if (countFilters.universities && countFilters.universities.length > 0) {
      query = query
        .addSelect("mcq.universityId", "universityId")
        .andWhere("mcq.universityId IN (:...universities)", {
          universities: countFilters.universities,
        })
        .groupBy("mcq.universityId");
    }

    if (countFilters.clinical_cases && countFilters.clinical_cases.length > 0) {
      query = query
        .addSelect("mcq.clinicalCaseId", "clinicalCaseId")
        .andWhere("mcq.clinicalCaseId IN (:...clinicalCases)", {
          clinicalCases: countFilters.clinical_cases,
        })
        .groupBy("mcq.clinicalCaseId");
    }
    return query.getRawMany();
  }

  /**
   * Updates an existing MCQ with new data.
   *
   * @param {string} mcqId - The ID of the MCQ to update
   * @param {Express.Multer.File} attachment - New attachment file (optional)
   * @param {string} freelancerId - ID of the freelancer who owns the MCQ
   * @param {UpdateMcqDto} updateMcqDto - The new data to update the MCQ with
   * @returns {Promise<Mcq>} The updated MCQ entity
   * @throws {NotFoundException} When the MCQ is not found
   * @throws {BadRequestException} When the update data fails validation
   */
  async update(
    mcqId: string,
    attachment: Express.Multer.File,
    freelancerId: string,
    updateMcqDto: UpdateMcqDto,
  ) {
    const mcq = await this.getOneMcq({ mcqId, freelancerId }, true);
    this.validateMcqUpdateDto({ ...updateMcqDto, type: mcq.type }); // check that update dto doesnt cause any problem

    //TODO refactor this to be better

    /*if (updateMcqDto.unit) {
      const unit = await this.unitService.findOne(updateMcqDto.unit);
      mcq.unit = unit;
    }
    if (updateMcqDto.faculty) {
      const faculty = await this.facultyService.findOne(updateMcqDto.faculty);
      mcq.faculty = faculty;
    }
    if (updateMcqDto.university) {
      const university = await this.universityService.findOne(
        updateMcqDto.university,
      );
      mcq.university = university;
    }
    if (updateMcqDto.subject) {
      const subject = await this.subjectService.findOne(updateMcqDto.subject);
      mcq.subject = subject;
    }
    if (updateMcqDto.course) {
      const course = await this.courseService.findOne(updateMcqDto.course);
      mcq.course = course;
    }*/
    if (attachment) {
      mcq.attachment = attachment.path;
    }
    if (updateMcqDto.options_to_delete?.length) {
      await Promise.all(
        updateMcqDto.options_to_delete.map((optionId) =>
          this.optionService.remove(optionId),
        ),
      );
    }
    if (updateMcqDto.options) {
      await Promise.all(
        updateMcqDto.options.map((option) => {
          if (option.id) {
            return this.optionService.update(option.id, option);
          }
          return this.optionService.create(option, mcq);
        }),
      );
    }
    const {
      options,
      options_to_delete: _optionsToDelete,
      approval_status: _approvalStatus,
      ...restUpdateMcqDto
    } = updateMcqDto;
    Object.assign(mcq, restUpdateMcqDto);
    await this.mcqRepository.save(mcq);
    return mcq;
  }

  async approveMcq(mcqId: string, freelancer: JwtPayload) {
    const mcq = await this.getOneMcq(
      { mcqId, freelancerId: freelancer.id },
      false,
    );

    if (mcq.approval_status === McqApprovalStatus.APPROVED) {
      return mcq;
    }

    mcq.approval_status = McqApprovalStatus.APPROVED;
    return this.mcqRepository.save(mcq);
  }

  async approveMcqs(mcqIds: string[], freelancer: JwtPayload) {
    if (!mcqIds || mcqIds.length === 0) {
      return { updated: 0 };
    }

    const result = await this.mcqRepository
      .createQueryBuilder()
      .update(Mcq)
      .set({ approval_status: McqApprovalStatus.APPROVED })
      .where("id IN (:...ids)", { ids: mcqIds })
      .andWhere(`"freelancerId" = :freelancerId`, {
        freelancerId: freelancer.id,
      })
      .andWhere("approval_status = :pending", {
        pending: McqApprovalStatus.PENDING,
      })
      .returning("id")
      .execute();

    return {
      updated: result?.affected ?? 0,
      ids: result?.raw?.map((row: { id: string }) => row.id) ?? [],
    };
  }

  async approveAllPending(freelancer: JwtPayload) {
    const result = await this.mcqRepository
      .createQueryBuilder()
      .update(Mcq)
      .set({ approval_status: McqApprovalStatus.APPROVED })
      .where(`"freelancerId" = :freelancerId`, {
        freelancerId: freelancer.id,
      })
      .andWhere("approval_status = :pending", {
        pending: McqApprovalStatus.PENDING,
      })
      .returning("id")
      .execute();

    return {
      updated: result?.affected ?? 0,
      ids: result?.raw?.map((row: { id: string }) => row.id) ?? [],
    };
  }

  /**
   * Removes an MCQ and deducts the transaction amount from the freelancer's wallet.
   *
   * @param {string} mcqId - The ID of the MCQ to remove
   * @param {JwtPayload} freelancer - The authenticated freelancer who owns the MCQ
   * @returns {Promise<Mcq>} The removed MCQ entity
   * @throws {NotFoundException} When the MCQ is not found
   * @throws {Error} When the freelancer doesn't have enough balance
   */

  async removeMcq(mcqId: string, freelancer: JwtPayload) {
    const mcq = await this.getOneMcq({ mcqId, freelancerId: freelancer.id });
    const { transaction_amount } = (await this.redisService.get(
      RedisKeys.getRedisTransactionConfig(),
      true,
    )) as TransactionConfigInterface;

    await this.mcqRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // if user dont have balance he wont be able to remove the mcq
        await this.walletService.subtractBalance(
          { freelancer: freelancer.id, amount: transaction_amount },
          transactionalEntityManager,
        );
        await transactionalEntityManager.remove(Mcq, mcq);
      },
    );
    return mcq;
  }

  /**
   * Generates a TypeORM where clause from the provided filters for MCQ queries.
   *
   * @param {McqFilters} filters - The filters to apply to the query
   * @returns {FindOptionsWhere<Mcq>} The TypeORM where clause object
   */
  private generateWhereClauseFromFilters(
    filters: McqFilters = {},
  ): FindOptionsWhere<Mcq> {
    let where_clause: FindOptionsWhere<Mcq> = {};

    // Handle string filters
    if (filters.question) {
      where_clause.question = ILike(`%${filters.question}%`);
    }

    if (filters.explanation) {
      where_clause.explanation = ILike(`%${filters.explanation}%`);
    }

    if (filters.answer) {
      where_clause.answer = ILike(`%${filters.answer}%`);
    }

    // Handle keywords array
    if (filters.keywords && filters.keywords.length > 0) {
      where_clause.keywords = In(filters.keywords);
    }

    // Handle enum filters
    if (filters.type) {
      if (Array.isArray(filters.type)) {
        // Avoid applying an empty IN() clause which would return no results
        if (filters.type.length > 0) {
          where_clause.type = In(filters.type);
        }
      } else {
        where_clause.type = filters.type;
      }
    }

    if (filters.quiz_type) {
      where_clause.quiz_type = filters.quiz_type;
    }

    if (filters.year_of_study) {
      where_clause.year_of_study = filters.year_of_study;
    }

    // Handle mcq_tags - could be single tag or array of tags
    if (filters.mcq_tags) {
      if (Array.isArray(filters.mcq_tags)) {
        where_clause.mcq_tags = In(filters.mcq_tags);
      } else {
        where_clause.mcq_tags = filters.mcq_tags;
      }
    }

    // Handle difficulty - could be single difficulty or array of difficulties
    if (filters.difficulty) {
      if (Array.isArray(filters.difficulty)) {
        where_clause.difficulty = In(filters.difficulty);
      } else {
        where_clause.difficulty = filters.difficulty;
      }
    }

    if (filters.approval_status) {
      if (Array.isArray(filters.approval_status)) {
        if (filters.approval_status.length > 0) {
          where_clause.approval_status = In(filters.approval_status);
        }
      } else {
        where_clause.approval_status = filters.approval_status;
      }
    }

    // Handle boolean filters
    if (filters.in_clinical_case !== undefined) {
      where_clause.in_clinical_case = filters.in_clinical_case;
    }

    // Handle numeric range filters
    // Estimated time
    if (
      filters.estimated_time_min !== undefined &&
      filters.estimated_time_max !== undefined &&
      !isNaN(Number(filters.estimated_time_min)) &&
      !isNaN(Number(filters.estimated_time_max))
    ) {
      where_clause.estimated_time = Between(
        Number(filters.estimated_time_min),
        Number(filters.estimated_time_max),
      );
    } else if (
      filters.estimated_time_min !== undefined &&
      !isNaN(Number(filters.estimated_time_min))
    ) {
      where_clause.estimated_time = MoreThanOrEqual(
        Number(filters.estimated_time_min),
      );
    } else if (
      filters.estimated_time_max !== undefined &&
      !isNaN(Number(filters.estimated_time_max))
    ) {
      where_clause.estimated_time = LessThanOrEqual(
        Number(filters.estimated_time_max),
      );
    }

    // Promo
    if (
      filters.promo_min !== undefined &&
      filters.promo_max !== undefined &&
      !isNaN(Number(filters.promo_min)) &&
      !isNaN(Number(filters.promo_max))
    ) {
      where_clause.promo = Between(
        Number(filters.promo_min),
        Number(filters.promo_max),
      );
    } else if (
      filters.promo_min !== undefined &&
      !isNaN(Number(filters.promo_min))
    ) {
      where_clause.promo = MoreThanOrEqual(Number(filters.promo_min));
    } else if (
      filters.promo_max !== undefined &&
      !isNaN(Number(filters.promo_max))
    ) {
      where_clause.promo = LessThanOrEqual(Number(filters.promo_max));
    }

    // Add exclusion if provided
    if (filters.exclude_ids && filters.exclude_ids.length > 0) {
      where_clause.id = Not(In(filters.exclude_ids));
    }
    // Handle relation filters
    if (filters.freelancer) {
      where_clause.freelancer = { id: filters.freelancer };
    }

    if (filters.university) {
      where_clause.university = { id: filters.university };
    }

    if (filters.faculty) {
      where_clause.faculty = { id: filters.faculty };
    }

    if (filters.unit) {
      where_clause.unit = { id: filters.unit };
    }

    if (filters.subject) {
      where_clause.subject = { id: filters.subject };
    }

    if (filters.course) {
      where_clause.course = { id: filters.course };
    }

    if (filters.clinical_case) {
      where_clause.clinical_case = { id: filters.clinical_case };
    }

    return where_clause;
  }
  /**
   * Validates a Multiple Choice Question (MCQ) for creation to ensure it meets all requirements.
   *
   * @param {CreateMcqDto | CreateMcqInClinicalCase} createMcqDto - The MCQ data to validate
   * @throws {BadRequestException} When the MCQ data doesn't meet validation criteria:
   *   - For QCM/QCS: No answer allowed, at least 2 options required
   *   - For QCS: Exactly one correct option required
   *   - For QROC: No options allowed, answer required
   */
  private normalizeLabel(value: any): string {
    if (value === undefined || value === null) {
      return "";
    }
    return String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  private normalizeSpreadsheetRow(row: Record<string, any>): Map<string, any> {
    return Object.entries(row).reduce((acc, [key, value]) => {
      if (!key) {
        return acc;
      }
      const normalizedKey = key
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "");
      if (normalizedKey) {
        acc.set(normalizedKey, value);
      }
      return acc;
    }, new Map<string, any>());
  }

  private isSpreadsheetRowEmpty(row: Map<string, any>): boolean {
    const keysToCheck = [
      "questiontext",
      "questiontype",
      "option1",
      "option2",
      "option3",
      "option4",
      "option5",
      "answertext",
      "explanation",
    ];

    return keysToCheck.every(
      (key) => this.getSpreadsheetString(row, key) === "",
    );
  }

  private getSpreadsheetString(row: Map<string, any>, key: string): string {
    const value = row.get(key);
    if (value === undefined || value === null) {
      return "";
    }
    if (typeof value === "string") {
      return value.trim();
    }
    if (typeof value === "number") {
      return Number.isFinite(value) ? String(value).trim() : "";
    }
    return String(value).trim();
  }

  private parseCorrectIndexes(value: any): number[] {
    if (value === undefined || value === null || value === "") {
      return [];
    }

    const rawValue = Array.isArray(value)
      ? value.map((item) => String(item)).join(",")
      : String(value);

    return rawValue
      .split(/[^0-9]+/)
      .map((part) => Number(part))
      .filter(
        (num) => Number.isInteger(num) && num >= 1 && num <= 5,
      );
  }

  private parseSpreadsheetDifficulty(
    value: any,
    fallback: McqDifficulty = McqDifficulty.medium,
  ): McqDifficulty {
    const normalized = this.normalizeLabel(value);
    if (normalized) {
      const mapping: Record<string, McqDifficulty> = {
        easy: McqDifficulty.easy,
        facile: McqDifficulty.easy,
        medium: McqDifficulty.medium,
        moyen: McqDifficulty.medium,
        hard: McqDifficulty.hard,
        difficile: McqDifficulty.hard,
      };
      if (mapping[normalized]) {
        return mapping[normalized];
      }
    }
    return fallback;
  }

  private parseSpreadsheetQuizType(
    value: any,
    fallback: QuizType = QuizType.theorique,
  ): QuizType {
    const normalized = this.normalizeLabel(value).replace(/[^a-z0-9]+/g, "");
    if (normalized) {
      const mapping: Record<string, QuizType> = {
        theorique: QuizType.theorique,
        theory: QuizType.theorique,
        standard: QuizType.theorique,
        pratique: QuizType.pratique,
        pratiquee: QuizType.pratique,
        practical: QuizType.pratique,
        practice: QuizType.pratique,
      };
      if (mapping[normalized]) {
        return mapping[normalized];
      }
    }
    return fallback;
  }

  private parseSpreadsheetTag(
    value: any,
    fallback: McqTag = McqTag.others,
  ): McqTag {
    const normalized = this.normalizeLabel(value).replace(/[^a-z0-9]+/g, "");
    if (normalized) {
      const mapping: Record<string, McqTag> = {
        book: McqTag.book,
        livre: McqTag.book,
        serie: McqTag.serie,
        series: McqTag.serie,
        exam: McqTag.exam,
        examen: McqTag.exam,
        tdtp: McqTag.td_tp,
        td: McqTag.td_tp,
        tp: McqTag.td_tp,
        others: McqTag.others,
        autre: McqTag.others,
        autres: McqTag.others,
      };
      if (mapping[normalized]) {
        return mapping[normalized];
      }
    }
    return fallback;
  }

  private parseSpreadsheetPromo(
    value: any,
    fallback: number = new Date().getFullYear(),
  ): number {
    if (typeof value === "number" && Number.isFinite(value)) {
      const rounded = Math.round(value);
      if (rounded >= 2000 && rounded <= 2100) {
        return rounded;
      }
    }

    if (typeof value === "string") {
      const match = value.match(/\b(20\d{2})\b/);
      if (match) {
        const year = Number(match[1]);
        if (year >= 2000 && year <= 2100) {
          return year;
        }
      }
    }

    return fallback;
  }

  private parseSpreadsheetEstimatedTime(
    value: any,
    fallback?: number,
  ): number {
    const parseNumeric = (input: any): number | null => {
      if (typeof input === "number" && Number.isFinite(input)) {
        return input;
      }
      if (typeof input === "string") {
        const normalized = input.replace(",", ".").trim();
        if (!normalized) {
          return null;
        }
        const parsed = Number(normalized);
        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }
      return null;
    };

    const seconds = parseNumeric(value);
    if (seconds !== null) {
      if (seconds <= 0) {
        return Math.max(1, fallback ?? 2);
      }
      return Math.max(1, Math.round(seconds));
    }

    if (fallback !== undefined && fallback > 0) {
      return Math.max(1, Math.round(fallback));
    }

    return 2;
  }

  private validateMcqDto(
    createMcqDto: CreateMcqDto | CreateMcqInClinicalCase,
  ): void {
    const { type, answer, options, explanation } = createMcqDto;

    if (type === McqType.qcm || type === McqType.qcs) {
      if (answer) {
        throw new BadRequestException(
          "You cannot provide an answer for a QCM or QCS",
        );
      }
      if (!options || options.length < 2) {
        throw new BadRequestException("You must provide at least 2 options");
      }
      if (type === McqType.qcs) {
        const correctAnswers = options.filter((option) => option.is_correct);
        if (correctAnswers.length !== 1)
          throw new BadRequestException(
            "Only one correct answer is allowed for a QCS",
          );
      }
    } else if (type === McqType.qroc) {
      if (options && options.length > 0) {
        throw new BadRequestException("You cannot provide options for a QROC");
      }
      if (!answer) {
        throw new BadRequestException("You must provide an answer for a QROC");
      }
    }
  }

  /**
   * Validates MCQ data for updates to ensure it meets all requirements.
   *
   * @param {UpdateMcqDto} updateMcqDto - The MCQ update data to validate
   * @param {boolean} is_update - Flag indicating if this is an update operation (not currently used)
   * @throws {BadRequestException} When the update data doesn't meet validation criteria:
   *   - For QCM/QCS: No answer allowed
   *   - For QCS: Exactly one correct option required
   *   - For QROC: No options allowed, answer required
   */

  private validateMcqUpdateDto(updateMcqDto: UpdateMcqDto): void {
    const { type, answer, options, explanation } = updateMcqDto;

    if (type === McqType.qcm || type === McqType.qcs) {
      if (answer) {
        throw new BadRequestException(
          "You cannot provide an answer for a QCM or QCS",
        );
      }
      if (type === McqType.qcs && updateMcqDto.options) {
        const correctAnswers = options.filter((option) => option.is_correct);
        if (correctAnswers.length !== 1)
          throw new BadRequestException(
            "Only one correct answer is allowed for a QCS",
          );
      }
    } else if (type === McqType.qroc) {
      if (options && options.length > 0) {
        throw new BadRequestException("You cannot provide options for a QROC");
      }
      if (!answer) {
        throw new BadRequestException("You must provide an answer for a QROC");
      }
    }
  }
  private validateAttemptDto(
    submitMcqAttemptDto: SubmitMcqAttemptDto,
    mcq: Mcq,
  ) {
    const { response, response_options } = submitMcqAttemptDto;
    const { type, options } = mcq;

    if (type === McqType.qcm || type === McqType.qcs) {
      if (!response_options?.length) {
        throw new BadRequestException(`Options are required for ${type}`);
      }
      if (response) {
        throw new BadRequestException(
          `Free response is not allowed for ${type}`,
        );
      }
      if (type === McqType.qcs && response_options.length > 1) {
        throw new BadRequestException("Only one option is allowed for qcs");
      }
      const validOptions = new Set(options.map((option) => option.id));
      if (response_options.some((option) => !validOptions.has(option.option))) {
        // check if option not in qcm
        throw new BadRequestException(
          `Invalid option selected , Not in ${type}`,
        );
      }
    } else if (type === McqType.qroc) {
      if (!response) {
        throw new BadRequestException("Response is required for qroc");
      }
      if (response_options?.length) {
        throw new BadRequestException("Options are not allowed for qroc");
      }
    }
  }
  private extractSelectedOptionsWithData(
    submitMcqAttemptDto: SubmitMcqAttemptDto,
    mcq: Mcq,
  ) {
    // its using the populated options from the mcq to get content and is correct
    if (mcq.type == McqType.qroc) return null;
    return submitMcqAttemptDto.response_options.map((option) => {
      const selectedOption = mcq.options.find(
        (mcqOption) => mcqOption.id === option.option,
      );
      return {
        id: selectedOption.id,
        content: selectedOption.content,
        is_correct: selectedOption.is_correct,
      };
    });
  }
  private async evaluateAttemptAccuracy(
    submitMcqAttemptDto: SubmitMcqAttemptDto,
    mcq: Mcq,
    options: {
      analysis?: boolean;
    } = {
      analysis: false,
    },
  ): Promise<{
    rating: number | null;
    feedback: string | null;
    isCorrect: boolean;
  }> {
    let rating: number | null;
    let feedback: string | null;
    let isCorrect = false;

    if (mcq.type === McqType.qroc) {
      const expected = this.normalizeFreeResponse(mcq.answer);
      const received = this.normalizeFreeResponse(
        submitMcqAttemptDto.response ?? "",
      );
      if (!options.analysis) {
        isCorrect = expected.length > 0 && received === expected;
        rating = isCorrect ? 1 : 0;
        feedback = isCorrect
          ? "Correct."
          : "La r\u00e9ponse ne correspond pas \u00e0 la correction attendue.";
      } else {
        const response =
          await this.assistantService.getAssistantResponseRatingAndFeedback(
            submitMcqAttemptDto.response,
            mcq,
          );
        rating = response.rating;
        feedback = response.feedback;
        const assistantAffirms = (response.rating ?? 0) >= 0.9;
        isCorrect = expected.length > 0 && received === expected
          ? true
          : assistantAffirms;
      }
    } else if (mcq.type === McqType.qcs || mcq.type === McqType.qcm) {
      // For qcs and qcm, always calculate success ratio based on selected options
      const correctOptions = new Set(
        mcq.options
          .filter((option) => option.is_correct)
          .map((option) => option.id),
      );
      const selectedOptions = new Set(
        (submitMcqAttemptDto.response_options ?? []).map(
          (option) => option.option,
        ),
      );

      const correctSelections = new Set(
        [...correctOptions].filter((x) => selectedOptions.has(x)),
      );
      const incorrectSelections = new Set(
        [...selectedOptions].filter((x) => !correctOptions.has(x)),
      );

      rating =
        correctSelections.size / correctOptions.size -
        incorrectSelections.size / mcq.options.length;
      rating = Math.max(0, Math.min(1, rating));
      feedback = this.generateFeedbackForRating(rating);
      isCorrect =
        correctSelections.size === correctOptions.size &&
        incorrectSelections.size === 0;
    } else {
      throw new BadRequestException(`Unsupported MCQ type: ${mcq.type}`);
    }
    return {
      rating,
      feedback,
      isCorrect,
    };
  }

  private normalizeFreeResponse(value?: string | null): string {
    if (!value) return "";
    return value
      .toString()
      .trim()
      .toLocaleLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }
  /**
   * Generates appropriate feedback text based on the performance rating.
   *
   * @param {number} rating - The calculated success ratio (0-1)
   * @param {McqType} mcqType - The gained_xptype of MCQ being evaluated
   * @returns {string} Personalized feedback message
   */
  private generateFeedbackForRating(rating: number): string {
    if (rating === 1) {
      return "Perfect! Your answer is completely correct.";
    } else if (rating >= 0.8) {
      return "Excellent work! You've demonstrated strong understanding.";
    } else if (rating >= 0.6) {
      return "Good job! You're on the right track, but there's room for improvement.";
    } else if (rating >= 0.4) {
      return "You have a partial understanding. Review the related material to improve.";
    } else if (rating >= 0.2) {
      return "You need more practice with this concept. Consider reviewing the fundamentals.";
    } else {
      return "You should revisit this topic. The answer needs significant improvement.";
    }
  }
  private async calculateEarnedXp(mcq: Mcq) {
    const xp_config = (await this.redisService.get(
      RedisKeys.getRedisXpConfig(),
      true,
    )) as XpConfigInterface;
    const base_xp = xp_config.questionFormat[mcq.type] || 10;
    const difficulty_multiplier =
      xp_config.difficultyMultiplier[mcq.difficulty] || 1;
    const type_bonus = xp_config.typeBonus[mcq.quiz_type] || 1;
    const earned_xp =
      Math.round(base_xp * difficulty_multiplier * 0.1 + 1) + type_bonus;

    return earned_xp;
  }

  /**
   * Fetches required data and validates subscription for the attempt
   */
  private async fetchDataAndValidate(user: JwtPayload, mcqId: string) {
    const subscription =
      await this.userSubscriptionService.getUserCurrentSubscription(user.id);
    const mcq = await this.getOneWithCorrection(mcqId, {
      includeRelations: "ids",
    });

    const usageType: UserSubscriptionUsageEnum =
      mcq.type == McqType.qroc
        ? UserSubscriptionUsageEnum.QROCS
        : UserSubscriptionUsageEnum.MCQS;

    await this.userSubscriptionService.checkUserUsage(subscription, usageType);

    return { subscription, mcq, usageType };
  }

  /**
   * Evaluates the attempt and generates result data
   */
  private async generateAttemptResult(
    submitMcqAttemptDto: SubmitMcqAttemptDto,
    mcq: any,
    enableAnalysis: boolean,
  ) {
    const selected_options =
      mcq.type !== McqType.qroc
        ? this.extractSelectedOptionsWithData(submitMcqAttemptDto, mcq)
        : null;

    const attempt_accuracy = await this.evaluateAttemptAccuracy(
      submitMcqAttemptDto,
      mcq,
      { analysis: enableAnalysis },
    );

    const gained_xp = await this.calculateEarnedXp(mcq);
    return {
      selected_options: selected_options || undefined,
      response: submitMcqAttemptDto.response,
      success_ratio: attempt_accuracy.rating,
      is_correct: attempt_accuracy.isCorrect,
      feedback: attempt_accuracy.feedback,
      gained_xp,
    };
  }

  /**
   * Records user progress and updates related metrics in a transaction
   */
  private async recordProgressAndUpdateMetrics(
    user: JwtPayload,
    mcq: Mcq,
    submitMcqAttemptDto: SubmitMcqAttemptDto,
    attemptResult: any,
    gained_xp: number,
    subscription: UserSubscription,
    usageType: UserSubscriptionUsageEnum,
  ) {
    const { is_correct, ...attemptResultForProgress } = attemptResult;

    await this.mcqRepository.manager.transaction(async (transactionManager) => {
      // Record user progress for this MCQ attempt
      await this.progressService.createUserProgress(
        user.id,
        {
          ...submitMcqAttemptDto,
          ...attemptResultForProgress,
          gained_xp,
          mcq: mcq.id,
          unit: mcq.unit.id,
          course: mcq.course.id,
          subject: mcq.subject.id,
        },
        transactionManager,
      );

      // Update adaptive learning metrics only for graded attempts with a session
      if (
        submitMcqAttemptDto?.session != null &&
        attemptResult?.success_ratio != null
      ) {
        await this.updateAdaptiveLearningMetrics(
          user.id,
          mcq,
          attemptResult.success_ratio,
          Boolean(is_correct),
          submitMcqAttemptDto.time_spent,
          transactionManager,
        );
      }

      // Update user XP, activity, and subscription usage
      await this.updateUserMetrics(
        user.id,
        subscription,
        gained_xp,
        usageType,
        transactionManager,
      );
    });
  }

  /**
   * Updates adaptive learning metrics for the user
   */
  private async updateAdaptiveLearningMetrics(
    userId: string,
    mcq: any,
    accuracyRate: number,
    wasCorrect: boolean,
    timeSpent: number,
    transactionManager: EntityManager,
  ) {
    await this.adapativeEngineService.updateAdaptiveLearner(
      {
        userId: userId,
        courseId: mcq.course.id,
      },
      {
        is_correct: wasCorrect,
        success_ratio: accuracyRate,
        type: mcq.type,
        difficulty: mcq.difficulty,
        estimated_time: mcq.estimated_time,
        time_spent: timeSpent,
        baseline: mcq.baseline,
      },
      transactionManager,
    );
  }

  /**
   * Updates various user metrics after an MCQ attempt
   */
  private async updateUserMetrics(
    userId: string,
    subscription: UserSubscription,
    gained_xp: number,
    usageType: UserSubscriptionUsageEnum,
    transactionManager: EntityManager,
  ) {
    // Increment user XP
    await this.userXpService.incrementUserXP(
      userId,
      gained_xp,
      transactionManager,
    );

    // Record user activity
    await this.userActivityService.recordActivity(
      userId,
      UserActivityType.MCQ_ATTEMPT,
      transactionManager,
    );

    // Increment subscription usage
    await this.userSubscriptionService.incrementUsage(
      subscription,
      usageType,
      transactionManager,
    );
  }
}
