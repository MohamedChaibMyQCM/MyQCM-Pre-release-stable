import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { ClinicalCaseFeedback } from "./entities/clinical_case_feedback.entity";
import { ClinicalCase } from "./entities/clinical_case.entity";
import { CreateClinicalCaseFeedbackDto } from "./dto/create-clinical_case-feedback.dto";

type FeedbackSummary = {
  average_rating: number;
  total_reviews: number;
  rating_distribution: Record<number, number>;
};

@Injectable()
export class ClinicalCaseFeedbackService {
  constructor(
    @InjectRepository(ClinicalCaseFeedback)
    private readonly feedbackRepository: Repository<ClinicalCaseFeedback>,
    @InjectRepository(ClinicalCase)
    private readonly clinicalCaseRepository: Repository<ClinicalCase>,
  ) {}

  async upsertFeedback(
    userId: string,
    payload: CreateClinicalCaseFeedbackDto,
  ): Promise<ClinicalCaseFeedback> {
    const caseIdentifier = this.normalizeCaseIdentifier(
      payload.case_identifier,
    );
    const normalizedReview =
      payload.review && payload.review.trim().length > 0
        ? payload.review.trim()
        : null;

    let feedback = await this.feedbackRepository.findOne({
      where: {
        case_identifier: caseIdentifier,
        user: { id: userId },
      },
      relations: ["clinical_case"],
    });

    if (!feedback) {
      feedback = this.feedbackRepository.create({
        case_identifier: caseIdentifier,
        user: { id: userId } as any,
      });
    }

    feedback.rating = payload.rating;
    feedback.review = normalizedReview;

    if (caseIdentifier !== this.demoCaseIdentifier()) {
      const clinicalCase = await this.clinicalCaseRepository.findOne({
        where: { id: payload.case_identifier },
      });
      feedback.clinical_case = clinicalCase ?? null;
      feedback.case_identifier = clinicalCase
        ? clinicalCase.id
        : caseIdentifier;
    } else {
      feedback.clinical_case = null;
      feedback.case_identifier = caseIdentifier;
    }

    return this.feedbackRepository.save(feedback);
  }

  async getUserFeedback(userId: string, caseIdentifier: string) {
    const feedback = await this.feedbackRepository.findOne({
      where: {
        case_identifier: this.normalizeCaseIdentifier(caseIdentifier),
        user: { id: userId },
      },
    });

    if (!feedback) {
      return null;
    }

    return {
      id: feedback.id,
      rating: feedback.rating,
      review: feedback.review,
      updatedAt: feedback.updatedAt,
    };
  }

  async getSummary(
    caseIdentifier: string,
    options: { includeRecent?: number } = {},
  ): Promise<
    FeedbackSummary & {
      recent_reviews: Array<{
        id: string;
        rating: number;
        review: string | null;
        createdAt: Date;
        user: { id: string; name: string; avatar: string } | null;
      }>;
    }
  > {
    const normalizedIdentifier = this.normalizeCaseIdentifier(caseIdentifier);

    const qb = this.feedbackRepository
      .createQueryBuilder("feedback")
      .where("feedback.case_identifier = :caseIdentifier", {
        caseIdentifier: normalizedIdentifier,
      });

    const aggregate = await this.extractAggregate(qb);
    const recentReviews = await this.fetchRecentReviews(
      normalizedIdentifier,
      options.includeRecent ?? 5,
    );

    return {
      ...aggregate,
      recent_reviews: recentReviews,
    };
  }

  private async extractAggregate(
    qb: SelectQueryBuilder<ClinicalCaseFeedback>,
  ): Promise<FeedbackSummary> {
    const rawAggregate = await qb
      .clone()
      .select("COALESCE(AVG(feedback.rating), 0)", "avg")
      .addSelect("COUNT(feedback.id)", "count")
      .getRawOne<{ avg: string; count: string }>();

    const average = rawAggregate?.avg
      ? parseFloat(Number(rawAggregate.avg).toFixed(2))
      : 0;
    const total = rawAggregate?.count ? parseInt(rawAggregate.count, 10) : 0;

    const distributionRows = await qb
      .clone()
      .select("feedback.rating", "rating")
      .addSelect("COUNT(feedback.id)", "count")
      .groupBy("feedback.rating")
      .getRawMany<{ rating: string; count: string }>();

    const distribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    for (const row of distributionRows) {
      const rating = parseInt(row.rating, 10);
      if (distribution[rating] !== undefined) {
        distribution[rating] = parseInt(row.count, 10);
      }
    }

    return {
      average_rating: average,
      total_reviews: total,
      rating_distribution: distribution,
    };
  }

  private async fetchRecentReviews(caseIdentifier: string, limit: number) {
    const entries = await this.feedbackRepository
      .createQueryBuilder("feedback")
      .leftJoinAndSelect("feedback.user", "user")
      .where("feedback.case_identifier = :caseIdentifier", { caseIdentifier })
      .andWhere("feedback.review IS NOT NULL")
      .andWhere("TRIM(feedback.review) <> ''")
      .orderBy("feedback.createdAt", "DESC")
      .take(limit)
      .getMany();

    return entries.map((entry) => ({
      id: entry.id,
      rating: entry.rating,
      review: entry.review,
      createdAt: entry.createdAt,
      user: entry.user
        ? {
            id: entry.user.id,
            name: entry.user.name,
            avatar: entry.user.avatar,
          }
        : null,
    }));
  }

  private normalizeCaseIdentifier(identifier: string): string {
    const trimmed = identifier.trim();
    return trimmed.toLowerCase() === this.demoCaseIdentifier()
      ? this.demoCaseIdentifier()
      : trimmed;
  }

  private demoCaseIdentifier(): string {
    return "demo";
  }
}
