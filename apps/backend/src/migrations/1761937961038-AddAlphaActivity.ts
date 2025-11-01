import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAlphaActivity1761937961038 implements MigrationInterface {
    name = 'AddAlphaActivity1761937961038'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clinical_case" ALTER COLUMN "objectives" SET DEFAULT ARRAY[]::text[]`);
        await queryRunner.query(`ALTER TABLE "clinical_case" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::text[]`);
        await queryRunner.query(`ALTER TABLE "generation_request" ALTER COLUMN "content_types" SET DEFAULT ARRAY[]::text[]`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "generation_request" ALTER COLUMN "content_types" SET DEFAULT ARRAY[]`);
        await queryRunner.query(`ALTER TABLE "clinical_case" ALTER COLUMN "tags" SET DEFAULT ARRAY[]`);
        await queryRunner.query(`ALTER TABLE "clinical_case" ALTER COLUMN "objectives" SET DEFAULT ARRAY[]`);
    }

}
