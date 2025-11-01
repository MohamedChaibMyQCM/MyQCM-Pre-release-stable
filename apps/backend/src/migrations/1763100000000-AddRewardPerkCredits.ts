import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddRewardPerkCredits1763100000000 implements MigrationInterface {
  name = "AddRewardPerkCredits1763100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const rewardPerkTable = await queryRunner.getTable("reward_perk");
    if (!rewardPerkTable) {
      return;
    }

    if (!rewardPerkTable.findColumnByName("creditMcqs")) {
      await queryRunner.addColumn(
        "reward_perk",
        new TableColumn({
          name: "creditMcqs",
          type: "int",
          default: 0,
          isNullable: false,
        }),
      );
    }

    if (!rewardPerkTable.findColumnByName("creditQrocs")) {
      await queryRunner.addColumn(
        "reward_perk",
        new TableColumn({
          name: "creditQrocs",
          type: "int",
          default: 0,
          isNullable: false,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const rewardPerkTable = await queryRunner.getTable("reward_perk");
    if (!rewardPerkTable) {
      return;
    }

    if (rewardPerkTable.findColumnByName("creditQrocs")) {
      await queryRunner.dropColumn("reward_perk", "creditQrocs");
    }

    if (rewardPerkTable.findColumnByName("creditMcqs")) {
      await queryRunner.dropColumn("reward_perk", "creditMcqs");
    }
  }
}
