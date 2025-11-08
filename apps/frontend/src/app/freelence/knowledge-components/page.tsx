"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { FreelancerLayout } from "@/components/freelancer/FreelancerLayout";
import type { CourseContext } from "@/components/forms/CourseContextSelector";
import {
  apiFetch,
  UnauthorizedError,
  redirectToLogin,
  getAccessToken,
  getApiBaseUrl,
} from "@/app/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { AiMcqMapperSection } from "./components/AiMcqMapperSection";
import { KnowledgeComponentFormSection } from "./components/KnowledgeComponentFormSection";
import { KnowledgeComponentsTableSection } from "./components/KnowledgeComponentsTableSection";
import {
  AiReviewConfidence,
  AiReviewItem,
  AiReviewResponse,
  AiSessionLog,
  FormState,
  KnowledgeComponentRow,
  SelectOption,
} from "./types";

const extractItems = (payload: any): any[] => {
  if (!payload) return [];
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

const mapOptions = (items: any[]): SelectOption[] =>
  items
    .map((item) => {
      const id =
        item?.id ??
        item?.uuid ??
        item?._id ??
        item?.identifier ??
        item?.key ??
        "";
      if (!id || typeof id !== "string") {
        return null;
      }
      const name =
        item?.name ??
        item?.title ??
        item?.label ??
        item?.displayName ??
        item?.slug ??
        "Unnamed";
      return { id, name };
    })
    .filter((option): option is SelectOption => option !== null);

const emptyFormState = (courseId: string): FormState => ({
  slug: "",
  name: "",
  code: "",
  description: "",
  domainId: "",
  courseId,
  parentId: "",
  level: "",
  isActive: true,
});

const INITIAL_CONTEXT: CourseContext = {
  university: "",
  faculty: "",
  year: "",
  unit: "",
  subject: "",
  course: "",
};

export default function KnowledgeComponentsPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [courseContext, setCourseContext] =
    React.useState<CourseContext>(INITIAL_CONTEXT);
  const selectedCourse = courseContext.course;

  const [domains, setDomains] = React.useState<SelectOption[]>([]);
  const [selectedDomainFilter, setSelectedDomainFilter] =
    React.useState<string>("");

  const [components, setComponents] = React.useState<KnowledgeComponentRow[]>(
    [],
  );
  const [loadingComponents, setLoadingComponents] = React.useState(false);

  const [formState, setFormState] = React.useState<FormState>(
    emptyFormState(""),
  );
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [submitting, setSubmitting] = React.useState(false);

  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [aiReviewLoading, setAiReviewLoading] = React.useState(false);
  const [aiReviewResponse, setAiReviewResponse] = React.useState<
    AiReviewResponse | null
  >(null);
  const [storedSuggestions, setStoredSuggestions] = React.useState<AiReviewItem[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = React.useState(false);
  const [aiApplyLoading, setAiApplyLoading] = React.useState(false);
  const [aiEnrichmentLoading, setAiEnrichmentLoading] = React.useState(false);
  const [aiEnrichmentResult, setAiEnrichmentResult] = React.useState<{
    queued: number;
    mcqIds: string[];
  } | null>(null);
  const [enrichmentLimit, setEnrichmentLimit] = React.useState(25);
  const [enrichmentOnlyPending, setEnrichmentOnlyPending] = React.useState(true);
  const [aiLogs, setAiLogs] = React.useState<AiSessionLog[]>([]);
  const [aiLogsLoading, setAiLogsLoading] = React.useState(false);

  const storedSuggestionsResponse = React.useMemo<AiReviewResponse | null>(() => {
    if (!storedSuggestions.length) {
      return null;
    }
    return {
      items: storedSuggestions,
      requestIds: [],
      processed: storedSuggestions.length,
      requested: storedSuggestions.length,
      skipped: 0,
      optionsSkipped: 0,
      tokens: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    };
  }, [storedSuggestions]);

  const displayedReview = aiReviewResponse ?? storedSuggestionsResponse;

  const templateUrl = React.useMemo(
    () => `${getApiBaseUrl()}/knowledge-components/template`,
    [],
  );

  const parentOptions = React.useMemo(
    () =>
      components.map((component) => ({
        id: component.id,
        name: `${component.name} (${component.slug})`,
      })),
    [components],
  );

  const filteredComponents = React.useMemo(() => {
    if (!selectedDomainFilter) {
      return components;
    }
    return components.filter(
      (component) => component.domain?.id === selectedDomainFilter,
    );
  }, [components, selectedDomainFilter]);

  const loadStoredSuggestions = React.useCallback(
    async (courseId: string) => {
      if (!courseId) {
        setStoredSuggestions([]);
        return;
      }
      setSuggestionsLoading(true);
      try {
        const response = await apiFetch<{
          data?: { items?: AiReviewItem[] };
        }>(`/knowledge-components/courses/${courseId}/ai-suggestions`);
        const items = response.data?.items ?? [];
        setStoredSuggestions(items);
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          redirectToLogin();
          return;
        }
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load saved AI suggestions.";
        toast.error(message);
      } finally {
        setSuggestionsLoading(false);
      }
    },
    [],
  );

  const loadSessionLogs = React.useCallback(
    async (courseId: string) => {
      if (!courseId) {
        setAiLogs([]);
        return;
      }
      setAiLogsLoading(true);
      try {
        const response = await apiFetch<{ data?: any[] }>(
          `/knowledge-components/courses/${courseId}/ai-logs`,
        );
        const entries = response.data ?? [];
        const mapped: AiSessionLog[] = entries.map((entry) => ({
          id: entry.id,
          createdAt: entry.createdAt ?? entry.created_at,
          requested: entry.requested ?? 0,
          processed: entry.processed ?? 0,
          skipped: entry.skipped ?? 0,
          optionsSkipped: entry.options_skipped ?? entry.optionsSkipped ?? 0,
          promptTokens: entry.prompt_tokens ?? entry.promptTokens ?? 0,
          completionTokens: entry.completion_tokens ?? entry.completionTokens ?? 0,
          totalTokens: entry.total_tokens ?? entry.totalTokens ?? 0,
          model: entry.model ?? "unknown",
          initiatedBy: entry.initiated_by ?? entry.initiatedBy ?? null,
        }));
        setAiLogs(mapped);
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          redirectToLogin();
          return;
        }
        console.error(err);
      } finally {
        setAiLogsLoading(false);
      }
    },
    [],
  );

  React.useEffect(() => {
    if (!selectedCourse) {
      setStoredSuggestions([]);
      setAiReviewResponse(null);
      setAiLogs([]);
      return;
    }
    loadStoredSuggestions(selectedCourse);
    loadSessionLogs(selectedCourse);
    setAiReviewResponse(null);
  }, [selectedCourse, loadStoredSuggestions, loadSessionLogs]);

  const resetForm = React.useCallback(
    (mode: "create" | "edit" = "create") => {
      setFormMode(mode);
      setFormState((prev) => ({
        ...emptyFormState(selectedCourse ?? ""),
        courseId: selectedCourse ?? "",
        domainId: mode === "create" ? "" : prev.domainId,
      }));
    },
    [selectedCourse],
  );

  const loadDomains = React.useCallback(async () => {
    try {
      const response = await apiFetch<any>(
        "/knowledge-components/domains?includeInactive=true",
      );
      setDomains(mapOptions(extractItems(response)));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load domains";
      setError(message);
    }
  }, []);

  const loadComponents = React.useCallback(
    async (courseId: string) => {
      if (!courseId) {
        setComponents([]);
        return;
      }

      try {
        setLoadingComponents(true);
        const response = await apiFetch<any>(
          `/knowledge-components?courseId=${encodeURIComponent(
            courseId,
          )}&includeInactive=true&includeRelations=true`,
        );

        const mapped: KnowledgeComponentRow[] = extractItems(response).map(
          (item: any) => ({
            id: item?.id,
            slug: item?.slug,
            name: item?.name,
            code: item?.code ?? null,
            description: item?.description ?? null,
            level: item?.level ?? null,
            isActive: Boolean(item?.isActive ?? item?.is_active ?? true),
            domain: item?.domain
              ? { id: item.domain.id, name: item.domain.name }
              : null,
            parent: item?.parent
              ? { id: item.parent.id, name: item.parent.name }
              : null,
          }),
        );

        setComponents(mapped);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load knowledge components";
        toast.error(message);
      } finally {
        setLoadingComponents(false);
      }
    },
    [],
  );

  React.useEffect(() => {
    if (!getAccessToken()) {
      redirectToLogin();
      return;
    }

    setCourseContext(INITIAL_CONTEXT);
    setSelectedDomainFilter("");

    const bootstrap = async () => {
      setLoading(true);
      setError(null);
      try {
        await loadDomains();
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          redirectToLogin();
          return;
        }
        const message =
          err instanceof Error ? err.message : "Failed to load initial data";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [loadDomains]);

  React.useEffect(() => {
    if (selectedCourse) {
      loadComponents(selectedCourse);
      resetForm("create");
    } else {
      setComponents([]);
      resetForm("create");
    }

    setAiReviewResponse(null);
  }, [selectedCourse, loadComponents, resetForm]);

  const handleEdit = (component: KnowledgeComponentRow) => {
    setFormMode("edit");
    setFormState({
      id: component.id,
      slug: component.slug,
      name: component.name,
      code: component.code ?? "",
      description: component.description ?? "",
      domainId: component.domain?.id ?? "",
      courseId: selectedCourse ?? "",
      parentId: component.parent?.id ?? "",
      level: component.level ?? "",
      isActive: component.isActive,
    });
  };

  const handleDelete = async (component: KnowledgeComponentRow) => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Delete knowledge component "${component.name}" (${component.slug})?`,
      )
    ) {
      return;
    }

    try {
      await apiFetch(`/knowledge-components/${component.id}`, {
        method: "DELETE",
      });
      toast.success("Knowledge component deleted");
      if (selectedCourse) {
        await loadComponents(selectedCourse);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete component";
      toast.error(message);
    }
  };

  const handleFormChange = (
    field: keyof FormState,
    value: string | boolean | number | "",
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedCourse) {
      toast.error("Select a course before saving.");
      return;
    }

    if (!formState.domainId) {
      toast.error("Select a domain for this knowledge component.");
      return;
    }

    if (!formState.slug.trim() || !formState.name.trim()) {
      toast.error("Slug and name are required.");
      return;
    }

    const payload: Record<string, unknown> = {
      slug: formState.slug.trim(),
      name: formState.name.trim(),
      code: formState.code?.trim() || undefined,
      description: formState.description?.trim() || undefined,
      domain_id: formState.domainId,
      course_id: selectedCourse,
      parent_id: formState.parentId || undefined,
      level:
        formState.level === "" ? undefined : Number(formState.level ?? 1),
      isActive: formState.isActive,
    };

    setSubmitting(true);
    setError(null);

    try {
      if (formMode === "edit" && formState.id) {
        await apiFetch(`/knowledge-components/${formState.id}`, {
          method: "PATCH",
          body: payload,
        });
        toast.success("Knowledge component updated");
      } else {
        await apiFetch("/knowledge-components", {
          method: "POST",
          body: payload,
        });
        toast.success("Knowledge component created");
      }

      if (selectedCourse) {
        await loadComponents(selectedCourse);
      }
      resetForm("create");
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      const message =
        err instanceof Error ? err.message : "Failed to save knowledge component";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCourse) {
      toast.error("Select a course before importing knowledge components.");
      return;
    }

    const input = fileInputRef.current;
    const file = input?.files?.[0];
    if (!file) {
      toast.error("Choose a CSV or Excel file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      await apiFetch(`/knowledge-components/courses/${selectedCourse}/import`, {
        method: "POST",
        body: formData,
      });
      toast.success("Knowledge components imported successfully");
      input.value = "";
      await loadComponents(selectedCourse);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Import failed. Please verify your file.";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const confidenceBadgeVariantMap: Record<
    AiReviewConfidence,
    "success" | "secondary" | "destructive"
  > = {
    high: "success",
    medium: "secondary",
    low: "destructive",
  };

  const handleRunAiReview = async () => {
    if (!selectedCourse) {
      toast.error("Select a course before running the AI review.");
      return;
    }

    setAiReviewLoading(true);
    try {
      const response = await apiFetch<AiReviewResponse>(
        `/knowledge-components/courses/${selectedCourse}/ai-review`,
        {
          method: "POST",
          body: {},
        },
      );
      setAiReviewResponse(response);
      toast.success(
        `AI review processed ${response.processed}/${response.requested} MCQ${
          response.processed === 1 ? "" : "s"
        }.`,
      );
      await loadStoredSuggestions(selectedCourse);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      const message =
        err instanceof Error ? err.message : "AI review failed, please retry.";
      toast.error(message);
    } finally {
      setAiReviewLoading(false);
    }
  };

  const handleApplyAiSuggestions = async () => {
    if (!selectedCourse) {
      toast.error("Select a course before pushing AI suggestions live.");
      return;
    }

    const source = aiReviewResponse ?? storedSuggestionsResponse;
    if (!source?.items.length) {
      toast.error(
        "No AI suggestions are available. Run a review or load saved suggestions first.",
      );
      return;
    }

    const payload = {
      items: source.items
        .filter((item) => item.suggestions.length > 0)
        .map((item) => ({
          mcqId: item.mcqId,
          componentIds: item.suggestions.map((suggestion) => suggestion.id),
        })),
    };

    if (!payload.items.length) {
      toast.error("No suggestions were available to push to production.");
      return;
    }

    setAiApplyLoading(true);
    try {
      const response = await apiFetch<{
        data?: { applied?: number };
      }>(`/knowledge-components/courses/${selectedCourse}/ai-apply`, {
        method: "POST",
        body: payload,
      });
      const applied = response.data?.applied ?? payload.items.length;
      toast.success(`${applied} MCQ${applied === 1 ? "" : "s"} pushed live.`);
      setAiReviewResponse(null);
      await loadStoredSuggestions(selectedCourse);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      const message =
        err instanceof Error ? err.message : "Failed to apply AI suggestions.";
      toast.error(message);
    } finally {
      setAiApplyLoading(false);
    }
  };

  const handleQueueAiEnrichment = async () => {
    if (!selectedCourse) {
      toast.error("Select a course before queuing MCQs.");
      return;
    }

    setAiEnrichmentLoading(true);
    try {
      const payload: Record<string, any> = {};
      const sanitizedLimit = Math.min(
        200,
        Math.max(1, Number.isFinite(enrichmentLimit) ? enrichmentLimit : 1),
      );
      payload.limit = sanitizedLimit;
      if (!enrichmentOnlyPending) {
        payload.only_pending = false;
      }

      const response = await apiFetch<any>(
        `/mcq/courses/${selectedCourse}/ai-enrichment`,
        {
          method: "POST",
          body: payload,
        },
      );
      const data = (response?.data ?? response) as {
        queued: number;
        mcqIds: string[];
      };
      setAiEnrichmentResult(data);
      setEnrichmentLimit(sanitizedLimit);
      toast.success(
        `Queued ${data.queued} MCQ${data.queued === 1 ? "" : "s"} for AI enrichment.`,
      );
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      const message =
        err instanceof Error ? err.message : "Failed to queue MCQs for enrichment.";
      toast.error(message);
    } finally {
      setAiEnrichmentLoading(false);
    }
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

  return (
    <FreelancerLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Knowledge Component Manager</h1>
          <p className="text-muted-foreground">
            Create, edit, or import knowledge components for your courses. Download the
            template to prepare bulk uploads.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <KnowledgeComponentsTableSection
              courseContext={courseContext}
              onCourseContextChange={(value) => {
                setCourseContext(value);
                setSelectedDomainFilter("");
              }}
              selectedDomainFilter={selectedDomainFilter}
              onDomainFilterChange={setSelectedDomainFilter}
              domains={domains}
              filteredComponents={filteredComponents}
              loadingComponents={loadingComponents}
              selectedCourse={selectedCourse}
              templateUrl={templateUrl}
              onRefresh={() => {
                setError(null);
                if (selectedCourse) {
                  loadComponents(selectedCourse);
                }
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
              uploading={uploading}
              onUpload={handleUpload}
              fileInputRef={fileInputRef}
            />

            <AiMcqMapperSection
              aiReviewLoading={aiReviewLoading}
              aiApplyLoading={aiApplyLoading}
              aiEnrichmentLoading={aiEnrichmentLoading}
              suggestionsLoading={suggestionsLoading}
              hasSessionResults={Boolean(aiReviewResponse)}
              selectedCourse={selectedCourse}
              aiReviewResponse={displayedReview}
              aiEnrichmentResult={aiEnrichmentResult}
              aiLogs={aiLogs}
              aiLogsLoading={aiLogsLoading}
              enrichmentLimit={enrichmentLimit}
              enrichmentOnlyPending={enrichmentOnlyPending}
              onRunAiReview={handleRunAiReview}
              onApplyAiSuggestions={handleApplyAiSuggestions}
              onQueueAiEnrichment={handleQueueAiEnrichment}
              onChangeEnrichmentLimit={setEnrichmentLimit}
              onToggleOnlyPending={(value) =>
                setEnrichmentOnlyPending(Boolean(value))
              }
              onClearResults={() => setAiReviewResponse(null)}
              onClearEnrichmentResult={() => setAiEnrichmentResult(null)}
              onRefreshLogs={() =>
                selectedCourse ? loadSessionLogs(selectedCourse) : undefined
              }
            />
          </div>

          <KnowledgeComponentFormSection
            formMode={formMode}
            formState={formState}
            domains={domains}
            parentOptions={parentOptions}
            submitting={submitting}
            selectedCourse={selectedCourse}
            onSubmit={handleSubmit}
            onChange={handleFormChange}
            onCancelEdit={() => resetForm("create")}
          />
        </div>
      </div>
    </FreelancerLayout>
  );
}
