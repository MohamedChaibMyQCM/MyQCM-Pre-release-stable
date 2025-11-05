"use client";

import { motion } from "framer-motion";
import { useOnboardingV2 } from "../../context/OnboardingV2Context";
import { useEffect, useState } from "react";

const CircularProgress = ({ percentage, size = 100, strokeWidth = 8 }) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedPercentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(248, 88, 159, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="progress-ring"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F8589F" />
            <stop offset="100%" stopColor="#FF3D88" />
          </linearGradient>
        </defs>
      </svg>

      {/* Percentage text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="text-3xl font-bold gradient-text"
        >
          {Math.round(animatedPercentage)}%
        </motion.span>
      </div>

      {/* Glow effect */}
      {animatedPercentage > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full blur-xl"
          style={{
            background:
              "radial-gradient(circle, rgba(248, 88, 159, 0.3), transparent)",
          }}
        />
      )}
    </div>
  );
};

const MilestoneIndicator = ({ milestone, isActive, isCompleted, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className={`
        flex items-center gap-3 p-3 rounded-xl transition-all duration-300
        ${isActive ? "bg-gradient-to-r from-[#F8589F]/20 to-[#FF3D88]/20 scale-105" : ""}
        ${isCompleted ? "opacity-70" : ""}
      `}
    >
      <div
        className={`
        w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300
        ${
          isCompleted
            ? "bg-gradient-to-r from-[#F8589F] to-[#FF3D88] text-white"
            : isActive
            ? "bg-white border-2 border-[#F8589F] text-[#F8589F] animate-pulse"
            : "bg-gray-200 text-gray-400"
        }
      `}
      >
        {isCompleted ? "✓" : milestone.step}
      </div>
      <div className="flex-1">
        <p className={`font-semibold ${isActive ? "text-[#F8589F]" : "text-gray-700"}`}>
          {milestone.title}
        </p>
        {isActive && (
          <p className="text-xs text-gray-500 mt-1">{milestone.description}</p>
        )}
      </div>
      {milestone.xp && (
        <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold">
          +{milestone.xp} XP
        </div>
      )}
    </motion.div>
  );
};

export default function ProgressVisualization({ className = "" }) {
  const { progress, completionPercentage, xpEarned } = useOnboardingV2();

  // Example milestones - in real app, this would come from the tour steps
  const milestones = [
    { step: 1, title: "Bienvenue", description: "Introduction à MyQCM", xp: 10 },
    { step: 2, title: "Découverte", description: "Explorer les fonctionnalités", xp: 20 },
    { step: 3, title: "Pratique", description: "Essayer les exercices", xp: 30 },
    { step: 4, title: "Maîtrise", description: "Comprendre le système", xp: 40 },
    { step: 5, title: "Complet", description: "Tour terminé!", xp: 50 },
  ];

  const currentStep = progress.currentStep + 1;

  return (
    <div className={`fixed top-8 right-8 z-50 ${className}`}>
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="glassmorphism-card p-6 rounded-3xl shadow-2xl max-w-sm"
      >
        {/* Circular progress */}
        <div className="flex flex-col items-center mb-6">
          <CircularProgress percentage={completionPercentage} size={120} strokeWidth={10} />

          {/* Stats */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Étape {currentStep} sur {progress.totalSteps}
            </p>
            <div className="mt-2 flex items-center gap-2 justify-center">
              <span className="text-2xl">⭐</span>
              <span className="text-xl font-bold gradient-text">{xpEarned} XP</span>
            </div>
          </div>
        </div>

        {/* Milestone progress */}
        {completionPercentage >= 50 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="border-t border-gray-200 pt-4"
          >
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Progression</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scroll">
              {milestones.map((milestone, index) => (
                <MilestoneIndicator
                  key={milestone.step}
                  milestone={milestone}
                  isActive={currentStep === milestone.step}
                  isCompleted={currentStep > milestone.step}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Motivation message */}
        {completionPercentage > 0 && completionPercentage < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 p-3 bg-gradient-to-r from-[#F8589F]/10 to-[#FF3D88]/10 rounded-xl text-center"
          >
            <p className="text-sm font-medium text-gray-700">
              {completionPercentage < 25 && "🚀 Excellent début!"}
              {completionPercentage >= 25 && completionPercentage < 50 && "💪 Continue comme ça!"}
              {completionPercentage >= 50 && completionPercentage < 75 && "🔥 À mi-chemin!"}
              {completionPercentage >= 75 && completionPercentage < 100 && "⭐ Presque terminé!"}
            </p>
          </motion.div>
        )}

        {/* Celebration when complete */}
        {completionPercentage === 100 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mt-4 p-4 bg-gradient-to-r from-[#F8589F] to-[#FF3D88] rounded-xl text-center"
          >
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-white font-bold">Félicitations!</p>
            <p className="text-white/90 text-sm mt-1">Tour complété avec succès</p>
          </motion.div>
        )}
      </motion.div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #f8589f, #ff3d88);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
