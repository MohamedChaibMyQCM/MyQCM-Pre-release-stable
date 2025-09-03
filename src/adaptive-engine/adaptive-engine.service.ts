import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { RedisService } from "src/redis/redis.service";
import { RedisKeys } from "common/utils/redis-keys.util";
import { AccuracyThresholdConfigInterface } from "shared/interfaces/accuracy-threshold-config.interface";
import { BktParamsInterface } from "src/adaptive-engine/types/interfaces/bkt.params.interface";
import { IrtParamsInterface } from "./types/interfaces/irt-params.interface";
import { IrtMapInterface } from "./types/interfaces/irt-map.interface";
import { McqDifficulty, McqType } from "src/mcq/dto/mcq.type";
import { AdaptiveLearner } from "./entities/adaptive-learner.entity";
import { CreateNewAdaptiveLearnerInterface } from "./types/interfaces/create-new-adaptive-learner.interface";
import { DefaultBktParamsConfig } from "config/default-bkt-params.config";

@Injectable()
export class AdaptiveEngineService {
  constructor(
    @InjectRepository(AdaptiveLearner)
    private readonly adaptiveLearnerRepository: Repository<AdaptiveLearner>,
    private readonly redisService: RedisService,
  ) {}
  private readonly logger = new Logger(AdaptiveEngineService.name);
  private readonly USE_CORRECTED_BKT = process.env.FF_BKT_CORRECTED === "true";

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
      accuracy_rate: number;
      type: McqType;
      difficulty: McqDifficulty;
      estimated_time: number;
      time_spent: number;
      baseline: number;
    },
    transactionManager?: EntityManager,
  ) {
    const adaptive_learner = await this.getAdaptiveLearner(
      params,
      transactionManager,
    );
    const { guessing_probability, slipping_probability, learning_rate } =
      adaptive_learner.course;

    // Calculate new mastery using BKT model
    const new_bkt_mastery = await this.calculateBkt(
      adaptive_learner,
      { guessing_probability, slipping_probability, learning_rate },
      options.accuracy_rate,
    );

    // Calculate IRT parameters and new ability score
    const irtParams = await this.mapIrtValues(options);
    const new_irt_ability = await this.calculateIrt(
      adaptive_learner,
      irtParams,
    );
    adaptive_learner.ability = Math.min(1, Math.max(0, new_irt_ability));

    return transactionManager
      ? transactionManager.save(adaptive_learner)
      : this.adaptiveLearnerRepository.save(adaptive_learner);
  }

  // CALCULATION MODELS

  /**
   * Calculates updated mastery using Bayesian Knowledge Tracing model
   * @param learner Current adaptive learner state
   * @param bktParams BKT model parameters
   * @param accuracy_rate Student's accuracy rate on the question
   * @returns Updated mastery value
   */
  async calculateBkt(
    learner: AdaptiveLearner,
    bktParams: BktParamsInterface,
    accuracy_rate: number | null,
  ): Promise<number> {
    // Legacy path (FF off): preserve behavior, but avoid overriding legitimate zeros
    if (!this.USE_CORRECTED_BKT) {
      if (accuracy_rate === null || isNaN(accuracy_rate as any)) {
        accuracy_rate = 0;
      }

      let { slipping_probability, guessing_probability, learning_rate } = bktParams;
      const { mastery } = learner;

      if (guessing_probability == null) {
        guessing_probability = DefaultBktParamsConfig.guessing_probability;
      }
      if (slipping_probability == null) {
        slipping_probability = DefaultBktParamsConfig.slipping_probability;
      }
      if (learning_rate == null) {
        learning_rate = DefaultBktParamsConfig.learning_rate;
      }
      const p_learn_temp = mastery + (1 - mastery) * learning_rate;

      const { correct_threshold } = (await this.redisService.get(
        RedisKeys.getRedisAccuracyThresholdConfig(),
        true,
      )) as AccuracyThresholdConfigInterface;

      const isCorrect = accuracy_rate > correct_threshold;

      const updatedMastery = ((): number => {
        if (isCorrect) {
          const numerator = p_learn_temp * (1 - slipping_probability);
          const denominator =
            numerator + (1 - p_learn_temp) * guessing_probability;
          return numerator / denominator;
        } else {
          const numerator = p_learn_temp * slipping_probability;
          const denominator =
            numerator + (1 - p_learn_temp) * (1 - guessing_probability);
          return numerator / denominator;
        }
      })();

      return Math.min(1, Math.max(0, updatedMastery));
    }

    // Corrected path (FF on): posterior → learn, with clamps and epsilon guards
    const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
    const eps = 1e-12;

    let { slipping_probability, guessing_probability, learning_rate } = bktParams;
    const pL0 = clamp01(learner.mastery);
    const s = clamp01(
      slipping_probability ?? DefaultBktParamsConfig.slipping_probability,
    );
    const g = clamp01(
      guessing_probability ?? DefaultBktParamsConfig.guessing_probability,
    );
    const t = clamp01(learning_rate ?? DefaultBktParamsConfig.learning_rate);

    const { correct_threshold } = (await this.redisService.get(
      RedisKeys.getRedisAccuracyThresholdConfig(),
      true,
    )) as AccuracyThresholdConfigInterface;

    if (accuracy_rate == null || Number.isNaN(accuracy_rate)) {
      this.logger.debug("BKT skip: null/NaN accuracy_rate");
      return pL0;
    }

    const correct = accuracy_rate >= correct_threshold;
    const pC = pL0 * (1 - s) + (1 - pL0) * g;
    const pI = pL0 * s + (1 - pL0) * (1 - g);
    const post = correct
      ? (pL0 * (1 - s)) / Math.max(eps, pC)
      : (pL0 * s) / Math.max(eps, pI);
    return clamp01(post + (1 - post) * t);
  }

  /**
   * Maps question attributes to IRT model parameters
   * @param irtMap Question metadata
   * @returns IRT parameters (difficulty, guessing, discrimination)
   */
  async mapIrtValues(irtMap: IrtMapInterface): Promise<IrtParamsInterface> {
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

    return { difficulty, guessing, discrimination };
  }

  /**
   * Calculates updated ability using Item Response Theory model
   * @param learner Current adaptive learner state
   * @param irtParams IRT model parameters
   * @returns Updated ability value
   */
  async calculateIrt(
    learner: AdaptiveLearner,
    irtParams: IrtParamsInterface,
  ): Promise<number> {
    const { ability } = learner;
    const { difficulty, discrimination, guessing } = irtParams;

    // Calculate exponent for logistic function
    const exponent = -discrimination * (ability - difficulty);

    // For a 3PL model including the guessing parameter:
    const probability = guessing + (1 - guessing) / (1 + Math.exp(exponent));
    // Clamp to valid probability range
    return Math.min(1, Math.max(0, probability));
  }
}
