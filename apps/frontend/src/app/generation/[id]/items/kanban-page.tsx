"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { FreelancerLayout } from "@/components/freelancer/FreelancerLayout";
import { KanbanBoard, KanbanCard, KanbanColumn, KanbanItem } from "@/components/ui/kanban";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Edit,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
  CheckCheck,
} from "lucide-react";
import {
  apiFetch,
  UnauthorizedError,
  redirectToLogin,
  getAccessToken,
} from "@/app/lib/api";
import toast from "react-hot-toast";

type RawOption = {
  id?: string;
  text?: string;
  content?: string;
  is_correct?: boolean;
};

type RawItem = {
  id: string;
  type: string;
  stem?: string;
  body?: string;
  status?: string;
  options?: RawOption[];
  expected_answer?: string;
};

type ItemData = {
  id: string;
  type: string;
  stem: string;
  options: { id: string; text: string; is_correct: boolean }[];
  expected_answer: string;
  status: string;
};

const unwrapResponse = <T,>(payload: any): T =>
  (payload?.data ?? payload) as T;

const normalizeItem = (raw: RawItem): ItemData => ({
  id: raw.id?.toString() || "",
  type: (raw.type ?? "mcq").toLowerCase(),
  stem: raw.stem ?? raw.body ?? "",
  options: Array.isArray(raw.options)
    ? raw.options.map((opt, idx) => ({
        id: opt.id ?? `opt-${idx}`,
        text: opt.text ?? opt.content ?? "",
        is_correct: Boolean(opt.is_correct),
      }))
    : [],
  expected_answer: raw.expected_answer ?? "",
  status: (raw.status ?? "draft").toLowerCase(),
});

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: "to_review", title: "To Review", color: "bg-warning-light" },
  { id: "approved", title: "Approved", color: "bg-success-light" },
  { id: "rejected", title: "Rejected", color: "bg-destructive/10" },
];

export default function KanbanItemsReviewPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params?.id?.toString() ?? "";

  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<ItemData[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [editingItem, setEditingItem] = React.useState<ItemData | null>(null);
  const [saving, setSaving] = React.useState(false);

  // Filter states
  const [typeFilter, setTypeFilter] = React.useState<string>("all");

  const loadItems = React.useCallback(async () => {
    if (!requestId || !getAccessToken()) {
      redirectToLogin();
      return;
    }

    try {
      setLoading(true);
      const response = await apiFetch<{ items?: RawItem[] } | RawItem[]>(
        `/generation/requests/${requestId}/items`
      );

      const payload = unwrapResponse<{ items?: RawItem[] } | RawItem[]>(response);
      const rawItems = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.items)
        ? payload.items
        : [];

      setItems(rawItems.map(normalizeItem));
      setError(null);
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      setError("Failed to load items");
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  React.useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleItemMove = async (
    itemId: string,
    fromColumnId: string,
    toColumnId: string
  ) => {
    if (fromColumnId === toColumnId) return;

    // Optimistic update
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, status: toColumnId } : item
      )
    );

    try {
      // Call appropriate API based on destination
      if (toColumnId === "approved") {
        await apiFetch(`/generation/requests/${requestId}/items/${itemId}/approve`, {
          method: "POST",
        });
        toast.success("Item approved");
      } else if (toColumnId === "rejected") {
        await apiFetch(`/generation/requests/${requestId}/items/${itemId}/reject`, {
          method: "POST",
          body: { reason: "Moved to rejected via Kanban" },
        });
        toast.success("Item rejected");
      }
    } catch (e) {
      // Revert on error
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, status: fromColumnId } : item
        )
      );
      toast.error("Failed to update item status");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        stem: editingItem.stem,
        type: editingItem.type,
      };

      if (editingItem.type === "mcq") {
        payload.options = editingItem.options.map((opt) => ({
          id: opt.id,
          content: opt.text,
          is_correct: opt.is_correct,
        }));
      }

      if (editingItem.type === "qroc") {
        payload.expected_answer = editingItem.expected_answer;
      }

      await apiFetch(`/generation/requests/${requestId}/items/${editingItem.id}`, {
        method: "PUT",
        body: payload,
      });

      setItems((prev) =>
        prev.map((item) => (item.id === editingItem.id ? editingItem : item))
      );

      toast.success("Item saved");
      setEditingItem(null);
    } catch (e) {
      toast.error("Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkApprove = async () => {
    const toReviewItems = items.filter((item) => item.status === "to_review");
    if (toReviewItems.length === 0) {
      toast("No items to approve");
      return;
    }

    try {
      await Promise.all(
        toReviewItems.map((item) =>
          apiFetch(`/generation/requests/${requestId}/items/${item.id}/approve`, {
            method: "POST",
          })
        )
      );

      setItems((prev) =>
        prev.map((item) =>
          item.status === "to_review" ? { ...item, status: "approved" } : item
        )
      );

      toast.success(`Approved ${toReviewItems.length} items`);
    } catch (e) {
      toast.error("Failed to approve all items");
    }
  };

  const kanbanItems: KanbanItem[] = React.useMemo(() => {
    let filtered = items;

    if (typeFilter !== "all") {
      filtered = filtered.filter((item) => item.type === typeFilter);
    }

    return filtered.map((item) => ({
      id: item.id,
      columnId: item.status === "approved" ? "approved" : item.status === "rejected" ? "rejected" : "to_review",
      ...item,
    }));
  }, [items, typeFilter]);

  const stats = React.useMemo(() => {
    const total = items.length;
    const approved = items.filter((i) => i.status === "approved").length;
    const toReview = items.filter(
      (i) => i.status !== "approved" && i.status !== "rejected"
    ).length;
    const rejected = items.filter((i) => i.status === "rejected").length;

    return {
      total,
      approved,
      toReview,
      rejected,
      progress: total > 0 ? (approved / total) * 100 : 0,
    };
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
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <button
              onClick={() => router.push("/freelence/dashboard")}
              className="hover:text-foreground"
            >
              Dashboard
            </button>
            <span>/</span>
            <button
              onClick={() => router.push(`/generation/${requestId}`)}
              className="hover:text-foreground"
            >
              Request
            </button>
            <span>/</span>
            <span>Review Items</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Review Items</h1>
              <p className="text-muted-foreground">
                Drag items between columns to change their status
              </p>
            </div>
          </div>
        </div>

        {/* Stats & Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card p-4">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{stats.toReview}</p>
              <p className="text-xs text-muted-foreground">To Review</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">{stats.approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{stats.rejected}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All Types</option>
              <option value="mcq">MCQ Only</option>
              <option value="qroc">QROC Only</option>
            </select>

            <button
              onClick={handleBulkApprove}
              disabled={stats.toReview === 0}
              className="inline-flex items-center gap-2 rounded-md bg-success px-4 py-2 text-sm font-medium text-success-foreground transition-colors hover:bg-success/90 disabled:pointer-events-none disabled:opacity-50"
            >
              <CheckCheck className="h-4 w-4" />
              Approve All
            </button>

            <button
              onClick={loadItems}
              className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {stats.approved} of {stats.total} approved
            </span>
          </div>
          <Progress value={stats.progress} variant="success" showLabel />
        </div>

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Kanban Board */}
        <KanbanBoard
          columns={KANBAN_COLUMNS}
          items={kanbanItems}
          onItemMove={handleItemMove}
          renderItem={(item) => (
            <KanbanCard>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="text-xs">
                    {item.type.toUpperCase()}
                  </Badge>
                  <button
                    onClick={() => setEditingItem(item as ItemData)}
                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>

                <p className="line-clamp-3 text-sm">{item.stem}</p>

                {item.type === "mcq" && (
                  <div className="space-y-1">
                    {item.options.slice(0, 2).map((opt: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        {opt.is_correct ? (
                          <CheckCircle2 className="h-3 w-3 text-success" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        <span className="line-clamp-1">{opt.text}</span>
                      </div>
                    ))}
                    {item.options.length > 2 && (
                      <p className="text-xs text-muted-foreground">
                        +{item.options.length - 2} more options
                      </p>
                    )}
                  </div>
                )}

                {item.type === "qroc" && item.expected_answer && (
                  <div className="rounded bg-muted p-2">
                    <p className="text-xs text-muted-foreground">Expected answer:</p>
                    <p className="line-clamp-2 text-xs font-medium">
                      {item.expected_answer}
                    </p>
                  </div>
                )}
              </div>
            </KanbanCard>
          )}
        />

        {/* Item Editor Dialog */}
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Edit {editingItem?.type.toUpperCase()} Item
              </DialogTitle>
            </DialogHeader>

            {editingItem && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Question Stem</label>
                  <textarea
                    value={editingItem.stem}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, stem: e.target.value })
                    }
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                {editingItem.type === "mcq" && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Answer Options</label>
                    {editingItem.options.map((opt, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="checkbox"
                          checked={opt.is_correct}
                          onChange={() => {
                            const newOptions = [...editingItem.options];
                            newOptions[idx].is_correct = !opt.is_correct;
                            setEditingItem({ ...editingItem, options: newOptions });
                          }}
                          className="mt-1 h-4 w-4 rounded border-input text-primary"
                        />
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const newOptions = [...editingItem.options];
                            newOptions[idx].text = e.target.value;
                            setEditingItem({ ...editingItem, options: newOptions });
                          }}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {editingItem.type === "qroc" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Expected Answer</label>
                    <input
                      type="text"
                      value={editingItem.expected_answer}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          expected_answer: e.target.value,
                        })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <button
                onClick={() => setEditingItem(null)}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </FreelancerLayout>
  );
}
