"use client";

import { X, Trophy, Clock, Sparkles } from "lucide-react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import { useTheme } from "next-themes";
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

type RewardRowConfig = {
  key: string;
  title: string;
  description: string;
  amount: string;
  icon: ReactNode;
  amountColor: {
    light: string;
    dark: string;
  };
  iconBg: {
    light: string;
    dark: string;
  };
  surfaces: {
    light: string;
    dark: string;
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

const RewardRow = ({ data, isDark }: { data: RewardRowConfig; isDark: boolean }) => (
  <div
    className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
      isDark ? data.surfaces.dark : data.surfaces.light
    }`}
  >
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
        isDark ? data.iconBg.dark : data.iconBg.light
      }`}
    >
      {data.icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-semibold text-gray-900 dark:text-white">{data.title}</div>
      <div className="text-xs text-gray-600 dark:text-gray-400">{data.description}</div>
    </div>
    <div className={`text-lg font-bold ${isDark ? data.amountColor.dark : data.amountColor.light}`}>
      {data.amount}
    </div>
  </div>
);

export const AlphaXpExplanationModal = ({
  open,
  onClose,
  onStart,
  featureName,
}: AlphaXpExplanationModalProps) => {
  const [config, setConfig] = useState<AlphaXpConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (open) {
      setIsLoading(true);
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

  const rewardRows: RewardRowConfig[] = config
    ? [
        {
          key: "testing",
          title: "Bonus de test",
          description: "Pour avoir essayé",
          amount: `+${config.testingReward.baseXp}`,
          icon: <Trophy className="h-5 w-5 text-white" />,
          amountColor: {
            light: "text-[#F8589F]",
            dark: "text-[#ff87c5]",
          },
          iconBg: {
            light: "bg-gradient-to-br from-[#F8589F] to-[#FD2E8A]",
            dark: "bg-gradient-to-br from-[#F8589F] to-[#FD2E8A]",
          },
          surfaces: {
            light:
              "bg-gradient-to-r from-[#F8589F]/10 to-[#FD2E8A]/10 border-pink-100/60 hover:border-pink-200/60 shadow-sm",
            dark: "bg-[#16111b] border-white/10 hover:border-white/20",
          },
        },
        {
          key: "time",
          title: "Temps passé",
          description: `${config.timeSpentReward.xpPerMinute} XP/min`,
          amount: `+${config.timeSpentReward.maxXp}`,
          icon: <Clock className="h-5 w-5 text-white" />,
          amountColor: {
            light: "text-blue-600",
            dark: "text-[#9db5ff]",
          },
          iconBg: {
            light: "bg-blue-500",
            dark: "bg-[#31468f]",
          },
          surfaces: {
            light: "bg-blue-50 border-blue-100 hover:border-blue-200 shadow-sm",
            dark: "bg-[#0d111f] border-white/10 hover:border-white/20",
          },
        },
        {
          key: "feedback",
          title: "Feedback détaillé",
          description: "Note + commentaire",
          amount: `+${config.feedbackQualityReward.rating5Xp + config.feedbackQualityReward.withTextBonus}`,
          icon: <FeedbackIcon />,
          amountColor: {
            light: "text-amber-600",
            dark: "text-[#ffd58a]",
          },
          iconBg: {
            light: "bg-amber-500",
            dark: "bg-[#d49832]",
          },
          surfaces: {
            light: "bg-amber-50 border-amber-100 hover:border-amber-200 shadow-sm",
            dark: "bg-[#1b1206] border-[#f1c16d]/20 hover:border-[#f1c16d]/40",
          },
        },
      ]
    : [];

  const cardClasses = isDark
    ? "bg-[#050506] border border-white/8 shadow-[0px_24px_60px_rgba(0,0,0,0.85)]"
    : "bg-white shadow-2xl";
  const bodyClasses = isDark ? "bg-[#050506]" : "bg-white";
  const infoSurface = isDark
    ? "bg-[#0d0d12] border-white/10 text-gray-100/90"
    : "bg-gray-50 border-gray-200 text-gray-600";
  const secondaryBtnClasses = isDark
    ? "border-white/12 bg-[#0d0d12] text-gray-100 hover:bg-[#161622]"
    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50";
  const backdropTransition: Transition = {
    duration: 0.25,
    ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={backdropTransition}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0.9, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.9, scale: 0.95 }}
            transition={backdropTransition}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-md overflow-hidden rounded-2xl transition-colors ${cardClasses}`}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 dark:bg-gray-900/60 text-gray-500 dark:text-gray-300 backdrop-blur-sm transition-colors hover:bg-white dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="bg-gradient-to-br from-[#F8589F] to-[#FD2E8A] px-5 py-5 text-white">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider opacity-90">
                <Sparkles className="h-4 w-4" />
                Programme Labs
              </div>
              <h2 className="text-xl font-bold mb-1">Gagnez des XP !</h2>
              <p className="text-sm opacity-90">
                Jusqu&apos;à <strong>{maxPossibleXp} XP</strong> en testant {featureName}
              </p>
            </div>

            {/* Content */}
            <div className={`p-5 ${bodyClasses} ${isDark ? "border-t border-white/10" : ""}`}>
              {isLoading || !config ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#F8589F] border-t-transparent" />
                </div>
              ) : (
                <div className="space-y-3">
                  {rewardRows.map((row) => (
                    <RewardRow key={row.key} data={row} isDark={isDark} />
                  ))}

                  <div className={`rounded-lg border px-3 py-2 text-xs ${infoSurface}`}>
                    Les XP sont ajoutés après soumission de votre évaluation.
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-5 flex gap-2">
                <button
                  onClick={onClose}
                  className={`flex-1 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${secondaryBtnClasses}`}
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    onStart();
                    onClose();
                  }}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#F8589F] to-[#FD2E8A] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#F8589F]/25 transition-shadow hover:shadow-xl hover:shadow-[#F8589F]/40"
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
