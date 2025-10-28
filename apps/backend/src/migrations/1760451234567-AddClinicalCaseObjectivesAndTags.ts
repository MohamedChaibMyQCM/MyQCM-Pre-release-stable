import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddClinicalCaseObjectivesAndTags1760451234567
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("clinical_case", [
      new TableColumn({
        name: "objectives",
        type: "text",
        isArray: true,
        isNullable: false,
        default: "ARRAY[]::text[]",
      }),
      new TableColumn({
        name: "tags",
        type: "text",
        isArray: true,
        isNullable: false,
        default: "ARRAY[]::text[]",
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns("clinical_case", ["tags", "objectives"]);
  }
}
