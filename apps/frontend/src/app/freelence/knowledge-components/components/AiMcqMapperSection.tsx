import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { AiReviewConfidence, AiReviewResponse } from "../types";

const confidenceBadgeVariantMap: Record<
  AiReviewConfidence,
  "success" | "secondary" | "destructive"
> = {
  high: "success",
  medium: "secondary",
  low: "destructive",
};

export type AiMcqMapperSectionProps = {
  aiReviewLoading: boolean;
  aiApplyLoading: boolean;
  aiEnrichmentLoading: boolean;
  suggestionsLoading: boolean;
  hasSessionResults: boolean;
  selectedCourse?: string;
  aiReviewResponse: AiReviewResponse | null;
  aiEnrichmentResult: { queued: number; mcqIds: string[] } | null;
  enrichmentLimit: number;
  enrichmentOnlyPending: boolean;
  onRunAiReview: () => void;
  onApplyAiSuggestions: () => void;
  onQueueAiEnrichment: () => void;
  onChangeEnrichmentLimit: (value: number) => void;
  onToggleOnlyPending: (value: boolean) => void;
  onClearResults: () => void;
  onClearEnrichmentResult: () => void;
};

export function AiMcqMapperSection({
  aiReviewLoading,
  aiApplyLoading,
  aiEnrichmentLoading,
  suggestionsLoading,
  hasSessionResults,
  selectedCourse,
  aiReviewResponse,
  aiEnrichmentResult,
  enrichmentLimit,
  enrichmentOnlyPending,
  onRunAiReview,
  onApplyAiSuggestions,
  onQueueAiEnrichment,
  onChangeEnrichmentLimit,
  onToggleOnlyPending,
  onClearResults,
  onClearEnrichmentResult,
}: AiMcqMapperSectionProps) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">AI MCQ Mapper</h2>
          <p className="text-sm text-muted-foreground">
            Use AI to match the selected course&apos;s MCQs with the knowledge components
            defined above, review them, then push to production.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={onRunAiReview}
            disabled={aiReviewLoading || !selectedCourse}
          >
            {aiReviewLoading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                Running review…
              </div>
            ) : (
              "Run AI review"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onApplyAiSuggestions}
            disabled={
              aiApplyLoading ||
              !selectedCourse ||
              !(aiReviewResponse?.items && aiReviewResponse.items.length > 0)
            }
          >
            {aiApplyLoading ? "Applying…" : "Push to production"}
          </Button>
          {hasSessionResults && (
            <Button type="button" variant="ghost" onClick={onClearResults}>
              Clear results
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-muted-foreground/20 bg-muted/20 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold">Step 1 · Queue MCQs for AI</p>
            <p className="text-xs text-muted-foreground">
              Enqueue pending MCQs for enrichment before running the review.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="ai-enrichment-limit" className="text-xs font-medium">
                Limit
              </Label>
              <Input
                id="ai-enrichment-limit"
                type="number"
                min={1}
                max={200}
                value={enrichmentLimit}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  onChangeEnrichmentLimit(Number.isFinite(next) ? next : 1);
                }}
                className="w-24"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="ai-enrichment-pending"
                checked={enrichmentOnlyPending}
                onCheckedChange={onToggleOnlyPending}
              />
              <Label
                htmlFor="ai-enrichment-pending"
                className="text-xs font-medium text-muted-foreground"
              >
                Only pending
              </Label>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={onQueueAiEnrichment}
              disabled={aiEnrichmentLoading || !selectedCourse}
            >
              {aiEnrichmentLoading ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Queuing…
                </div>
              ) : (
                "Queue MCQs"
              )}
            </Button>
            {aiEnrichmentResult && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearEnrichmentResult}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {aiEnrichmentResult ? (
            <>
              Queued {aiEnrichmentResult.queued} MCQ
              {aiEnrichmentResult.queued === 1 ? "" : "s"} for enrichment. AI review shows
              suggestions once processing completes.
            </>
          ) : (
            <>Helpful after uploading new spreadsheets so the AI focuses on fresh MCQs.</>
          )}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        {aiReviewResponse ? (
          <div className="space-y-1">
            <p>
              Processed {aiReviewResponse.processed} of {aiReviewResponse.requested} MCQ
              {aiReviewResponse.requested === 1 ? "" : "s"} (
              {aiReviewResponse.skipped} skipped, {aiReviewResponse.optionsSkipped} without
              options).
            </p>
            <p>AI calls: {aiReviewResponse.requestIds.length}.</p>
            <p>
              Tokens used: {aiReviewResponse.tokens.totalTokens} total (
              {aiReviewResponse.tokens.promptTokens} prompt / {" "}
              {aiReviewResponse.tokens.completionTokens} completion).
            </p>
          </div>
        ) : (
          <p>
            {suggestionsLoading ? (
              <span className="inline-flex items-center gap-2">
                <Spinner size="sm" />
                Loading saved suggestions…
              </span>
            ) : (
              <>
                Select a course then run the AI review. Previously generated suggestions
                are loaded automatically whenever you pick a course.
              </>
            )}
          </p>
        )}
      </div>

      {aiReviewResponse && (
        <div className="space-y-3">
          {aiReviewResponse.items.length === 0 ? (
            <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
              The AI review completed but did not return any suggestions.
            </div>
          ) : (
            <div className="space-y-3">
              {aiReviewResponse.items.map((item) => (
                <article
                  key={item.mcqId}
                  className="rounded-lg border border-border bg-background/70 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium leading-tight">
                        {item.stem || "Untitled MCQ"}
                      </p>
                      {item.generatedAt && (
                        <p className="text-xs text-muted-foreground">
                          Suggested on {new Date(item.generatedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={confidenceBadgeVariantMap[item.confidence]}
                      className="capitalize text-xs"
                    >
                      {item.confidence}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Confidence score {Math.round(item.confidenceScore * 100)}%
                    {item.rationale ? ` • ${item.rationale}` : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {item.suggestions.map((suggestion) => (
                      <Badge
                        key={`${item.mcqId}-${suggestion.id}`}
                        variant="outline"
                        className="text-xs"
                      >
                        {suggestion.name ?? suggestion.slug} (
                        {Math.round(suggestion.score * 100)}%)
                      </Badge>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
