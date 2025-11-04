"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FreelancerLayout } from "@/components/freelancer/FreelancerLayout";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  XCircle,
  Edit,
  ClipboardList,
  AlertCircle,
  Search,
  CheckCheck,
} from "lucide-react";
import {
  apiFetch,
  UnauthorizedError,
  redirectToLogin,
  getAccessToken,
} from "@/app/lib/api";
import toast from "react-hot-toast";

type PendingMcq = {
  id: string;
  question: string;
  type: string;
  difficulty: string;
  quiz_type: string;
  estimated_time: number;
  approval_status: string;
  course?: { name: string };
  options?: { content: string; is_correct: boolean }[];
};

const unwrapResponse = <T,>(payload: any): T =>
  (payload?.data ?? payload) as T;

export default function PendingReviewPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<PendingMcq[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCourse, setSelectedCourse] = React.useState("all");
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set());

  const loadPendingItems = React.useCallback(async () => {
    if (!getAccessToken()) {
      redirectToLogin();
      return;
    }

    try {
      setLoading(true);
      const query = new URLSearchParams({
        approval_status: "pending",
        offset: "200",
      });

      const response = await apiFetch<any>(`/mcq/freelancer?${query.toString()}`);
      const payload = unwrapResponse<any>(response);
      const rawItems = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : [];

      setItems(rawItems);
      setError(null);
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      setError("Failed to load pending items");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPendingItems();
  }, [loadPendingItems]);

  const handleApprove = async (mcqId: string) => {
    try {
      await apiFetch(`/mcq/${mcqId}/approve`, { method: "POST" });
      setItems((prev) => prev.filter((item) => item.id !== mcqId));
      toast.success("Item approved");
    } catch (e) {
      toast.error("Failed to approve item");
    }
  };

  const handleReject = async (mcqId: string) => {
    try {
      await apiFetch(`/mcq/${mcqId}`, { method: "DELETE" });
      setItems((prev) => prev.filter((item) => item.id !== mcqId));
      toast.success("Item rejected");
    } catch (e) {
      toast.error("Failed to reject item");
    }
  };

  const handleBulkApprove = async () => {
    if (selectedItems.size === 0) {
      toast("No items selected");
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedItems).map((id) =>
          apiFetch(`/mcq/${id}/approve`, { method: "POST" })
        )
      );

      setItems((prev) =>
        prev.filter((item) => !selectedItems.has(item.id))
      );
      setSelectedItems(new Set());
      toast.success(`Approved ${selectedItems.size} items`);
    } catch (e) {
      toast.error("Failed to approve selected items");
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map((item) => item.id)));
    }
  };

  const filteredItems = React.useMemo(() => {
    let filtered = items;

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCourse !== "all") {
      filtered = filtered.filter(
        (item) => item.course?.name === selectedCourse
      );
    }

    return filtered;
  }, [items, searchQuery, selectedCourse]);

  const uniqueCourses = React.useMemo(() => {
    const courses = new Set(items.map((item) => item.course?.name).filter(Boolean));
    return Array.from(courses);
  }, [items]);

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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Review</h1>
          <p className="text-muted-foreground">
            Review and approve MCQs awaiting your approval
          </p>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All Courses</option>
            {uniqueCourses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>

          <button
            onClick={handleBulkApprove}
            disabled={selectedItems.size === 0}
            className="inline-flex items-center gap-2 rounded-md bg-success px-4 py-2 text-sm font-medium text-success-foreground transition-colors hover:bg-success/90 disabled:pointer-events-none disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            Approve Selected ({selectedItems.size})
          </button>

          <button
            onClick={loadPendingItems}
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-4 rounded-lg border bg-card p-4">
          <div>
            <p className="text-2xl font-bold">{filteredItems.length}</p>
            <p className="text-xs text-muted-foreground">Items Pending</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{selectedItems.size}</p>
            <p className="text-xs text-muted-foreground">Selected</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No pending items"
            description={
              searchQuery || selectedCourse !== "all"
                ? "Try adjusting your filters"
                : "All caught up! No items awaiting review."
            }
          />
        ) : (
          <div className="space-y-4">
            {/* Select all */}
            <div className="flex items-center gap-2 rounded-lg border bg-card p-3">
              <input
                type="checkbox"
                checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-input text-primary"
              />
              <span className="text-sm font-medium">
                Select all ({filteredItems.length} items)
              </span>
            </div>

            {/* Items */}
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex gap-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleSelectItem(item.id)}
                    className="mt-1 h-4 w-4 rounded border-input text-primary"
                  />

                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {item.type?.toUpperCase() || "MCQ"}
                        </Badge>
                        <Badge variant="secondary" className="capitalize">
                          {item.difficulty}
                        </Badge>
                        {item.course?.name && (
                          <span className="text-sm text-muted-foreground">
                            {item.course.name}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.estimated_time}s
                      </span>
                    </div>

                    {/* Question */}
                    <p className="text-sm leading-relaxed">{item.question}</p>

                    {/* Options */}
                    {item.options && item.options.length > 0 && (
                      <div className="space-y-1">
                        {item.options.slice(0, 3).map((opt, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm"
                          >
                            {opt.is_correct ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className={opt.is_correct ? "font-medium" : ""}>
                              {opt.content}
                            </span>
                          </div>
                        ))}
                        {item.options.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{item.options.length - 3} more options
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="inline-flex items-center gap-1 rounded-md bg-success px-3 py-1.5 text-xs font-medium text-success-foreground transition-colors hover:bg-success/90"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <XCircle className="h-3 w-3" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FreelancerLayout>
  );
}
