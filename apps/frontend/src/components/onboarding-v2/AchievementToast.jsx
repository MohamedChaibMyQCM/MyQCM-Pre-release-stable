"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useOnboardingV2 } from "../../context/OnboardingV2Context";

const ToastNotification = ({ achievement, onClose, index }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(achievement.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [achievement.id, onClose]);

  return (
    <motion.div
      initial={{ x: 400, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 400, opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="glassmorphism-card rounded-2xl p-4 shadow-2xl max-w-sm cursor-pointer hover-lift"
      onClick={() => onClose(achievement.id)}
      style={{
        marginBottom: index * 8,
      }}
    >
      <div className="flex items-center gap-4">
        {/* Icon with animation */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: 2,
          }}
          className="text-5xl"
        >
          {achievement.icon}
        </motion.div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">
              🏆 Badge Débloqué
            </span>
          </div>
          <h4 className="font-bold text-gray-800 mb-1">{achievement.name}</h4>
          <p className="text-sm text-gray-600">{achievement.description}</p>
          <div className="mt-2 inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            <span>⭐</span>
            <span>+{achievement.xp} XP</span>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose(achievement.id);
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          aria-label="Fermer la notification"
        >
          ✕
        </button>
      </div>

      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 5, ease: "linear" }}
        className="h-1 bg-gradient-to-r from-[#F8589F] to-[#FF3D88] rounded-full mt-3 origin-left"
      />

      {/* Sparkle effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        {[...Array(8)].map((_, i) => {
          const randomX = Math.random() * 100;
          const randomY = Math.random() * 100;
          const randomDelay = Math.random() * 0.5;
          const randomDuration = 1 + Math.random();

          return (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                y: [-20, -40],
              }}
              transition={{
                duration: randomDuration,
                delay: randomDelay,
                repeat: Infinity,
                repeatDelay: 2,
              }}
              className="absolute w-2 h-2"
              style={{
                left: `${randomX}%`,
                top: `${randomY}%`,
              }}
            >
              ✨
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default function AchievementToast() {
  const { achievements } = useOnboardingV2();
  const [visibleAchievements, setVisibleAchievements] = useState([]);
  const [shownAchievementIds, setShownAchievementIds] = useState(new Set());

  useEffect(() => {
    // Find newly unlocked achievements
    const newAchievements = achievements.filter(
      (achievement) => !shownAchievementIds.has(achievement.id)
    );

    if (newAchievements.length > 0) {
      // Add new achievements to visible list
      setVisibleAchievements((prev) => [...prev, ...newAchievements]);

      // Mark them as shown
      setShownAchievementIds((prev) => {
        const newSet = new Set(prev);
        newAchievements.forEach((a) => newSet.add(a.id));
        return newSet;
      });
    }
  }, [achievements, shownAchievementIds]);

  const handleClose = (achievementId) => {
    setVisibleAchievements((prev) =>
      prev.filter((a) => a.id !== achievementId)
    );
  };

  return (
    <div
      className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence>
        {visibleAchievements.map((achievement, index) => (
          <div key={achievement.id} className="pointer-events-auto">
            <ToastNotification
              achievement={achievement}
              onClose={handleClose}
              index={index}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
