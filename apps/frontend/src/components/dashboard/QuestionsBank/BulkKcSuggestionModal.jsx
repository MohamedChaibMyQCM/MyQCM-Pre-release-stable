"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import secureLocalStorage from "react-secure-storage";
import BaseUrl from "@/components/BaseUrl";
import { emitAnalyticsEvent } from "@/utils/analytics";

const DEFAULT_PAGE_SIZE = 200;
const TOKENS_PER_ITEM = Number(
  process.env.NEXT_PUBLIC_KC_SUGGESTION_TOKENS_PER_ITEM || 1200,
);

const mapMcqResponse = (payload) => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload?.results && Array.isArray(payload.results)) {
    return payload.results;
  }

  if (payload?.data?.data && Array.isArray(payload.data.data)) {
    return payload.data.data;
  }

  return [];
};

const sanitizeMcq = (item) => ({
  id: item?.id ?? item?.mcq_id ?? "",
  question: item?.question ?? "",
  difficulty:
    typeof item?.difficulty === "string"
      ? item.difficulty.toLowerCase()
      : item?.difficulty ?? null,
  approval_status:
    typeof item?.approval_status === "string"
      ? item.approval_status.toLowerCase()
      : item?.approval_status ?? null,
  knowledgeComponents: Array.isArray(item?.knowledgeComponents)
    ? item.knowledgeComponents
    : Array.isArray(item?.knowledge_components)
    ? item.knowledge_components
    : [],
});

const BulkKcSuggestionModal = ({
  open,
  courseId,
  courseName,
  onClose,
  onJobStart,
}) => {
  const [loading, setLoading] = useState(false);
  const [mcqs, setMcqs] = useState([]);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !courseId) {
      return;
    }

    let cancelled = false;

    const fetchMcqs = async () => {
      setLoading(true);
      setError(null);
      setSelected([]);
      try {
        const token = secureLocalStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication requise pour charger les MCQ.");
        }

        const response = await BaseUrl.get("/mcq", {
          params: {
            course: courseId,
            offset: DEFAULT_PAGE_SIZE,
            page: 1,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (cancelled) {
          return;
        }

        const payload = response?.data?.data ?? response?.data;
        const rows = mapMcqResponse(payload).map(sanitizeMcq);

        setMcqs(rows.filter((row) => row.id));

        if (rows.length === 0) {
          setError("Aucune question trouvée pour ce cours.");
        }
      } catch (err) {
        if (cancelled) {
          return;
        }
        const message =
          err?.response?.data?.message ??
          err?.message ??
          "Impossible de charger les questions.";
        setError(message);
        toast.error(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchMcqs();

    return () => {
      cancelled = true;
    };
  }, [courseId, open]);

  useEffect(() => {
    if (!open) {
      setConfirming(false);
      setSubmitting(false);
      setSearch("");
      setSelected([]);
      setError(null);
    }
  }, [open]);

  const filteredMcqs = useMemo(() => {
    if (!search) {
      return mcqs;
    }
    const needle = search.trim().toLowerCase();
    return mcqs.filter((item) =>
      item.question?.toLowerCase().includes(needle),
    );
  }, [mcqs, search]);

  const toggleSelection = (mcqId) => {
    setSelected((prev) =>
      prev.includes(mcqId)
        ? prev.filter((value) => value !== mcqId)
        : [...prev, mcqId],
    );
  };

  const allVisibleSelected =
    filteredMcqs.length > 0 &&
    filteredMcqs.every((item) => selected.includes(item.id));

  const handleToggleAll = () => {
    if (allVisibleSelected) {
      const filteredIds = new Set(filteredMcqs.map((item) => item.id));
      setSelected((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      const merged = new Set(selected);
      filteredMcqs.forEach((item) => merged.add(item.id));
      setSelected(Array.from(merged));
    }
  };

  const selectedCount = selected.length;
  const estimatedTokens = selectedCount * TOKENS_PER_ITEM;

  const handleSubmit = () => {
    if (selectedCount === 0) {
      toast.error("Sélectionnez au moins une question.");
      return;
    }
    setConfirming(true);
  };

  const handleConfirm = async () => {
    if (selectedCount === 0 || !courseId) {
      setConfirming(false);
      return;
    }
    setSubmitting(true);
    try {
      const token = secureLocalStorage.getItem("token");
      if (!token) {
        throw new Error("Authentification requise pour lancer le traitement.");
      }

      const response = await BaseUrl.post(
        "/kc-suggestion/bulk",
        {
          courseId,
          mcqIds: selected,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const payload = response?.data?.data ?? response?.data ?? {};
      const jobId =
        payload?.jobId ?? payload?.job_id ?? payload?.id ?? payload?.job;

      if (!jobId) {
        throw new Error("Aucun identifiant de tâche renvoyé par le serveur.");
      }

      toast.success("Suggestions KC en file d'attente.");

      emitAnalyticsEvent("kc_suggestion_requested", {
        courseId,
        entrypoint: "bulk",
        mcqCount: selectedCount,
      });

      if (typeof onJobStart === "function") {
        onJobStart({
          jobId,
          courseId,
          courseName,
          mcqIds: selected,
          total: selectedCount,
        });
      }

      setConfirming(false);
      setSelected([]);
      onClose?.();
    } catch (err) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Impossible de lancer la suggestion automatique.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-10 backdrop-blur-sm">
      <div className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
              Suggestions automatiques
            </p>
            <h2 className="text-lg font-semibold text-slate-900">
              {courseName ? `Cours : ${courseName}` : "Cours sélectionné"}
            </h2>
            <p className="text-sm text-slate-500">
              Sélectionnez les questions à enrichir par l’IA.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full border border-slate-200 px-3 py-1">
              {selectedCount} sélectionnée
              {selectedCount > 1 ? "s" : ""}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:text-slate-800"
              disabled={submitting}
            >
              Fermer
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleToggleAll}
                className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 transition-colors duration-200 hover:border-indigo-300 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                disabled={loading || mcqs.length === 0}
              >
                {allVisibleSelected ? "Tout désélectionner" : "Tout sélectionner"}
              </button>
              <button
                type="button"
                onClick={() => setSelected([])}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed"
                disabled={selectedCount === 0}
              >
                Effacer la sélection
              </button>
            </div>
            <div className="flex w-full max-w-sm items-center rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600">
              <input
                type="search"
                placeholder="Filtrer par énoncé…"
                className="w-full border-none bg-transparent outline-none"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="max-h-[50vh] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-sm text-slate-500">
                Chargement des questions…
              </div>
            ) : error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-600">
                {error}
              </div>
            ) : filteredMcqs.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-sm text-slate-500">
                Aucune question ne correspond à ce filtre.
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {filteredMcqs.map((item) => {
                  const isSelected = selected.includes(item.id);
                  return (
                    <li
                      key={item.id}
                      className={`rounded-2xl border px-4 py-3 text-sm shadow-sm transition-colors duration-200 ${
                        isSelected
                          ? "border-indigo-300 bg-white"
                          : "border-transparent bg-white"
                      }`}
                    >
                      <label className="flex cursor-pointer flex-col gap-2">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            checked={isSelected}
                            onChange={() => toggleSelection(item.id)}
                            disabled={submitting}
                          />
                          <div className="flex-1 space-y-1">
                            <p className="font-medium text-slate-800">
                              {item.question && item.question.trim().length > 0
                                ? item.question
                                : "Question sans énoncé"}
                            </p>
                            <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-slate-400">
                              {item.difficulty ? (
                                <span className="rounded-full border border-slate-200 px-2 py-0.5">
                                  Difficulté : {item.difficulty}
                                </span>
                              ) : null}
                              {item.approval_status ? (
                                <span className="rounded-full border border-slate-200 px-2 py-0.5">
                                  Statut : {item.approval_status}
                                </span>
                              ) : null}
                              <span className="rounded-full border border-slate-200 px-2 py-0.5">
                                KC actuelles : {item.knowledgeComponents.length}
                              </span>
                            </div>
                          </div>
                        </div>
                        {item.knowledgeComponents.length > 0 ? (
                          <div className="flex flex-wrap gap-2 pl-7 text-xs text-slate-500">
                            {item.knowledgeComponents.slice(0, 6).map((kc) => (
                              <span
                                key={kc?.id ?? kc}
                                className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5"
                              >
                                {kc?.name ?? kc?.slug ?? kc}
                              </span>
                            ))}
                            {item.knowledgeComponents.length > 6 ? (
                              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-slate-400">
                                +{item.knowledgeComponents.length - 6}
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            {selectedCount > 0 ? (
              <span>
                {selectedCount} question
                {selectedCount > 1 ? "s" : ""} sélectionnée
                {selectedCount > 1 ? "s" : ""} • Estimation :{" "}
                <span className="font-semibold text-indigo-600">
                  ~{estimatedTokens.toLocaleString("fr-FR")} tokens
                </span>
              </span>
            ) : (
              "Sélectionnez des questions pour lancer les suggestions."
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
              disabled={selectedCount === 0 || submitting || loading}
            >
              Lancer les suggestions
            </button>
          </div>
        </div>

        {confirming ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-sm shadow-xl">
              <h3 className="text-base font-semibold text-slate-900">
                Confirmer le lancement
              </h3>
              <p className="mt-2 text-slate-600">
                {selectedCount} question
                {selectedCount > 1 ? "s" : ""} sera
                {selectedCount > 1 ? "ont" : " aura"} envoyée
                {selectedCount > 1 ? "s" : ""} à l’IA. Estimation de coût :{" "}
                <span className="font-semibold text-indigo-600">
                  ~{estimatedTokens.toLocaleString("fr-FR")} tokens
                </span>
                .
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  disabled={submitting}
                >
                  {submitting ? "Envoi…" : "Confirmer"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BulkKcSuggestionModal;

