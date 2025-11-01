"use client";

import { X, Trophy, Clock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import BaseUrl from "@/components/BaseUrl";

type AlphaXpConfig = {
  testingReward: {
    baseXp: number;
    description: string;
  };
  timeSpentReward: {
    xpPerMinute: number;
    maxXp: number;
    minMinutes: number;
    description: string;
  };
  feedbackQualityReward: {
    rating5Xp: number;
    withTextBonus: number;
    minTextLength: number;
    description: string;
  };
};

type AlphaXpExplanationModalProps = {
  open: boolean;
  onClose: () => void;
  onStart: () => void;
  featureName: string;
};

// Minimal chat-bubble icon (fallback-safe)
const FeedbackIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-white"
    aria-hidden="true"
  >
    <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.3 8.3 0 0 1-3.8-.9L3 21l1.9-5.7A8.3 8.3 0 0 1 3.5 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z" />
  </svg>
);

export const AlphaXpExplanationModal = ({
  open,
  onClose,
  onStart,
  featureName,
}: AlphaXpExplanationModalProps) => {
  const [config, setConfig] = useState<AlphaXpConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchXpConfig();
    }
  }, [open]);

  const fetchXpConfig = async () => {
    try {
      const response = await BaseUrl.get("/user/alpha-activity/xp-config");
      setConfig(response.data?.data);
    } catch (error) {
      console.error("Failed to fetch XP config:", error);
      setConfig({
        testingReward: { baseXp: 50, description: "Bonus pour test" },
        timeSpentReward: {
          xpPerMinute: 5,
          maxXp: 100,
          minMinutes: 1,
          description: "Temps passé",
        },
        feedbackQualityReward: {
          rating5Xp: 50,
          withTextBonus: 25,
          minTextLength: 50,
          description: "Qualité feedback",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  const maxPossibleXp = config
    ? config.testingReward.baseXp +
      config.timeSpentReward.maxXp +
      config.feedbackQualityReward.rating5Xp +
      config.feedbackQualityReward.withTextBonus
    : 225;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-gray-500 backdrop-blur-sm transition-colors hover:bg-white hover:text-gray-900"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="bg-gradient-to-br from-[#F8589F] to-[#FD2E8A] px-5 py-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                  Programme Labs
                </span>
              </div>
              <h2 className="text-xl font-bold mb-1">Gagnez des XP !</h2>
              <p className="text-sm opacity-90">
                Jusqu&apos;à <strong>{maxPossibleXp} XP</strong> en testant {featureName}
              </p>
            </div>

            {/* Content */}
            <div className="p-5">
              {isLoading || !config ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#F8589F] border-t-transparent" />
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Testing XP */}
                  <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#F8589F]/5 to-[#FD2E8A]/5 p-3 transition-all hover:from-[#F8589F]/10 hover:to-[#FD2E8A]/10 hover:shadow-md cursor-pointer">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F8589F] to-[#FD2E8A]">
                      {/* Trophy icon from Lucide */}
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900">Bonus de test</div>
                      <div className="text-xs text-gray-600">Pour avoir essayé</div>
                    </div>
                    <div className="text-lg font-bold text-[#F8589F]">+{config.testingReward.baseXp}</div>
                  </div>

                  {/* Time XP */}
                  <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-3 transition-all hover:bg-blue-100 hover:shadow-md cursor-pointer">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500">
                      {/* Clock icon from Lucide */}
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900">Temps passé</div>
                      <div className="text-xs text-gray-600">{config.timeSpentReward.xpPerMinute} XP/min</div>
                    </div>
                    <div className="text-lg font-bold text-blue-600">+{config.timeSpentReward.maxXp}</div>
                  </div>

                  {/* Feedback XP (FORCED ICON via inline SVG) */}
                  <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-3 transition-all hover:bg-amber-100 hover:shadow-md cursor-pointer">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500">
                      <FeedbackIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900">Feedback détaillé</div>
                      <div className="text-xs text-gray-600">Note + commentaire</div>
                    </div>
                    <div className="text-lg font-bold text-amber-600">
                      +{config.feedbackQualityReward.rating5Xp + config.feedbackQualityReward.withTextBonus}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="rounded-lg bg-gray-50 px-3 py-2">
                    <p className="text-xs text-gray-600">
                      Les XP sont ajoutés après soumission de votre évaluation.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-5 flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    onStart();
                    onClose();
                  }}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#F8589F] to-[#FD2E8A] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#F8589F]/20 transition-shadow hover:shadow-lg hover:shadow-[#F8589F]/30"
                >
                  Commencer
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
