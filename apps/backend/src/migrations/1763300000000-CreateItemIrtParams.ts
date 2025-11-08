import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateItemIrtParams1763300000000 implements MigrationInterface {
  name = "CreateItemIrtParams1763300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable("item_irt_params");
    if (!tableExists) {
      await queryRunner.createTable(
        new Table({
          name: "item_irt_params",
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
              name: "discrimination",
              type: "float",
            },
            {
              name: "difficulty",
              type: "float",
            },
            {
              name: "guessing",
              type: "float",
            },
            {
              name: "source",
              type: "varchar",
              length: "64",
              isNullable: true,
            },
            {
              name: "version",
              type: "varchar",
              length: "64",
              isNullable: true,
            },
            {
              name: "mcq_id",
              type: "uuid",
              isUnique: true,
            },
          ],
          indices: [
            new TableIndex({
              name: "IDX_item_irt_params_source",
              columnNames: ["source"],
            }),
            new TableIndex({
              name: "IDX_item_irt_params_version",
              columnNames: ["version"],
            }),
          ],
        }),
        true,
      );
    }

    const table = await queryRunner.getTable("item_irt_params");
    if (
      table &&
      !table.foreignKeys.find(
        (fk) => fk.columnNames.includes("mcq_id"),
      )
    ) {
      await queryRunner.createForeignKey(
        "item_irt_params",
        new TableForeignKey({
          columnNames: ["mcq_id"],
          referencedTableName: "mcq",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("item_irt_params");
    if (table) {
      for (const fk of table.foreignKeys) {
        await queryRunner.dropForeignKey("item_irt_params", fk);
      }
    }
    await queryRunner.dropTable("item_irt_params", true);
  }
}
