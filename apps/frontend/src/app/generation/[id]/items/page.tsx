"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  apiFetch,
  UnauthorizedError,
  redirectToLogin,
  getAccessToken,
} from "@/app/lib/api";
import { useInterval } from "@/hooks/useInterval";

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

const pageStyle: CSSProperties = {
  maxWidth: 900,
  margin: "3rem auto",
  display: "grid",
  gap: "1.5rem",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};

const itemCardStyle: CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 12,
  padding: "1.5rem",
  display: "grid",
  gap: "0.75rem",
};

const fieldLabel: CSSProperties = {
  display: "grid",
  gap: "0.5rem",
};

const inputStyle: CSSProperties = {
  padding: "0.5rem",
  border: "1px solid #d1d5db",
  borderRadius: 4,
  fontSize: "1rem",
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: "6rem",
};

const actionRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem",
};

const buttonStyle: CSSProperties = {
  padding: "0.5rem 0.9rem",
  borderRadius: 6,
  border: "1px solid #111827",
  backgroundColor: "#111827",
  color: "#ffffff",
  cursor: "pointer",
};

const secondaryButton: CSSProperties = {
  ...buttonStyle,
  backgroundColor: "#ffffff",
  color: "#111827",
};

const dangerButton: CSSProperties = {
  ...buttonStyle,
  backgroundColor: "#991b1b",
  borderColor: "#991b1b",
};

const successButton: CSSProperties = {
  ...buttonStyle,
  backgroundColor: "#047857",
  borderColor: "#047857",
};

const optionRowStyle: CSSProperties = {
  display: "grid",
  gap: "0.35rem",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: "0.75rem",
};

const optionHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "0.5rem",
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

export default function GenerationItemsPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params?.id?.toString() ?? "";

  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalMessage, setGlobalMessage] = useState<string | null>(null);

  const [polling, setPolling] = useState(false);

  const loadItems = useCallback(async () => {
    if (!requestId) {
      return;
    }
    if (!getAccessToken()) {
      redirectToLogin();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`[${new Date().toISOString()}] Fetching items for request ID: ${requestId}`);
      const response = await apiFetch<{ items?: RawItem[] } | RawItem[]>(
        `/generation/requests/${requestId}/items`,
      );
      console.log(`[${new Date().toISOString()}] Received response:`, response);

      const payload = unwrapResponse<{ items?: RawItem[] } | RawItem[]>(
        response,
      );
      console.log(`[${new Date().toISOString()}] Unwrapped payload:`, payload);

      const rawItems = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.items)
        ? payload.items
        : [];
      console.log(`[${new Date().toISOString()}] Parsed raw items (count: ${rawItems.length}):`, rawItems);

      if (rawItems.length > 0) {
        setItems(rawItems.map(normalizeItem));
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
      console.error(`[${new Date().toISOString()}] Error loading items:`, e);
      setPolling(false);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useInterval(
    () => {
      loadItems();
    },
    polling ? 5000 : null,
  );

  const hasItems = useMemo(() => items.length > 0, [items]);

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

  const markSaving = (itemId: string, isSaving: boolean, error: string | null) =>
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isSaving, actionError: error } : item,
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
      setGlobalMessage("Item saved.");
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      markSaving(
        itemId,
        false,
        err instanceof Error ? err.message : "Failed to save item.",
      );
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
      setGlobalMessage("Item approved.");
      await loadItems();
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      setGlobalMessage(
        err instanceof Error ? err.message : "Failed to approve item.",
      );
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
      setGlobalMessage("Item rejected.");
      await loadItems();
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      setGlobalMessage(
        err instanceof Error ? err.message : "Failed to reject item.",
      );
    }
  };

  const itemCountLabel = useMemo(() => {
    const total = items.length;
    if (!total) {
      return "No generated items yet.";
    }
    return `${total} generated item${total === 1 ? "" : "s"}.`;
  }, [items]);

  return (
    <main style={pageStyle}>
      <h1>Review Generated Items</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {globalMessage && <p>{globalMessage}</p>}

      {!loading && !hasItems && (
        <div>
          <p>No generated items yet. Return later once processing has completed or refresh this page.</p>
        </div>
      )}

      {hasItems && (
        <div style={{ display: "grid", gap: "1rem" }}>
          <div style={actionRowStyle}>
            <button
              type="button"
              style={secondaryButton}
              onClick={loadItems}
              disabled={loading}
            >
              Refresh
            </button>
            <span style={{ color: "#4b5563" }}>{itemCountLabel}</span>
          </div>

          {items.map((item, index) => {
            const disableActions = item.status === "converted";
            return (
              <article key={item.id} style={itemCardStyle}>
                <header
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.2rem" }}>
                    {item.type.toUpperCase()} #{index + 1}
                  </h2>
                  <p style={{ margin: 0, color: "#6b7280" }}>
                    Current status: {item.status}
                  </p>
                </div>
                {item.isDirty && (
                  <span
                    style={{
                      alignSelf: "center",
                      padding: "0.25rem 0.75rem",
                      borderRadius: 999,
                      backgroundColor: "#fef3c7",
                      color: "#92400e",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    Unsaved changes
                  </span>
                )}
              </header>

              {disableActions && (
                <p style={{ margin: 0, color: "#047857" }}>
                  This item has already been converted into a MCQ.
                </p>
              )}

              <label style={fieldLabel}>
                <span>Stem / prompt</span>
                <textarea
                  value={item.stem}
                  onChange={(event) => handleStemChange(item.id, event.target.value)}
                  style={textareaStyle}
                  disabled={disableActions}
                />
              </label>

              {item.type === "mcq" && (
                <section style={{ display: "grid", gap: "0.75rem" }}>
                  <h3 style={{ margin: 0 }}>Answer options</h3>
                  {item.options.map((option, optionIndex) => (
                    <div key={optionIndex} style={optionRowStyle}>
                      <div style={optionHeaderStyle}>
                        <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          <input
                            type="checkbox"
                            checked={option.is_correct}
                            onChange={() => handleOptionToggle(item.id, optionIndex)}
                            disabled={disableActions}
                          />
                          <span>Correct answer</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleOptionRemove(item.id, optionIndex)}
                          style={{
                            ...secondaryButton,
                            padding: "0.35rem 0.65rem",
                          }}
                          disabled={disableActions}
                        >
                          Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        value={option.text}
                        onChange={(event) =>
                          handleOptionTextChange(
                            item.id,
                            optionIndex,
                            event.target.value,
                          )
                        }
                        style={inputStyle}
                        placeholder="Option text"
                        disabled={disableActions}
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleAddOption(item.id)}
                    style={secondaryButton}
                    disabled={disableActions}
                  >
                    Add option
                  </button>
                </section>
              )}

              {item.type === "qroc" && (
                <label style={fieldLabel}>
                  <span>Expected answer</span>
                  <input
                    type="text"
                    value={item.expected_answer}
                    onChange={(event) =>
                      handleExpectedAnswerChange(item.id, event.target.value)
                    }
                    style={inputStyle}
                    placeholder="Provide the model answer"
                    disabled={disableActions}
                  />
                </label>
              )}

              {item.actionError && (
                <p style={{ color: "#b91c1c" }} role="alert">
                  {item.actionError}
                </p>
              )}

                <div style={actionRowStyle}>
                  <button
                    type="button"
                    style={secondaryButton}
                    onClick={() => handleSave(item.id)}
                    disabled={item.isSaving || disableActions}
                  >
                    {item.isSaving ? "Saving..." : "Save changes"}
                  </button>
                  <button
                    type="button"
                    style={successButton}
                    onClick={() => handleApprove(item.id)}
                    disabled={disableActions}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    style={dangerButton}
                    onClick={() => handleReject(item.id)}
                    disabled={disableActions}
                  >
                    Reject
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
