"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import secureLocalStorage from "react-secure-storage";
import BaseUrl from "@/components/BaseUrl";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Target, Zap } from "lucide-react";

const formatSeconds = (seconds) => {
  if (seconds == null || Number.isNaN(seconds)) return "—";
  const total = Math.max(0, Math.round(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
};

const formatTimestamp = (dateString) => {
  if (!dateString) return "—";
  try {
    return format(new Date(dateString), "HH:mm", { locale: fr });
  } catch (err) {
    return "—";
  }
};

const attemptStatus = (attempt) => {
  if (!attempt) {
    return {
      label: "—",
      tone: "muted",
      className: "text-gray-400",
    };
  }
  if (attempt.is_skipped) {
    return {
      label: "Question ignorée",
      tone: "warning",
      className: "text-yellow-500",
    };
  }
  const ratio = attempt.success_ratio ?? -1;
  if (ratio >= 0.99) {
    return { label: "Réponse parfaite", tone: "success", className: "text-emerald-500" };
  }
  if (ratio >= 0.7) {
    return { label: "Réponse partielle", tone: "info", className: "text-sky-400" };
  }
  if (ratio >= 0) {
    return { label: "À améliorer", tone: "danger", className: "text-rose-500" };
  }
  return { label: "—", tone: "muted", className: "text-gray-400" };
};

const OptionRow = ({ option, isSelected, isCorrect }) => {
  const baseClasses =
    "rounded-xl border px-4 py-3 text-sm sm:text-base transition-colors duration-200";
  const selectedClasses = isSelected ? "border-2" : "";

  let stateClasses =
    "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] text-gray-700 dark:text-gray-200";

  if (isSelected && isCorrect) {
    stateClasses =
      "border-emerald-500 bg-emerald-500/10 text-emerald-500 dark:text-emerald-300";
  } else if (isSelected && !isCorrect) {
    stateClasses =
      "border-rose-500 bg-rose-500/10 text-rose-500 dark:text-rose-300";
  } else if (!isSelected && isCorrect) {
    stateClasses =
      "border-sky-500/60 bg-sky-500/10 text-sky-500 dark:text-sky-300";
  }

  return (
    <div className={`${baseClasses} ${selectedClasses} ${stateClasses}`}>
      <div className="flex items-center gap-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {option.label}
        </div>
        <div className="flex-1 leading-relaxed">{option.content}</div>
      </div>
    </div>
  );
};

const ReplayTimelineList = ({ attempts, selectedIndex, onSelect }) => {
  if (!attempts?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Aucun essai enregistré pour cette session.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {attempts.map((attempt, index) => {
        const status = attemptStatus(attempt);
        const isActive = index === selectedIndex;
        return (
          <button
            key={attempt.id}
            onClick={() => onSelect(index)}
            className={`w-full text-left rounded-2xl border px-4 py-3 transition-all ${
              isActive
                ? "border-pink-500/80 bg-pink-500/10 shadow-sm"
                : "border-gray-200 dark:border-gray-800 hover:border-pink-300/60 hover:bg-pink-500/5"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
              <span>Question {index + 1}</span>
              <span>{formatTimestamp(attempt.created_at)}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
              <span className={`rounded-full bg-black/5 px-2.5 py-0.5 text-xs dark:bg-white/5 ${status.className}`}>
                {status.label}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-300">
                <Clock className="h-3 w-3" />
                {formatSeconds(attempt.time_spent)}
              </span>
              {typeof attempt.gained_xp === "number" && attempt.gained_xp !== 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                  <Zap className="h-3 w-3" />
                  {attempt.gained_xp > 0 ? `+${attempt.gained_xp} XP` : `${attempt.gained_xp} XP`}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

const ReplayAttemptDetails = ({ attempt, index }) => {
  if (!attempt) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Sélectionnez une interaction pour afficher les détails.
      </div>
    );
  }

  const status = attemptStatus(attempt);
  const mcq = attempt.mcq;
  const formattedRatio =
    typeof attempt.success_ratio === "number"
      ? `${Math.round(attempt.success_ratio * 100)}%`
      : "—";

  const selectedIds = new Set(
    (attempt.selected_options || []).map((option) => option.id),
  );
  const optionPayload =
    mcq?.options?.map((option, optionIndex) => ({
      id: option.id,
      content: option.content,
      is_correct: option.is_correct,
      label: String.fromCharCode(65 + optionIndex),
      isSelected: selectedIds.has(option.id),
    })) || [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#121212]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Question {index + 1}
            </div>
            <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {mcq?.question || "Question introuvable"}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
              {status.label}
            </span>
            <span className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-900 dark:text-gray-300">
              <Clock className="h-4 w-4" />
              {formatSeconds(attempt.time_spent)}
            </span>
            <span className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-900 dark:text-gray-300">
              <Target className="h-4 w-4" />
              {formattedRatio}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          {mcq?.type && (
            <span className="rounded-full bg-black/5 px-2.5 py-0.5 dark:bg-white/5">
              Type : {mcq.type.toUpperCase()}
            </span>
          )}
          {mcq?.difficulty && (
            <span className="rounded-full bg-black/5 px-2.5 py-0.5 dark:bg-white/5 capitalize">
              Difficulté : {mcq.difficulty.toLowerCase()}
            </span>
          )}
          {mcq?.estimated_time && (
            <span className="rounded-full bg-black/5 px-2.5 py-0.5 dark:bg-white/5">
              Temps estimé : {formatSeconds(mcq.estimated_time)}
            </span>
          )}
          {mcq?.subject?.name && (
            <span className="rounded-full bg-black/5 px-2.5 py-0.5 dark:bg-white/5">
              Matière : {mcq.subject.name}
            </span>
          )}
          {mcq?.course?.name && (
            <span className="rounded-full bg-black/5 px-2.5 py-0.5 dark:bg-white/5">
              Cours : {mcq.course.name}
            </span>
          )}
        </div>

        {attempt.feedback && (
          <div className="mt-4 rounded-xl bg-pink-500/5 p-4 text-sm text-pink-600 dark:bg-pink-500/10 dark:text-pink-200">
            <div className="text-xs font-semibold uppercase tracking-wide">
              Feedback
            </div>
            <p className="mt-1 leading-relaxed whitespace-pre-line">
              {attempt.feedback}
            </p>
          </div>
        )}

        {attempt.knowledge_components?.length > 0 && (
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Compétences ciblées
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {attempt.knowledge_components.map((kc) => (
                <span
                  key={kc}
                  className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-600 dark:bg-purple-500/20 dark:text-purple-200"
                >
                  {kc}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {mcq?.type !== "qroc" && optionPayload.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#121212]">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Vos choix
          </div>
          <div className="mt-4 space-y-3">
            {optionPayload.map((option) => (
              <OptionRow
                key={option.id}
                option={option}
                isSelected={option.isSelected}
                isCorrect={option.is_correct}
              />
            ))}
          </div>
          {mcq?.explanation && (
            <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-300">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Explication
              </div>
              <p className="mt-2 leading-relaxed whitespace-pre-line">
                {mcq.explanation}
              </p>
            </div>
          )}
        </div>
      )}

      {mcq?.type === "qroc" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#121212]">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Votre réponse
            </div>
            <p className="mt-2 rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-700 dark:bg-gray-900 dark:text-gray-200">
              {attempt.response || "Aucune réponse enregistrée"}
            </p>
          </div>
          {mcq?.answer && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-500/5 p-6 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              <div className="text-xs font-semibold uppercase tracking-wide">
                Réponse attendue
              </div>
              <p className="mt-2 leading-relaxed whitespace-pre-line">
                {mcq.answer}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ReplayPage = () => {
  const { trainingSessionId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedAttemptIndex, setSelectedAttemptIndex] = useState(0);

  const selectedDate = searchParams.get("date");
  const backHref = selectedDate
    ? `/dashboard/progress/summary?date=${selectedDate}`
    : "/dashboard/progress/summary";

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["sessionReplayTimeline", trainingSessionId],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      if (!token) {
        throw new Error("Session utilisateur invalide.");
      }
      const response = await BaseUrl.get(
        `/progress/session/${trainingSessionId}/timeline`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data.data;
    },
    enabled: !!trainingSessionId,
    retry: 1,
  });

  useEffect(() => {
    if (isError && error) {
      const reason =
        error?.response?.data?.message || error?.message || "Erreur inconnue";
      toast.error(reason);
    }
  }, [isError, error]);

  useEffect(() => {
    if (data?.attempts?.length) {
      setSelectedAttemptIndex(0);
    }
  }, [data]);

  const session = data?.session;
  const attempts = data?.attempts || [];
  const selectedAttempt =
    attempts.length > 0 ? attempts[selectedAttemptIndex] : null;

  const sessionDateLabel = useMemo(() => {
    if (!attempts.length) return null;
    const firstAttempt = attempts[0];
    try {
      return format(new Date(firstAttempt.created_at), "d MMMM yyyy", {
        locale: fr,
      });
    } catch (err) {
      return null;
    }
  }, [attempts]);

  if (isLoading) {
    return (
      <div className="px-6 py-10">
        <Loading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-6 py-10 text-sm text-rose-500 dark:text-rose-300">
        Impossible de récupérer l&apos;historique de cette session.
      </div>
    );
  }

  return (
    <div className="px-6 py-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.push(backHref)}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-pink-200 hover:text-pink-500 dark:border-gray-800 dark:bg-[#121212] dark:text-gray-200 dark:hover:border-pink-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au calendrier
        </button>

        {sessionDateLabel && (
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {sessionDateLabel}
          </span>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#121212]"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Session d&apos;entraînement
            </div>
            <h1 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {session?.title || "Session sans titre"}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span>
                {attempts.length} question
                {attempts.length > 1 ? "s" : ""}
              </span>
              {session?.accuracy != null && (
                <span>
                  Précision : {Math.round((session.accuracy || 0) * 100)}%
                </span>
              )}
              {typeof session?.xp_earned === "number" && (
                <span>XP total : {session.xp_earned}</span>
              )}
              {session?.status && (
                <span className="capitalize">Statut : {session.status.toLowerCase()}</span>
              )}
            </div>
          </div>
          {session?.completed_at && (
            <div className="text-xs text-gray-400 dark:text-gray-500">
              Terminé le{" "}
              {format(new Date(session.completed_at), "d MMM yyyy 'à' HH:mm", {
                locale: fr,
              })}
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <div className="space-y-4">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Chronologie des interactions
          </div>
          <ReplayTimelineList
            attempts={attempts}
            selectedIndex={selectedAttemptIndex}
            onSelect={(index) => setSelectedAttemptIndex(index)}
          />
        </div>

        <ReplayAttemptDetails attempt={selectedAttempt} index={selectedAttemptIndex} />
      </div>
    </div>
  );
};

export default ReplayPage;
