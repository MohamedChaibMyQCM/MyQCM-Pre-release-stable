import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateFeatureAnnouncementTablesFixed1763300000001
  implements MigrationInterface
{
  name = "CreateFeatureAnnouncementTablesFixed1763300000001";

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

    // Create feature_announcement_status enum
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'feature_announcement_status_enum'
        ) THEN
          CREATE TYPE "feature_announcement_status_enum" AS ENUM ('draft', 'published', 'archived');
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
          CREATE TYPE "feature_announcement_media_type_enum" AS ENUM ('none', 'image', 'video', 'lottie');
        END IF;
      END
      $$;
    `);

    // Create feature_announcements table (plural!)
    const featureAnnouncementTable = new Table({
      name: "feature_announcements",
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
          name: "version",
          type: "varchar",
          length: "20",
        },
        {
          name: "release_date",
          type: "date",
        },
        {
          name: "title",
          type: "varchar",
          length: "255",
        },
        {
          name: "description",
          type: "text",
        },
        {
          name: "type",
          type: "feature_announcement_type_enum",
          default: "'minor'",
        },
        {
          name: "status",
          type: "feature_announcement_status_enum",
          default: "'draft'",
        },
        {
          name: "media_type",
          type: "feature_announcement_media_type_enum",
          default: "'none'",
        },
        {
          name: "media_url",
          type: "text",
          isNullable: true,
        },
        {
          name: "thumbnail_url",
          type: "text",
          isNullable: true,
        },
        {
          name: "highlight_steps",
          type: "jsonb",
          isNullable: true,
        },
        {
          name: "target_roles",
          type: "jsonb",
          default: "'[\"user\"]'",
        },
        {
          name: "is_active",
          type: "boolean",
          default: true,
        },
        {
          name: "cta_text",
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
          name: "priority",
          type: "int",
          default: 0,
        },
        {
          name: "created_by",
          type: "uuid",
          isNullable: true,
        },
      ],
    });

    await queryRunner.createTable(featureAnnouncementTable, true);

    // Create indexes for feature_announcements
    const announcementTable = await queryRunner.getTable("feature_announcements");

    const hasIsActiveIndex = announcementTable?.indices.some(
      (index) => index.name === "IDX_feature_announcements_is_active"
    );
    if (!hasIsActiveIndex) {
      await queryRunner.createIndex(
        "feature_announcements",
        new TableIndex({
          name: "IDX_feature_announcements_is_active",
          columnNames: ["is_active"],
        })
      );
    }

    const hasStatusIndex = announcementTable?.indices.some(
      (index) => index.name === "IDX_feature_announcements_status"
    );
    if (!hasStatusIndex) {
      await queryRunner.createIndex(
        "feature_announcements",
        new TableIndex({
          name: "IDX_feature_announcements_status",
          columnNames: ["status"],
        })
      );
    }

    const hasReleaseDateIndex = announcementTable?.indices.some(
      (index) => index.name === "IDX_feature_announcements_release_date"
    );
    if (!hasReleaseDateIndex) {
      await queryRunner.createIndex(
        "feature_announcements",
        new TableIndex({
          name: "IDX_feature_announcements_release_date",
          columnNames: ["release_date"],
        })
      );
    }

    const hasTypeIndex = announcementTable?.indices.some(
      (index) => index.name === "IDX_feature_announcements_type"
    );
    if (!hasTypeIndex) {
      await queryRunner.createIndex(
        "feature_announcements",
        new TableIndex({
          name: "IDX_feature_announcements_type",
          columnNames: ["type"],
        })
      );
    }

    // Add foreign key to admin table
    const hasCreatedByFk = announcementTable?.foreignKeys.some(
      (fk) => fk.columnNames.includes("created_by")
    );
    if (!hasCreatedByFk) {
      await queryRunner.createForeignKey(
        "feature_announcements",
        new TableForeignKey({
          name: "FK_feature_announcements_created_by",
          columnNames: ["created_by"],
          referencedColumnNames: ["id"],
          referencedTableName: "admin",
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        })
      );
    }

    // Create feature_interactions table (plural!)
    const featureInteractionTable = new Table({
      name: "feature_interactions",
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
          name: "feature_id",
          type: "uuid",
          isNullable: false,
        },
        {
          name: "user_id",
          type: "uuid",
          isNullable: false,
        },
      ],
    });

    await queryRunner.createTable(featureInteractionTable, true);

    // Create indexes for feature_interactions
    const interactionTable = await queryRunner.getTable("feature_interactions");

    const hasUserFeatureIndex = interactionTable?.indices.some(
      (index) => index.name === "IDX_feature_interactions_user_feature"
    );
    if (!hasUserFeatureIndex) {
      await queryRunner.createIndex(
        "feature_interactions",
        new TableIndex({
          name: "IDX_feature_interactions_user_feature",
          columnNames: ["user_id", "feature_id"],
          isUnique: true,
        })
      );
    }

    const hasUserIndex = interactionTable?.indices.some(
      (index) => index.name === "IDX_feature_interactions_user"
    );
    if (!hasUserIndex) {
      await queryRunner.createIndex(
        "feature_interactions",
        new TableIndex({
          name: "IDX_feature_interactions_user",
          columnNames: ["user_id"],
        })
      );
    }

    const hasFeatureIndex = interactionTable?.indices.some(
      (index) => index.name === "IDX_feature_interactions_feature"
    );
    if (!hasFeatureIndex) {
      await queryRunner.createIndex(
        "feature_interactions",
        new TableIndex({
          name: "IDX_feature_interactions_feature",
          columnNames: ["feature_id"],
        })
      );
    }

    // Create foreign keys for feature_interactions
    const hasFeatureFk = interactionTable?.foreignKeys.some(
      (fk) => fk.columnNames.includes("feature_id")
    );
    if (!hasFeatureFk) {
      await queryRunner.createForeignKey(
        "feature_interactions",
        new TableForeignKey({
          name: "FK_feature_interactions_feature",
          columnNames: ["feature_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "feature_announcements",
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        })
      );
    }

    const hasUserFk = interactionTable?.foreignKeys.some(
      (fk) => fk.columnNames.includes("user_id")
    );
    if (!hasUserFk) {
      await queryRunner.createForeignKey(
        "feature_interactions",
        new TableForeignKey({
          name: "FK_feature_interactions_user",
          columnNames: ["user_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "user",
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop feature_interactions table with foreign keys
    const interactionTable = await queryRunner.getTable("feature_interactions");
    if (interactionTable) {
      for (const fk of interactionTable.foreignKeys) {
        await queryRunner.dropForeignKey("feature_interactions", fk);
      }
    }
    await queryRunner.dropTable("feature_interactions", true, true, true);

    // Drop feature_announcements table with foreign keys
    const announcementTable = await queryRunner.getTable("feature_announcements");
    if (announcementTable) {
      for (const fk of announcementTable.foreignKeys) {
        await queryRunner.dropForeignKey("feature_announcements", fk);
      }
    }
    await queryRunner.dropTable("feature_announcements", true, true, true);

    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "feature_announcement_media_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "feature_announcement_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "feature_announcement_type_enum"`);
  }
}
