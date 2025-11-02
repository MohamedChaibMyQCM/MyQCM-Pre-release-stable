import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { AppDataSource } from "../../data-source";
import { KnowledgeComponentService } from "../knowledge-component.service";
import { KnowledgeDomain } from "../entities/knowledge-domain.entity";
import { KnowledgeComponent } from "../entities/knowledge-component.entity";
import { Course } from "../../course/entities/course.entity";
import { CreateKnowledgeComponentDto } from "../dto/create-knowledge-component.dto";
import { CreateKnowledgeDomainDto } from "../dto/create-knowledge-domain.dto";
import { DEFAULT_KNOWLEDGE_DOMAIN_SLUG } from "../knowledge-component.constants";
import { detect } from "chardet";
import * as iconv from "iconv-lite";

interface KnowledgeComponentSeed {
  slug: string;
  name: string;
  code?: string;
  description?: string;
  level?: number;
  isActive?: boolean;
  parent_id?: string;
  children?: KnowledgeComponentSeed[];
}

interface KnowledgeDomainSeed {
  slug: string;
  name: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
  components?: KnowledgeComponentSeed[];
}

const SEED_RELATIVE_PATH = "../../../seed/knowledge-components.json";
const SAMPLE_RELATIVE_PATH = "../../../seed/knowledge-components.sample.json";

async function upsertComponentTree(
  service: KnowledgeComponentService,
  componentSeed: KnowledgeComponentSeed,
  domainId: string,
  parentId?: string,
) {
  const { children, ...componentDto } = componentSeed;
  const payload: CreateKnowledgeComponentDto = {
    ...componentDto,
    domain_id: domainId,
    parent_id: parentId,
    level:
      componentDto.level ??
      (parentId ? undefined : componentDto.level ?? 1),
  };

  const existing = await service.componentRepository.findOne({
    where: { slug: componentSeed.slug },
  });

  const saved = existing
    ? await service.updateComponent(existing.id, payload)
    : await service.createComponent(payload);

  if (children?.length) {
    for (const child of children) {
      await upsertComponentTree(service, child, domainId, saved.id);
    }
  }
}

async function bootstrap() {
  const dataSource = await AppDataSource.initialize();
  try {
    const domainRepo = dataSource.getRepository(KnowledgeDomain);
    const componentRepo = dataSource.getRepository(KnowledgeComponent);
    const courseRepo = dataSource.getRepository(Course);
    const service = new KnowledgeComponentService(
      domainRepo,
      componentRepo,
      courseRepo,
    );

    const seedPathCandidates = [SEED_RELATIVE_PATH, SAMPLE_RELATIVE_PATH]
      .map((relative) => resolve(join(__dirname, relative)))
      .filter((fullPath) => existsSync(fullPath));

    if (seedPathCandidates.length === 0) {
      throw new Error(
        "No seed file found. Add apps/backend/seed/knowledge-components.json to customize the taxonomy.",
      );
    }

    const seedPath = seedPathCandidates[0];
    const rawBuffer = readFileSync(seedPath);
    const detected = detect(rawBuffer);
    const encoding =
      typeof detected === "string" && detected.length > 0
        ? detected.toLowerCase()
        : "utf-8";
    const raw =
      encoding === "utf-8"
        ? rawBuffer.toString("utf8")
        : iconv.decode(rawBuffer, encoding);
    const payload = JSON.parse(raw) as KnowledgeDomainSeed[];

    if (!Array.isArray(payload) || payload.length === 0) {
      console.warn("Knowledge component seed is empty. Nothing to do.");
      return;
    }

    const results: { domain: string; components: number }[] = [];

    for (const domainSeed of payload) {
      const domainPayload: CreateKnowledgeDomainDto = {
        slug: domainSeed.slug,
        name: domainSeed.name,
        description: domainSeed.description,
        sortOrder: domainSeed.sortOrder ?? 0,
        isActive: domainSeed.isActive ?? true,
      };

      const [domain] = await service.upsertDomains([domainPayload]);

      if (!domain) {
        throw new Error(`Failed to upsert domain ${domainSeed.slug}`);
      }

      let componentCount = 0;
      if (domainSeed.components?.length) {
        for (const componentSeed of domainSeed.components) {
          await upsertComponentTree(service, componentSeed, domain.id);
          componentCount += 1;
        }
      }

      results.push({ domain: domain.slug, components: componentCount });
    }

    if (!payload.some((domain) => domain.slug === DEFAULT_KNOWLEDGE_DOMAIN_SLUG)) {
      await service.getDefaultComponent();
    }

    console.log("Knowledge component taxonomy seeded from", seedPath);
    results.forEach((entry) =>
      console.log(` - ${entry.domain}: ${entry.components} top-level components upserted`),
    );
  } finally {
    await dataSource.destroy();
  }
}

bootstrap().catch((error) => {
  console.error("Failed to seed knowledge components", error);
  process.exitCode = 1;
});
