"use client";

import * as React from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FreelancerLayout } from "@/components/freelancer/FreelancerLayout";
import {
  CourseContextSelector,
  CourseContext,
} from "@/components/forms/CourseContextSelector";
import {
  apiFetch,
  UnauthorizedError,
  redirectToLogin,
  getAccessToken,
  getApiBaseUrl,
} from "@/app/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Download, FilePlus2, RefreshCw } from "lucide-react";

type KnowledgeComponentRow = {
  id: string;
  slug: string;
  name: string;
  code?: string | null;
  description?: string | null;
  level?: number | null;
  isActive: boolean;
  domain?: { id: string; name: string } | null;
  parent?: { id: string; name: string } | null;
};

type FormState = {
  id?: string;
  slug: string;
  name: string;
  code?: string;
  description?: string;
  domainId: string;
  courseId: string;
  parentId?: string;
  level?: number | "";
  isActive: boolean;
};

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

const mapOptions = (items: any[]): { id: string; name: string }[] =>
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
    .filter((option): option is { id: string; name: string } => option !== null);

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
  const selectedModule = courseContext.subject;

  const [domains, setDomains] = React.useState<{ id: string; name: string }[]>(
    [],
  );
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

  const handleUpload = async (event: React.FormEvent) => {
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
          <section className="space-y-6 rounded-lg border border-border bg-card p-6">
            <div className="space-y-6">
              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Course Context
                </Label>
                <CourseContextSelector
                  value={courseContext}
                  onChange={(value) => {
                    setCourseContext(value);
                    setSelectedDomainFilter("");
                  }}
                />
              </div>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <Label htmlFor="domain-filter">Domain Filter</Label>
                  <select
                    id="domain-filter"
                    value={selectedDomainFilter}
                    onChange={(event) =>
                      setSelectedDomainFilter(event.target.value)
                    }
                    className="flex h-10 w-64 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">All domains</option>
                    {domains.map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        {domain.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <Button
                    variant="outline"
                    asChild
                    className="gap-2"
                  >
                    <Link href={templateUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                      Download Template
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      setError(null);
                      if (selectedCourse) {
                        loadComponents(selectedCourse);
                      }
                    }}
                    disabled={loadingComponents || !selectedCourse}
                  >
                    {loadingComponents ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border">
              <div className="flex items-center justify-between border-b border-border p-4">
                <div>
                  <h2 className="text-lg font-semibold">Knowledge Components</h2>
                  <p className="text-sm text-muted-foreground">
                    {filteredComponents.length} result
                    {filteredComponents.length === 1 ? "" : "s"} displayed
                  </p>
                </div>
                {loadingComponents && <Spinner size="sm" />}
              </div>

              <div className="max-h-[480px] overflow-auto">
                <table className="min-w-full divide-y divide-border text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Name</th>
                      <th className="px-4 py-3 text-left font-medium">Slug</th>
                      <th className="px-4 py-3 text-left font-medium">Domain</th>
                      <th className="px-4 py-3 text-left font-medium">Level</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredComponents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                          {loadingComponents
                            ? "Loading components…"
                            : selectedCourse
                              ? "No knowledge components found for this selection."
                              : "Select a course to view knowledge components."}
                        </td>
                      </tr>
                    ) : (
                      filteredComponents.map((component) => (
                        <tr key={component.id} className="hover:bg-muted/40">
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-medium">{component.name}</span>
                              {component.code && (
                                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                                  {component.code}
                                </span>
                              )}
                              {component.description && (
                                <span className="text-xs text-muted-foreground">
                                  {component.description}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{component.slug}</td>
                          <td className="px-4 py-3">
                            {component.domain ? (
                              <Badge variant="outline">{component.domain.name}</Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">Unassigned</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {component.level ?? (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={component.isActive ? "success" : "secondary"}
                            >
                              {component.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(component)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(component)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <form className="rounded-lg border border-border p-4" onSubmit={handleUpload}>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <div>
                    <Label htmlFor="kc-upload">Upload Spreadsheet</Label>
                    <Input
                      id="kc-upload"
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xls,.xlsx"
                      className="w-64"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Supports CSV or Excel files up to 5MB.
                    </p>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="gap-2"
                  disabled={uploading || !selectedCourse}
                >
                  <FilePlus2 className="h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </form>
          </section>

          <section className="space-y-4 rounded-lg border border-border bg-card p-6">
            <div>
              <h2 className="text-lg font-semibold">
                {formMode === "edit" ? "Edit Knowledge Component" : "Create Knowledge Component"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Fill in the details below to {formMode === "edit" ? "update" : "add"} a knowledge component.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formState.slug}
                  onChange={(event) => handleFormChange("slug", event.target.value)}
                  placeholder="Unique identifier"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formState.name}
                  onChange={(event) => handleFormChange("name", event.target.value)}
                  placeholder="Display name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formState.code ?? ""}
                  onChange={(event) => handleFormChange("code", event.target.value)}
                  placeholder="Optional short code"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formState.description ?? ""}
                  onChange={(event) => handleFormChange("description", event.target.value)}
                  className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Optional description to guide authors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="domainId">Domain *</Label>
                <select
                  id="domainId"
                  value={formState.domainId}
                  onChange={(event) => handleFormChange("domainId", event.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select domain…</option>
                  {domains.map((domain) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentId">Parent Component</Label>
                <select
                  id="parentId"
                  value={formState.parentId ?? ""}
                  onChange={(event) => handleFormChange("parentId", event.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">No parent</option>
                  {parentOptions.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Input
                  id="level"
                  type="number"
                  min={1}
                  value={formState.level === "" ? "" : Number(formState.level)}
                  onChange={(event) =>
                    handleFormChange(
                      "level",
                      event.target.value === ""
                        ? ""
                        : Number.parseInt(event.target.value, 10),
                    )
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">
                    Inactive components won&apos;t appear in selectors.
                  </p>
                </div>
                <Switch
                  checked={formState.isActive}
                  onCheckedChange={(checked) => handleFormChange("isActive", checked)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button type="submit" disabled={submitting || !selectedCourse}>
                  {submitting
                    ? "Saving..."
                    : formMode === "edit"
                    ? "Update Component"
                    : "Create Component"}
                </Button>
                {formMode === "edit" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => resetForm("create")}
                  >
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </section>
        </div>
      </div>
    </FreelancerLayout>
  );
}
