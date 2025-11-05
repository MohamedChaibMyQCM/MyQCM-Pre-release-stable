"use client";

import { motion } from "framer-motion";
import { useOnboardingV2 } from "../../context/OnboardingV2Context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ConfettiPiece = ({ delay = 0, duration = 3, windowDimensions }) => {
  const colors = ["#F8589F", "#FF3D88", "#FFD700", "#00D9FF", "#FF6B9D"];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const randomX = Math.random() * windowDimensions.width;
  const randomRotation = Math.random() * 720;

  return (
    <motion.div
      initial={{
        x: randomX,
        y: -20,
        rotate: 0,
        opacity: 1,
      }}
      animate={{
        y: windowDimensions.height + 20,
        rotate: randomRotation,
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: "easeIn",
      }}
      className="absolute w-3 h-3 rounded-sm"
      style={{ backgroundColor: randomColor }}
    />
  );
};

const AchievementBadge = ({ achievement, index }) => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        delay: index * 0.2,
        type: "spring",
        stiffness: 200,
        damping: 15,
      }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      className="glassmorphism-card p-6 rounded-2xl text-center hover-lift"
    >
      <div className="text-5xl mb-3 animate-bounce">{achievement.icon}</div>
      <h4 className="font-bold text-gray-800 mb-1">{achievement.name}</h4>
      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
      <div className="inline-block bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
        +{achievement.xp} XP
      </div>
    </motion.div>
  );
};

export default function CompletionCelebration() {
  const { achievements, xpEarned, progress, resetOnboarding } = useOnboardingV2();
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowDimensions, setWindowDimensions] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleStartLearning = () => {
    router.push("/dashboard");
  };

  const handleRestart = () => {
    resetOnboarding();
  };

  const completedSteps = progress.completedSteps.length;
  const totalSteps = progress.totalSteps;
  const timeSpentMinutes = Math.round(progress.timeSpent / 60);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#fbfcff] to-[#f5f7fd] relative overflow-hidden px-6 py-12">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <ConfettiPiece
              key={i}
              delay={i * 0.05}
              duration={3 + Math.random() * 2}
              windowDimensions={windowDimensions}
            />
          ))}
        </div>
      )}

      {/* Main content */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full text-center z-10"
      >
        {/* Trophy animation */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="text-9xl mb-8"
        >
          🏆
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-5xl md:text-6xl font-bold gradient-text mb-4"
        >
          Félicitations!
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-2xl text-gray-600 mb-12"
        >
          Vous avez terminé votre parcours d'introduction avec brio! 🎉
        </motion.p>

        {/* Stats grid */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="glassmorphism-card p-6 rounded-2xl">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-3xl font-bold gradient-text mb-1">
              {completedSteps}/{totalSteps}
            </div>
            <div className="text-gray-600">Étapes complétées</div>
          </div>

          <div className="glassmorphism-card p-6 rounded-2xl">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-3xl font-bold gradient-text mb-1">{xpEarned} XP</div>
            <div className="text-gray-600">Points gagnés</div>
          </div>

          <div className="glassmorphism-card p-6 rounded-2xl">
            <div className="text-4xl mb-2">⏱️</div>
            <div className="text-3xl font-bold gradient-text mb-1">{timeSpentMinutes} min</div>
            <div className="text-gray-600">Temps passé</div>
          </div>
        </motion.div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="mb-12"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Badges débloqués
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <AchievementBadge key={achievement.id} achievement={achievement} index={index} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col md:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={handleStartLearning}
            className="px-12 py-5 bg-gradient-to-r from-[#F8589F] to-[#FF3D88] text-white text-xl font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 click-feedback min-w-[280px]"
          >
            <span className="flex items-center gap-3 justify-center">
              <span>Commencer l'apprentissage</span>
              <span className="text-2xl">🚀</span>
            </span>
          </button>

          <button
            onClick={handleRestart}
            className="px-8 py-5 glassmorphism text-gray-700 text-lg font-semibold rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 click-feedback"
          >
            Revoir le parcours
          </button>
        </motion.div>

        {/* Motivational message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="mt-12 p-6 glassmorphism-card rounded-2xl max-w-2xl mx-auto"
        >
          <p className="text-lg text-gray-700 leading-relaxed">
            💡 <strong>Prochaine étape:</strong> Explorez votre tableau de bord personnalisé,
            commencez vos premiers QCM, et suivez votre progression en temps réel. Bon courage dans
            vos études! 📚
          </p>
        </motion.div>
      </motion.div>

      {/* Decorative elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-20 left-20 w-96 h-96 bg-[#F8589F]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-[#FF3D88]/10 rounded-full blur-3xl"
        />
      </div>
    </div>
  );
}
