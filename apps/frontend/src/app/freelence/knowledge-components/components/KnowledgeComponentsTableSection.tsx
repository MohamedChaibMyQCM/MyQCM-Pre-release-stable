import * as React from "react";
import Link from "next/link";
import { Download, FilePlus2, RefreshCw } from "lucide-react";

import {
  CourseContext,
  CourseContextSelector,
} from "@/components/forms/CourseContextSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import { KnowledgeComponentRow, SelectOption } from "../types";

export type KnowledgeComponentsTableSectionProps = {
  courseContext: CourseContext;
  onCourseContextChange: (context: CourseContext) => void;
  selectedDomainFilter: string;
  onDomainFilterChange: (value: string) => void;
  domains: SelectOption[];
  filteredComponents: KnowledgeComponentRow[];
  loadingComponents: boolean;
  selectedCourse?: string;
  templateUrl: string;
  onRefresh: () => void;
  onEdit: (component: KnowledgeComponentRow) => void;
  onDelete: (component: KnowledgeComponentRow) => void;
  uploading: boolean;
  onUpload: (event: React.FormEvent<HTMLFormElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
};

export function KnowledgeComponentsTableSection(
  props: KnowledgeComponentsTableSectionProps,
) {
  const {
    courseContext,
    onCourseContextChange,
    selectedDomainFilter,
    onDomainFilterChange,
    domains,
    filteredComponents,
    loadingComponents,
    selectedCourse,
    templateUrl,
    onRefresh,
    onEdit,
    onDelete,
    uploading,
    onUpload,
    fileInputRef,
  } = props;

  return (
    <section className="space-y-6 rounded-lg border border-border bg-card p-6">
      <div className="space-y-6">
        <div>
          <Label className="mb-2 block text-sm font-medium">Course Context</Label>
          <CourseContextSelector
            value={courseContext}
            onChange={onCourseContextChange}
          />
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Label htmlFor="domain-filter">Domain Filter</Label>
            <select
              id="domain-filter"
              value={selectedDomainFilter}
              onChange={(event) => onDomainFilterChange(event.target.value)}
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
            <Button variant="outline" asChild className="gap-2">
              <Link href={templateUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
                Download Template
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={onRefresh}
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
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-muted-foreground"
                  >
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
                    <td className="px-4 py-3 text-muted-foreground">
                      {component.slug}
                    </td>
                    <td className="px-4 py-3">
                      {component.domain ? (
                        <Badge variant="outline">{component.domain.name}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {component.level ?? (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={component.isActive ? "success" : "secondary"}>
                        {component.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(component)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onDelete(component)}
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

      <form className="rounded-lg border border-border p-4" onSubmit={onUpload}>
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
          <Button type="submit" className="gap-2" disabled={uploading || !selectedCourse}>
            <FilePlus2 className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </form>
    </section>
  );
}
