import "reflect-metadata";
import { AppDataSource } from "../src/data-source";
import { Mcq } from "../src/mcq/entities/mcq.entity";
import { Progress } from "../src/progress/entities/progress.entity";

type SeedOptions = {
  courseId: string;
  userId: string;
  attemptsPerMcq: number;
  minSuccessRatio: number;
  maxSuccessRatio: number;
};

function getEnvOptions(): SeedOptions {
  const courseId = process.env.COURSE_ID;
  const userId = process.env.USER_ID;

  if (!courseId || !userId) {
    throw new Error("COURSE_ID and USER_ID environment variables are required");
  }

  const attemptsPerMcq = Number(process.env.ATTEMPTS_PER_MCQ ?? 1);
  const minSuccessRatio = Number(process.env.MIN_SUCCESS_RATIO ?? 0.4);
  const maxSuccessRatio = Number(process.env.MAX_SUCCESS_RATIO ?? 0.9);

  if (Number.isNaN(attemptsPerMcq) || attemptsPerMcq < 1) {
    throw new Error("ATTEMPTS_PER_MCQ must be a positive integer");
  }

  return {
    courseId,
    userId,
    attemptsPerMcq,
    minSuccessRatio,
    maxSuccessRatio,
  };
}

async function seedSyntheticProgress(options: SeedOptions) {
  await AppDataSource.initialize();
  try {
    const mcqRepository = AppDataSource.getRepository(Mcq);
    const progressRepository = AppDataSource.getRepository(Progress);

    const mcqs = await mcqRepository.find({
      where: { course: { id: options.courseId } },
      relations: ["knowledgeComponents", "unit", "subject", "course"],
      order: { createdAt: "ASC" },
    });

    if (!mcqs.length) {
      console.warn(
        `No MCQs found for course ${options.courseId}. Nothing to seed.`,
      );
      return;
    }

    const totalAttempts = mcqs.length * options.attemptsPerMcq;
    console.log(
      `Seeding ${totalAttempts} synthetic attempts across ${mcqs.length} MCQs for course ${options.courseId}`,
    );

    const records: Progress[] = [];

    for (const mcq of mcqs) {
      for (let attempt = 0; attempt < options.attemptsPerMcq; attempt += 1) {
        const successRatio = randomBetween(
          options.minSuccessRatio,
          options.maxSuccessRatio,
        );

        const progress = progressRepository.create({
          user: { id: options.userId } as any,
          mcq: { id: mcq.id } as any,
          course: mcq.course ? { id: mcq.course.id } : { id: options.courseId },
          unit: mcq.unit ? { id: mcq.unit.id } : null,
          subject: mcq.subject ? { id: mcq.subject.id } : null,
          success_ratio: clamp(successRatio, 0, 1),
          time_spent: mcq.estimated_time
            ? Math.max(5, Math.round(mcq.estimated_time * randomBetween(0.6, 1.4)))
            : null,
          gained_xp: 0,
          is_skipped: false,
          selected_options: null,
          knowledge_components: (mcq.knowledgeComponents || []).map(
            (component) => component.id,
          ),
        });

        records.push(progress);
      }
    }

    await progressRepository.save(records);
    console.log(`Inserted ${records.length} synthetic progress rows.`);
  } finally {
    await AppDataSource.destroy();
  }
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

if (require.main === module) {
  seedSyntheticProgress(getEnvOptions()).catch((error) => {
    console.error("Failed to seed synthetic progress", error);
    process.exitCode = 1;
  });
}
