import { MigrationInterface, QueryRunner } from "typeorm";

export class AddApprovalStatusAndSeconds1762001100000
  implements MigrationInterface
{
  name = "AddApprovalStatusAndSeconds1762001100000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."mcq_approval_status_enum" AS ENUM('pending','approved')`,
    );
    await queryRunner.query(
      `ALTER TABLE "mcq" ADD "approval_status" "public"."mcq_approval_status_enum" NOT NULL DEFAULT 'approved'`,
    );
    await queryRunner.query(`
      UPDATE "mcq"
      SET "estimated_time" = CASE
        WHEN "estimated_time" IS NULL THEN NULL
        WHEN "estimated_time" <= 0 THEN 1
        ELSE "estimated_time" * 60
      END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "mcq"
      SET "estimated_time" = CASE
        WHEN "estimated_time" IS NULL THEN NULL
        WHEN "estimated_time" <= 0 THEN 1
        ELSE CEIL("estimated_time"::numeric / 60)::smallint
      END
    `);
    await queryRunner.query(
      `ALTER TABLE "mcq" DROP COLUMN "approval_status"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."mcq_approval_status_enum"`,
    );
  }
}
