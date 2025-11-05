"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useOnboardingV2 } from "../../context/OnboardingV2Context";

export default function InteractiveFeatureCard({ feature, onComplete, index = 0 }) {
  const [isInteracting, setIsInteracting] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const { addXP } = useOnboardingV2();

  const handleTryIt = () => {
    setIsInteracting(true);
    setShowDemo(true);
    addXP(10);

    setTimeout(() => {
      setIsInteracting(false);
    }, 2000);
  };

  const handleComplete = () => {
    addXP(25);
    onComplete && onComplete(feature.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{ scale: 1.02 }}
      className="glassmorphism-card hover-lift p-8 rounded-3xl relative overflow-hidden"
    >
      {/* Animated icon */}
      <motion.div
        animate={{
          scale: isInteracting ? [1, 1.2, 1] : 1,
          rotate: isInteracting ? [0, 10, -10, 0] : 0,
        }}
        transition={{ duration: 0.5 }}
        className="text-6xl mb-6 text-center"
      >
        {feature.icon || "✨"}
      </motion.div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">
        {feature.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 text-center mb-6 leading-relaxed">
        {feature.description}
      </p>

      {/* Interactive demo area */}
      {showDemo && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-[#F8589F]/10 to-[#FF3D88]/10 rounded-2xl border-2 border-[#F8589F]/20"
        >
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-sm text-gray-700 font-medium">
              {feature.demoText || "Fonctionnalité en action!"}
            </p>
          </div>
        </motion.div>
      )}

      {/* Benefits list */}
      {feature.benefits && feature.benefits.length > 0 && (
        <div className="mb-6 space-y-2">
          {feature.benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + idx * 0.1 }}
              className="flex items-start gap-2"
            >
              <span className="text-[#F8589F] mt-1">✓</span>
              <span className="text-gray-700 text-sm">{benefit}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        {!showDemo && (
          <button
            onClick={handleTryIt}
            className="w-full py-3 px-6 bg-gradient-to-r from-[#F8589F] to-[#FF3D88] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 click-feedback"
          >
            <span className="flex items-center justify-center gap-2">
              <span>Essayer</span>
              <span>🚀</span>
            </span>
          </button>
        )}

        <button
          onClick={handleComplete}
          className="w-full py-3 px-6 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-[#F8589F] hover:text-[#F8589F] transition-all duration-300 click-feedback"
        >
          J'ai compris! ✓
        </button>
      </div>

      {/* XP badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: index * 0.1 + 0.3 }}
        className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
      >
        +25 XP
      </motion.div>

      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 animate-shimmer" />
      </div>
    </motion.div>
  );
}

// Example features data structure
export const exampleFeatures = [
  {
    id: "feature-qcm",
    icon: "📚",
    title: "Questions à Choix Multiples",
    description:
      "Testez vos connaissances avec des milliers de QCM adaptés à votre niveau et à votre progression.",
    demoText: "QCM intelligent avec feedback instantané!",
    benefits: [
      "Feedback instantané sur vos réponses",
      "Explications détaillées pour chaque question",
      "Suivi de progression en temps réel",
    ],
  },
  {
    id: "feature-streak",
    icon: "🔥",
    title: "Système de Streak",
    description:
      "Maintenez votre motivation avec un système de séries quotidiennes. Plus vous êtes régulier, plus vous gagnez de récompenses!",
    demoText: "Votre série actuelle: 7 jours 🔥",
    benefits: [
      "Récompenses pour la régularité",
      "Badges exclusifs à débloquer",
      "Rappels personnalisés",
    ],
  },
  {
    id: "feature-adaptive",
    icon: "🧠",
    title: "Apprentissage Adaptatif",
    description:
      "Notre IA ajuste automatiquement la difficulté des questions selon vos performances pour un apprentissage optimal.",
    demoText: "Difficulté ajustée à votre niveau!",
    benefits: [
      "Personnalisation automatique",
      "Focus sur vos points faibles",
      "Optimisation de votre temps d'étude",
    ],
  },
  {
    id: "feature-progress",
    icon: "📊",
    title: "Suivi de Progression",
    description:
      "Visualisez votre progression avec des graphiques détaillés et des statistiques complètes sur vos performances.",
    demoText: "Graphiques interactifs et insights!",
    benefits: [
      "Statistiques détaillées par matière",
      "Analyse de vos forces et faiblesses",
      "Prédiction de vos performances",
    ],
  },
];
