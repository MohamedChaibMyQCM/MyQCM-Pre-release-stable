import { DataSource, In, Repository } from "typeorm";
import { AppDataSource } from "../src/data-source";
import { Progress } from "../src/progress/entities/progress.entity";
import { ItemIrtParams } from "../src/adaptive-engine/entities/item-irt-params.entity";
import { Mcq } from "../src/mcq/entities/mcq.entity";
import { McqType } from "../src/mcq/dto/mcq.type";

type TrainingOptions = {
  minAttempts: number;
  version: string;
  source: string;
  courseId?: string;
  maxIterations: number;
  abilityLearningRate: number;
  itemLearningRate: number;
};

type AttemptRecord = {
  userId: string;
  mcqId: string;
  response: number;
};

type ItemParams = {
  difficulty: number;
  discrimination: number;
  guessing: number;
};

const DEFAULT_OPTIONS: TrainingOptions = {
  minAttempts: 25,
  version: new Date().toISOString().split("T")[0],
  source: "offline-script",
  maxIterations: 20,
  abilityLearningRate: 0.4,
  itemLearningRate: 0.05,
};

const PRIOR_VARIANCE = 4;
const DISCRIMINATION_BOUNDS: [number, number] = [0.3, 3];
const DIFFICULTY_BOUNDS: [number, number] = [-4, 4];
const THETA_BOUNDS: [number, number] = [-4.5, 4.5];
const EPS = 1e-9;

async function trainIrtParameters(
  dataSource: DataSource,
  options: TrainingOptions,
) {
  const progressRepository = dataSource.getRepository(Progress);
  const paramsRepository = dataSource.getRepository(ItemIrtParams);
  const mcqRepository = dataSource.getRepository(Mcq);

  const attempts = await fetchAttempts(progressRepository, options);
  if (!attempts.length) {
    console.warn("No attempts available for training.");
    return;
  }

  const mcqIdSet = Array.from(new Set(attempts.map((attempt) => attempt.mcqId)));
  const mcqs = await mcqRepository.find({
    where: { id: In(mcqIdSet) },
    select: ["id", "type", "baseline", "difficulty"],
  });

  if (!mcqs.length) {
    console.warn(
      "Unable to resolve MCQ metadata for the collected attempts. Nothing to train.",
    );
    return;
  }

  const mcqById = new Map(mcqs.map((item) => [item.id, item]));
  const userIds = Array.from(new Set(attempts.map((attempt) => attempt.userId)));

  if (userIds.length === 0) {
    console.warn("No users found in the attempt set. Nothing to train.");
    return;
  }

  const userAbilities = new Map(userIds.map((userId) => [userId, 0]));
  const itemParameters = initializeItemParams(attempts, mcqById);
  const attemptsByUser = groupBy(attempts, (attempt) => attempt.userId);
  const attemptsByItem = groupBy(attempts, (attempt) => attempt.mcqId);

  for (let iteration = 0; iteration < options.maxIterations; iteration += 1) {
    const abilityDelta = updateAbilities(
      attemptsByUser,
      itemParameters,
      userAbilities,
      options.abilityLearningRate,
    );
    const itemDelta = updateItemParameters(
      attemptsByItem,
      itemParameters,
      userAbilities,
      options.itemLearningRate,
    );

    console.log(
      `[IRT] Iteration ${iteration + 1}/${
        options.maxIterations
      } — abilityΔ=${abilityDelta.toFixed(4)}, itemΔ=${itemDelta.toFixed(4)}`,
    );

    if (abilityDelta < 0.0005 && itemDelta < 0.0005) {
      console.log("[IRT] Converged early based on deltas.");
      break;
    }
  }

  const upsertPayload = Array.from(itemParameters.entries()).map(
    ([mcqId, params]) => ({
      mcq: { id: mcqId } as Mcq,
      ...params,
      source: options.source,
      version: options.version,
    }),
  );

  await paramsRepository.upsert(upsertPayload, ["mcq"]);
  console.log(
    `Stored calibrated parameters for ${upsertPayload.length} MCQs (${attempts.length} attempts, users=${userIds.length}).`,
  );
}

async function fetchAttempts(
  repository: Repository<Progress>,
  options: TrainingOptions,
) {
  const qb = repository
    .createQueryBuilder("progress")
    .select(['progress."userId" AS "userId"'])
    .addSelect('progress."mcqId" AS "mcqId"')
    .addSelect("progress.success_ratio AS successRatio")
    .where("progress.success_ratio IS NOT NULL")
    .andWhere("progress.is_skipped = false");

  if (options.courseId) {
    qb.andWhere('progress."courseId" = :courseId', {
      courseId: options.courseId,
    });
  }

  const rawAttempts = await qb.getRawMany<{
    userId: string;
    mcqId: string;
    successRatio: string;
  }>();

  const countsPerItem = new Map<string, number>();
  rawAttempts.forEach((row) => {
    const current = countsPerItem.get(row.mcqId) ?? 0;
    countsPerItem.set(row.mcqId, current + 1);
  });

  return rawAttempts
    .filter((row) => (countsPerItem.get(row.mcqId) ?? 0) >= options.minAttempts)
    .map<AttemptRecord>((row) => ({
      userId: row.userId,
      mcqId: row.mcqId,
      response: clampProbability(Number(row.successRatio ?? 0)),
    }));
}

function initializeItemParams(
  attempts: AttemptRecord[],
  mcqById: Map<string, Pick<Mcq, "id" | "type" | "baseline" | "difficulty">>,
) {
  const params = new Map<string, ItemParams>();
  const grouped = groupBy(attempts, (attempt) => attempt.mcqId);

  for (const [mcqId, mcqAttempts] of grouped.entries()) {
    const meta = mcqById.get(mcqId);
    if (!meta) {
      continue;
    }

    const initialGuessing = getGuessingPrior(meta.type);
    const initialDiscrimination = getDiscriminationPrior(meta.baseline);
    const averageScore =
      mcqAttempts.reduce((sum, attempt) => sum + attempt.response, 0) /
      mcqAttempts.length;
    const boundedAverage = clampProbability(
      (averageScore - initialGuessing) / (1 - initialGuessing),
    );
    const initialDifficulty =
      -(Math.log(boundedAverage / (1 - boundedAverage))) / initialDiscrimination;

    params.set(mcqId, {
      guessing: initialGuessing,
      discrimination: clamp(
        initialDiscrimination,
        DISCRIMINATION_BOUNDS[0],
        DISCRIMINATION_BOUNDS[1],
      ),
      difficulty: clamp(
        Number.isFinite(initialDifficulty) ? initialDifficulty : 0,
        DIFFICULTY_BOUNDS[0],
        DIFFICULTY_BOUNDS[1],
      ),
    });
  }

  return params;
}

function updateAbilities(
  attemptsByUser: Map<string, AttemptRecord[]>,
  itemParams: Map<string, ItemParams>,
  abilities: Map<string, number>,
  learningRate: number,
) {
  let maxDelta = 0;

  for (const [userId, userAttempts] of attemptsByUser.entries()) {
    if (!userAttempts.length) continue;

    const currentTheta = abilities.get(userId) ?? 0;
    let gradient = 0;

    for (const attempt of userAttempts) {
      const params = itemParams.get(attempt.mcqId);
      if (!params) continue;

      const { probability, dPdTheta } = irtProbability(
        currentTheta,
        params,
      );
      const term =
        (attempt.response - probability) *
        (dPdTheta / (probability * (1 - probability)));
      gradient += term;
    }

    gradient -= currentTheta / PRIOR_VARIANCE;
    const updatedTheta = clamp(
      currentTheta + learningRate * gradient,
      THETA_BOUNDS[0],
      THETA_BOUNDS[1],
    );
    abilities.set(userId, updatedTheta);
    maxDelta = Math.max(maxDelta, Math.abs(updatedTheta - currentTheta));
  }

  return maxDelta;
}

function updateItemParameters(
  attemptsByItem: Map<string, AttemptRecord[]>,
  itemParams: Map<string, ItemParams>,
  abilities: Map<string, number>,
  learningRate: number,
) {
  let maxDelta = 0;

  for (const [mcqId, itemAttempts] of attemptsByItem.entries()) {
    if (!itemAttempts.length) continue;

    const current = itemParams.get(mcqId);
    if (!current) continue;

    let gradDifficulty = 0;
    let gradDiscrimination = 0;

    for (const attempt of itemAttempts) {
      const theta = abilities.get(attempt.userId) ?? 0;
      const { probability, logistic } = irtProbability(theta, current);
      const residual = attempt.response - probability;
      const common =
        residual *
        ((1 - current.guessing) * logistic * (1 - logistic)) /
        (probability * (1 - probability));

      gradDifficulty -= current.discrimination * common;
      gradDiscrimination += (theta - current.difficulty) * common;
    }

    const updatedDifficulty = clamp(
      current.difficulty + learningRate * gradDifficulty,
      DIFFICULTY_BOUNDS[0],
      DIFFICULTY_BOUNDS[1],
    );
    const updatedDiscrimination = clamp(
      current.discrimination + learningRate * gradDiscrimination,
      DISCRIMINATION_BOUNDS[0],
      DISCRIMINATION_BOUNDS[1],
    );

    maxDelta = Math.max(
      maxDelta,
      Math.abs(updatedDifficulty - current.difficulty),
      Math.abs(updatedDiscrimination - current.discrimination),
    );

    itemParams.set(mcqId, {
      ...current,
      difficulty: updatedDifficulty,
      discrimination: updatedDiscrimination,
    });
  }

  return maxDelta;
}

function irtProbability(theta: number, params: ItemParams) {
  const logistic = 1 / (1 + Math.exp(-params.discrimination * (theta - params.difficulty)));
  const probability = clampProbability(
    params.guessing + (1 - params.guessing) * logistic,
  );
  const dPdTheta =
    (1 - params.guessing) *
    params.discrimination *
    logistic *
    (1 - logistic);

  return { probability, logistic, dPdTheta };
}

function getGuessingPrior(type: McqType | null | undefined) {
  if (type === McqType.qcm) {
    return 0.25;
  }
  if (type === McqType.qcs) {
    return 0.2;
  }
  if (type === McqType.qroc) {
    return 0.1;
  }
  return 0.2;
}

function getDiscriminationPrior(baseline: number | null | undefined) {
  if (!baseline || Number.isNaN(baseline)) {
    return 1;
  }
  return Math.max(0.4, Math.min(2.5, baseline));
}

async function bootstrap() {
  const options: TrainingOptions = {
    ...DEFAULT_OPTIONS,
    minAttempts: process.env.MIN_ATTEMPTS
      ? Number(process.env.MIN_ATTEMPTS)
      : DEFAULT_OPTIONS.minAttempts,
    version: process.env.IRT_VERSION ?? DEFAULT_OPTIONS.version,
    source: process.env.IRT_SOURCE ?? DEFAULT_OPTIONS.source,
    courseId: process.env.COURSE_ID,
    maxIterations: process.env.IRT_MAX_ITERATIONS
      ? Number(process.env.IRT_MAX_ITERATIONS)
      : DEFAULT_OPTIONS.maxIterations,
    abilityLearningRate: process.env.IRT_THETA_LR
      ? Number(process.env.IRT_THETA_LR)
      : DEFAULT_OPTIONS.abilityLearningRate,
    itemLearningRate: process.env.IRT_ITEM_LR
      ? Number(process.env.IRT_ITEM_LR)
      : DEFAULT_OPTIONS.itemLearningRate,
  };

  await AppDataSource.initialize();
  try {
    await trainIrtParameters(AppDataSource, options);
  } finally {
    await AppDataSource.destroy();
  }
}

if (require.main === module) {
  bootstrap().catch((error) => {
    console.error("Failed to train IRT parameters", error);
    process.exitCode = 1;
  });
}

function clampProbability(value: number) {
  if (!Number.isFinite(value)) {
    return 0.5;
  }
  return clamp(value, EPS, 1 - EPS);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K,
) {
  const map = new Map<K, T[]>();
  items.forEach((item) => {
    const key = keyFn(item);
    const bucket = map.get(key);
    if (bucket) {
      bucket.push(item);
    } else {
      map.set(key, [item]);
    }
  });
  return map;
}
