import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateFeatureAnnouncementTables1763300000000
  implements MigrationInterface
{
  name = "CreateFeatureAnnouncementTables1763300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create feature_announcement_type enum
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'feature_announcement_type_enum'
        ) THEN
          CREATE TYPE "feature_announcement_type_enum" AS ENUM ('major', 'minor', 'update', 'bugfix');
        END IF;
      END
      $$;
    `);

    // Create feature_announcement_media_type enum
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'feature_announcement_media_type_enum'
        ) THEN
          CREATE TYPE "feature_announcement_media_type_enum" AS ENUM ('image', 'video', 'lottie');
        END IF;
      END
      $$;
    `);

    // Create feature_announcement table
    const featureAnnouncementTable = new Table({
      name: "feature_announcement",
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
        },
        {
          name: "title",
          type: "varchar",
          length: "200",
        },
        {
          name: "description",
          type: "text",
        },
        {
          name: "type",
          type: "feature_announcement_type_enum",
          default: "'update'",
        },
        {
          name: "media_url",
          type: "varchar",
          length: "500",
          isNullable: true,
        },
        {
          name: "media_type",
          type: "feature_announcement_media_type_enum",
          isNullable: true,
        },
        {
          name: "cta_label",
          type: "varchar",
          length: "100",
          isNullable: true,
        },
        {
          name: "cta_link",
          type: "varchar",
          length: "500",
          isNullable: true,
        },
        {
          name: "target_roles",
          type: "jsonb",
          default: "'[\"user\"]'",
        },
        {
          name: "release_date",
          type: "timestamp with time zone",
          default: "CURRENT_TIMESTAMP",
        },
        {
          name: "is_active",
          type: "boolean",
          default: true,
        },
        {
          name: "priority",
          type: "int",
          default: 0,
        },
      ],
    });

    await queryRunner.createTable(featureAnnouncementTable, true);

    // Create indexes for feature_announcement
    const announcementTable = await queryRunner.getTable("feature_announcement");

    const hasIsActiveIndex = announcementTable?.indices.some(
      (index) => index.name === "IDX_feature_announcement_is_active"
    );
    if (!hasIsActiveIndex) {
      await queryRunner.createIndex(
        "feature_announcement",
        new TableIndex({
          name: "IDX_feature_announcement_is_active",
          columnNames: ["is_active"],
        })
      );
    }

    const hasReleaseDateIndex = announcementTable?.indices.some(
      (index) => index.name === "IDX_feature_announcement_release_date"
    );
    if (!hasReleaseDateIndex) {
      await queryRunner.createIndex(
        "feature_announcement",
        new TableIndex({
          name: "IDX_feature_announcement_release_date",
          columnNames: ["release_date"],
        })
      );
    }

    const hasTypeIndex = announcementTable?.indices.some(
      (index) => index.name === "IDX_feature_announcement_type"
    );
    if (!hasTypeIndex) {
      await queryRunner.createIndex(
        "feature_announcement",
        new TableIndex({
          name: "IDX_feature_announcement_type",
          columnNames: ["type"],
        })
      );
    }

    // Create feature_interaction table
    const featureInteractionTable = new Table({
      name: "feature_interaction",
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
        },
        {
          name: "has_seen",
          type: "boolean",
          default: false,
        },
        {
          name: "has_tried",
          type: "boolean",
          default: false,
        },
        {
          name: "has_dismissed",
          type: "boolean",
          default: false,
        },
        {
          name: "seen_at",
          type: "timestamp with time zone",
          isNullable: true,
        },
        {
          name: "tried_at",
          type: "timestamp with time zone",
          isNullable: true,
        },
        {
          name: "dismissed_at",
          type: "timestamp with time zone",
          isNullable: true,
        },
        {
          name: "featureId",
          type: "uuid",
          isNullable: false,
        },
        {
          name: "userId",
          type: "uuid",
          isNullable: false,
        },
      ],
    });

    await queryRunner.createTable(featureInteractionTable, true);

    // Create indexes for feature_interaction
    const interactionTable = await queryRunner.getTable("feature_interaction");

    const hasUserFeatureIndex = interactionTable?.indices.some(
      (index) => index.name === "IDX_feature_interaction_user_feature"
    );
    if (!hasUserFeatureIndex) {
      await queryRunner.createIndex(
        "feature_interaction",
        new TableIndex({
          name: "IDX_feature_interaction_user_feature",
          columnNames: ["userId", "featureId"],
          isUnique: true,
        })
      );
    }

    const hasUserIndex = interactionTable?.indices.some(
      (index) => index.name === "IDX_feature_interaction_user"
    );
    if (!hasUserIndex) {
      await queryRunner.createIndex(
        "feature_interaction",
        new TableIndex({
          name: "IDX_feature_interaction_user",
          columnNames: ["userId"],
        })
      );
    }

    const hasFeatureIndex = interactionTable?.indices.some(
      (index) => index.name === "IDX_feature_interaction_feature"
    );
    if (!hasFeatureIndex) {
      await queryRunner.createIndex(
        "feature_interaction",
        new TableIndex({
          name: "IDX_feature_interaction_feature",
          columnNames: ["featureId"],
        })
      );
    }

    // Create foreign keys for feature_interaction
    const hasFeatureFk = interactionTable?.foreignKeys.some(
      (fk) => fk.columnNames.includes("featureId")
    );
    if (!hasFeatureFk) {
      await queryRunner.createForeignKey(
        "feature_interaction",
        new TableForeignKey({
          name: "FK_feature_interaction_feature",
          columnNames: ["featureId"],
          referencedColumnNames: ["id"],
          referencedTableName: "feature_announcement",
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        })
      );
    }

    const hasUserFk = interactionTable?.foreignKeys.some(
      (fk) => fk.columnNames.includes("userId")
    );
    if (!hasUserFk) {
      await queryRunner.createForeignKey(
        "feature_interaction",
        new TableForeignKey({
          name: "FK_feature_interaction_user",
          columnNames: ["userId"],
          referencedColumnNames: ["id"],
          referencedTableName: "user",
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop feature_interaction table with foreign keys
    const interactionTable = await queryRunner.getTable("feature_interaction");
    if (interactionTable) {
      for (const fk of interactionTable.foreignKeys) {
        await queryRunner.dropForeignKey("feature_interaction", fk);
      }
    }
    await queryRunner.dropTable("feature_interaction", true, true, true);

    // Drop feature_announcement table
    await queryRunner.dropTable("feature_announcement", true, true, true);

    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "feature_announcement_media_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "feature_announcement_type_enum"`);
  }
}
