import { Injectable } from "@nestjs/common";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import { Counter } from "prom-client";

type UsageRecord = {
  model: string;
  courseId: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

@Injectable()
export class KnowledgeComponentSuggestionMetricsService {
  constructor(
    @InjectMetric("kc_suggestion_calls_total")
    private readonly callCounter: Counter<string>,
    @InjectMetric("kc_suggestion_prompt_tokens_total")
    private readonly promptTokensCounter: Counter<string>,
    @InjectMetric("kc_suggestion_completion_tokens_total")
    private readonly completionTokensCounter: Counter<string>,
    @InjectMetric("kc_suggestion_total_tokens")
    private readonly totalTokensCounter: Counter<string>,
  ) {}

  recordUsage(record: UsageRecord): void {
    const labels = {
      model: record.model,
      course_id: record.courseId,
    };

    this.callCounter.inc(labels, 1);
    if (record.promptTokens > 0) {
      this.promptTokensCounter.inc(labels, record.promptTokens);
    }
    if (record.completionTokens > 0) {
      this.completionTokensCounter.inc(labels, record.completionTokens);
    }
    if (record.totalTokens > 0) {
      this.totalTokensCounter.inc(labels, record.totalTokens);
    }
  }
}
