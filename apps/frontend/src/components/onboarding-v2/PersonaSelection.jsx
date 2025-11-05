"use client";

import { motion } from "framer-motion";
import { useOnboardingV2 } from "../../context/OnboardingV2Context";
import { useState } from "react";

const PersonaCard = ({ persona, isSelected, onClick, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      whileHover={{ scale: 1.05, y: -10 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative cursor-pointer rounded-3xl p-8 transition-all duration-300
        ${
          isSelected
            ? "glassmorphism-card border-4 border-[#F8589F] shadow-2xl"
            : "glassmorphism hover-lift border-2 border-white/20"
        }
        ${isHovered ? "shadow-xl" : ""}
      `}
      style={{
        minHeight: "420px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-3 -right-3 w-12 h-12 bg-[#F8589F] rounded-full flex items-center justify-center shadow-lg"
        >
          <span className="text-white text-2xl">✓</span>
        </motion.div>
      )}

      {/* Icon */}
      <div className="text-7xl mb-6 text-center animate-float">
        {persona.icon}
      </div>

      {/* Name */}
      <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">
        {persona.name}
      </h3>

      {/* Description */}
      <p className="text-gray-600 text-center mb-6 flex-grow">
        {persona.description}
      </p>

      {/* Duration badge */}
      <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-200">
        <span className="text-[#F8589F] font-semibold">⏱️ {persona.duration}</span>
        <span className="text-gray-500">•</span>
        <span className="text-gray-600">{persona.stepCount} étapes</span>
      </div>

      {/* Hover effect gradient */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-[#F8589F]/5 to-[#FF3D88]/5 rounded-3xl pointer-events-none"
        />
      )}
    </motion.div>
  );
};

export default function PersonaSelection() {
  const { personas, setPersona, startOnboarding } = useOnboardingV2();
  const [selectedPersona, setSelectedPersona] = useState(null);

  const handlePersonaClick = (personaKey) => {
    setSelectedPersona(personaKey);
  };

  const handleContinue = () => {
    if (selectedPersona) {
      setPersona(selectedPersona.toLowerCase());
      startOnboarding("tour");
    }
  };

  const personaArray = [
    { key: "BEGINNER", ...personas.BEGINNER },
    { key: "INTERMEDIATE", ...personas.INTERMEDIATE },
    { key: "ADVANCED", ...personas.ADVANCED },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#fbfcff] to-[#f5f7fd] py-12 px-6">
      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 max-w-3xl"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Choisissez votre parcours
        </h1>
        <p className="text-xl text-gray-600">
          Sélectionnez le type d'introduction qui vous correspond le mieux
        </p>
      </motion.div>

      {/* Persona cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full mb-12">
        {personaArray.map((persona, index) => (
          <PersonaCard
            key={persona.key}
            persona={persona}
            isSelected={selectedPersona === persona.key}
            onClick={() => handlePersonaClick(persona.key)}
            index={index}
          />
        ))}
      </div>

      {/* Continue button */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="flex flex-col items-center gap-4"
      >
        <button
          onClick={handleContinue}
          disabled={!selectedPersona}
          className={`
            px-12 py-5 rounded-2xl text-xl font-semibold
            transition-all duration-300 click-feedback
            ${
              selectedPersona
                ? "bg-gradient-to-r from-[#F8589F] to-[#FF3D88] text-white hover:shadow-2xl hover:scale-105 cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {selectedPersona ? (
            <span className="flex items-center gap-3">
              <span>Commencer mon parcours</span>
              <span className="text-2xl">→</span>
            </span>
          ) : (
            "Sélectionnez un parcours"
          )}
        </button>

        <button
          onClick={() => startOnboarding("skip")}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-300 text-lg underline"
        >
          Passer l'introduction
        </button>
      </motion.div>

      {/* Decorative elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#F8589F]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#FF3D88]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF1E73]/5 rounded-full blur-3xl animate-float" />
      </div>
    </div>
  );
}
