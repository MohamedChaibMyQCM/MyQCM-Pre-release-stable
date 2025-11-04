"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FreelancerLayout } from "@/components/freelancer/FreelancerLayout";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Download,
  XCircle,
  AlertCircle,
  ArrowRight,
  Calendar,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import {
  apiFetch,
  UnauthorizedError,
  getAccessToken,
  redirectToLogin,
} from "@/app/lib/api";
import { formatRelativeTime, formatDateTime } from "@/lib/utils";

type GenerationRequest = {
  id: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  failureReason?: string;
  content_types?: string[];
  requested_mcq_count?: number;
  requested_qroc_count?: number;
  year_of_study?: string;
  difficulty?: string;
  source_file_name?: string | null;
  university?: { name: string };
  faculty?: { name: string };
  unit?: { name: string };
  subject?: { name: string };
  course?: { name: string };
};

const unwrapResponse = <T,>(payload: any): T =>
  (payload?.data ?? payload) as T;

export default function EnhancedGenerationRequestPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params?.id?.toString() ?? "";

  const [request, setRequest] = React.useState<GenerationRequest | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const statusMap: Record<
    string,
    "completed" | "current" | "upcoming"
  > = React.useMemo(() => {
    if (!request) return {};

    const status = request.status.toLowerCase();
    return {
      created: "completed",
      awaiting_upload:
        status === "awaiting_upload"
          ? "current"
          : status === "created"
          ? "upcoming"
          : "completed",
      uploaded:
        status === "upload_in_progress" || status === "uploaded"
          ? "current"
          : ["awaiting_upload", "created"].includes(status)
          ? "upcoming"
          : "completed",
      processing:
        status === "processing"
          ? "current"
          : [
              "awaiting_upload",
              "uploaded",
              "upload_in_progress",
              "created",
            ].includes(status)
          ? "upcoming"
          : "completed",
      ready_for_review:
        status === "ready_for_review"
          ? "current"
          : ["completed"].includes(status)
          ? "completed"
          : "upcoming",
      completed: status === "completed" ? "completed" : "upcoming",
    };
  }, [request]);

  React.useEffect(() => {
    if (!requestId) {
      return;
    }
    if (!getAccessToken()) {
      redirectToLogin();
      return;
    }

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const fetchRequest = async () => {
      try {
        const response = await apiFetch<any>(
          `/generation/requests/${requestId}`
        );
        if (cancelled) return;

        const data = unwrapResponse<GenerationRequest>(response);
        setRequest(data);
        setError(null);

        // Stop polling if status is final
        if (
          intervalId &&
          data?.status &&
          ["ready_for_review", "completed", "failed"].includes(
            data.status.toLowerCase()
          )
        ) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof UnauthorizedError) {
          redirectToLogin();
          return;
        }
        setError(
          err instanceof Error ? err.message : "Failed to load request"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
    intervalId = setInterval(fetchRequest, 5000);

    return () => {
      cancelled = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [requestId]);

  const timelineItems: TimelineItem[] = React.useMemo(() => {
    if (!request) return [];

    const items: TimelineItem[] = [
      {
        title: "Request Created",
        description: "Generation request initialized",
        timestamp: request.createdAt
          ? formatRelativeTime(request.createdAt)
          : undefined,
        status: statusMap.created || "completed",
      },
      {
        title: "Source Uploaded",
        description: request.source_file_name
          ? `File: ${request.source_file_name}`
          : "Awaiting source document",
        timestamp: request.updatedAt
          ? formatRelativeTime(request.updatedAt)
          : undefined,
        status: statusMap.uploaded || "upcoming",
      },
      {
        title: "Processing",
        description: "AI is generating questions from your content",
        status: statusMap.processing || "upcoming",
        substeps:
          statusMap.processing === "current"
            ? [
                { title: "Extracting text", status: "completed" },
                { title: "Analyzing content", status: "completed" },
                { title: "Generating questions", status: "current" },
                { title: "Validating quality", status: "pending" },
              ]
            : undefined,
      },
      {
        title: "Ready for Review",
        description: "Questions generated and awaiting your review",
        status: statusMap.ready_for_review || "upcoming",
      },
      {
        title: "Completed",
        description: "All questions approved and published",
        status: statusMap.completed || "upcoming",
      },
    ];

    return items;
  }, [request, statusMap]);

  const getStatusBadgeVariant = (
    status: string
  ): "default" | "success" | "warning" | "info" => {
    const s = status.toLowerCase();
    if (s === "completed") return "success";
    if (s === "ready_for_review") return "warning";
    if (["processing", "upload_in_progress"].includes(s)) return "info";
    return "default";
  };

  if (loading) {
    return (
      <FreelancerLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      </FreelancerLayout>
    );
  }

  if (error || !request) {
    return (
      <FreelancerLayout>
        <div className="mx-auto max-w-4xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Request not found"}</AlertDescription>
          </Alert>
        </div>
      </FreelancerLayout>
    );
  }

  return (
    <FreelancerLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/freelence/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <span>/</span>
            <span>Request #{requestId.slice(0, 8)}</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Generation Request
              </h1>
              <p className="text-muted-foreground">
                Created {request.createdAt && formatDateTime(request.createdAt)}
              </p>
            </div>
            <Badge variant={getStatusBadgeVariant(request.status)}>
              {request.status.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>

        {/* Failure reason */}
        {request.failureReason && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Failed:</strong> {request.failureReason}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content - Timeline */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-6 text-lg font-semibold">Progress</h2>
              <Timeline items={timelineItems} />
            </div>
          </div>

          {/* Sidebar - Details */}
          <div className="space-y-6">
            {/* Request details */}
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Details</h2>
              <dl className="space-y-3">
                {request.university && (
                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <dt className="text-xs text-muted-foreground">
                        University
                      </dt>
                      <dd className="text-sm font-medium">
                        {request.university.name}
                      </dd>
                    </div>
                  </div>
                )}
                {request.faculty && (
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <dt className="text-xs text-muted-foreground">
                        Faculty
                      </dt>
                      <dd className="text-sm font-medium">
                        {request.faculty.name}
                      </dd>
                    </div>
                  </div>
                )}
                {request.course && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <dt className="text-xs text-muted-foreground">Course</dt>
                      <dd className="text-sm font-medium">
                        {request.course.name}
                      </dd>
                    </div>
                  </div>
                )}
                {request.year_of_study && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <dt className="text-xs text-muted-foreground">
                        Year of Study
                      </dt>
                      <dd className="text-sm font-medium">
                        {request.year_of_study}
                      </dd>
                    </div>
                  </div>
                )}
              </dl>
            </div>

            {/* Configuration */}
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Configuration</h2>
              <dl className="space-y-2 text-sm">
                {request.difficulty && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Difficulty:</dt>
                    <dd className="font-medium capitalize">
                      {request.difficulty}
                    </dd>
                  </div>
                )}
                {request.requested_mcq_count !== undefined && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">MCQs:</dt>
                    <dd className="font-medium">{request.requested_mcq_count}</dd>
                  </div>
                )}
                {request.requested_qroc_count !== undefined &&
                  request.requested_qroc_count > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">QROCs:</dt>
                      <dd className="font-medium">
                        {request.requested_qroc_count}
                      </dd>
                    </div>
                  )}
                {request.source_file_name && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Source:</dt>
                    <dd className="truncate font-medium">
                      {request.source_file_name}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {["ready_for_review", "completed"].includes(
                request.status.toLowerCase()
              ) && (
                <Link
                  href={`/generation/${requestId}/items`}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Review Items
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              {request.status.toLowerCase() === "ready_for_review" && (
                <Link
                  href={`/generation/${requestId}/finalize`}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Finalize Batch
                </Link>
              )}
              <Link
                href="/generation/wizard"
                className="flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                New Request
              </Link>
            </div>
          </div>
        </div>
      </div>
    </FreelancerLayout>
  );
}
