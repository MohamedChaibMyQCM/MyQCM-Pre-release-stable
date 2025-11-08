import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateAdaptiveLearnerKnowledgeComponent1763300000001
  implements MigrationInterface
{
  name = "CreateAdaptiveLearnerKnowledgeComponent1763300000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const exists = await queryRunner.hasTable(
      "adaptive_learner_knowledge_component",
    );
    if (!exists) {
      await queryRunner.createTable(
        new Table({
          name: "adaptive_learner_knowledge_component",
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
              name: "adaptive_learner_id",
              type: "uuid",
            },
            {
              name: "knowledge_component_id",
              type: "uuid",
            },
            {
              name: "mastery",
              type: "float",
              default: 0.2,
            },
          ],
          indices: [
            new TableIndex({
              name: "IDX_adaptive_learner_component_component",
              columnNames: ["knowledge_component_id"],
            }),
            new TableIndex({
              name: "IDX_adaptive_learner_component_learner",
              columnNames: ["adaptive_learner_id"],
            }),
            new TableIndex({
              name: "UQ_adaptive_learner_component",
              columnNames: ["adaptive_learner_id", "knowledge_component_id"],
              isUnique: true,
            }),
          ],
        }),
        true,
      );
    }

    const table = await queryRunner.getTable(
      "adaptive_learner_knowledge_component",
    );
    if (table) {
      const learnerFkExists = table.foreignKeys.some((fk) =>
        fk.columnNames.includes("adaptive_learner_id"),
      );
      if (!learnerFkExists) {
        await queryRunner.createForeignKey(
          "adaptive_learner_knowledge_component",
          new TableForeignKey({
            columnNames: ["adaptive_learner_id"],
            referencedTableName: "adaptive_learner",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          }),
        );
      }

      const kcFkExists = table.foreignKeys.some((fk) =>
        fk.columnNames.includes("knowledge_component_id"),
      );
      if (!kcFkExists) {
        await queryRunner.createForeignKey(
          "adaptive_learner_knowledge_component",
          new TableForeignKey({
            columnNames: ["knowledge_component_id"],
            referencedTableName: "knowledge_component",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(
      "adaptive_learner_knowledge_component",
    );
    if (table) {
      for (const fk of table.foreignKeys) {
        await queryRunner.dropForeignKey(
          "adaptive_learner_knowledge_component",
          fk,
        );
      }
    }
    await queryRunner.dropTable("adaptive_learner_knowledge_component", true);
  }
}
