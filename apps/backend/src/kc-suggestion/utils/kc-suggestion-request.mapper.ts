import { SuggestKcRequestDto } from "../dto/suggest-kc.dto";
import {
  SuggestionBatchRequest,
  SuggestionCandidateInput,
  SuggestionItemInput,
} from "../interfaces/kc-suggestion.types";

export class KcSuggestionRequestMapper {
  static map(
    courseId: string,
    dto: SuggestKcRequestDto,
    user?: { id?: string; email?: string; name?: string },
  ): SuggestionBatchRequest {
    const items: SuggestionItemInput[] = dto.items.map((item) => ({
      stem: item.stem,
      explanation: item.explanation ?? undefined,
      options: item.options.map((option) => ({
        content: option.content,
        is_correct: option.is_correct ?? undefined,
      })),
      metadata: {
        mcqId: item.metadata?.mcqId,
        source: item.metadata?.source,
      },
      candidateComponentInput: this.mapCandidateInput({
        ids: item.candidate_component_ids,
        slugs: item.candidate_component_slugs,
      }),
    }));

    return {
      courseId,
      items,
      targetedComponentInput: this.mapCandidateInput({
        ids: dto.targeted_component_ids,
        slugs: dto.targeted_component_slugs,
      }),
      initiatedBy: user
        ? {
            userId: user.id,
            email: user.email,
            name: user.name,
          }
        : undefined,
    };
  }

  private static mapCandidateInput(input?: {
    ids?: string[] | null;
    slugs?: string[] | null;
  }): SuggestionCandidateInput | undefined {
    if (!input) return undefined;

    const ids =
      input.ids?.map((value) => value.trim()).filter((value) => value.length) ??
      [];
    const slugs =
      input.slugs
        ?.map((value) => value.trim().toLowerCase())
        .filter((value) => value.length) ?? [];

    if (!ids.length && !slugs.length) {
      return undefined;
    }

    return {
      ids: ids.length ? Array.from(new Set(ids)) : undefined,
      slugs: slugs.length ? Array.from(new Set(slugs)) : undefined,
    };
  }
}
