"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "next/navigation";
import { FreelancerLayout } from "@/components/freelancer/FreelancerLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  apiFetch,
  UnauthorizedError,
  redirectToLogin,
  getAccessToken,
} from "@/app/lib/api";
import { useInterval } from "@/hooks/useInterval";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react";

const unwrapResponse = <T,>(payload: any): T =>
  (payload?.data ?? payload) as T;

type RawOption = {
  id?: string;
  text?: string;
  value?: string;
  label?: string;
  content?: string;
  is_correct?: boolean;
  isCorrect?: boolean;
  correct?: boolean;
};

type RawItem = {
  id: string;
  type: string;
  stem?: string;
  body?: string;
  prompt?: string;
  status?: string;
  options?: RawOption[];
  expected_answer?: string;
  expectedAnswer?: string;
  answer?: string;
};

type ItemRow = {
  id: string;
  type: string;
  stem: string;
  options: { id?: string; text: string; is_correct: boolean }[];
  expected_answer: string;
  status: string;
  isDirty: boolean;
  isSaving: boolean;
  actionError: string | null;
};

type GlobalMessage = {
  variant: "success" | "info" | "error";
  text: string;
};

type StatusFilter =
  | "all"
  | "pending_review"
  | "approved"
  | "rejected"
  | "converted";

type TypeFilter = "all" | "mcq" | "qroc";

type ReviewSummary = {
  total: number;
  statusCounts?: Record<string, number>;
  typeCounts?: Record<string, number>;
  request?: {
    id: string;
    status: string;
    requestedCounts?: {
      mcq?: number;
      qroc?: number;
    };
  };
  lastUpdatedAt?: string | null;
};

const normalizeOption = (option: RawOption, idx: number) => ({
  id: option.id ?? `${idx}`,
  text:
    option.text ??
    option.value ??
    option.label ??
    option.content ??
    "",
  is_correct: Boolean(
    option.is_correct ?? option.isCorrect ?? option.correct ?? false,
  ),
});

const normalizeItem = (raw: RawItem, idx: number): ItemRow => ({
  id: raw.id?.toString() ?? `item-${idx}`,
  type: (raw.type ?? "mcq").toLowerCase(),
  stem: raw.stem ?? raw.body ?? raw.prompt ?? "",
  options: Array.isArray(raw.options)
    ? raw.options.map(normalizeOption)
    : [],
  expected_answer:
    raw.expected_answer ?? raw.expectedAnswer ?? raw.answer ?? "",
  status: (raw.status ?? "draft").toLowerCase(),
  isDirty: false,
  isSaving: false,
  actionError: null,
});

const formatStatusLabel = (status: string) =>
  status
    .split(/[_-]/g)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");

const getStatusVariant = (status: string): BadgeProps["variant"] => {
  switch (status) {
    case "converted":
    case "approved":
      return "success";
    case "rejected":
      return "destructive";
    case "pending":
    case "draft":
    case "to_review":
      return "warning";
    default:
      return "info";
  }
};

const alertVariantMap: Record<
  GlobalMessage["variant"],
  "success" | "info" | "destructive"
> = {
  success: "success",
  info: "info",
  error: "destructive",
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
};

export default function GenerationItemsPage() {
  const params = useParams();
  const requestId = params?.id?.toString() ?? "";

  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [globalMessage, setGlobalMessage] = useState<GlobalMessage | null>(
    null,
  );
  const [polling, setPolling] = useState(false);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const notify = useCallback(
    (variant: GlobalMessage["variant"], text: string) => {
      setGlobalMessage({ variant, text });
    },
    [],
  );

  useEffect(() => {
    if (!globalMessage) {
      return;
    }
    const timer = window.setTimeout(() => setGlobalMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [globalMessage]);

  const loadItems = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!requestId) {
        return;
      }
      if (!getAccessToken()) {
        redirectToLogin();
        return;
      }

      const silent = options?.silent ?? false;
      silent ? setRefreshing(true) : setLoading(true);
      setError(null);

      try {
        const response = await apiFetch<
          { items?: RawItem[]; summary?: ReviewSummary } | RawItem[]
        >(`/generation/requests/${requestId}/items`);
        const payload = unwrapResponse<
          { items?: RawItem[]; summary?: ReviewSummary } | RawItem[]
        >(response);

        let rawItems: RawItem[] = [];
        let summaryPayload: ReviewSummary | null = null;

        if (Array.isArray(payload)) {
          rawItems = payload;
        } else {
          rawItems = Array.isArray(payload?.items) ? payload.items : [];
          summaryPayload = payload?.summary ?? null;
        }

        setItems(rawItems.map(normalizeItem));
        setSummary(summaryPayload);

        if (rawItems.length > 0) {
          setPolling(false);
        } else {
          setPolling(true);
        }
      } catch (e) {
        if (e instanceof UnauthorizedError) {
          redirectToLogin();
          return;
        }
        setError("Failed to load items.");
        setSummary(null);
        setPolling(false);
      } finally {
        silent ? setRefreshing(false) : setLoading(false);
      }
    },
    [requestId],
  );

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useInterval(
    () => {
      loadItems({ silent: true });
    },
    polling ? 5000 : null,
  );

  const hasItems = useMemo(() => items.length > 0, [items]);

  const handleRefresh = useCallback(() => {
    loadItems({ silent: items.length > 0 });
  }, [items.length, loadItems]);

  const handleClearFilters = useCallback(() => {
    setStatusFilter("all");
    setTypeFilter("all");
  }, []);

  const stats = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.type === "mcq") {
          acc.mcqs += 1;
        }
        if (item.type === "qroc") {
          acc.qrocs += 1;
        }
        if (item.status === "converted" || item.status === "approved") {
          acc.converted += 1;
        } else {
          acc.pending += 1;
        }
        return acc;
      },
      { total: 0, mcqs: 0, qrocs: 0, converted: 0, pending: 0 },
    );
  }, [items]);

  const resolvedSummary = useMemo(() => {
    if (summary) {
      return {
        total: summary.total ?? items.length,
        statusCounts: summary.statusCounts ?? {},
        typeCounts: summary.typeCounts ?? {},
        request: summary.request,
        lastUpdatedAt: summary.lastUpdatedAt ?? null,
      };
    }

    const fallbackStatus = items.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    }, {});

    return {
      total: items.length,
      statusCounts: fallbackStatus,
      typeCounts: { mcq: stats.mcqs, qroc: stats.qrocs },
      request: undefined,
      lastUpdatedAt: null,
    };
  }, [items, stats, summary]);

  const itemCountLabel = useMemo(() => {
    const total = resolvedSummary.total;
    if (!total) {
      return "No generated items yet.";
    }
    return `${total} generated item${total === 1 ? "" : "s"}.`;
  }, [resolvedSummary.total]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const statusMatch =
        statusFilter === "all" ? true : item.status === statusFilter;
      const typeMatch =
        typeFilter === "all" ? true : item.type === typeFilter;
      return statusMatch && typeMatch;
    });
  }, [items, statusFilter, typeFilter]);

  const hasFilteredItems = filteredItems.length > 0;
  const pendingCount = resolvedSummary.statusCounts?.pending_review ?? 0;
  const approvedCount = resolvedSummary.statusCounts?.approved ?? 0;
  const convertedCount = resolvedSummary.statusCounts?.converted ?? 0;
  const rejectedCount = resolvedSummary.statusCounts?.rejected ?? 0;
  const readyCount = approvedCount + convertedCount;
  const requestedCounts = resolvedSummary.request?.requestedCounts ?? {};
  const typeCounts = resolvedSummary.typeCounts ?? { mcq: 0, qroc: 0 };
  const lastUpdatedLabel = formatDateTime(resolvedSummary.lastUpdatedAt);
  const requestTypeMeta = [
    { key: "mcq" as const, label: "Multiple choice" },
    { key: "qroc" as const, label: "QROC" },
  ];

  const statusOptions: Array<{ key: StatusFilter; label: string; count: number }> =
    [
      { key: "all", label: "All items", count: resolvedSummary.total },
      { key: "pending_review", label: "Pending review", count: pendingCount },
      { key: "approved", label: "Approved", count: approvedCount },
      { key: "converted", label: "Converted", count: convertedCount },
      { key: "rejected", label: "Rejected", count: rejectedCount },
    ];

  const typeOptions: Array<{ key: TypeFilter; label: string; count: number }> =
    [
      { key: "all", label: "All types", count: resolvedSummary.total },
      { key: "mcq", label: "MCQ", count: typeCounts.mcq ?? 0 },
      { key: "qroc", label: "QROC", count: typeCounts.qroc ?? 0 },
    ];
  const filtersActive = statusFilter !== "all" || typeFilter !== "all";

  const updateItem = useCallback(
    (itemId: string, updates: Partial<ItemRow>) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, ...updates } : item,
        ),
      );
    },
    [],
  );

  const handleStemChange = (itemId: string, value: string) => {
    updateItem(itemId, { stem: value, isDirty: true });
  };

  const handleExpectedAnswerChange = (itemId: string, value: string) => {
    updateItem(itemId, { expected_answer: value, isDirty: true });
  };

  const handleOptionTextChange = (
    itemId: string,
    optionIndex: number,
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) {
          return item;
        }
        const options = item.options.map((opt, idx) =>
          idx === optionIndex ? { ...opt, text: value } : opt,
        );
        return { ...item, options, isDirty: true };
      }),
    );
  };

  const handleOptionToggle = (itemId: string, optionIndex: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) {
          return item;
        }
        const options = item.options.map((opt, idx) =>
          idx === optionIndex ? { ...opt, is_correct: !opt.is_correct } : opt,
        );
        return { ...item, options, isDirty: true };
      }),
    );
  };

  const handleOptionRemove = (itemId: string, optionIndex: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) {
          return item;
        }
        const options = item.options.filter((_, idx) => idx !== optionIndex);
        return { ...item, options, isDirty: true };
      }),
    );
  };

  const handleAddOption = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) {
          return item;
        }
        return {
          ...item,
          options: [
            ...item.options,
            { id: `${item.options.length + 1}`, text: "", is_correct: false },
          ],
          isDirty: true,
        };
      }),
    );
  };

  const validateItem = (item: ItemRow): string | null => {
    if (!item.stem.trim()) {
      return "Stem is required.";
    }
    if (item.type === "mcq") {
      if (item.options.length === 0) {
        return "MCQ items require at least one option.";
      }
      if (!item.options.some((option) => option.is_correct)) {
        return "Mark at least one option as correct.";
      }
      if (item.options.some((option) => !option.text.trim())) {
        return "All options need text.";
      }
    }
    if (item.type === "qroc") {
      if (!item.expected_answer.trim()) {
        return "Expected answer is required for QROC items.";
      }
    }
    return null;
  };

  const updateItemOnServer = async (item: ItemRow) => {
    const validationError = validateItem(item);
    if (validationError) {
      throw new Error(validationError);
    }

    const payload: Record<string, unknown> = {
      stem: item.stem,
      type: item.type,
    };
    if (item.type === "mcq") {
      payload.options = item.options.map((option) => ({
        id: option.id,
        content: option.text,
        is_correct: option.is_correct,
      }));
    }
    if (item.type === "qroc") {
      payload.expected_answer = item.expected_answer;
    }

    await apiFetch(
      `/generation/requests/${requestId}/items/${item.id}`,
      {
        method: "PUT",
        body: payload,
      },
    );
  };

  const markSaving = (
    itemId: string,
    isSaving: boolean,
    actionError: string | null,
  ) =>
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isSaving, actionError } : item,
      ),
    );

  const handleSave = async (itemId: string) => {
    const target = items.find((item) => item.id === itemId);
    if (!target) {
      return;
    }

    markSaving(itemId, true, null);
    try {
      await updateItemOnServer(target);
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, isDirty: false } : item,
        ),
      );
      notify("success", "Item saved.");
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      const message =
        err instanceof Error ? err.message : "Failed to save item.";
      markSaving(itemId, false, message);
      notify("error", message);
      return;
    }
    markSaving(itemId, false, null);
  };

  const handleApprove = async (itemId: string) => {
    try {
      await apiFetch(
        `/generation/requests/${requestId}/items/${itemId}/approve`,
        { method: "POST" },
      );
      notify("success", "Item approved.");
      await loadItems({ silent: true });
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      const message =
        err instanceof Error ? err.message : "Failed to approve item.";
      notify("error", message);
    }
  };

  const handleReject = async (itemId: string) => {
    const reason =
      typeof window !== "undefined"
        ? window.prompt("Provide a rejection reason (optional):", "")
        : "";

    if (reason === null) {
      return;
    }

    try {
      await apiFetch(
        `/generation/requests/${requestId}/items/${itemId}/reject`,
        {
          method: "POST",
          body: reason ? { reason } : {},
        },
      );
      notify("info", "Item rejected.");
      await loadItems({ silent: true });
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      const message =
        err instanceof Error ? err.message : "Failed to reject item.";
      notify("error", message);
    }
  };

  if (loading && !items.length) {
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
            Generation request
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            Review generated items
          </h1>
          <p className="text-muted-foreground">
            Request ID:{" "}
            <span className="font-mono text-sm text-foreground">
              {requestId || "N/A"}
            </span>
          </p>
        </div>

        {(error || globalMessage) && (
          <div className="space-y-3">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {globalMessage && (
              <Alert variant={alertVariantMap[globalMessage.variant]}>
                {globalMessage.variant === "error" ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <AlertDescription>{globalMessage.text}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {polling && (
          <Alert variant="info">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              We&apos;re still generating content for this request. The page
              will auto-refresh every 5 seconds.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Badge variant={polling ? "info" : "secondary"}>
            {polling ? "Auto-refresh active (5s)" : "Auto-refresh paused"}
          </Badge>
          <span className="text-sm text-muted-foreground">{itemCountLabel}</span>
          <span className="text-sm text-muted-foreground">
            Last updated {lastUpdatedLabel}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total items" value={resolvedSummary.total} icon={FileText} />
          <Stat label="Pending review" value={pendingCount} icon={Clock} variant="warning" />
          <Stat
            label="Ready for publication"
            value={readyCount}
            icon={CheckCircle2}
            variant="success"
          />
          <Stat label="Rejected" value={rejectedCount} icon={XCircle} variant="info" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Requested vs generated</CardTitle>
            <CardDescription>
              Track how many MCQs and QROCs have been produced compared with the initial brief.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {requestTypeMeta.map((type) => {
              const requested = requestedCounts?.[type.key] ?? 0;
              const produced = typeCounts[type.key] ?? 0;
              const progressValue =
                requested > 0 ? Math.min((produced / requested) * 100, 100) : 0;
              return (
                <div key={type.key}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{type.label}</span>
                    <span className="text-muted-foreground">
                      {produced}/{requested || "—"}
                    </span>
                  </div>
                  <Progress value={progressValue} className="mt-2 h-2" />
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground">
              Last activity: {lastUpdatedLabel}
            </p>
          </CardContent>
        </Card>

        {hasItems && (
          <Card className="border-dashed border-border/70">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-lg">Review filters</CardTitle>
                <CardDescription>
                  Focus on a specific status or item type while you work through the batch.
                </CardDescription>
              </div>
              {filtersActive && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Clear filters
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <Button
                    key={option.key}
                    type="button"
                    variant={statusFilter === option.key ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                    onClick={() => setStatusFilter(option.key)}
                  >
                    {option.label}
                    <Badge variant="secondary" className="ml-1">
                      {option.count}
                    </Badge>
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {typeOptions.map((option) => (
                  <Button
                    key={option.key}
                    type="button"
                    variant={typeFilter === option.key ? "secondary" : "outline"}
                    size="sm"
                    className="gap-2"
                    onClick={() => setTypeFilter(option.key)}
                  >
                    {option.label}
                    <Badge variant="outline" className="ml-1">
                      {option.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && !hasItems && (
          <EmptyState
            icon={FileText}
            title="No generated items yet"
            description="We&apos;ll notify you as soon as the AI finishes creating the requested questions."
            action={
              <Button onClick={handleRefresh} disabled={refreshing}>
                Refresh now
              </Button>
            }
          />
        )}

        {hasItems && (
          <div className="space-y-6">
            {hasFilteredItems ? (
              filteredItems.map((item, index) => {
                const disableActions = item.status === "converted";
                return (
                  <Card key={item.id} className="shadow-sm">
                    <CardHeader className="flex flex-col gap-4 border-b border-border/60 pb-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="text-xl capitalize">
                        {item.type === "mcq" ? "Multiple choice" : "QROC"} #
                        {index + 1}
                      </CardTitle>
                      <CardDescription>Item ID: {item.id}</CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{item.type.toUpperCase()}</Badge>
                      <Badge variant={getStatusVariant(item.status)}>
                        {formatStatusLabel(item.status)}
                      </Badge>
                      {item.isDirty && (
                        <Badge variant="warning">Unsaved changes</Badge>
                      )}
                    </div>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-6">
                      {disableActions && (
                        <Alert variant="success">
                          <CheckCircle2 className="h-4 w-4" />
                          <AlertDescription>
                            This item has already been converted into a MCQ and
                            can no longer be edited.
                          </AlertDescription>
                        </Alert>
                      )}

                    <div className="space-y-2">
                      <label
                        htmlFor={`stem-${item.id}`}
                        className="text-sm font-medium text-muted-foreground"
                      >
                        Stem / prompt
                      </label>
                      <Textarea
                        id={`stem-${item.id}`}
                        value={item.stem}
                        onChange={(event) =>
                          handleStemChange(item.id, event.target.value)
                        }
                        disabled={disableActions}
                      />
                    </div>

                    {item.type === "mcq" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-semibold">
                            Answer options
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            Mark the correct answers using the checkbox.
                          </span>
                        </div>
                        {item.options.map((option, optionIndex) => (
                          <div
                            key={option.id ?? optionIndex}
                            className="rounded-lg border border-dashed border-border bg-muted/30 p-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <label className="flex items-center gap-2 text-sm font-medium">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-muted-foreground text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                  checked={option.is_correct}
                                  onChange={() =>
                                    handleOptionToggle(item.id, optionIndex)
                                  }
                                  disabled={disableActions}
                                />
                                Correct answer
                              </label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleOptionRemove(item.id, optionIndex)
                                }
                                disabled={disableActions}
                                className="gap-1 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                Remove
                              </Button>
                            </div>
                            <Input
                              className="mt-3"
                              type="text"
                              value={option.text}
                              onChange={(event) =>
                                handleOptionTextChange(
                                  item.id,
                                  optionIndex,
                                  event.target.value,
                                )
                              }
                              placeholder="Option text"
                              disabled={disableActions}
                            />
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleAddOption(item.id)}
                          disabled={disableActions}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add option
                        </Button>
                      </div>
                    )}

                    {item.type === "qroc" && (
                      <div className="space-y-2">
                        <label
                          htmlFor={`expected-${item.id}`}
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Expected answer
                        </label>
                        <Input
                          id={`expected-${item.id}`}
                          type="text"
                          value={item.expected_answer}
                          onChange={(event) =>
                            handleExpectedAnswerChange(
                              item.id,
                              event.target.value,
                            )
                          }
                          placeholder="Provide the model answer"
                          disabled={disableActions}
                        />
                      </div>
                    )}

                    {item.actionError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{item.actionError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleSave(item.id)}
                        disabled={item.isSaving || disableActions}
                        className="gap-2"
                      >
                        {item.isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4" />
                            Save changes
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        className="gap-2 bg-success text-success-foreground hover:bg-success/90"
                        onClick={() => handleApprove(item.id)}
                        disabled={disableActions}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        type="button"
                        className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => handleReject(item.id)}
                        disabled={disableActions}
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
            ) : (
              <EmptyState
                title="No items match your filters"
                description="Relax the status or type filters to keep reviewing."
                action={
                  filtersActive && (
                    <Button size="sm" onClick={handleClearFilters}>
                      Reset filters
                    </Button>
                  )
                }
              />
            )}
          </div>
        )}
      </div>
    </FreelancerLayout>
  );
}
