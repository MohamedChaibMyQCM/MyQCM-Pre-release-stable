import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, In, Repository } from "typeorm";
import { BktParamsInterface } from "src/adaptive-engine/types/interfaces/bkt.params.interface";
import { IrtParamsInterface } from "./types/interfaces/irt-params.interface";
import { IrtMapInterface } from "./types/interfaces/irt-map.interface";
import { McqDifficulty, McqType } from "src/mcq/dto/mcq.type";
import { AdaptiveLearner } from "./entities/adaptive-learner.entity";
import { CreateNewAdaptiveLearnerInterface } from "./types/interfaces/create-new-adaptive-learner.interface";
import { DefaultBktParamsConfig } from "../../config/default-bkt-params.config";
import { ItemIrtParams } from "./entities/item-irt-params.entity";
import { AdaptiveLearnerKnowledgeComponent } from "./entities/adaptive-learner-knowledge-component.entity";
import { KnowledgeComponent } from "src/knowledge-component/entities/knowledge-component.entity";

@Injectable()
export class AdaptiveEngineService {
  constructor(
    @InjectRepository(AdaptiveLearner)
    private readonly adaptiveLearnerRepository: Repository<AdaptiveLearner>,
    @InjectRepository(ItemIrtParams)
    private readonly itemIrtParamsRepository: Repository<ItemIrtParams>,
    @InjectRepository(AdaptiveLearnerKnowledgeComponent)
    private readonly learnerKnowledgeComponentRepository: Repository<AdaptiveLearnerKnowledgeComponent>,
  ) {}
  private readonly logger = new Logger(AdaptiveEngineService.name);
  private readonly irtPriorMean = 0;
  private readonly irtPriorVariance = 4;
  private readonly irtLearningRate = 0.75;

  // LEARNER PROFILE MANAGEMENT

  /**
   * Finds an adaptive learner by user ID and course ID
   * @param params Search parameters containing userId and/or courseId
   * @returns The found adaptive learner or null if not found
   */
  async findAdaptiveLearner(
    params: { userId?: string; courseId: string },
    options: { populate?: boolean },
  ) {
    return this.adaptiveLearnerRepository.findOne({
      where: {
        ...(params.courseId ? { course: { id: params.courseId } } : {}),
        ...(params.userId ? { user: { id: params.userId } } : {}),
      },
      relations: options.populate ? ["course"] : [],
    });
  }

  /**
   * Creates a new adaptive learner profile
   * @param createAdaptiveEngineDto Data for creating a new adaptive learner
   * @param transactionManager Optional transaction manager for database operations
   * @returns The created adaptive learner entity
   */
  async createNewAdaptiveLearner(
    createAdaptiveEngineDto: CreateNewAdaptiveLearnerInterface,
    transactionManager?: EntityManager,
  ) {
    const adaptiveLearner = this.adaptiveLearnerRepository.create({
      ...createAdaptiveEngineDto,
      user: { id: createAdaptiveEngineDto.user },
      course: { id: createAdaptiveEngineDto.course },
    });

    return transactionManager
      ? transactionManager.save(adaptiveLearner)
      : this.adaptiveLearnerRepository.save(adaptiveLearner);
  }

  /**
   * Gets or creates an adaptive learner
   * @param params User and course identifiers
   * @param transactionManager Optional transaction manager
   * @returns Existing or newly created adaptive learner
   */
  async getAdaptiveLearner(
    params: { userId: string; courseId: string },
    transactionManager?: EntityManager,
  ) {
    const { userId, courseId } = params;
    const adaptiveLearner = await this.findAdaptiveLearner(
      {
        userId,
        courseId,
      },
      {
        populate: true,
      },
    );

    if (adaptiveLearner) return adaptiveLearner;

    return this.createNewAdaptiveLearner(
      { user: userId, course: courseId },
      transactionManager,
    );
  }

  /**
   * Updates an adaptive learner's mastery and ability based on their performance
   * @param params User and course identifiers
   * @param options Performance metrics and question metadata
   * @param transactionManager Optional transaction manager
   * @returns Updated adaptive learner entity
   */
  async updateAdaptiveLearner(
    params: { userId: string; courseId: string },
    options: {
      mcqId: string;
      is_correct: boolean;
      success_ratio: number | null;
      type: McqType;
      difficulty: McqDifficulty;
      estimated_time: number;
      time_spent: number;
      baseline: number;
      knowledgeComponentIds?: string[];
    },
    transactionManager?: EntityManager,
  ) {
    const adaptive_learner = await this.getAdaptiveLearner(
      params,
      transactionManager,
    );
    const normalizedBktParams = this.normalizeBktParams({
      guessing_probability: adaptive_learner.course.guessing_probability,
      slipping_probability: adaptive_learner.course.slipping_probability,
      learning_rate: adaptive_learner.course.learning_rate,
    });
    const knowledgeComponentIds = options.knowledgeComponentIds ?? [];
    const observation = {
      isCorrect: options.is_correct,
      accuracy: options.success_ratio,
    };

    // Calculate new mastery using BKT model
    const new_bkt_mastery = await this.calculateBkt(
      adaptive_learner,
      normalizedBktParams,
      observation,
    );
    adaptive_learner.mastery = this.clamp01(new_bkt_mastery);

    await this.upsertKnowledgeComponentMastery(
      adaptive_learner,
      knowledgeComponentIds,
      normalizedBktParams,
      observation,
      transactionManager,
    );

    // Calculate IRT parameters and new ability score
    const irtParams = await this.mapIrtValues(
      {
        ...options,
        knowledgeComponentIds,
      },
      transactionManager,
    );
    const new_irt_ability = await this.calculateIrt(
      adaptive_learner,
      irtParams,
      options.is_correct,
    );
    adaptive_learner.ability = new_irt_ability;

    return transactionManager
      ? transactionManager.save(adaptive_learner)
      : this.adaptiveLearnerRepository.save(adaptive_learner);
  }

  // CALCULATION MODELS

  /**
   * Calculates updated mastery using Bayesian Knowledge Tracing model
   * @param learner Current adaptive learner state
   * @param bktParams BKT model parameters
   * @param observation Observation metadata (isCorrect flag + optional accuracy signal)
   * @returns Updated mastery value
   */
  async calculateBkt(
    learner: AdaptiveLearner,
    bktParams: BktParamsInterface,
    observation: { isCorrect: boolean; accuracy?: number | null },
  ): Promise<number> {
    const { isCorrect } = observation;
    const normalizedAccuracy =
      observation.accuracy != null && !Number.isNaN(observation.accuracy)
        ? Number(observation.accuracy)
        : isCorrect
        ? 1
        : 0;
    const accuracy_rate = Number.isFinite(normalizedAccuracy)
      ? this.clamp01(normalizedAccuracy)
      : null;
    const eps = 1e-12;

    if (accuracy_rate == null || Number.isNaN(accuracy_rate)) {
      this.logger.debug("BKT skip: null/NaN accuracy_rate");
      return this.clamp01(learner.mastery);
    }

    const { guessing_probability: g, slipping_probability: s, learning_rate: t } =
      this.normalizeBktParams(bktParams);
    const pL0 = this.clamp01(learner.mastery);
    const correct = isCorrect;
    const pC = pL0 * (1 - s) + (1 - pL0) * g;
    const pI = pL0 * s + (1 - pL0) * (1 - g);
    const post = correct
      ? (pL0 * (1 - s)) / Math.max(eps, pC)
      : (pL0 * s) / Math.max(eps, pI);
    return this.clamp01(post + (1 - post) * t);
  }

  /**
   * Maps question attributes to IRT model parameters
   * @param irtMap Question metadata
   * @returns IRT parameters (difficulty, guessing, discrimination)
   */
  async mapIrtValues(
    irtMap: IrtMapInterface,
    transactionManager?: EntityManager,
  ): Promise<IrtParamsInterface> {
    const repository = transactionManager
      ? transactionManager.getRepository(ItemIrtParams)
      : this.itemIrtParamsRepository;

    if (irtMap.mcqId) {
      const stored =
        (await repository.findOne({
          where: { mcq: { id: irtMap.mcqId }, is_latest: true },
          relations: ["mcq"],
        })) ??
        (await repository.findOne({
          where: { mcq: { id: irtMap.mcqId } },
          relations: ["mcq"],
          order: { updatedAt: "DESC" },
        }));

      if (stored) {
        return {
          discrimination: stored.discrimination,
          difficulty: stored.difficulty,
          guessing: stored.guessing,
          knowledgeComponentIds: irtMap.knowledgeComponentIds ?? [],
        };
      }
    }

    // Map difficulty based on question difficulty level
    const difficulty_map = {
      [McqDifficulty.easy]: -1,
      [McqDifficulty.medium]: 0,
      [McqDifficulty.hard]: 1,
    };

    const difficulty = difficulty_map[irtMap.difficulty] ?? 0;

    // Calculate guessing parameter based on time spent
    let guessing = 0.35; // Default/highest guessing probability

    if (irtMap.estimated_time > 0) {
      const time_ratio = irtMap.time_spent / irtMap.estimated_time;

      if (time_ratio >= 2) {
        guessing = 0.15; // Less guessing: spent significantly more time
      } else if (time_ratio >= 1.25) {
        guessing = 0.25; // Moderate guessing
      }
    }

    // Calculate discrimination based on question type
    const discriminationMap = {
      [McqType.qcm]: irtMap.baseline * 0.8,
      [McqType.qcs]: irtMap.baseline,
      [McqType.qroc]: irtMap.baseline,
    };

    const discrimination = discriminationMap[irtMap.type] ?? 0.5;
    const knowledgeComponentIds = irtMap.knowledgeComponentIds ?? [];

    return { difficulty, guessing, discrimination, knowledgeComponentIds };
  }

  /**
   * Calculates updated ability using Item Response Theory model
   * @param learner Current adaptive learner state
   * @param irtParams IRT model parameters
   * @param isCorrect Whether the last attempt was correct
   * @returns Updated ability value
   */
  async calculateIrt(
    learner: AdaptiveLearner,
    irtParams: IrtParamsInterface,
    isCorrect: boolean,
  ): Promise<number> {
    const theta = Number.isFinite(learner.ability) ? learner.ability : 0;
    const difficulty = Number.isFinite(irtParams.difficulty)
      ? irtParams.difficulty
      : 0;
    const discrimination = Math.max(
      0.1,
      Math.min(
        4,
        Number.isFinite(irtParams.discrimination)
          ? irtParams.discrimination
          : 1,
      ),
    );
    const guessing = this.clamp01(
      Number.isFinite(irtParams.guessing) ? irtParams.guessing : 0.2,
    );
    const eps = 1e-9;
    const response = isCorrect ? 1 : 0;
    const logistic = 1 / (1 + Math.exp(-discrimination * (theta - difficulty)));
    const probability = guessing + (1 - guessing) * logistic;
    const boundedProbability = Math.min(1 - eps, Math.max(eps, probability));
    const dPdTheta =
      (1 - guessing) *
      discrimination *
      logistic *
      (1 - logistic);
    const gradLikelihood =
      (response - boundedProbability) *
      (dPdTheta / (boundedProbability * (1 - boundedProbability)));
    const gradPrior = -(theta - this.irtPriorMean) / this.irtPriorVariance;
    const updatedTheta =
      theta + this.irtLearningRate * (gradLikelihood + gradPrior);
    return Number.isFinite(updatedTheta) ? updatedTheta : theta;
  }

  private clamp01(value: number) {
    if (!Number.isFinite(value)) {
      return 0;
    }
    return Math.min(1, Math.max(0, value));
  }

  private normalizeBktParams(
    params?: Partial<BktParamsInterface> | null,
  ): BktParamsInterface {
    const normalizeValue = (
      candidate: number | undefined,
      fallback: number,
    ): number => {
      const source = Number.isFinite(candidate) ? (candidate as number) : fallback;
      return this.clamp01(source);
    };

    return {
      guessing_probability: normalizeValue(
        params?.guessing_probability,
        DefaultBktParamsConfig.guessing_probability,
      ),
      slipping_probability: normalizeValue(
        params?.slipping_probability,
        DefaultBktParamsConfig.slipping_probability,
      ),
      learning_rate: normalizeValue(
        params?.learning_rate,
        DefaultBktParamsConfig.learning_rate,
      ),
    };
  }

  private async upsertKnowledgeComponentMastery(
    learner: AdaptiveLearner,
    knowledgeComponentIds: string[],
    bktParams: BktParamsInterface,
    observation: { isCorrect: boolean; accuracy?: number | null },
    transactionManager?: EntityManager,
  ) {
    if (!knowledgeComponentIds.length) {
      return;
    }

    const uniqueIds = Array.from(new Set(knowledgeComponentIds));
    const repository = transactionManager
      ? transactionManager.getRepository(AdaptiveLearnerKnowledgeComponent)
      : this.learnerKnowledgeComponentRepository;

    const existingRecords = await repository.find({
      where: {
        adaptiveLearner: { id: learner.id },
        knowledgeComponent: { id: In(uniqueIds) },
      },
      relations: ["knowledgeComponent"],
    });
    const recordByComponent = new Map(
      existingRecords.map((record) => [
        record.knowledgeComponent.id,
        record,
      ]),
    );

    const toSave: AdaptiveLearnerKnowledgeComponent[] = [];

    for (const componentId of uniqueIds) {
      let record = recordByComponent.get(componentId);
      if (!record) {
        record = repository.create({
          adaptiveLearner: { id: learner.id } as AdaptiveLearner,
          knowledgeComponent: { id: componentId } as KnowledgeComponent,
          mastery: learner.mastery,
        });
      }

      const syntheticLearner = {
        ...learner,
        mastery: record.mastery,
      } as AdaptiveLearner;

      const updatedMastery = await this.calculateBkt(
        syntheticLearner,
        bktParams,
        observation,
      );
      record.mastery = this.clamp01(updatedMastery);
      toSave.push(record);
    }

    if (toSave.length) {
      await repository.save(toSave);
    }
  }
}
