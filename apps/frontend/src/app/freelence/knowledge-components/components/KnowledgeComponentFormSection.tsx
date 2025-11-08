import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { FormState, SelectOption } from "../types";

export type KnowledgeComponentFormSectionProps = {
  formMode: "create" | "edit";
  formState: FormState;
  domains: SelectOption[];
  parentOptions: SelectOption[];
  submitting: boolean;
  selectedCourse?: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: (field: keyof FormState, value: string | boolean | number | "") => void;
  onCancelEdit: () => void;
};

export function KnowledgeComponentFormSection({
  formMode,
  formState,
  domains,
  parentOptions,
  submitting,
  selectedCourse,
  onSubmit,
  onChange,
  onCancelEdit,
}: KnowledgeComponentFormSectionProps) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">
          {formMode === "edit" ? "Edit Knowledge Component" : "Create Knowledge Component"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Fill in the details below to {formMode === "edit" ? "update" : "add"} a
          knowledge component.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={formState.slug}
            onChange={(event) => onChange("slug", event.target.value)}
            placeholder="Unique identifier"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formState.name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="Display name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Code</Label>
          <Input
            id="code"
            value={formState.code ?? ""}
            onChange={(event) => onChange("code", event.target.value)}
            placeholder="Optional short code"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={formState.description ?? ""}
            onChange={(event) => onChange("description", event.target.value)}
            className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Optional description to guide authors"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="domainId">Domain *</Label>
          <select
            id="domainId"
            value={formState.domainId}
            onChange={(event) => onChange("domainId", event.target.value)}
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
            onChange={(event) => onChange("parentId", event.target.value)}
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
              onChange(
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
            onCheckedChange={(checked) => onChange("isActive", checked)}
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
            <Button type="button" variant="outline" onClick={onCancelEdit}>
              Cancel Edit
            </Button>
          )}
        </div>
      </form>
    </section>
  );
}
