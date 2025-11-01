"use client";

import { X, Trophy, TrendingUp, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

type XpReward = {
  total_xp_earned: number;
  testing_xp: number;
  time_spent_xp: number;
  feedback_quality_xp: number;
  time_spent_minutes: number;
  breakdown: {
    testing: string;
    timeSpent: string;
    feedbackQuality: string;
  };
};

type AlphaXpRewardsModalProps = {
  open: boolean;
  onClose: () => void;
  rewards: XpReward | null;
};

export const AlphaXpRewardsModal = ({
  open,
  onClose,
  rewards,
}: AlphaXpRewardsModalProps) => {
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  useEffect(() => {
    if (open && rewards && !hasTriggeredConfetti) {
      // Trigger confetti celebration
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ["#F8589F", "#FD2E8A", "#FF7CB1"],
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ["#F8589F", "#FD2E8A", "#FF7CB1"],
        });
      }, 250);

      setHasTriggeredConfetti(true);

      return () => clearInterval(interval);
    }
  }, [open, rewards, hasTriggeredConfetti]);

  if (!open || !rewards) return null;

  const xpItems = [
    {
      label: "Bonus de test",
      xp: rewards.testing_xp,
      description: rewards.breakdown.testing,
      color: "from-[#F8589F] to-[#FD2E8A]",
      bgColor: "from-[#F8589F]/10 to-[#FD2E8A]/10",
    },
    {
      label: "Temps d'exploration",
      xp: rewards.time_spent_xp,
      description: rewards.breakdown.timeSpent,
      color: "from-blue-500 to-indigo-600",
      bgColor: "from-blue-50 to-indigo-50",
    },
    {
      label: "Qualité du feedback",
      xp: rewards.feedback_quality_xp,
      description: rewards.breakdown.feedbackQuality,
      color: "from-amber-500 to-yellow-600",
      bgColor: "from-amber-50 to-yellow-50",
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-[480px] overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Header with total XP */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#F8589F] via-[#FD2E8A] to-[#FF7CB1] px-6 py-8 text-center text-white">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
              >
                <Trophy className="h-10 w-10 text-white" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold"
              >
                Félicitations !
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm"
              >
                <Sparkles className="h-5 w-5" />
                <span className="text-2xl font-bold">
                  +{rewards.total_xp_earned} XP
                </span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-3 text-sm text-white/90"
              >
                Votre contribution nous aide à améliorer MyQCM
              </motion.p>
            </div>

            {/* XP Breakdown */}
            <div className="px-6 py-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Détail des récompenses
              </h3>

              <div className="space-y-3">
                {xpItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className={`flex items-center justify-between rounded-xl bg-gradient-to-r ${item.bgColor} p-4`}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{item.label}</div>
                      <div className="mt-1 text-xs text-gray-600">
                        {item.description}
                      </div>
                    </div>
                    <div className={`text-xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                      +{item.xp}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Action button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                onClick={onClose}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F8589F] to-[#FD2E8A] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#F8589F]/25 transition-all hover:shadow-xl hover:shadow-[#F8589F]/30"
              >
                <TrendingUp className="h-4 w-4" />
                Voir mon classement
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
