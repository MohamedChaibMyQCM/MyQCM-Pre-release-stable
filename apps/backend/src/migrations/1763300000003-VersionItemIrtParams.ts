import { MigrationInterface, QueryRunner } from "typeorm";

export class VersionItemIrtParams1763300000003
  implements MigrationInterface
{
  name = "VersionItemIrtParams1763300000003";
  public readonly transaction = false;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "item_irt_params" ADD COLUMN IF NOT EXISTS "is_latest" boolean DEFAULT true',
    );

    await queryRunner.query(
      "ALTER TABLE \"item_irt_params\" ALTER COLUMN \"is_latest\" SET NOT NULL",
    );

    await queryRunner.query(
      "UPDATE \"item_irt_params\" SET \"version\" = 'legacy' WHERE \"version\" IS NULL",
    );

    await queryRunner.query(
      'ALTER TABLE "item_irt_params" ALTER COLUMN "version" DROP DEFAULT',
    );
    await queryRunner.query(
      'ALTER TABLE "item_irt_params" ALTER COLUMN "version" SET NOT NULL',
    );

    await queryRunner.query(
      'WITH ranked AS (\n        SELECT id, ROW_NUMBER() OVER (PARTITION BY mcq_id ORDER BY "updatedAt" DESC, "createdAt" DESC) AS rn\n        FROM "item_irt_params"\n      )\n      UPDATE "item_irt_params" i\n      SET "is_latest" = CASE WHEN ranked.rn = 1 THEN true ELSE false END\n      FROM ranked\n      WHERE ranked.id = i.id',
    );

    await queryRunner.query(
      'DROP INDEX CONCURRENTLY IF EXISTS "UQ_item_irt_params_mcq"',
    );

    await queryRunner.query(
      'CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "UQ_item_irt_params_mcq_version" ON "item_irt_params" ("mcq_id","version")',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "IDX_item_irt_params_latest" ON "item_irt_params" ("mcq_id") WHERE "is_latest"',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX CONCURRENTLY IF EXISTS "IDX_item_irt_params_latest"',
    );
    await queryRunner.query(
      'DROP INDEX CONCURRENTLY IF EXISTS "UQ_item_irt_params_mcq_version"',
    );

    await queryRunner.query(
      'ALTER TABLE "item_irt_params" ALTER COLUMN "version" DROP NOT NULL',
    );

    await queryRunner.query(
      'ALTER TABLE "item_irt_params" DROP COLUMN IF EXISTS "is_latest"',
    );

    await queryRunner.query(
      'CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "UQ_item_irt_params_mcq" ON "item_irt_params" ("mcq_id")',
    );
  }
}
