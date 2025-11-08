import { DataSource, In } from "typeorm";
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
};

const DEFAULT_OPTIONS: TrainingOptions = {
  minAttempts: 25,
  version: new Date().toISOString().split("T")[0],
  source: "offline-script",
};

async function trainIrtParameters(
  dataSource: DataSource,
  options: TrainingOptions,
) {
  const progressRepository = dataSource.getRepository(Progress);
  const paramsRepository = dataSource.getRepository(ItemIrtParams);
  const mcqRepository = dataSource.getRepository(Mcq);

  const queryBuilder = progressRepository
    .createQueryBuilder("progress")
    .select("progress.mcqId", "mcqId")
    .addSelect("AVG(progress.success_ratio)", "avgSuccess")
    .addSelect("COUNT(progress.id)", "attempts")
    .where("progress.success_ratio IS NOT NULL");

  if (options.courseId) {
    queryBuilder.andWhere("progress.courseId = :courseId", {
      courseId: options.courseId,
    });
  }

  const aggregates = await queryBuilder
    .groupBy("progress.mcqId")
    .having("COUNT(progress.id) >= :minAttempts", {
      minAttempts: options.minAttempts,
    })
    .getRawMany<{
      mcqId: string;
      avgSuccess: string;
      attempts: string;
    }>();

  if (!aggregates.length) {
    console.warn(
      "No MCQs met the minimum attempt threshold. Nothing to train.",
    );
    return;
  }

  const mcqIds = aggregates.map((record) => record.mcqId);
  const mcqs = await mcqRepository.find({
    where: { id: In(mcqIds) },
    select: ["id", "type", "baseline", "difficulty"],
  });
  const mcqById = new Map(mcqs.map((item) => [item.id, item]));

  const payload = aggregates
    .map((aggregate) => {
      const mcq = mcqById.get(aggregate.mcqId);
      if (!mcq) {
        return null;
      }

      const attempts = Number(aggregate.attempts ?? 0);
      const avgSuccess = Number(aggregate.avgSuccess ?? 0.5);
      const guessing = getGuessingPrior(mcq.type);
      const discrimination = getDiscriminationPrior(mcq.baseline);
      const boundedSuccess = boundProbability(avgSuccess, guessing + 0.05, 0.95);
      const logisticProb = boundProbability(
        (boundedSuccess - guessing) / (1 - guessing),
        0.05,
        0.95,
      );
      const difficulty =
        -(Math.log(logisticProb / (1 - logisticProb))) / discrimination;

      return {
        mcq: { id: mcq.id } as Mcq,
        discrimination,
        difficulty,
        guessing,
        source: options.source,
        version: options.version,
        attempts,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (!payload.length) {
    console.warn("No eligible MCQs after filtering metadata. Nothing saved.");
    return;
  }

  await paramsRepository.upsert(
    payload.map(({ attempts, ...params }) => params),
    ["mcq"],
  );

  console.log(
    `Stored calibrated parameters for ${payload.length} MCQs (minAttempts=${options.minAttempts}, version=${options.version}).`,
  );
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

function boundProbability(value: number, min = 0.01, max = 0.99) {
  if (!Number.isFinite(value)) {
    return 0.5;
  }
  return Math.max(min, Math.min(max, value));
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
