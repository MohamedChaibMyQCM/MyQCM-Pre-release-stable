import { BadRequestException, Injectable } from "@nestjs/common";
import { KcSuggestionService } from "src/kc-suggestion/services/kc-suggestion.service";
import { KnowledgeComponentService } from "../knowledge-component.service";
import { McqService } from "src/mcq/mcq.service";
import { Mcq } from "src/mcq/entities/mcq.entity";
import {
  SuggestionConfidenceLevel,
  SuggestionResultItem,
} from "src/kc-suggestion/interfaces/kc-suggestion.types";
import {
  KnowledgeComponentAiApplyRequestDto,
  KnowledgeComponentAiReviewRequestDto,
} from "./dto/ai-match.dto";
import {
  SuggestKcItemDto,
  SuggestKcRequestDto,
} from "src/kc-suggestion/dto/suggest-kc.dto";

export type KnowledgeComponentAiReviewResponse = {
  items: SuggestionResultItem[];
  requestIds: string[];
  processed: number;
  requested: number;
  skipped: number;
  optionsSkipped: number;
  tokens: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

@Injectable()
export class KnowledgeComponentAiService {
  private readonly maxMcqs = Number(process.env.KC_AI_MATCH_MAX_MCQS || 30);
  private readonly chunkSize = Number(process.env.KC_SUGGESTION_MAX_ITEMS || 5);
  private readonly maxTargetComponents = Number(
    process.env.KC_SUGGESTION_CANDIDATE_LIMIT || 18,
  );

  constructor(
    private readonly suggestionService: KcSuggestionService,
    private readonly knowledgeComponentService: KnowledgeComponentService,
    private readonly mcqService: McqService,
  ) {}

  async reviewCourse(
    courseId: string,
    dto: KnowledgeComponentAiReviewRequestDto,
    user?: { id?: string; email?: string; name?: string },
  ): Promise<KnowledgeComponentAiReviewResponse> {
    const requestedIds = dto.mcqIds
      ? dto.mcqIds.slice(0, this.maxMcqs)
      : undefined;

    const mcqs = await this.mcqService.listMcqsForCourse(courseId, {
      mcqIds: requestedIds,
      limit: this.maxMcqs,
    });

    if (mcqs.length === 0) {
      throw new BadRequestException(
        "No MCQs were found for the selected course.",
      );
    }

    const components = await this.knowledgeComponentService.listComponents({
      courseId,
      includeInactive: false,
    });

    if (components.length === 0) {
      throw new BadRequestException(
        "Define knowledge components for the course before triggering AI tagging.",
      );
    }

    const targetedComponentIds = components
      .slice(0, this.maxTargetComponents)
      .map((component) => component.id);

    const candidateItems = mcqs
      .map((mcq) => ({
        mcq,
        item: this.mapToSuggestionItem(mcq),
      }))
      .filter((entry) => entry.item.options.length > 0);

    if (candidateItems.length === 0) {
      throw new BadRequestException(
        "The selected MCQs do not contain options, so AI tagging cannot run.",
      );
    }

    const aggregatedItems: SuggestionResultItem[] = [];
    const requestIds: string[] = [];

    for (const batch of this.chunk(candidateItems, this.chunkSize)) {
      const payload: SuggestKcRequestDto = {
        items: batch.map((entry) => entry.item),
        targeted_component_ids: targetedComponentIds,
      };

      const response = await this.suggestionService.handleSuggestRequest(
        courseId,
        payload,
        user,
      );

      aggregatedItems.push(...response.items);
      requestIds.push(response.requestId);
    }

    const matchedIds = new Set(
      aggregatedItems
        .map((item) => item.mcqId)
        .filter((value): value is string => Boolean(value)),
    );

    const optionsSkipped = mcqs.length - candidateItems.length;
    const skipped = mcqs.length - matchedIds.size;

    return {
      items: aggregatedItems,
      requestIds,
      processed: matchedIds.size,
      requested: mcqs.length,
      skipped,
      optionsSkipped,
      tokens: this.aggregateTokenUsage(aggregatedItems),
    };
  }

  async applyMatches(
    courseId: string,
    dto: KnowledgeComponentAiApplyRequestDto,
  ): Promise<{ applied: number }> {
    const mcqIds = dto.items.map((item) => item.mcqId);
    const mcqs = await this.mcqService.listMcqsForCourse(courseId, {
      mcqIds,
      limit: mcqIds.length,
    });

    const availableIds = new Set(mcqs.map((mcq) => mcq.id));
    const invalidItems = dto.items.filter(
      (item) => !availableIds.has(item.mcqId),
    );

    const validItems = dto.items.filter((item) =>
      availableIds.has(item.mcqId),
    );

    if (validItems.length === 0) {
      throw new BadRequestException(
        invalidItems.length
          ? `The selected MCQs no longer belong to this course.`
          : "No valid MCQ suggestions were supplied.",
      );
    }

    let applied = 0;

    for (const item of validItems) {
      const uniqueComponentIds = Array.from(new Set(item.componentIds));
      if (uniqueComponentIds.length === 0) {
        continue;
      }
      await this.mcqService.assignKnowledgeComponentsToMcq(
        item.mcqId,
        uniqueComponentIds,
      );
      await this.mcqService.clearSuggestionMetadata(item.mcqId);
      applied += 1;
    }

    return { applied };
  }

  async listStoredSuggestions(courseId: string) {
    const mcqs = await this.mcqService.listMcqSuggestions(courseId);
    const items: SuggestionResultItem[] = mcqs
      .filter(
        (mcq) =>
          Array.isArray(mcq.suggested_knowledge_components) &&
          mcq.suggested_knowledge_components.length > 0,
      )
      .map((mcq) => ({
        mcqId: mcq.id,
        stem: mcq.question,
        rationale: mcq.suggestion_rationale ?? null,
        confidence:
          (mcq.suggestion_confidence as SuggestionConfidenceLevel) ?? "low",
        confidenceScore: mcq.suggestion_confidence_score ?? 0,
        suggestions:
          mcq.suggested_knowledge_components?.map((component) => ({
            id: component.id,
            slug: component.slug,
            name: component.name,
            score: component.score,
            rationale: component.rationale ?? null,
          })) ?? [],
        generatedAt: mcq.suggestion_generated_at ?? undefined,
      }));

    return {
      items,
      total: items.length,
    };
  }

  private mapToSuggestionItem(mcq: Mcq): SuggestKcItemDto {
    const options = (mcq.options ?? []).map((option: any) => ({
      content: option.content,
      is_correct: option.is_correct ?? undefined,
    }));

    return {
      stem: mcq.question,
      explanation: mcq.explanation ?? undefined,
      options,
      metadata: {
        mcqId: mcq.id,
        source: "ai-knowledge-component-review",
      },
    };
  }

  private aggregateTokenUsage(items: SuggestionResultItem[]) {
    return items.reduce(
      (acc, item) => {
        if (!item.tokenUsage) {
          return acc;
        }
        acc.promptTokens += item.tokenUsage.promptTokens;
        acc.completionTokens += item.tokenUsage.completionTokens;
        acc.totalTokens += item.tokenUsage.totalTokens;
        return acc;
      },
      { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    );
  }

  private chunk<T>(input: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < input.length; i += size) {
      result.push(input.slice(i, i + size));
    }
    return result;
  }
}
