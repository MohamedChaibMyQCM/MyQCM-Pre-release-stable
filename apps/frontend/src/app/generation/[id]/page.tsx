"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  apiFetch,
  UnauthorizedError,
  getAccessToken,
  redirectToLogin,
} from "@/app/lib/api";

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
  university?: GenerationEntity;
  faculty?: GenerationEntity;
  unit?: GenerationEntity;
  subject?: GenerationEntity;
  course?: GenerationEntity;
  [key: string]: unknown;
};

const unwrapResponse = <T,>(payload: any): T =>
  (payload?.data ?? payload) as T;

const wrapperStyle: CSSProperties = {
  maxWidth: 720,
  margin: "3rem auto",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  display: "grid",
  gap: "1.5rem",
};

const statusChip: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.25rem 0.75rem",
  borderRadius: 999,
  fontSize: "0.875rem",
  fontWeight: 600,
  backgroundColor: "#e0e7ff",
  color: "#1e3a8a",
};

const cardStyle: CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 12,
  padding: "1.25rem",
  display: "grid",
  gap: "0.75rem",
};

const listStyle: CSSProperties = {
  display: "grid",
  gap: "0.35rem",
};

const linkStyle: CSSProperties = {
  display: "inline-block",
  padding: "0.5rem 0.75rem",
  borderRadius: 6,
  border: "1px solid #111827",
  textDecoration: "none",
  color: "#111827",
  fontWeight: 600,
};

const pollStatuses = new Set([
  "awaiting_upload",
  "upload_in_progress",
  "processing",
]);

const shouldShowItemsLink = (status: string) => {
  const normalized = status.toLowerCase();
  return normalized === "ready_for_review" || normalized === "completed";
};

const shouldShowFinalizeLink = (status: string) =>
  status.toLowerCase() === "ready_for_review";

export default function GenerationRequestPage() {
  const params = useParams();
  const requestId = params?.id?.toString() ?? "";

  const [request, setRequest] = useState<GenerationRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) {
      return;
    }

    // Validate that requestId is a valid UUID to prevent invalid API calls
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(requestId)) {
      setError("Invalid generation request ID. Please use a valid request URL.");
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
          `/generation/requests/${requestId}`,
        );
        if (cancelled) {
          return;
        }
        const data = unwrapResponse<GenerationRequest>(response);
        setRequest(data);
        setError(null);
        if (intervalId && data?.status && !pollStatuses.has(data.status)) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } catch (err) {
        if (cancelled) {
          return;
        }
        if (err instanceof UnauthorizedError) {
          redirectToLogin();
          return;
        }
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load generation request.");
        }
      }
    };

    fetchRequest();
    intervalId = setInterval(fetchRequest, 4000);

    return () => {
      cancelled = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [requestId]);

  const parsedRequestedCounts = useMemo(() => {
    if (!request) {
      return [];
    }
    const counts: [string, number][] = [];
    if (typeof request.requested_mcq_count === "number") {
      counts.push(["mcq", request.requested_mcq_count]);
    }
    if (typeof request.requested_qroc_count === "number") {
      counts.push(["qroc", request.requested_qroc_count]);
    }
    return counts;
  }, [request]);

  return (
    <main style={wrapperStyle}>
      <header>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          Generation Request
        </h1>
        <p style={{ color: "#6b7280" }}>
          Track the processing status and jump to review or finalization once
          items are ready.
        </p>
      </header>

      {error && (
        <p style={{ color: "#b91c1c" }} role="alert">
          {error}
        </p>
      )}

      {request ? (
        <section style={cardStyle}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <span style={statusChip}>{request.status ?? "UNKNOWN"}</span>
            {request.failureReason && (
              <span
                style={{
                  ...statusChip,
                  backgroundColor: "#fee2e2",
                  color: "#991b1b",
                }}
              >
                Failed: {request.failureReason}
              </span>
            )}
          </div>

          <dl style={listStyle}>
            <div>
              <dt style={{ fontWeight: 600 }}>Request ID</dt>
              <dd>{request.id}</dd>
            </div>
            {request.university?.name && (
              <div>
                <dt style={{ fontWeight: 600 }}>University</dt>
                <dd>{request.university.name}</dd>
              </div>
            )}
            {request.faculty?.name && (
              <div>
                <dt style={{ fontWeight: 600 }}>Faculty</dt>
                <dd>{request.faculty.name}</dd>
              </div>
            )}
            {request.year_of_study && (
              <div>
                <dt style={{ fontWeight: 600 }}>Year of study</dt>
                <dd>{request.year_of_study}</dd>
              </div>
            )}
            {request.unit?.name && (
              <div>
                <dt style={{ fontWeight: 600 }}>Unit</dt>
                <dd>{request.unit.name}</dd>
              </div>
            )}
            {request.subject?.name && (
              <div>
                <dt style={{ fontWeight: 600 }}>Module</dt>
                <dd>{request.subject.name}</dd>
              </div>
            )}
            {request.course?.name && (
              <div>
                <dt style={{ fontWeight: 600 }}>Course</dt>
                <dd>{request.course.name}</dd>
              </div>
            )}
            {request.difficulty && (
              <div>
                <dt style={{ fontWeight: 600 }}>Difficulty</dt>
                <dd>
                  {request.difficulty.charAt(0).toUpperCase() +
                    request.difficulty.slice(1)}
                </dd>
              </div>
            )}
            {request.content_types && request.content_types.length > 0 && (
              <div>
                <dt style={{ fontWeight: 600 }}>Content types</dt>
                <dd>{request.content_types.join(", ")}</dd>
              </div>
            )}
            {parsedRequestedCounts.length > 0 && (
              <div>
                <dt style={{ fontWeight: 600 }}>Requested counts</dt>
                <dd>
                  {parsedRequestedCounts
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(" · ")}
                </dd>
              </div>
            )}
            {request.source_file_name && (
              <div>
                <dt style={{ fontWeight: 600 }}>Source document</dt>
                <dd>{request.source_file_name}</dd>
              </div>
            )}
            {request.createdAt && (
              <div>
                <dt style={{ fontWeight: 600 }}>Created</dt>
                <dd>{new Date(request.createdAt).toLocaleString()}</dd>
              </div>
            )}
            {request.updatedAt && (
              <div>
                <dt style={{ fontWeight: 600 }}>Last updated</dt>
                <dd>{new Date(request.updatedAt).toLocaleString()}</dd>
              </div>
            )}
          </dl>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {shouldShowItemsLink(request.status ?? "") && (
              <Link href={`/generation/${requestId}/items`} style={linkStyle}>
                Review generated items
              </Link>
            )}
            {shouldShowFinalizeLink(request.status ?? "") && (
              <Link
                href={`/generation/${requestId}/finalize`}
                style={{ ...linkStyle, borderColor: "#047857", color: "#047857" }}
              >
                Finalize batch
              </Link>
            )}
            <Link
              href="/freelence/dashboard"
              style={{ ...linkStyle, color: "#2563eb", borderColor: "#2563eb" }}
            >
              Start another request
            </Link>
          </div>
        </section>
      ) : (
        !error && <p>Loading request...</p>
      )}
    </main>
  );
}

