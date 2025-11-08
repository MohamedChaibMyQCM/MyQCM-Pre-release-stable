"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FreelancerLayout } from "@/components/freelancer/FreelancerLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  apiFetch,
  UnauthorizedError,
  getAccessToken,
  redirectToLogin,
} from "@/app/lib/api";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  FolderOpen,
  Layers,
  RefreshCw,
} from "lucide-react";

type GenerationEntity = {
  id: string;
  name?: string;
  description?: string;
};

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
  source_file_size?: number | null;
  university?: GenerationEntity;
  faculty?: GenerationEntity;
  unit?: GenerationEntity;
  subject?: GenerationEntity;
  course?: GenerationEntity;
  knowledge_components?: string[];
  [key: string]: unknown;
};

const unwrapResponse = <T,>(payload: any): T =>
  (payload?.data ?? payload) as T;

const pollStatuses = new Set([
  "awaiting_upload",
  "upload_in_progress",
  "processing",
]);

const statusBadgeMap: Record<string, BadgeProps["variant"]> = {
  ready_for_review: "success",
  completed: "success",
  failed: "destructive",
  processing: "info",
  upload_in_progress: "info",
  awaiting_upload: "warning",
};

const STATUS_STEPS = [
  {
    key: "awaiting_upload",
    label: "Upload assets",
    description: "Send us the source material",
  },
  {
    key: "upload_in_progress",
    label: "Preparing data",
    description: "We process and clean your upload",
  },
  {
    key: "processing",
    label: "Generating",
    description: "AI generates draft questions",
  },
  {
    key: "ready_for_review",
    label: "Ready to review",
    description: "Jump in and refine the output",
  },
  {
    key: "completed",
    label: "Finalized",
    description: "Batch converted to MCQs",
  },
] as const;

const formatDateTime = (value?: string) => {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
};

const formatBytes = (value?: number | null) => {
  if (!value) {
    return null;
  }
  if (value < 1024) {
    return `${value} B`;
  }
  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

export default function GenerationRequestPage() {
  const params = useParams();
  const requestId = params?.id?.toString() ?? "";

  const [request, setRequest] = useState<GenerationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldAutoRefresh, setShouldAutoRefresh] = useState(false);

  const fetchRequest = useCallback(
    async (silent = false) => {
      if (!requestId) {
        setError("Missing generation request ID.");
        setRequest(null);
        setLoading(false);
        return null;
      }

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(requestId)) {
        setError("Invalid generation request ID. Please use a valid request URL.");
        setRequest(null);
        setLoading(false);
        return null;
      }

      if (!getAccessToken()) {
        redirectToLogin();
        return null;
      }

      if (!silent) {
        setLoading(true);
      }

      try {
        const response = await apiFetch<any>(`/generation/requests/${requestId}`);
        const data = unwrapResponse<GenerationRequest>(response);
        setRequest(data);
        setError(null);
        return data;
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          redirectToLogin();
          return null;
        }
        setRequest(null);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load generation request.",
        );
        return null;
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [requestId],
  );

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const load = async (silent = false) => {
      const data = await fetchRequest(silent);
      if (cancelled) {
        return;
      }
      const status = data?.status?.toLowerCase() ?? "";
      const canPoll = pollStatuses.has(status);
      setShouldAutoRefresh(canPoll);
      if (!canPoll && intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    load(false);

    intervalId = setInterval(() => {
      load(true);
    }, 5000);

    return () => {
      cancelled = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchRequest]);

  const parsedRequestedCounts = useMemo(() => {
    if (!request) {
      return [];
    }
    const counts: Array<{ key: string; value: number }> = [];
    if (typeof request.requested_mcq_count === "number") {
      counts.push({ key: "MCQ", value: request.requested_mcq_count });
    }
    if (typeof request.requested_qroc_count === "number") {
      counts.push({ key: "QROC", value: request.requested_qroc_count });
    }
    return counts;
  }, [request]);

  const statusIndex = useMemo(() => {
    const normalized = request?.status?.toLowerCase() ?? "";
    return STATUS_STEPS.findIndex((step) => step.key === normalized);
  }, [request?.status]);

  const metadataRows = useMemo(() => {
    if (!request) {
      return [];
    }

    return [
      { label: "University", value: request.university?.name },
      { label: "Faculty", value: request.faculty?.name },
      { label: "Year of study", value: request.year_of_study },
      { label: "Unit", value: request.unit?.name },
      { label: "Module", value: request.subject?.name },
      { label: "Course", value: request.course?.name },
      {
        label: "Difficulty",
        value: request.difficulty
          ? request.difficulty.charAt(0).toUpperCase() + request.difficulty.slice(1)
          : null,
      },
      {
        label: "Content types",
        value: request.content_types?.length
          ? request.content_types.join(", ")
          : null,
      },
      {
        label: "Knowledge components",
        value: request.knowledge_components?.length
          ? request.knowledge_components.length
          : null,
      },
      { label: "Created", value: formatDateTime(request.createdAt) },
      { label: "Last updated", value: formatDateTime(request.updatedAt) },
    ];
  }, [request]);

  const canReview = useMemo(
    () => {
      const status = request?.status?.toLowerCase() ?? "";
      return status === "ready_for_review" || status === "completed";
    },
    [request?.status],
  );

  const canFinalize = useMemo(
    () => request?.status?.toLowerCase() === "ready_for_review",
    [request?.status],
  );

  if (loading && !request) {
    return (
      <FreelancerLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      </FreelancerLayout>
    );
  }

  return (
    <FreelancerLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            Generation workspace
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            Generation request overview
          </h1>
          <p className="text-muted-foreground">
            Track the processing status and jump into review or finalization the moment items are ready.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {shouldAutoRefresh && (
          <Alert variant="info">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              We&apos;re still generating content for this request. This page refreshes every 5 seconds until it&apos;s ready.
            </AlertDescription>
          </Alert>
        )}

        {request && (
          <>
            <Card className="border-primary/10 bg-gradient-to-r from-primary/5 via-background to-background shadow-sm">
              <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {request.id}
                    </Badge>
                    <Badge variant={statusBadgeMap[request.status?.toLowerCase() ?? ""] ?? "secondary"}>
                      {request.status ?? "UNKNOWN"}
                    </Badge>
                    {request.failureReason && (
                      <Badge variant="destructive">
                        Failed: {request.failureReason}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4 text-2xl font-semibold">
                    {request.course?.name ?? request.subject?.name ?? "Unnamed request"}
                  </CardTitle>
                  <CardDescription>
                    Requested on {formatDateTime(request.createdAt)} · last update {formatDateTime(request.updatedAt)}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {parsedRequestedCounts.map((entry) => (
                    <div
                      key={entry.key}
                      className="rounded-xl border border-border/50 bg-background px-4 py-2 text-center"
                    >
                      <p className="text-xs uppercase text-muted-foreground">
                        {entry.key}
                      </p>
                      <p className="text-2xl font-semibold">{entry.value}</p>
                    </div>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Requested formats: {request.content_types?.join(", ") ?? "—"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span>
                      Year: {request.year_of_study ?? "—"}
                    </span>
                    <span className="hidden text-muted-foreground md:inline">•</span>
                    <span>Difficulty: {request.difficulty ?? "—"}</span>
                    <span className="hidden text-muted-foreground md:inline">•</span>
                    <span>
                      Source: {request.source_file_name ?? "No document uploaded"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workflow status</CardTitle>
                <CardDescription>
                  Follow each step to understand where your batch is in the pipeline.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  {STATUS_STEPS.map((step, index) => {
                    const normalized = request.status?.toLowerCase() ?? "";
                    let state: "done" | "current" | "upcoming" = "upcoming";
                    if (statusIndex === -1) {
                      state = "upcoming";
                    } else if (index < statusIndex) {
                      state = "done";
                    } else if (index === statusIndex) {
                      state = "current";
                    }

                    const icon =
                      state === "done" ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : state === "current" ? (
                        <Clock className="h-4 w-4 text-warning" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      );

                    return (
                      <div
                        key={step.key}
                        className="rounded-xl border border-dashed border-border/60 p-4"
                      >
                        <div className="flex items-center gap-2">
                          {icon}
                          <p className="font-semibold">{step.label}</p>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {step.description}
                        </p>
                        {state === "current" && (
                          <Badge variant="outline" className="mt-3 text-xs uppercase">
                            Current step
                          </Badge>
                        )}
                        {state === "done" && normalized === "ready_for_review" && step.key === "ready_for_review" && (
                          <Badge variant="success" className="mt-3 text-xs uppercase">
                            Jump into review
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Request details</CardTitle>
                  <CardDescription>
                    All the context shared with the AI for this generation run.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {metadataRows
                      .filter((row) => row.value)
                      .map((row) => (
                        <div key={row.label} className="rounded-lg border border-border/60 p-3">
                          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                            {row.label}
                          </dt>
                          <dd className="mt-1 font-medium text-foreground">
                            {row.value}
                          </dd>
                        </div>
                      ))}
                    {metadataRows.every((row) => !row.value) && (
                      <p className="text-sm text-muted-foreground">
                        No contextual metadata was provided for this request.
                      </p>
                    )}
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Source document</CardTitle>
                  <CardDescription>
                    Keep an eye on the uploaded reference file.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 rounded-lg border border-dashed border-border/60 p-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">
                        {request.source_file_name ?? "No file uploaded yet"}
                      </p>
                      {request.source_file_size && (
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(request.source_file_size)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      Upload date: {formatDateTime(request.createdAt)}
                    </p>
                    <p>
                      Last processed: {formatDateTime(request.updatedAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Next steps</CardTitle>
                <CardDescription>
                  Use these shortcuts to continue the workflow or kick off another batch.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button
                  asChild
                  disabled={!canReview}
                  className="gap-2"
                >
                  <Link href={`/generation/${requestId}/items`}>
                    <FolderOpen className="h-4 w-4" />
                    Review generated items
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  disabled={!canFinalize}
                  className="gap-2"
                >
                  <Link href={`/generation/${requestId}/finalize`}>
                    <CheckCircle2 className="h-4 w-4" />
                    Finalize batch
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="gap-2">
                  <Link href="/freelence/dashboard">
                    <ArrowRight className="h-4 w-4" />
                    Start another request
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {!request && !error && (
          <Card>
            <CardHeader>
              <CardTitle>Looking for that request…</CardTitle>
              <CardDescription>
                We couldn&apos;t load the request details yet. This might be a temporary issue, please try refreshing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => fetchRequest()}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry loading
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </FreelancerLayout>
  );
}
