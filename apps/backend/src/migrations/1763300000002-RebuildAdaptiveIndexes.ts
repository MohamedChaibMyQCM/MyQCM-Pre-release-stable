import { MigrationInterface, QueryRunner } from "typeorm";

export class RebuildAdaptiveIndexes1763300000002
  implements MigrationInterface
{
  name = "RebuildAdaptiveIndexes1763300000002";
  public readonly transaction = false;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX CONCURRENTLY IF EXISTS idx_progress_user_time',
    );
    await queryRunner.query(
      'DROP INDEX CONCURRENTLY IF EXISTS idx_progress_session_time',
    );
    await queryRunner.query(
      'DROP INDEX CONCURRENTLY IF EXISTS idx_mcq_course_difficulty_type',
    );
    await queryRunner.query(
      'DROP INDEX CONCURRENTLY IF EXISTS idx_adaptive_learner_user_course',
    );

    await queryRunner.query(
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_progress_user_time ON "progress"("userId","createdAt")',
    );
    await queryRunner.query(
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_progress_session_time ON "progress"("sessionId","createdAt")',
    );
    await queryRunner.query(
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mcq_course_difficulty_type ON "mcq"("courseId","difficulty","type")',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_adaptive_learner_user_course ON "adaptive_learner"("userId","courseId")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX CONCURRENTLY IF EXISTS idx_adaptive_learner_user_course',
    );
    await queryRunner.query(
      'DROP INDEX CONCURRENTLY IF EXISTS idx_mcq_course_difficulty_type',
    );
    await queryRunner.query(
      'DROP INDEX CONCURRENTLY IF EXISTS idx_progress_session_time',
    );
    await queryRunner.query(
      'DROP INDEX CONCURRENTLY IF EXISTS idx_progress_user_time',
    );
  }
}
