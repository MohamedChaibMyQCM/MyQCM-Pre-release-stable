import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMcqSuggestionFields1763200000100 implements MigrationInterface {
  name = "AddMcqSuggestionFields1763200000100";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const mcqColumns: Array<{ name: string; definition: string }> = [
      {
        name: "suggested_knowledge_components",
        definition: `jsonb`,
      },
      {
        name: "suggestion_confidence",
        definition: `character varying(16)`,
      },
      {
        name: "suggestion_confidence_score",
        definition: `double precision`,
      },
      {
        name: "suggestion_rationale",
        definition: `text`,
      },
      {
        name: "suggestion_generated_at",
        definition: `TIMESTAMP WITH TIME ZONE`,
      },
    ];

    for (const column of mcqColumns) {
      const exists = await queryRunner.hasColumn("mcq", column.name);
      if (!exists) {
        await queryRunner.query(
          `ALTER TABLE "mcq" ADD COLUMN "${column.name}" ${column.definition}`,
        );
      }
    }

    const tableExists = await queryRunner.hasTable("kc_suggestion_call");
    if (!tableExists) {
      await queryRunner.query(
        `CREATE TABLE "kc_suggestion_call" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "course_id" uuid, "mcq_ids" jsonb, "model" character varying(160) NOT NULL, "prompt_tokens" integer NOT NULL DEFAULT '0', "completion_tokens" integer NOT NULL DEFAULT '0', "total_tokens" integer NOT NULL DEFAULT '0', "extra_labels" jsonb, CONSTRAINT "PK_3d1890e7ce3b72596c3d15fc0d8" PRIMARY KEY ("id"))`,
      );
    }

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_kc_suggestion_call_course" ON "kc_suggestion_call" ("course_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_kc_suggestion_call_course"`,
    );
    const tableExists = await queryRunner.hasTable("kc_suggestion_call");
    if (tableExists) {
      await queryRunner.query(`DROP TABLE "kc_suggestion_call"`);
    }

    const mcqColumns = [
      "suggestion_generated_at",
      "suggestion_rationale",
      "suggestion_confidence_score",
      "suggestion_confidence",
      "suggested_knowledge_components",
    ];

    for (const column of mcqColumns) {
      const exists = await queryRunner.hasColumn("mcq", column);
      if (exists) {
        await queryRunner.query(
          `ALTER TABLE "mcq" DROP COLUMN "${column}"`,
        );
      }
    }
  }
}
