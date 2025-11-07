import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  EntityManager,
  FindManyOptions,
  In,
  Repository,
} from "typeorm";
import { KnowledgeComponent } from "./entities/knowledge-component.entity";
import { KnowledgeDomain } from "./entities/knowledge-domain.entity";
import { CreateKnowledgeDomainDto } from "./dto/create-knowledge-domain.dto";
import { UpdateKnowledgeDomainDto } from "./dto/update-knowledge-domain.dto";
import { CreateKnowledgeComponentDto } from "./dto/create-knowledge-component.dto";
import { DEFAULT_KNOWLEDGE_COMPONENT_SLUG, DEFAULT_KNOWLEDGE_DOMAIN_SLUG } from "./knowledge-component.constants";
import { UpdateKnowledgeComponentDto } from "./dto/update-knowledge-component.dto";
import { Course } from "src/course/entities/course.entity";
import * as XLSX from "xlsx";
import { extname } from "path";
import { readFileSync } from "fs";
import { detect } from "chardet";
import * as iconv from "iconv-lite";

type KnowledgeComponentImportRow = {
  domainSlug: string;
  domainName?: string;
  domainDescription?: string;
  domainSortOrder?: number;
  componentSlug: string;
  componentName: string;
  componentCode?: string;
  componentDescription?: string;
  parentSlug?: string;
  level?: number;
  isActive?: boolean;
};

const BOOLEAN_TRUE_VALUES = new Set(["1", "true", "yes", "y", "active", "enabled"]);

@Injectable()
export class KnowledgeComponentService {
  constructor(
    @InjectRepository(KnowledgeDomain)
    private readonly knowledgeDomainRepository: Repository<KnowledgeDomain>,
    @InjectRepository(KnowledgeComponent)
    private readonly knowledgeComponentRepository: Repository<KnowledgeComponent>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  get componentRepository() {
    return this.knowledgeComponentRepository;
  }

  get domainRepository() {
    return this.knowledgeDomainRepository;
  }

  async listDomains(options?: {
    includeComponents?: boolean;
    includeInactive?: boolean;
  }): Promise<KnowledgeDomain[]> {
    const findOptions: FindManyOptions<KnowledgeDomain> = {
      order: { sortOrder: "ASC", name: "ASC" },
    };

    if (!options?.includeInactive) {
      findOptions.where = { isActive: true };
    }

    if (options?.includeComponents) {
      findOptions.relations = ["components"];
    }

    return this.knowledgeDomainRepository.find(findOptions);
  }

  async listComponents(options?: {
    domainId?: string;
    courseId?: string;
    includeInactive?: boolean;
    includeRelations?: boolean;
  }): Promise<KnowledgeComponent[]> {
    const where: Record<string, any> = {};

    if (options?.domainId) {
      where.domain = { id: options.domainId };
    }

    if (options?.courseId) {
      where.course = { id: options.courseId };
    }

    if (!options?.includeInactive) {
      where.isActive = true;
    }

    const findOptions: FindManyOptions<KnowledgeComponent> = {
      order: { level: "ASC", name: "ASC" },
      where,
    };

    if (options?.includeRelations) {
      findOptions.relations = ["domain", "parent", "course"];
    }

    return this.knowledgeComponentRepository.find(findOptions);
  }

  async getComponentsByIds(
    ids: string[],
    options?: {
      manager?: EntityManager;
      ensureAll?: boolean;
      includeInactive?: boolean;
    },
  ): Promise<KnowledgeComponent[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    const uniqueIds = Array.from(new Set(ids));
    const repository = options?.manager
      ? options.manager.getRepository(KnowledgeComponent)
      : this.knowledgeComponentRepository;

    const whereClause: Record<string, any> = { id: In(uniqueIds) };

    if (!options?.includeInactive) {
      whereClause.isActive = true;
    }

    const components = await repository.find({
      where: whereClause,
      relations: ["domain", "parent", "course"],
    });

    if (options?.ensureAll && components.length !== uniqueIds.length) {
      const foundIds = new Set(components.map((component) => component.id));
      const missingIds = uniqueIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(
        `Knowledge components not found: ${missingIds.join(", ")}`,
      );
    }

    return components;
  }

  async getComponentsBySlugs(
    slugs: string[],
    options?: {
      manager?: EntityManager;
      ensureAll?: boolean;
      includeInactive?: boolean;
    },
  ): Promise<KnowledgeComponent[]> {
    if (!slugs || slugs.length === 0) {
      return [];
    }

    const normalizedSlugs = Array.from(
      new Set(slugs.map((slug) => slug.trim()).filter(Boolean)),
    );

    if (normalizedSlugs.length === 0) {
      return [];
    }

    const repository = options?.manager
      ? options.manager.getRepository(KnowledgeComponent)
      : this.knowledgeComponentRepository;

    const whereClause: Record<string, any> = { slug: In(normalizedSlugs) };

    if (!options?.includeInactive) {
      whereClause.isActive = true;
    }

    const components = await repository.find({
      where: whereClause,
      relations: ["domain", "parent", "course"],
    });

    if (options?.ensureAll && components.length !== normalizedSlugs.length) {
      const foundSlugs = new Set(components.map((component) => component.slug));
      const missing = normalizedSlugs.filter((slug) => !foundSlugs.has(slug));
      throw new NotFoundException(
        `Knowledge components not found for slugs: ${missing.join(", ")}`,
      );
    }

    return components;
  }

  async createDomain(dto: CreateKnowledgeDomainDto) {
    const domain = this.knowledgeDomainRepository.create({
      ...dto,
    });
    return this.knowledgeDomainRepository.save(domain);
  }

  async updateDomain(id: string, dto: UpdateKnowledgeDomainDto) {
    const domain = await this.knowledgeDomainRepository.findOne({
      where: { id },
    });

    if (!domain) {
      throw new NotFoundException("Knowledge domain not found");
    }

    Object.assign(domain, dto);
    return this.knowledgeDomainRepository.save(domain);
  }

  async createComponent(dto: CreateKnowledgeComponentDto) {
    const [domain, parent, course] = await Promise.all([
      this.knowledgeDomainRepository.findOne({
        where: { id: dto.domain_id },
      }),
      dto.parent_id
        ? this.knowledgeComponentRepository.findOne({
            where: { id: dto.parent_id },
          })
        : null,
      dto.course_id
        ? this.courseRepository.findOne({
            where: { id: dto.course_id },
          })
        : null,
    ]);

    if (!domain) {
      throw new NotFoundException("Knowledge domain not found");
    }

    if (dto.parent_id && !parent) {
      throw new NotFoundException("Parent knowledge component not found");
    }
    if (dto.course_id && !course) {
      throw new NotFoundException("Course not found");
    }

    const component = this.knowledgeComponentRepository.create({
      slug: dto.slug,
      name: dto.name,
      code: dto.code,
      description: dto.description,
      level: dto.level ?? (parent?.level ?? 0) + 1,
      isActive: dto.isActive ?? true,
      domain,
      parent: parent ?? null,
      course: course ?? undefined,
    });

    const savedComponent =
      await this.knowledgeComponentRepository.save(component);

    if (dto.children?.length) {
      const children = await Promise.all(
        dto.children.map((childDto) =>
          this.createComponent({
            ...childDto,
            parent_id: savedComponent.id,
            domain_id: domain.id,
          }),
        ),
      );
      savedComponent.children = children;
    }

    return savedComponent;
  }

  async updateComponent(id: string, dto: UpdateKnowledgeComponentDto) {
    const component = await this.knowledgeComponentRepository.findOne({
      where: { id },
      relations: ["domain", "parent", "course"],
    });

    if (!component) {
      throw new NotFoundException("Knowledge component not found");
    }

    if (dto.domain_id && dto.domain_id !== component.domain?.id) {
      component.domain = await this.knowledgeDomainRepository.findOneOrFail({
        where: { id: dto.domain_id },
      });
    }

    if (dto.parent_id !== undefined) {
      component.parent = dto.parent_id
        ? await this.knowledgeComponentRepository.findOneOrFail({
            where: { id: dto.parent_id },
          })
        : null;
    }

    if (dto.course_id && dto.course_id !== component.course?.id) {
      component.course = await this.courseRepository.findOne({
        where: { id: dto.course_id },
      });

      if (!component.course) {
        throw new NotFoundException("Course not found");
      }
    }

    Object.assign(component, {
      slug: dto.slug ?? component.slug,
      name: dto.name ?? component.name,
      code:
        dto.code !== undefined
          ? dto.code
          : component.code,
      description:
        dto.description !== undefined
          ? dto.description
          : component.description,
      level:
        dto.level !== undefined
          ? dto.level
          : component.level,
      isActive:
        dto.isActive !== undefined
          ? dto.isActive
          : component.isActive,
    });

    return this.knowledgeComponentRepository.save(component);
  }

  async deleteComponent(id: string) {
    const component = await this.knowledgeComponentRepository.findOne({
      where: { id },
    });

    if (!component) {
      throw new NotFoundException("Knowledge component not found");
    }

    await this.knowledgeComponentRepository.remove(component);
  }

  async upsertDomains(domains: CreateKnowledgeDomainDto[]) {
    if (!domains?.length) {
      return [];
    }

    const existingDomains = await this.knowledgeDomainRepository.find({
      where: { slug: In(domains.map((domain) => domain.slug)) },
    });

    const existingDomainMap = new Map(
      existingDomains.map((domain) => [domain.slug, domain]),
    );

    const results: KnowledgeDomain[] = [];

    for (const domainDto of domains) {
      const existingDomain = existingDomainMap.get(domainDto.slug);

      if (existingDomain) {
        Object.assign(existingDomain, domainDto);
        results.push(await this.knowledgeDomainRepository.save(existingDomain));
      } else {
        results.push(await this.createDomain(domainDto));
      }
    }

    return results;
  }

  async upsertComponents(
    components: CreateKnowledgeComponentDto[],
    options?: { domainFallback?: KnowledgeDomain; courseId?: string },
  ) {
    if (!components?.length) {
      return [];
    }

    const results: KnowledgeComponent[] = [];

    for (const componentDto of components) {
      if (!componentDto.domain_id && options?.domainFallback) {
        componentDto.domain_id = options.domainFallback.id;
      }

      if (!componentDto.course_id && options?.courseId) {
        componentDto.course_id = options.courseId;
      }

      const existingComponent =
        await this.knowledgeComponentRepository.findOne({
          where: { slug: componentDto.slug },
        });

      if (existingComponent) {
        results.push(
          await this.updateComponent(existingComponent.id, componentDto),
        );
      } else {
        results.push(await this.createComponent(componentDto));
      }
    }

    return results;
  }

  async importCourseComponentsFromFile(
    courseId: string,
    file: Express.Multer.File,
  ) {
    if (!courseId) {
      throw new BadRequestException("Course identifier is required.");
    }

    if (!file) {
      throw new BadRequestException("No file provided.");
    }

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException("Course not found");
    }

    const workbook = this.loadWorkbook(file);

    if (!workbook.SheetNames?.length) {
      throw new BadRequestException("The uploaded file does not contain any sheets.");
    }

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!worksheet) {
      throw new BadRequestException("Unable to read the first sheet from the uploaded file.");
    }

    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      defval: "",
    });

    const parsedRows: KnowledgeComponentImportRow[] = rawRows
      .map((row, index) => this.parseImportRow(row, index + 2))
      .filter((row): row is KnowledgeComponentImportRow => row != null);

    if (parsedRows.length === 0) {
      throw new BadRequestException(
        "The uploaded file does not contain any valid knowledge component rows.",
      );
    }

    const domainInputs = new Map<string, CreateKnowledgeDomainDto>();

    for (const row of parsedRows) {
      if (!domainInputs.has(row.domainSlug)) {
        domainInputs.set(row.domainSlug, {
          slug: row.domainSlug,
          name: row.domainName ?? this.humanizeSlug(row.domainSlug),
          description: row.domainDescription,
          sortOrder: row.domainSortOrder ?? 0,
          isActive: true,
        });
      }
    }

    const upsertedDomains = await this.upsertDomains(
      Array.from(domainInputs.values()),
    );

    const domainEntities = await this.knowledgeDomainRepository.find({
      where: { slug: In(Array.from(domainInputs.keys())) },
    });
    const domainMap = new Map(domainEntities.map((domain) => [domain.slug, domain]));

    const allSlugs = Array.from(
      new Set(parsedRows.map((row) => row.componentSlug.trim()).filter(Boolean)),
    );
    const parentSlugs = Array.from(
      new Set(
        parsedRows
          .map((row) => row.parentSlug?.trim())
          .filter((slug): slug is string => Boolean(slug)),
      ),
    );

    const existingComponents = await this.getComponentsBySlugs(
      Array.from(new Set([...allSlugs, ...parentSlugs])),
      { includeInactive: true },
    );
    const existingMap = new Map(existingComponents.map((component) => [component.slug, component]));

    const sortedRows = [...parsedRows].sort((a, b) => {
      const levelA = a.level ?? 1;
      const levelB = b.level ?? 1;
      if (levelA !== levelB) {
        return levelA - levelB;
      }
      return a.componentSlug.localeCompare(b.componentSlug);
    });

    let createdCount = 0;
    let updatedCount = 0;

    for (const row of sortedRows) {
      const domain = domainMap.get(row.domainSlug);
      if (!domain) {
        throw new BadRequestException(
          `Domain slug "${row.domainSlug}" could not be resolved.`,
        );
      }

      let parentId: string | undefined;
      if (row.parentSlug) {
        const parentComponent = existingMap.get(row.parentSlug);
        if (!parentComponent) {
          throw new BadRequestException(
            `Parent slug "${row.parentSlug}" referenced by "${row.componentSlug}" does not exist in the import or database.`,
          );
        }
        parentId = parentComponent.id;
      }

      const dto: CreateKnowledgeComponentDto = {
        slug: row.componentSlug,
        name: row.componentName,
        code: row.componentCode,
        description: row.componentDescription,
        level: row.level,
        isActive: row.isActive,
        domain_id: domain.id,
        parent_id: parentId,
        course_id: courseId,
      };

      const existing = existingMap.get(row.componentSlug);

      if (existing) {
        const updated = await this.updateComponent(existing.id, dto);
        existingMap.set(row.componentSlug, updated);
        updatedCount += 1;
      } else {
        const created = await this.createComponent(dto);
        existingMap.set(row.componentSlug, created);
        createdCount += 1;
      }
    }

    return {
      domainsProcessed: upsertedDomains.length,
      componentsProcessed: parsedRows.length,
      created: createdCount,
      updated: updatedCount,
    };
  }

  async getDefaultDomain(manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(KnowledgeDomain)
      : this.knowledgeDomainRepository;

    return repository.findOne({
      where: { slug: DEFAULT_KNOWLEDGE_DOMAIN_SLUG },
    });
  }

  async getDefaultComponent(manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(KnowledgeComponent)
      : this.knowledgeComponentRepository;

    const component = await repository.findOne({
      where: { slug: DEFAULT_KNOWLEDGE_COMPONENT_SLUG },
      relations: ["domain", "parent"],
    });

    if (!component) {
      throw new NotFoundException(
        "Default knowledge component seed is missing. Run the DATA-003 migration or seed script.",
      );
    }

    return component;
  }

  private parseImportRow(
    rawRow: Record<string, any>,
    rowNumber: number,
  ): KnowledgeComponentImportRow | null {
    const normalizedEntries = Object.entries(rawRow).reduce(
      (acc, [key, value]) => {
        const normalizedKey = this.normalizeHeaderKey(key);
        if (normalizedKey) {
          acc.set(normalizedKey, value);
        }
        return acc;
      },
      new Map<string, any>(),
    );

    const getString = (keys: string[], required = false): string | undefined => {
      for (const key of keys) {
        const rawValue = normalizedEntries.get(key);
        if (rawValue === undefined || rawValue === null) {
          continue;
        }
        const text = String(rawValue).trim();
        if (text.length > 0) {
          return text;
        }
      }
      if (required) {
        throw new BadRequestException(
          `Row ${rowNumber}: Missing required column (${keys.join(", ")}).`,
        );
      }
      return undefined;
    };

    const getNumber = (keys: string[]): number | undefined => {
      const text = getString(keys);
      if (!text) {
        return undefined;
      }
      const parsed = Number(text);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    const domainSlug = getString(["domain_slug", "domain", "domaincode"], true);
    const componentSlug = getString([
      "kc_slug",
      "knowledge_component_slug",
      "component_slug",
      "slug",
    ], true);
    const componentName = getString([
      "kc_name",
      "knowledge_component_name",
      "component_name",
      "name",
    ], true);

    if (!domainSlug || !componentSlug || !componentName) {
      return null;
    }

    const domainSortOrder = getNumber(["domain_sort_order", "domain_order"]);
    const level = getNumber(["level", "kc_level", "component_level"]);
    const isActiveValue = getString([
      "is_active",
      "active",
      "status",
      "enabled",
    ]);

    return {
      domainSlug,
      domainName: getString(["domain_name", "domainlabel", "domain_display_name"]),
      domainDescription: getString([
        "domain_description",
        "domain_desc",
        "domain_details",
      ]),
      domainSortOrder,
      componentSlug,
      componentName,
      componentCode: getString([
        "kc_code",
        "knowledge_component_code",
        "component_code",
      ]),
      componentDescription: getString([
        "kc_description",
        "knowledge_component_description",
        "component_description",
        "description",
      ]),
      parentSlug: getString([
        "parent_slug",
        "parent",
        "kc_parent",
        "kc_parent_slug",
      ]),
      level: level ? Math.max(1, Math.round(level)) : undefined,
      isActive: isActiveValue ? this.coerceBoolean(isActiveValue) : undefined,
    };
  }

  private normalizeHeaderKey(value: string): string {
    return value
      ?.toString()
      ?.trim()
      ?.toLowerCase()
      ?.replace(/[^a-z0-9]+/g, "_")
      ?.replace(/^_+|_+$/g, "");
  }

  private humanizeSlug(value: string): string {
    return value
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (match) => match.toUpperCase());
  }

  private coerceBoolean(value: string): boolean {
    return BOOLEAN_TRUE_VALUES.has(value.toLowerCase());
  }

  private loadWorkbook(file: Express.Multer.File) {
    const originalName = file.originalname || "";
    const extension = extname(originalName).toLowerCase();
    const mime = (file.mimetype || "").toLowerCase();
    const buffer = file.buffer ?? readFileSync(file.path);

    const looksLikeCsv =
      extension === ".csv" ||
      mime.includes("csv") ||
      mime === "text/plain" ||
      mime === "application/vnd.ms-excel";

    if (looksLikeCsv) {
      const detected = detect(buffer);
      const encoding =
        typeof detected === "string" && detected.length > 0
          ? detected
          : "utf-8";

      const normalizedEncoding = encoding.toLowerCase();
      const csvText =
        normalizedEncoding === "utf-8"
          ? buffer.toString("utf8")
          : iconv.decode(buffer, normalizedEncoding);

      return XLSX.read(csvText, { type: "string" });
    }

    return XLSX.read(buffer, { type: "buffer" });
  }


}
