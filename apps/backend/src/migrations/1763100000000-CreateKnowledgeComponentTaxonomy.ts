import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from "typeorm";
import { randomUUID } from "crypto";

export class CreateKnowledgeComponentTaxonomy1763100000000
  implements MigrationInterface
{
  name = "CreateKnowledgeComponentTaxonomy1763100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const knowledgeDomainTable = new Table({
      name: "knowledge_domain",
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
          name: "slug",
          type: "varchar",
          length: "160",
        },
        {
          name: "name",
          type: "varchar",
          length: "160",
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
          name: "UQ_knowledge_domain_slug",
          columnNames: ["slug"],
        }),
      ],
    });

    const existingDomainTable = await queryRunner.getTable("knowledge_domain");
    if (!existingDomainTable) {
      await queryRunner.createTable(knowledgeDomainTable, true);
    }

    const knowledgeComponentTableDefinition = new Table({
      name: "knowledge_component",
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
          name: "slug",
          type: "varchar",
          length: "190",
        },
        {
          name: "name",
          type: "varchar",
          length: "190",
        },
        {
          name: "code",
          type: "varchar",
          length: "64",
          isNullable: true,
        },
        {
          name: "description",
          type: "text",
          isNullable: true,
        },
        {
          name: "level",
          type: "int",
          default: 1,
        },
        {
          name: "isActive",
          type: "boolean",
          default: true,
        },
        {
          name: "domain_id",
          type: "uuid",
        },
        {
          name: "parent_id",
          type: "uuid",
          isNullable: true,
        },
        {
          name: "course_id",
          type: "uuid",
          isNullable: true,
        },
      ],
      uniques: [
        new TableUnique({
          name: "UQ_knowledge_component_slug",
          columnNames: ["slug"],
        }),
      ],
      indices: [
        new TableIndex({
          name: "IDX_knowledge_component_domain",
          columnNames: ["domain_id"],
        }),
        new TableIndex({
          name: "IDX_knowledge_component_parent",
          columnNames: ["parent_id"],
        }),
        new TableIndex({
          name: "IDX_knowledge_component_course",
          columnNames: ["course_id"],
        }),
      ],
    });

    let knowledgeComponentTable = await queryRunner.getTable(
      "knowledge_component",
    );

    if (!knowledgeComponentTable) {
      await queryRunner.createTable(knowledgeComponentTableDefinition, true);
      knowledgeComponentTable = await queryRunner.getTable(
        "knowledge_component",
      );
    } else {
      const requiredColumns = knowledgeComponentTableDefinition.columns;
      for (const column of requiredColumns) {
        if (!knowledgeComponentTable.findColumnByName(column.name)) {
          await queryRunner.addColumn("knowledge_component", column);
        }
      }

      for (const index of knowledgeComponentTableDefinition.indices ?? []) {
        const existingIndex = knowledgeComponentTable.indices.find(
          (idx) => idx.name === index.name,
        );
        if (!existingIndex) {
          await queryRunner.createIndex("knowledge_component", index);
        }
      }

      for (const unique of knowledgeComponentTableDefinition.uniques ?? []) {
        const existingUnique = knowledgeComponentTable.uniques.find(
          (uq) => uq.name === unique.name,
        );
        if (!existingUnique) {
          await queryRunner.createUniqueConstraint(
            "knowledge_component",
            unique,
          );
        }
      }
    }

    const knowledgeComponentForeignKeys = [
      new TableForeignKey({
        columnNames: ["domain_id"],
        referencedTableName: "knowledge_domain",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
      new TableForeignKey({
        columnNames: ["parent_id"],
        referencedTableName: "knowledge_component",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      }),
      new TableForeignKey({
        columnNames: ["course_id"],
        referencedTableName: "course",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    ];

    const refreshedKnowledgeComponentTable = await queryRunner.getTable(
      "knowledge_component",
    );

    for (const foreignKey of knowledgeComponentForeignKeys) {
      const exists = refreshedKnowledgeComponentTable?.foreignKeys.some((fk) =>
        fk.columnNames.join() === foreignKey.columnNames.join(),
      );
      if (!exists) {
        await queryRunner.createForeignKey(
          "knowledge_component",
          foreignKey,
        );
      }
    }

    const mcqKnowledgeComponentTableDefinition = new Table({
      name: "mcq_knowledge_component",
      columns: [
        {
          name: "mcq_id",
          type: "uuid",
          isPrimary: true,
        },
        {
          name: "knowledge_component_id",
          type: "uuid",
          isPrimary: true,
        },
        {
          name: "createdAt",
          type: "timestamp with time zone",
          default: "CURRENT_TIMESTAMP",
        },
      ],
      indices: [
        new TableIndex({
          name: "IDX_mcq_knowledge_component_component",
          columnNames: ["knowledge_component_id"],
        }),
        new TableIndex({
          name: "IDX_mcq_knowledge_component_mcq",
          columnNames: ["mcq_id"],
        }),
      ],
    });

    let mcqKnowledgeComponentTable = await queryRunner.getTable(
      "mcq_knowledge_component",
    );

    if (!mcqKnowledgeComponentTable) {
      await queryRunner.createTable(mcqKnowledgeComponentTableDefinition, true);
      mcqKnowledgeComponentTable = await queryRunner.getTable(
        "mcq_knowledge_component",
      );
    } else {
      const requiredColumns = mcqKnowledgeComponentTableDefinition.columns;
      for (const column of requiredColumns) {
        if (!mcqKnowledgeComponentTable.findColumnByName(column.name)) {
          await queryRunner.addColumn("mcq_knowledge_component", column);
        }
      }

      for (const index of mcqKnowledgeComponentTableDefinition.indices ?? []) {
        const existingIndex = mcqKnowledgeComponentTable.indices.find(
          (idx) => idx.name === index.name,
        );
        if (!existingIndex) {
          await queryRunner.createIndex("mcq_knowledge_component", index);
        }
      }
    }

    const mcqKnowledgeComponentForeignKeys = [
      new TableForeignKey({
        columnNames: ["mcq_id"],
        referencedTableName: "mcq",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
      new TableForeignKey({
        columnNames: ["knowledge_component_id"],
        referencedTableName: "knowledge_component",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    ];

    const refreshedMkcTable = await queryRunner.getTable(
      "mcq_knowledge_component",
    );

    for (const foreignKey of mcqKnowledgeComponentForeignKeys) {
      const exists = refreshedMkcTable?.foreignKeys.some((fk) =>
        fk.columnNames.join() === foreignKey.columnNames.join(),
      );
      if (!exists) {
        await queryRunner.createForeignKey(
          "mcq_knowledge_component",
          foreignKey,
        );
      }
    }

    const defaultDomainSlug = "kc-domain-general";
    const defaultComponentSlug = "kc-general";

    await queryRunner.query(
      `ALTER TABLE generation_request
       ADD COLUMN IF NOT EXISTS knowledge_components uuid[] DEFAULT ARRAY[]::uuid[]`,
    );

    const defaultDomainId = randomUUID();
    await queryRunner.query(
      `INSERT INTO knowledge_domain (id, "createdAt", "updatedAt", slug, name, description, "sortOrder", "isActive")
       VALUES ($1, NOW(), NOW(), $2, $3, $4, 0, true)
       ON CONFLICT (slug) DO NOTHING`,
      [
        defaultDomainId,
        defaultDomainSlug,
        "General Knowledge",
        "Fallback domain for MCQs without explicit taxonomy",
      ],
    );

    const storedDomain = await queryRunner.query(
      `SELECT id FROM knowledge_domain WHERE slug = $1 LIMIT 1`,
      [defaultDomainSlug],
    );

    if (!storedDomain?.length || !storedDomain[0]?.id) {
      throw new Error("Failed to create or retrieve default knowledge domain");
    }

    const domainId = storedDomain[0].id;

    const defaultComponentId = randomUUID();
    await queryRunner.query(
      `INSERT INTO knowledge_component (id, "createdAt", "updatedAt", slug, name, description, level, "isActive", domain_id)
       VALUES ($1, NOW(), NOW(), $2, $3, $4, 1, true, $5)
       ON CONFLICT (slug) DO NOTHING`,
      [
        defaultComponentId,
        defaultComponentSlug,
        "General Mastery",
        "Default knowledge component used as a placeholder",
        domainId,
      ],
    );

    const storedComponent = await queryRunner.query(
      `SELECT id FROM knowledge_component WHERE slug = $1 LIMIT 1`,
      [defaultComponentSlug],
    );

    if (!storedComponent?.length || !storedComponent[0]?.id) {
      throw new Error(
        "Failed to create or retrieve default knowledge component",
      );
    }

    const componentId = storedComponent[0].id;

    await queryRunner.query(
      `ALTER TABLE progress
       ADD COLUMN IF NOT EXISTS knowledge_components uuid[]`,
    );

    await queryRunner.query(
      `INSERT INTO mcq_knowledge_component (mcq_id, knowledge_component_id, "createdAt")
       SELECT mcq.id, $1, NOW()
       FROM mcq
       WHERE NOT EXISTS (
         SELECT 1
         FROM mcq_knowledge_component mkc
         WHERE mkc.mcq_id = mcq.id
       )`,
      [componentId],
    );
    await queryRunner.query(
      `UPDATE progress
       SET knowledge_components = sub.kc_ids
       FROM (
         SELECT mkc.mcq_id AS mcq_id,
                array_agg(mkc.knowledge_component_id) AS kc_ids
         FROM mcq_knowledge_component mkc
         GROUP BY mkc.mcq_id
       ) AS sub
       WHERE progress."mcqId" = sub.mcq_id`,
    );

    await queryRunner.query(
      `UPDATE progress
       SET knowledge_components = ARRAY[$1::uuid]
       WHERE knowledge_components IS NULL`,
      [componentId],
    );

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE progress DROP COLUMN IF EXISTS knowledge_components`,
    );
    await queryRunner.query(
      `ALTER TABLE generation_request DROP COLUMN IF EXISTS knowledge_components`,
    );
    await queryRunner.dropTable("mcq_knowledge_component", true, true, true);
    await queryRunner.dropTable("knowledge_component", true, true, true);
    await queryRunner.dropTable("knowledge_domain", true, true, true);
  }
}
