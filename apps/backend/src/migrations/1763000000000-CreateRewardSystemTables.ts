import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  TableUnique,
  TableColumn,
} from "typeorm";

export class CreateRewardSystemTables1763000000000
  implements MigrationInterface
{
  name = "CreateRewardSystemTables1763000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'reward_transaction_type_enum'
        ) THEN
          CREATE TYPE "reward_transaction_type_enum" AS ENUM ('credit', 'debit', 'hold', 'release');
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'reward_transaction_status_enum'
        ) THEN
          CREATE TYPE "reward_transaction_status_enum" AS ENUM ('pending', 'completed', 'cancelled');
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'reward_auction_status_enum'
        ) THEN
          CREATE TYPE "reward_auction_status_enum" AS ENUM ('draft', 'scheduled', 'active', 'completed', 'cancelled');
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'reward_auction_bid_status_enum'
        ) THEN
          CREATE TYPE "reward_auction_bid_status_enum" AS ENUM ('active', 'outbid', 'winning', 'cancelled');
        END IF;
      END
      $$;
    `);

    const rewardCategoryTable = new Table({
      name: "reward_category",
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
          name: "name",
          type: "varchar",
          length: "120",
        },
        {
          name: "slug",
          type: "varchar",
          length: "150",
        },
        {
          name: "description",
          type: "text",
          isNullable: true,
        },
        {
          name: "sortOrder",
          type: "int",
          default: 0,
        },
        {
          name: "isActive",
          type: "boolean",
          default: true,
        },
      ],
      uniques: [
        new TableUnique({
          name: "UQ_reward_category_slug",
          columnNames: ["slug"],
        }),
      ],
    });
    await queryRunner.createTable(rewardCategoryTable, true);

    const categoryTable = await queryRunner.getTable("reward_category");
    const hasCategorySortIndex = categoryTable?.indices.some(
      (index) => index.name === "IDX_reward_category_sortOrder",
    );

    if (!hasCategorySortIndex) {
      await queryRunner.createIndex(
        "reward_category",
        new TableIndex({
          name: "IDX_reward_category_sortOrder",
          columnNames: ["sortOrder"],
        }),
      );
    }

    const rewardAuctionTable = new Table({
      name: "reward_auction",
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
          name: "title",
          type: "varchar",
          length: "180",
        },
        {
          name: "description",
          type: "text",
          isNullable: true,
        },
        {
          name: "partner",
          type: "varchar",
          length: "160",
          isNullable: true,
        },
        {
          name: "imageUrl",
          type: "varchar",
          length: "255",
          isNullable: true,
        },
        {
          name: "startingBid",
          type: "int",
          default: 0,
        },
        {
          name: "minimumIncrement",
          type: "int",
          default: 10,
        },
        {
          name: "status",
          type: "reward_auction_status_enum",
          default: `'draft'`,
        },
        {
          name: "startsAt",
          type: "timestamp with time zone",
          isNullable: true,
        },
        {
          name: "endsAt",
          type: "timestamp with time zone",
          isNullable: true,
        },
        {
          name: "createdById",
          type: "uuid",
          isNullable: true,
        },
        {
          name: "currentBidAmount",
          type: "int",
          default: 0,
        },
        {
          name: "currentLeaderId",
          type: "uuid",
          isNullable: true,
        },
        {
          name: "metadata",
          type: "jsonb",
          isNullable: true,
        },
      ],
    });
    await queryRunner.createTable(rewardAuctionTable, true);

    const auctionTable = await queryRunner.getTable("reward_auction");

    const hasAuctionStatusIndex = auctionTable?.indices.some(
      (index) => index.name === "IDX_reward_auction_status",
    );

    if (!hasAuctionStatusIndex) {
      await queryRunner.createIndex(
        "reward_auction",
        new TableIndex({
          name: "IDX_reward_auction_status",
          columnNames: ["status"],
        }),
      );
    }

    const hasCreatedByColumn = auctionTable?.columns.some(
      (column) => column.name === "createdById",
    );

    if (hasCreatedByColumn) {
      const hasForeignKey = auctionTable?.foreignKeys.some((fk) =>
        fk.columnNames.includes("createdById"),
      );

      if (!hasForeignKey) {
        await queryRunner.createForeignKey(
          "reward_auction",
          new TableForeignKey({
            columnNames: ["createdById"],
            referencedColumnNames: ["id"],
            referencedTableName: "admin",
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
          }),
        );
      }
    }

    const rewardPerkTable = new Table({
      name: "reward_perk",
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
          name: "title",
          type: "varchar",
          length: "160",
        },
        {
          name: "description",
          type: "text",
          isNullable: true,
        },
        {
          name: "xpCost",
          type: "int",
        },
        {
          name: "maxRedemptions",
          type: "int",
          isNullable: true,
        },
        {
          name: "redeemedCount",
          type: "int",
          default: 0,
        },
        {
          name: "stock",
          type: "int",
          isNullable: true,
        },
        {
          name: "isActive",
          type: "boolean",
          default: true,
        },
        {
          name: "metadata",
          type: "jsonb",
          isNullable: true,
        },
        {
          name: "categoryId",
          type: "uuid",
          isNullable: false,
        },
      ],
    });
    await queryRunner.createTable(rewardPerkTable, true);

    const perkTable = await queryRunner.getTable("reward_perk");

    const hasIsActiveIndex = perkTable?.indices.some(
      (index) => index.name === "IDX_reward_perk_isActive",
    );
    if (!hasIsActiveIndex) {
      await queryRunner.createIndex(
        "reward_perk",
        new TableIndex({
          name: "IDX_reward_perk_isActive",
          columnNames: ["isActive"],
        }),
      );
    }

    const hasCategoryIndex = perkTable?.indices.some(
      (index) => index.name === "IDX_reward_perk_category",
    );
    if (!hasCategoryIndex) {
      await queryRunner.createIndex(
        "reward_perk",
        new TableIndex({
          name: "IDX_reward_perk_category",
          columnNames: ["categoryId"],
        }),
      );
    }

    const hasCategoryFk = perkTable?.foreignKeys.some((fk) =>
      fk.columnNames.includes("categoryId"),
    );

    if (!hasCategoryFk) {
      await queryRunner.createForeignKey(
        "reward_perk",
        new TableForeignKey({
          columnNames: ["categoryId"],
          referencedColumnNames: ["id"],
          referencedTableName: "reward_category",
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        }),
      );
    }

    const rewardTransactionTable = new Table({
      name: "reward_transaction",
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
          name: "type",
          type: "reward_transaction_type_enum",
        },
        {
          name: "status",
          type: "reward_transaction_status_enum",
          default: `'pending'`,
        },
        {
          name: "amount",
          type: "int",
        },
        {
          name: "description",
          type: "varchar",
          length: "180",
          isNullable: true,
        },
        {
          name: "metadata",
          type: "jsonb",
          isNullable: true,
        },
        {
          name: "reference",
          type: "varchar",
          length: "120",
          isNullable: true,
        },
        {
          name: "userId",
          type: "uuid",
          isNullable: false,
        },
        {
          name: "perkId",
          type: "uuid",
          isNullable: true,
        },
        {
          name: "auctionId",
          type: "uuid",
          isNullable: true,
        },
      ],
    });
    await queryRunner.createTable(rewardTransactionTable, true);

    const transactionTable = await queryRunner.getTable("reward_transaction");

    const hasUserIndex = transactionTable?.indices.some(
      (index) => index.name === "IDX_reward_transaction_user",
    );
    if (!hasUserIndex) {
      await queryRunner.createIndex(
        "reward_transaction",
        new TableIndex({
          name: "IDX_reward_transaction_user",
          columnNames: ["userId"],
        }),
      );
    }

    const ensureTransactionForeignKey = async (
      column: string,
      referencedTable: string,
      onDelete: "CASCADE" | "SET NULL",
      constraintName: string,
    ) => {
      const currentTable = await queryRunner.getTable("reward_transaction");
      const hasFk = currentTable?.foreignKeys.some(
        (fk) =>
          fk.name === constraintName || fk.columnNames.includes(column),
      );

      if (!hasFk) {
        await queryRunner.createForeignKey(
          "reward_transaction",
          new TableForeignKey({
            name: constraintName,
            columnNames: [column],
            referencedColumnNames: ["id"],
            referencedTableName: referencedTable,
            onDelete,
            onUpdate: "CASCADE",
          }),
        );
      }
    };

    await ensureTransactionForeignKey(
      "userId",
      "user",
      "CASCADE",
      "FK_reward_transaction_user",
    );
    await ensureTransactionForeignKey(
      "perkId",
      "reward_perk",
      "SET NULL",
      "FK_reward_transaction_perk",
    );
    await ensureTransactionForeignKey(
      "auctionId",
      "reward_auction",
      "SET NULL",
      "FK_reward_transaction_auction",
    );

    const rewardAuctionBidTable = new Table({
      name: "reward_auction_bid",
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
          name: "amount",
          type: "int",
        },
        {
          name: "status",
          type: "reward_auction_bid_status_enum",
          default: `'active'`,
        },
        {
          name: "isWinning",
          type: "boolean",
          default: false,
        },
        {
          name: "auctionId",
          type: "uuid",
          isNullable: false,
        },
        {
          name: "bidderId",
          type: "uuid",
          isNullable: false,
        },
        {
          name: "transactionId",
          type: "uuid",
          isNullable: true,
        },
      ],
    });
    await queryRunner.createTable(rewardAuctionBidTable, true);

    const auctionBidTable = await queryRunner.getTable("reward_auction_bid");

    const hasAuctionIndex = auctionBidTable?.indices.some(
      (index) => index.name === "IDX_reward_auction_bid_auction",
    );
    if (!hasAuctionIndex) {
      await queryRunner.createIndex(
        "reward_auction_bid",
        new TableIndex({
          name: "IDX_reward_auction_bid_auction",
          columnNames: ["auctionId"],
        }),
      );
    }

    const hasBidderIndex = auctionBidTable?.indices.some(
      (index) => index.name === "IDX_reward_auction_bid_bidder",
    );
    if (!hasBidderIndex) {
      await queryRunner.createIndex(
        "reward_auction_bid",
        new TableIndex({
          name: "IDX_reward_auction_bid_bidder",
          columnNames: ["bidderId"],
        }),
      );
    }

    const ensureAuctionBidForeignKey = async (
      column: string,
      referencedTable: string,
      onDelete: "CASCADE" | "SET NULL",
      constraintName: string,
    ) => {
      const currentTable = await queryRunner.getTable("reward_auction_bid");
      const hasFk = currentTable?.foreignKeys.some(
        (fk) => fk.name === constraintName || fk.columnNames.includes(column),
      );

      if (!hasFk) {
        await queryRunner.createForeignKey(
          "reward_auction_bid",
          new TableForeignKey({
            name: constraintName,
            columnNames: [column],
            referencedColumnNames: ["id"],
            referencedTableName: referencedTable,
            onDelete,
            onUpdate: "CASCADE",
          }),
        );
      }
    };

    await ensureAuctionBidForeignKey(
      "auctionId",
      "reward_auction",
      "CASCADE",
      "FK_reward_auction_bid_auction",
    );
    await ensureAuctionBidForeignKey(
      "bidderId",
      "user",
      "CASCADE",
      "FK_reward_auction_bid_bidder",
    );
    await ensureAuctionBidForeignKey(
      "transactionId",
      "reward_transaction",
      "SET NULL",
      "FK_reward_auction_bid_transaction",
    );

    let auctionTablePostBids = await queryRunner.getTable("reward_auction");
    const hasWinningBidColumn = auctionTablePostBids?.columns.some(
      (column) => column.name === "winningBidId",
    );

    if (!hasWinningBidColumn) {
      await queryRunner.addColumn(
        "reward_auction",
        new TableColumn({
          name: "winningBidId",
          type: "uuid",
          isNullable: true,
        }),
      );
    }

    auctionTablePostBids = await queryRunner.getTable("reward_auction");
    const hasWinningBidFk = auctionTablePostBids?.foreignKeys.some((fk) =>
      fk.columnNames.includes("winningBidId"),
    );

    if (!hasWinningBidFk) {
      await queryRunner.createForeignKey(
        "reward_auction",
        new TableForeignKey({
          name: "FK_reward_auction_winning_bid",
          columnNames: ["winningBidId"],
          referencedColumnNames: ["id"],
          referencedTableName: "reward_auction_bid",
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const auctionTable = await queryRunner.getTable("reward_auction");
    if (auctionTable) {
      const winningFk = auctionTable.foreignKeys.find((fk) =>
        fk.columnNames.includes("winningBidId"),
      );
      if (winningFk) {
        await queryRunner.dropForeignKey("reward_auction", winningFk);
      }
      const createdByFk = auctionTable.foreignKeys.find((fk) =>
        fk.columnNames.includes("createdById"),
      );
      if (createdByFk) {
        await queryRunner.dropForeignKey("reward_auction", createdByFk);
      }
    }

    await queryRunner.dropColumn("reward_auction", "winningBidId");

    const auctionBidTable = await queryRunner.getTable("reward_auction_bid");
    if (auctionBidTable) {
      for (const fk of auctionBidTable.foreignKeys) {
        await queryRunner.dropForeignKey("reward_auction_bid", fk);
      }
    }
    await queryRunner.dropTable("reward_auction_bid", true, true, true);

    const transactionTable = await queryRunner.getTable("reward_transaction");
    if (transactionTable) {
      for (const fk of transactionTable.foreignKeys) {
        await queryRunner.dropForeignKey("reward_transaction", fk);
      }
    }
    await queryRunner.dropTable("reward_transaction", true, true, true);

    const perkTable = await queryRunner.getTable("reward_perk");
    if (perkTable) {
      for (const fk of perkTable.foreignKeys) {
        await queryRunner.dropForeignKey("reward_perk", fk);
      }
    }
    await queryRunner.dropTable("reward_perk", true, true, true);

    await queryRunner.dropTable("reward_auction", true, true, true);

    await queryRunner.dropTable("reward_category", true, true, true);

    await queryRunner.query(`DROP TYPE IF EXISTS "reward_auction_bid_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "reward_auction_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "reward_transaction_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "reward_transaction_type_enum"`);
  }
}
