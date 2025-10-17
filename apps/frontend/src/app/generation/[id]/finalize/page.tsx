"use client";

import { useState, type CSSProperties } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  apiFetch,
  UnauthorizedError,
  redirectToLogin,
  getAccessToken,
} from "@/app/lib/api";

const wrapperStyle: CSSProperties = {
  maxWidth: 560,
  margin: "4rem auto",
  display: "grid",
  gap: "1.5rem",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};

const cardStyle: CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 12,
  padding: "1.5rem",
  display: "grid",
  gap: "0.75rem",
};

const buttonStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  borderRadius: 6,
  border: "none",
  backgroundColor: "#047857",
  color: "#ffffff",
  fontSize: "1rem",
  cursor: "pointer",
};

const secondaryButton: CSSProperties = {
  padding: "0.75rem 1rem",
  borderRadius: 6,
  border: "1px solid #111827",
  backgroundColor: "#ffffff",
  color: "#111827",
  fontSize: "1rem",
  cursor: "pointer",
};

export default function FinalizeGenerationPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params?.id?.toString() ?? "";

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFinalize = async () => {
    if (!requestId) {
      setError("Missing generation request id.");
      return;
    }
    if (!getAccessToken()) {
      redirectToLogin();
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await apiFetch(`/generation/requests/${requestId}/finalize`, {
        method: "POST",
      });
      setSuccess("Generation batch finalized successfully.");
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to finalize generation request.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={wrapperStyle}>
      <header>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          Finalize Generation Request
        </h1>
        <p style={{ color: "#6b7280" }}>
          Confirm that the reviewed items are ready to publish. This will mark
          the request as completed and make the questions available downstream.
        </p>
      </header>

      <section style={cardStyle}>
        <p>
          Finalizing locks the reviewed items and signals the backend to publish
          the generated content. Ensure all MCQs and QROCs are approved before
          continuing.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            type="button"
            style={buttonStyle}
            onClick={handleFinalize}
            disabled={submitting}
          >
            {submitting ? "Finalizing..." : "Finalize batch"}
          </button>
          <button
            type="button"
            style={secondaryButton}
            onClick={() => router.push(`/generation/${requestId}`)}
          >
            Back to status
          </button>
        </div>

        {success && (
          <p style={{ color: "#047857" }} role="status">
            {success}
          </p>
        )}
        {error && (
          <p style={{ color: "#b91c1c" }} role="alert">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
