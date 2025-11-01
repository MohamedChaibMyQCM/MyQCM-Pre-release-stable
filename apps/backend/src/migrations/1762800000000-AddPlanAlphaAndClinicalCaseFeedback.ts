import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class AddPlanAlphaAndClinicalCaseFeedback1762800000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasAlphaColumn = await queryRunner.hasColumn("plan", "is_alpha");
    if (!hasAlphaColumn) {
      await queryRunner.addColumn(
        "plan",
        new TableColumn({
          name: "is_alpha",
          type: "boolean",
          isNullable: false,
          default: false,
        }),
      );
    }

    const hasFeedbackTable = await queryRunner.hasTable(
      "clinical_case_feedback",
    );
    if (!hasFeedbackTable) {
      await queryRunner.createTable(
        new Table({
          name: "clinical_case_feedback",
          columns: [
            {
              name: "id",
              type: "uuid",
              isPrimary: true,
              generationStrategy: "uuid",
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
              name: "case_identifier",
              type: "varchar",
              length: "255",
              isNullable: false,
            },
            {
              name: "rating",
              type: "smallint",
              isNullable: false,
            },
            {
              name: "review",
              type: "text",
              isNullable: true,
            },
            {
              name: "clinical_caseId",
              type: "uuid",
              isNullable: true,
            },
            {
              name: "userId",
              type: "uuid",
              isNullable: true,
            },
          ],
        }),
      );

      await queryRunner.createIndex(
        "clinical_case_feedback",
        new TableIndex({
          name: "IDX_clinical_case_feedback_case_user",
          columnNames: ["case_identifier", "userId"],
          isUnique: true,
        }),
      );

      await queryRunner.createForeignKeys("clinical_case_feedback", [
        new TableForeignKey({
          columnNames: ["clinical_caseId"],
          referencedColumnNames: ["id"],
          referencedTableName: "clinical_case",
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        }),
        new TableForeignKey({
          columnNames: ["userId"],
          referencedColumnNames: ["id"],
          referencedTableName: '"user"',
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        }),
      ]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasFeedbackTable = await queryRunner.hasTable(
      "clinical_case_feedback",
    );
    if (hasFeedbackTable) {
      await queryRunner.dropTable("clinical_case_feedback", true, true, true);
    }

    const hasAlphaColumn = await queryRunner.hasColumn("plan", "is_alpha");
    if (hasAlphaColumn) {
      await queryRunner.dropColumn("plan", "is_alpha");
    }
  }
}
