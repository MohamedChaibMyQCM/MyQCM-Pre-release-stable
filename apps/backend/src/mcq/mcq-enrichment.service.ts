import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Mcq } from "./entities/mcq.entity";
import { McqAiEnrichmentRequestDto } from "./dto/mcq-ai-enrichment.dto";
import { KcSuggestionService } from "src/kc-suggestion/services/kc-suggestion.service";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";

@Injectable()
export class McqEnrichmentService {
  private readonly logger = new Logger(McqEnrichmentService.name);
  private readonly defaultLimit = Number(
    process.env.MCQ_AI_ENRICH_DEFAULT_LIMIT || 25,
  );
  private readonly maxLimit = Number(
    process.env.MCQ_AI_ENRICH_MAX_LIMIT || 200,
  );

  constructor(
    @InjectRepository(Mcq)
    private readonly mcqRepository: Repository<Mcq>,
    private readonly suggestionService: KcSuggestionService,
  ) {}

  async enqueueForCourse(
    courseId: string,
    dto: McqAiEnrichmentRequestDto,
    user?: JwtPayload,
  ): Promise<{ queued: number; mcqIds: string[] }> {
    const limit = this.resolveLimit(dto.limit);
    const onlyPending = dto.only_pending !== false;

    let mcqIds = this.normalizeIds(dto.mcq_ids, limit);
    if (!mcqIds.length) {
      mcqIds = await this.findCandidateMcqs(courseId, limit, onlyPending);
    }

    if (!mcqIds.length) {
      throw new BadRequestException(
        onlyPending
          ? "No pending MCQs were found for this course."
          : "No MCQs were found for this course.",
      );
    }

    await this.suggestionService.enqueueBulkSuggestion({
      courseId,
      mcqIds,
      initiatedBy: user
        ? {
            userId: user.id,
            email: user.email,
            name: (user as any)?.name ?? user.email,
          }
        : undefined,
    });

    this.logger.debug(
      `Queued ${mcqIds.length} MCQ(s) for AI enrichment in course ${courseId}`,
    );

    return { queued: mcqIds.length, mcqIds };
  }

  private resolveLimit(requested?: number) {
    if (!requested) {
      return this.defaultLimit;
    }
    if (requested < 1) {
      return 1;
    }
    return Math.min(requested, this.maxLimit);
  }

  private normalizeIds(ids: string[] | undefined, limit: number) {
    if (!ids?.length) {
      return [];
    }
    const deduped = Array.from(new Set(ids));
    return deduped.slice(0, limit);
  }

  private async findCandidateMcqs(
    courseId: string,
    limit: number,
    onlyPending: boolean,
  ) {
    const qb = this.mcqRepository
      .createQueryBuilder("mcq")
      .select("mcq.id", "id")
      .where("mcq.\"courseId\" = :courseId", { courseId })
      .orderBy("mcq.suggestion_generated_at", "ASC", "NULLS FIRST")
      .addOrderBy("mcq.createdAt", "DESC")
      .limit(limit);

    if (onlyPending) {
      qb.andWhere("mcq.suggestion_generated_at IS NULL");
    }

    const rows = await qb.getRawMany<{ id: string }>();
    return rows.map((row) => row.id);
  }
}
