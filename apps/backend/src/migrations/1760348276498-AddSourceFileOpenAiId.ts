import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddSourceFileOpenAiId1760348276498 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "generation_request",
      new TableColumn({
        name: "source_file_openai_id",
        type: "varchar",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("generation_request", "source_file_openai_id");
  }
}
