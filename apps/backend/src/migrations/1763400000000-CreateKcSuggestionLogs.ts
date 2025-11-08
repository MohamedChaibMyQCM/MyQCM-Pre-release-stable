import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateKcSuggestionLogs1763400000000 implements MigrationInterface {
  name = "CreateKcSuggestionLogs1763400000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const exists = await queryRunner.hasTable("kc_suggestion_log");
    if (!exists) {
      await queryRunner.createTable(
        new Table({
          name: "kc_suggestion_log",
          columns: [
            {
              name: "id",
              type: "uuid",
              isPrimary: true,
              default: "uuid_generate_v4()",
            },
            {
              name: "createdAt",
              type: "timestamp with time zone",
              default: "CURRENT_TIMESTAMP",
            },
            {
              name: "updatedAt",
              type: "timestamp with time zone",
              default: "CURRENT_TIMESTAMP",
              onUpdate: "CURRENT_TIMESTAMP",
            },
            {
              name: "course_id",
              type: "uuid",
              isNullable: false,
            },
            {
              name: "model",
              type: "varchar",
              length: "160",
            },
            {
              name: "requested",
              type: "int",
              default: 0,
            },
            {
              name: "processed",
              type: "int",
              default: 0,
            },
            {
              name: "skipped",
              type: "int",
              default: 0,
            },
            {
              name: "options_skipped",
              type: "int",
              default: 0,
            },
            {
              name: "prompt_tokens",
              type: "int",
              default: 0,
            },
            {
              name: "completion_tokens",
              type: "int",
              default: 0,
            },
            {
              name: "total_tokens",
              type: "int",
              default: 0,
            },
            {
              name: "request_ids",
              type: "jsonb",
              isNullable: true,
            },
            {
              name: "initiated_by",
              type: "jsonb",
              isNullable: true,
            },
          ],
          indices: [
            new TableIndex({
              name: "idx_kc_suggestion_log_course",
              columnNames: ["course_id"],
            }),
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("kc_suggestion_log", true);
  }
}
