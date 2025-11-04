"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import secureLocalStorage from "react-secure-storage";
import BaseUrl from "@/components/BaseUrl";

const FINAL_STATUSES = new Set([
  "completed",
  "failed",
  "cancelled",
  "aborted",
  "finished",
]);

const normalizeJobPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const stats = payload?.stats ?? payload?.metrics ?? {};
  const results = Array.isArray(payload?.results)
    ? payload.results
    : Array.isArray(payload?.items)
    ? payload.items
    : [];

  const processed =
    payload?.processed ??
    stats?.processed ??
    (Array.isArray(results) ? results.length : 0);

  const total =
    payload?.total ??
    stats?.total ??
    payload?.mcqCount ??
    payload?.count ??
    processed;

  const autoApplied =
    payload?.autoApplied ??
    payload?.applied ??
    stats?.autoApplied ??
    stats?.applied ??
    0;

  const needsReview =
    payload?.needsReview ??
    payload?.manualReview ??
    stats?.needsReview ??
    stats?.manualReview ??
    0;

  const estimatedTimeRemaining =
    payload?.estimatedTimeRemaining ??
    payload?.eta ??
    stats?.estimatedTimeRemaining ??
    null;

  const status =
    payload?.status ??
    payload?.state ??
    payload?.jobStatus ??
    (processed >= total ? "completed" : "unknown");

  return {
    status: typeof status === "string" ? status.toLowerCase() : "unknown",
    total,
    processed,
    autoApplied,
    needsReview,
    estimatedTimeRemaining,
    results,
    raw: payload,
  };
};

const BulkKcSuggestionProgressModal = ({
  open,
  job,
  onClose,
  onComplete,
  onAbort,
}) => {
  const [jobState, setJobState] = useState(null);
  const [pollingError, setPollingError] = useState(null);
  const [aborting, setAborting] = useState(false);

  useEffect(() => {
    if (!open || !job?.jobId) {
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const token = secureLocalStorage.getItem("token");
        if (!token) {
          throw new Error("Authentification requise pour suivre la progression.");
        }

        const response = await BaseUrl.get(
          `/kc-suggestion/jobs/${job.jobId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (cancelled) {
          return;
        }

        const payload = response?.data?.data ?? response?.data ?? {};
        const normalized = normalizeJobPayload(payload);

        setJobState(normalized);
        setPollingError(null);

        if (FINAL_STATUSES.has(normalized.status)) {
          onComplete?.({
            job,
            ...normalized,
          });
        }
      } catch (err) {
        if (cancelled) {
          return;
        }
        const message =
          err?.response?.data?.message ??
          err?.message ??
          "Impossible de récupérer la progression.";
        setPollingError(message);
      }
    };

    poll();
    const interval = setInterval(poll, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [job, onComplete, open]);

  useEffect(() => {
    if (!open) {
      setJobState(null);
      setPollingError(null);
      setAborting(false);
    }
  }, [open]);

  const isFinal = useMemo(
    () => (jobState ? FINAL_STATUSES.has(jobState.status) : false),
    [jobState],
  );

  const handleAbort = async () => {
    if (!job?.jobId || isFinal) {
      return;
    }
    setAborting(true);
    try {
      const token = secureLocalStorage.getItem("token");
      if (!token) {
        throw new Error("Authentification requise pour annuler la tâche.");
      }
      await BaseUrl.post(
        `/kc-suggestion/jobs/${job.jobId}/abort`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success("La tâche a été annulée.");
      onAbort?.(job);
    } catch (err) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Impossible d'annuler la tâche.";
      toast.error(message);
    } finally {
      setAborting(false);
    }
  };

  if (!open || !job) {
    return null;
  }

  const totalPlanned = jobState?.total ?? job?.total ?? job?.mcqIds?.length ?? 0;
  const processed = jobState?.processed ?? 0;
  const autoApplied = jobState?.autoApplied ?? 0;
  const needsReview = jobState?.needsReview ?? 0;
  const percentage =
    totalPlanned > 0 ? Math.min(100, Math.round((processed / totalPlanned) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-10 backdrop-blur-sm">
      <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
              Traitement en cours
            </p>
            <h2 className="text-lg font-semibold text-slate-900">
              Suggestions KC – {job.courseName ?? "Cours"}
            </h2>
            <p className="text-sm text-slate-500">
              {totalPlanned} question
              {totalPlanned > 1 ? "s" : ""} en file d’attente.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:text-slate-900"
          >
            Fermer
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
                <span>Progression</span>
                <span>{percentage}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span>
                  Traitées :{" "}
                  <span className="font-semibold text-slate-700">
                    {processed}/{totalPlanned}
                  </span>
                </span>
                <span>
                  Appliquées automatiquement :{" "}
                  <span className="font-semibold text-emerald-600">
                    {autoApplied}
                  </span>
                </span>
                <span>
                  À vérifier :{" "}
                  <span className="font-semibold text-amber-600">
                    {needsReview}
                  </span>
                </span>
                {jobState?.estimatedTimeRemaining ? (
                  <span>
                    Temps estimé restant :{" "}
                    <span className="font-semibold text-slate-700">
                      {jobState.estimatedTimeRemaining}
                    </span>
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {pollingError ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {pollingError}
            </div>
          ) : null}

          <div className="mt-6 space-y-3">
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-full border border-slate-200 px-3 py-1">
                Tâche #{job.jobId}
              </span>
              <span className="rounded-full border border-slate-200 px-3 py-1 capitalize">
                Statut : {jobState?.status ?? "inconnu"}
              </span>
              {!isFinal && (
                <button
                  type="button"
                  onClick={handleAbort}
                  disabled={aborting}
                  className="rounded-full border border-rose-200 px-3 py-1 font-semibold text-rose-600 transition-colors duration-200 hover:border-rose-300 hover:text-rose-700 disabled:cursor-not-allowed disabled:border-rose-100 disabled:text-rose-300"
                >
                  {aborting ? "Annulation…" : "Annuler la tâche"}
                </button>
              )}
            </div>

            {Array.isArray(jobState?.results) && jobState.results.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                <h3 className="text-sm font-semibold text-slate-800">
                  Derniers éléments traités
                </h3>
                <ul className="mt-2 flex flex-col gap-2 text-xs text-slate-500">
                  {jobState.results.slice(-5).map((item) => (
                    <li key={item?.mcqId ?? item?.id ?? Math.random()}>
                      <span className="font-semibold text-slate-700">
                        {item?.mcqId ?? item?.id ?? "MCQ"}
                      </span>{" "}
                      • Confiance :{" "}
                      <span className="capitalize">
                        {item?.confidence ?? item?.confidenceLevel ?? "n/a"}
                      </span>{" "}
                      • Suggestions :{" "}
                      {Array.isArray(item?.suggestions)
                        ? item.suggestions
                            .slice(0, 3)
                            .map(
                              (s) =>
                                s?.slug ??
                                s?.kc_slug ??
                                s?.name ??
                                "Suggestion",
                            )
                            .join(", ")
                        : "—"}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:text-slate-900"
          >
            {isFinal ? "Fermer" : "Revenir plus tard"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkKcSuggestionProgressModal;
