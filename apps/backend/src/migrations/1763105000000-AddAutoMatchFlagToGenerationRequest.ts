import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddAutoMatchFlagToGenerationRequest1763105000000
  implements MigrationInterface
{
  name = "AddAutoMatchFlagToGenerationRequest1763105000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn(
      "generation_request",
      "auto_match_with_ai",
    );
    if (!hasColumn) {
      await queryRunner.addColumn(
        "generation_request",
        new TableColumn({
          name: "auto_match_with_ai",
          type: "boolean",
          isNullable: false,
          default: false,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn(
      "generation_request",
      "auto_match_with_ai",
    );
    if (hasColumn) {
      await queryRunner.query(
        `ALTER TABLE "generation_request" DROP COLUMN "auto_match_with_ai"`,
      );
    }
  }
}
