"use client";

import { motion } from "framer-motion";
import { useOnboardingV2 } from "../../context/OnboardingV2Context";
import { useState, useEffect } from "react";

const AnimatedStat = ({ value, label, delay = 0 }) => {
  const [count, setCount] = useState(0);
  const target = parseInt(value.replace(/[^0-9]/g, ""));

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(interval);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [target, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.6 }}
      className="flex flex-col items-center"
    >
      <div className="text-5xl md:text-6xl font-bold text-white mb-2">
        {value.includes("+") && "+"}
        {count.toLocaleString()}
        {value.includes("%") && "%"}
      </div>
      <div className="text-lg md:text-xl text-white/80">{label}</div>
    </motion.div>
  );
};

const ParticlesBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default function HeroIntro() {
  const { startOnboarding } = useOnboardingV2();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F8589F] via-[#FF3D88] to-[#FF1E73] relative overflow-hidden">
      {/* Animated background particles */}
      <ParticlesBackground />

      {/* Main content */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center z-10 px-6"
      >
        {/* Logo or icon */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <div className="text-8xl mb-4 animate-float">🎓</div>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
        >
          Bienvenue sur MyQCM
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-2xl md:text-3xl text-white/90 font-normal mb-12"
        >
          Votre voyage vers l'excellence commence ici 🚀
        </motion.p>

        {/* Animated stats */}
        <div className="flex flex-wrap gap-12 md:gap-16 justify-center mb-16">
          <AnimatedStat value="10,000+" label="Étudiants" delay={800} />
          <AnimatedStat value="50,000+" label="Questions" delay={1000} />
          <AnimatedStat value="95%" label="Taux de réussite" delay={1200} />
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="flex flex-col md:flex-row gap-6 justify-center items-center"
        >
          <button
            onClick={() => startOnboarding("persona")}
            className="glassmorphism-card hover-lift px-10 py-5 text-xl font-semibold text-[#FF3D88] transition-all duration-300 hover:scale-105 hover:shadow-2xl click-feedback min-w-[280px]"
          >
            <span className="flex items-center gap-3">
              <span>Découvrir MyQCM</span>
              <span className="text-2xl">✨</span>
            </span>
            <p className="text-sm font-normal text-gray-600 mt-1">
              Parcours complet (5 min)
            </p>
          </button>

          <button
            onClick={() => startOnboarding("tour")}
            className="glassmorphism hover-lift px-10 py-5 text-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl click-feedback border-2 border-white/30 min-w-[280px]"
          >
            <span className="flex items-center gap-3">
              <span>Tour rapide</span>
              <span className="text-2xl">⚡</span>
            </span>
            <p className="text-sm font-normal text-white/80 mt-1">
              L'essentiel (1 min)
            </p>
          </button>
        </motion.div>

        {/* Skip option */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          onClick={() => startOnboarding("skip")}
          className="mt-8 text-white/70 hover:text-white transition-colors duration-300 text-lg underline"
        >
          Passer l'introduction
        </motion.button>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-float" />
    </div>
  );
}
