"use client";

import { Star, Loader2, X, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useClinicalCaseFeedback } from "../hooks/useClinicalCaseFeedback";

type CaseFeedbackModalSubmission = {
  rating: number;
  review: string;
};

type CaseFeedbackModalProps = {
  caseIdentifier: string;
  open: boolean;
  onClose: () => void;
  onSkip: () => void;
  onSubmitted: (payload: CaseFeedbackModalSubmission) => Promise<void> | void;
};

const STAR_SCALE = [1, 2, 3, 4, 5];

export const CaseFeedbackModal = ({
  caseIdentifier,
  open,
  onClose,
  onSkip,
  onSubmitted,
}: CaseFeedbackModalProps) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const {
    rating,
    setRating,
    review,
    setReview,
    isLoading,
    isSubmitting,
    submit,
    canSubmit,
  } = useClinicalCaseFeedback(caseIdentifier);
  const trimmedReview = useMemo(() => review.trim(), [review]);

  const progressLabel = useMemo(() => {
    if (isSubmitting) {
      return "Envoi en cours…";
    }
    if (isLoading) {
      return "Chargement…";
    }
    return null;
  }, [isLoading, isSubmitting]);

  if (!open) {
    return null;
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-md px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[480px] overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Gradient header accent */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#F8589F] via-[#FD2E8A] to-[#FF7CB1]" />

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F8589F] focus:ring-offset-2"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="px-6 py-6 pb-5">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-5 pr-8"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#F8589F]/10 to-[#FD2E8A]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#F8589F]">
                  <Sparkles className="h-3 w-3" />
                  Feedback
                </span>
                <h2 className="mt-3 text-xl font-bold text-gray-900">
                  Évaluez ce prototype
                </h2>
                <p className="mt-1.5 text-[13px] leading-relaxed text-gray-600">
                  Votre avis aide à prioriser les améliorations avant l&apos;intégration.
                </p>
              </motion.div>

              {/* Rating Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-700">
                    Note globale
                  </span>
                  <span className="text-[10px] font-medium text-gray-500">
                    1 = À retravailler · 5 = Prêt
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {STAR_SCALE.map((value) => {
                    const isActive =
                      hoveredRating !== null
                        ? value <= hoveredRating
                        : value <= rating;
                    return (
                      <motion.button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        onMouseEnter={() => setHoveredRating(value)}
                        onMouseLeave={() => setHoveredRating(null)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        className="rounded-full p-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F8589F] focus-visible:ring-offset-2"
                        aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
                      >
                        <Star
                          className={`h-7 w-7 transition-all duration-200 ${
                            isActive
                              ? "fill-[#F8589F] text-[#F8589F] drop-shadow-sm"
                              : "fill-gray-100 text-gray-300"
                          }`}
                        />
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Observations Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-700">
                    Vos observations
                  </span>
                  <span className="text-[10px] font-medium text-gray-500">
                    {review.length}/2000
                  </span>
                </div>
                <textarea
                  value={review}
                  onChange={(event) => setReview(event.target.value.slice(0, 2000))}
                  placeholder="Ce qui fonctionne bien et ce qui mérite d'être amélioré..."
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[13px] text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-[#F8589F] focus:bg-white focus:ring-2 focus:ring-[#F8589F]/20"
                  rows={3}
                  disabled={isSubmitting}
                />
                <p className="mt-2 text-[10px] leading-relaxed text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Réponses confidentielles, consultées par l&apos;équipe Labs uniquement.
                  </span>
                </p>
              </motion.div>

              {/* Progress indicator */}
              <AnimatePresence>
                {progressLabel && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 flex items-center gap-2 rounded-lg bg-[#F8589F]/5 px-3 py-2 text-[11px] font-medium text-[#F8589F]"
                  >
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {progressLabel}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
              >
                <button
                  type="button"
                  onClick={onSkip}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Plus tard
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await submit();
                      await onSubmitted({
                        rating,
                        review: trimmedReview,
                      });
                    } catch {
                      // already surfaced via toast
                    }
                  }}
                  disabled={!canSubmit}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F8589F] to-[#FD2E8A] px-5 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-[#F8589F]/25 transition-all hover:shadow-xl hover:shadow-[#F8589F]/30 focus:outline-none focus:ring-2 focus:ring-[#F8589F] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                >
                  Envoyer et retourner au tableau de bord
                  <svg
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
