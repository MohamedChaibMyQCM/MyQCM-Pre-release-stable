import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { KcPromptBuilderService } from "./kc-prompt-builder.service";
import { KcSuggestionLlmService } from "./kc-suggestion-llm.service";
import { KnowledgeComponentSuggestionMetricsService } from "./kc-suggestion-metrics.service";
import {
  PromptCandidateComponent,
  SuggestionBatchRequest,
  SuggestionBatchResponse,
  SuggestionCandidateInput,
  SuggestionItemInput,
  SuggestionResultItem,
  SuggestionConfidenceLevel,
} from "../interfaces/kc-suggestion.types";
import { KnowledgeComponentService } from "src/knowledge-component/knowledge-component.service";
import { KnowledgeComponent } from "src/knowledge-component/entities/knowledge-component.entity";
import { CourseService } from "src/course/course.service";
import { McqService } from "src/mcq/mcq.service";
import { KcSuggestionRequestMapper } from "../utils/kc-suggestion-request.mapper";
import { SuggestKcRequestDto } from "../dto/suggest-kc.dto";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bullmq";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { KnowledgeComponentSuggestionCall } from "../entities/kc-suggestion-call.entity";
import { KnowledgeComponentSuggestionLog } from "../entities/kc-suggestion-log.entity";
import { Mcq, SuggestedKnowledgeComponent } from "src/mcq/entities/mcq.entity";

const ResponseValidationSchema = z.object({
  items: z
    .array(
      z.object({
        index: z.number().int().nonnegative(),
        mcq_id: z.string().nullable().optional(),
        rationale: z.string().nullable().optional(),
        confidence_score: z
          .number()
          .min(0)
          .max(1)
          .nullable()
          .optional(),
        suggestions: z
          .array(
            z.object({
              kc_slug: z.string(),
              kc_name: z.string().nullable().optional(),
              score: z.number().min(0).max(1),
              rationale: z.string().nullable().optional(),
            }),
          )
          .max(5),
      }),
    )
    .max(5),
});

const BulkJobSchema = z.object({
  courseId: z.string().uuid(),
  mcqIds: z.array(z.string().uuid()).min(1),
  initiatedBy: z
    .object({
      userId: z.string().uuid().optional(),
      email: z.string().optional(),
      name: z.string().optional(),
    })
    .optional(),
});

type BulkJobPayload = z.infer<typeof BulkJobSchema>;

@Injectable()
export class KcSuggestionService {
  private readonly logger = new Logger(KcSuggestionService.name);
  private readonly promptVersion = "kc-auto-match-v1";
  private readonly maxCandidateComponents = Number(
    process.env.KC_SUGGESTION_CANDIDATE_LIMIT || 18,
  );
  private readonly maxItemsPerCall = Number(
    process.env.KC_SUGGESTION_MAX_ITEMS || 5,
  );

  constructor(
    private readonly promptBuilder: KcPromptBuilderService,
    private readonly llmService: KcSuggestionLlmService,
    private readonly knowledgeComponentService: KnowledgeComponentService,
    private readonly courseService: CourseService,
    private readonly mcqService: McqService,
    @InjectRepository(KnowledgeComponentSuggestionCall)
    private readonly callRepository: Repository<KnowledgeComponentSuggestionCall>,
    @InjectRepository(KnowledgeComponentSuggestionLog)
    private readonly logRepository: Repository<KnowledgeComponentSuggestionLog>,
    @InjectRepository(Mcq)
    private readonly mcqRepository: Repository<Mcq>,
    @InjectQueue("kc-suggestion")
    private readonly suggestionQueue: Queue,
    private readonly metrics: KnowledgeComponentSuggestionMetricsService,
  ) {}

  async handleSuggestRequest(
    courseId: string,
    dto: SuggestKcRequestDto,
    user?: { id?: string; email?: string; name?: string },
  ): Promise<SuggestionBatchResponse> {
    const batchRequest = KcSuggestionRequestMapper.map(courseId, dto, user);
    const result = await this.runSuggestionBatch(batchRequest);
    await this.persistResults(result);
    return result;
  }

  async enqueueBulkSuggestion(payload: BulkJobPayload) {
    const parsed = BulkJobSchema.parse(payload);
    await this.suggestionQueue.add("bulk-course", parsed, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1500,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  async processBulkJob(payload: BulkJobPayload, jobId?: string) {
    const parsed = BulkJobSchema.parse(payload);
    const { courseId, mcqIds } = parsed;

    const course = await this.courseService.getCourseById(courseId);
    if (!course) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    const batches = this.chunk(mcqIds, this.maxItemsPerCall);

    for (const batchIds of batches) {
      const mcqs = await this.mcqRepository.find({
        where: { id: In(batchIds) },
        relations: ["options", "course"],
      });

      if (mcqs.length === 0) {
        continue;
      }

      const items: SuggestionItemInput[] = mcqs.map((mcq) => {
        if (!mcq.course || mcq.course.id !== courseId) {
          throw new BadRequestException(
            `MCQ ${mcq.id} does not belong to course ${courseId}`,
          );
        }

        return {
          stem: mcq.question,
          explanation: mcq.explanation ?? undefined,
          options:
            mcq.options?.map((option) => ({
              content: option.content,
              is_correct: option.is_correct,
            })) ?? [],
          metadata: {
            mcqId: mcq.id,
            source: jobId ? `queue:${jobId}` : "queue",
          },
        };
      });

      const result = await this.runSuggestionBatch({
        courseId,
        items,
        initiatedBy: parsed.initiatedBy,
      });

      await this.persistResults(result);
    }
  }

  async runSuggestionBatch(
    request: SuggestionBatchRequest,
  ): Promise<SuggestionBatchResponse> {
    if (!request.items?.length) {
      throw new BadRequestException("At least one item is required");
    }

    if (request.items.length > this.maxItemsPerCall) {
      throw new BadRequestException(
        `A maximum of ${this.maxItemsPerCall} items is supported per request`,
      );
    }

    const invalidItem = request.items.find(
      (item) => !Array.isArray(item.options) || item.options.length === 0,
    );
    if (invalidItem) {
      throw new BadRequestException(
        "Each suggestion item must include at least one answer option.",
      );
    }

    const course = await this.courseService.getCourseById(request.courseId);

    const candidateComponents = await this.resolveCandidateComponents(
      request.courseId,
      request.targetedComponentInput,
      request.items.map((item) => item.candidateComponentInput),
    );

    if (candidateComponents.length === 0) {
      throw new BadRequestException(
        "No candidate knowledge components were resolved for this course",
      );
    }

    const previousState = await this.getLatestResponseState(request.courseId);

    const prompt = this.promptBuilder.buildPrompt({
      courseName: course.name,
      candidateComponents,
      items: request.items,
      promptVersion: this.promptVersion,
      reuseContext: Boolean(previousState?.previousResponseId),
    });

    const schema = this.buildResponseSchema();
    const requestId = uuidv4();

    const llmResult = await this.llmService.invoke({
      prompt,
      responseSchema: schema,
      requestId,
      previousResponseId: previousState?.previousResponseId,
    });

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(llmResult.rawText);
    } catch (error) {
      this.logger.error(
        `KC suggestion response was not valid JSON: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw new BadRequestException("Model response was not valid JSON");
    }

    const parsedResponse = ResponseValidationSchema.safeParse(parsedJson);

    if (!parsedResponse.success) {
      this.logger.error(
        `Failed to parse KC suggestion response: ${parsedResponse.error}`,
      );
      throw new BadRequestException("Failed to parse model response");
    }

    const slugToComponent = new Map(
      candidateComponents.map((component) => [component.slug, component]),
    );

    const items = parsedResponse.data.items.map((item) =>
      this.mapResultItem(item, request.items, slugToComponent, llmResult.usage),
    );

    const response: SuggestionBatchResponse = {
      model: llmResult.model,
      promptVersion: this.promptVersion,
      requestId,
      items,
      raw: llmResult.rawText,
    };

    await this.recordUsage({
      courseId: request.courseId,
      mcqIds: items
        .map((item) => item.mcqId)
        .filter((value): value is string => Boolean(value)),
      model: llmResult.model,
      promptTokens: llmResult.usage.promptTokens,
      completionTokens: llmResult.usage.completionTokens,
      totalTokens: llmResult.usage.totalTokens,
      responseId: llmResult.responseId,
      previousResponseId: llmResult.previousResponseId ?? undefined,
    });

    return response;
  }

  async recordSessionLog(params: {
    courseId: string;
    model: string;
    requested: number;
    processed: number;
    skipped: number;
    optionsSkipped: number;
    tokens: { promptTokens: number; completionTokens: number; totalTokens: number };
    requestIds: string[];
    initiatedBy?: { userId?: string; email?: string; name?: string };
  }) {
    const entry = this.logRepository.create({
      course_id: params.courseId,
      model: params.model,
      requested: params.requested,
      processed: params.processed,
      skipped: params.skipped,
      options_skipped: params.optionsSkipped,
      prompt_tokens: params.tokens.promptTokens,
      completion_tokens: params.tokens.completionTokens,
      total_tokens: params.tokens.totalTokens,
      request_ids: params.requestIds,
      initiated_by: params.initiatedBy,
    });
    await this.logRepository.save(entry);
  }

  async listSessionLogs(courseId: string, limit = 20) {
    return this.logRepository.find({
      where: { course_id: courseId },
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  async persistResults(response: SuggestionBatchResponse) {
    for (const item of response.items) {
      if (!item.mcqId) continue;

      await this.mcqService.updateSuggestionMetadata(item.mcqId, {
        suggestedComponents: item.suggestions,
        confidence: item.confidence,
        confidenceScore: item.confidenceScore,
        rationale: item.rationale,
        suggestedAt: new Date(),
      });
    }
  }

  private async recordUsage(params: {
    courseId: string;
    mcqIds: string[];
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    responseId: string;
    previousResponseId?: string;
  }) {
    const entry = this.callRepository.create({
      course_id: params.courseId,
      mcq_ids: params.mcqIds,
      model: params.model,
      prompt_tokens: params.promptTokens,
      completion_tokens: params.completionTokens,
      total_tokens: params.totalTokens,
      extra_labels: {
        prompt_version: this.promptVersion,
        response_id: params.responseId,
        previous_response_id: params.previousResponseId ?? "",
      },
    });

    await this.callRepository.save(entry);
    this.metrics.recordUsage({
      model: params.model,
      courseId: params.courseId,
      totalTokens: params.totalTokens,
      promptTokens: params.promptTokens,
      completionTokens: params.completionTokens,
    });
  }

  private mapResultItem(
    modelItem: z.infer<typeof ResponseValidationSchema>["items"][number],
    requestItems: SuggestionItemInput[],
    slugToComponent: Map<string, PromptCandidateComponent>,
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    },
  ): SuggestionResultItem {
    const normalizedIndex = this.resolveModelIndex(modelItem.index, requestItems);
    const requestItem = requestItems[normalizedIndex];

    if (!requestItem) {
      throw new BadRequestException(
        `Model returned index ${modelItem.index} that could not be mapped to a request item`,
      );
    }

    const suggestions: SuggestedKnowledgeComponent[] = [];

    modelItem.suggestions.forEach((suggestion) => {
      const component = slugToComponent.get(suggestion.kc_slug.trim());
      if (!component) {
        return;
      }

      suggestions.push({
        id: component.id,
        slug: component.slug,
        name: component.name,
        description: component.description ?? null,
        score: Number(suggestion.score),
        rationale: suggestion.rationale ?? null,
      });
    });

    suggestions.sort((a, b) => b.score - a.score);
    const topSuggestions = suggestions.slice(0, 3);

    const confidenceScore =
      modelItem.confidence_score ??
      (topSuggestions.length > 0
        ? topSuggestions.reduce((sum, item) => sum + item.score, 0) /
          topSuggestions.length
        : 0);

    const confidence = this.computeConfidenceLevel(confidenceScore, topSuggestions);

    return {
      mcqId: modelItem.mcq_id ?? requestItem.metadata?.mcqId,
      stem: requestItem.stem,
      rationale: modelItem.rationale ?? null,
      suggestions: topSuggestions,
      confidence,
      confidenceScore,
      tokenUsage: usage,
    };
  }

  private resolveModelIndex(
    reportedIndex: number,
    requestItems: SuggestionItemInput[],
  ): number {
    if (Number.isInteger(reportedIndex) && reportedIndex >= 0 && reportedIndex < requestItems.length) {
      return reportedIndex;
    }

    const oneBasedIndex = reportedIndex - 1;
    if (Number.isInteger(oneBasedIndex) && oneBasedIndex >= 0 && oneBasedIndex < requestItems.length) {
      return oneBasedIndex;
    }

    return Math.max(0, Math.min(requestItems.length - 1, reportedIndex));
  }

  private async getLatestResponseState(courseId: string) {
    if (!courseId) {
      return null;
    }
    const lastCall = await this.callRepository.findOne({
      where: { course_id: courseId },
      order: { createdAt: "DESC" },
    });
    if (!lastCall?.extra_labels) {
      return null;
    }
    const previousResponseId =
      lastCall.extra_labels.previous_response_id ||
      lastCall.extra_labels.response_id ||
      null;
    return { previousResponseId };
  }

  private computeConfidenceLevel(
    score: number,
    suggestions: SuggestedKnowledgeComponent[],
  ): SuggestionConfidenceLevel {
    if (suggestions.length === 0) {
      return "low";
    }

    if (score >= 0.75 && suggestions.length >= 2) {
      const delta =
        suggestions.length > 1
          ? Math.abs(suggestions[0].score - suggestions[1].score)
          : suggestions[0].score;
      if (delta <= 0.2 || suggestions[0].score >= 0.85) {
        return "high";
      }
    }

    if (score >= 0.5) {
      return "medium";
    }

    return "low";
  }

  private buildResponseSchema() {
    return {
      name: "kc_suggestion_response",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          items: {
            type: "array",
            maxItems: this.maxItemsPerCall,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                index: { type: "integer", minimum: 0 },
                mcq_id: { type: ["string", "null"] },
                rationale: { type: ["string", "null"] },
                confidence_score: {
                  anyOf: [
                    {
                      type: "number",
                      minimum: 0,
                      maximum: 1,
                    },
                    { type: "null" },
                  ],
                },
                suggestions: {
                  type: "array",
                  maxItems: 5,
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      kc_slug: { type: "string" },
                      kc_name: { type: ["string", "null"] },
                      score: { type: "number", minimum: 0, maximum: 1 },
                      rationale: { type: ["string", "null"] },
                    },
                    required: ["kc_slug", "kc_name", "score", "rationale"],
                  },
                },
              },
              required: [
                "index",
                "mcq_id",
                "rationale",
                "confidence_score",
                "suggestions",
              ],
            },
          },
        },
        required: ["items"],
      },
      strict: true,
    };
  }

  private async resolveCandidateComponents(
    courseId: string,
    targetedInput: SuggestionCandidateInput | undefined,
    itemInputs: Array<SuggestionCandidateInput | undefined>,
  ): Promise<PromptCandidateComponent[]> {
    const manualCandidates = new Set<string>();
    const manualIds = new Set<string>();

    if (targetedInput?.slugs) {
      targetedInput.slugs.forEach((slug) => manualCandidates.add(slug));
    }
    if (targetedInput?.ids) {
      targetedInput.ids.forEach((id) => manualIds.add(id));
    }

    itemInputs.forEach((input) => {
      input?.slugs?.forEach((slug) => manualCandidates.add(slug));
      input?.ids?.forEach((id) => manualIds.add(id));
    });

    let components: KnowledgeComponent[];

    if (manualCandidates.size > 0 || manualIds.size > 0) {
      if (manualCandidates.size > 0) {
        components =
          await this.knowledgeComponentService.getComponentsBySlugs(
            Array.from(manualCandidates),
            { includeInactive: false },
          );
      } else {
        components = await this.knowledgeComponentService.getComponentsByIds(
          Array.from(manualIds),
          { includeInactive: false },
        );
      }
    } else {
      components = await this.knowledgeComponentService.listComponents({
        courseId,
        includeInactive: false,
        includeRelations: true,
      });
    }

    const mapped = components.map((component) => ({
      id: component.id,
      slug: component.slug,
      name: component.name,
      description: component.description,
      domainName: component.domain?.name,
      domainOrder: component.domain?.sortOrder ?? null,
      level: component.level ?? null,
    }));

    const sorted = mapped.sort((a, b) => {
      const domainOrderA = a.domainOrder ?? Number.MAX_SAFE_INTEGER;
      const domainOrderB = b.domainOrder ?? Number.MAX_SAFE_INTEGER;

      if (domainOrderA !== domainOrderB) {
        return domainOrderA - domainOrderB;
      }

      const levelA = a.level ?? Number.MAX_SAFE_INTEGER;
      const levelB = b.level ?? Number.MAX_SAFE_INTEGER;

      if (levelA !== levelB) {
        return levelA - levelB;
      }

      return a.name.localeCompare(b.name);
    });

    return sorted.slice(0, this.maxCandidateComponents);
  }

  private chunk<T>(input: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < input.length; i += size) {
      chunks.push(input.slice(i, i + size));
    }
    return chunks;
  }
}
