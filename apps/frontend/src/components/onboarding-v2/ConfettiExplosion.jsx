"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const ConfettiPiece = ({
  color,
  delay = 0,
  duration = 3,
  startX,
  startY,
  endY,
  shape = "square",
}) => {
  const randomRotation = Math.random() * 720 - 360;
  const randomX = (Math.random() - 0.5) * 300;

  return (
    <motion.div
      initial={{
        x: startX,
        y: startY,
        rotate: 0,
        opacity: 1,
        scale: 1,
      }}
      animate={{
        x: startX + randomX,
        y: endY,
        rotate: randomRotation,
        opacity: [1, 1, 0],
        scale: [1, 1, 0.5],
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: "easeIn",
      }}
      className={`absolute ${
        shape === "circle" ? "rounded-full" : "rounded-sm"
      }`}
      style={{
        backgroundColor: color,
        width: Math.random() * 8 + 4,
        height: shape === "circle" ? Math.random() * 8 + 4 : Math.random() * 12 + 4,
      }}
    />
  );
};

const Streamer = ({ color, delay = 0, startX, startY, endY }) => {
  const randomX = (Math.random() - 0.5) * 200;
  const randomRotation = Math.random() * 360;

  return (
    <motion.div
      initial={{
        x: startX,
        y: startY,
        rotate: 0,
        opacity: 1,
        scaleY: 1,
      }}
      animate={{
        x: startX + randomX,
        y: endY,
        rotate: randomRotation,
        opacity: [1, 1, 0],
        scaleY: [1, 2, 1],
      }}
      transition={{
        duration: 3.5,
        delay: delay,
        ease: "easeInOut",
      }}
      className="absolute"
      style={{
        backgroundColor: color,
        width: 4,
        height: 30,
        borderRadius: 2,
      }}
    />
  );
};

export default function ConfettiExplosion({
  active = false,
  duration = 5000,
  particleCount = 80,
  origin = { x: "50%", y: "50%" },
  colors = ["#F8589F", "#FF3D88", "#FFD700", "#00D9FF", "#FF6B9D", "#9333EA", "#10B981"],
  onComplete,
  spread = 360,
  velocity = 50,
}) {
  const [isActive, setIsActive] = useState(active);
  const [windowDimensions, setWindowDimensions] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });

      const handleResize = () => {
        setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    setIsActive(active);

    if (active) {
      const timer = setTimeout(() => {
        setIsActive(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration, onComplete]);

  if (!isActive) return null;

  // Calculate origin position
  const originX = typeof origin.x === "string"
    ? (parseFloat(origin.x) / 100) * windowDimensions.width
    : origin.x;
  const originY = typeof origin.y === "string"
    ? (parseFloat(origin.y) / 100) * windowDimensions.height
    : origin.y;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998]" aria-hidden="true">
      {/* Confetti pieces */}
      {[...Array(particleCount)].map((_, i) => {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomDelay = Math.random() * 0.3;
        const randomDuration = 2.5 + Math.random() * 1.5;
        const shape = Math.random() > 0.5 ? "square" : "circle";

        return (
          <ConfettiPiece
            key={`confetti-${i}`}
            color={randomColor}
            delay={randomDelay}
            duration={randomDuration}
            startX={originX}
            startY={originY}
            endY={windowDimensions.height + 50}
            shape={shape}
          />
        );
      })}

      {/* Streamers */}
      {[...Array(Math.floor(particleCount / 4))].map((_, i) => {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomDelay = Math.random() * 0.2;

        return (
          <Streamer
            key={`streamer-${i}`}
            color={randomColor}
            delay={randomDelay}
            startX={originX}
            startY={originY}
            endY={windowDimensions.height + 50}
          />
        );
      })}
    </div>
  );
}

// Preset configurations
export const confettiPresets = {
  celebration: {
    particleCount: 100,
    spread: 360,
    velocity: 60,
    origin: { x: "50%", y: "50%" },
    colors: ["#F8589F", "#FF3D88", "#FFD700", "#00D9FF", "#FF6B9D"],
  },

  achievement: {
    particleCount: 50,
    spread: 120,
    velocity: 40,
    origin: { x: "50%", y: "30%" },
    colors: ["#FFD700", "#FFA500", "#FF6B9D", "#F8589F"],
  },

  milestone: {
    particleCount: 80,
    spread: 180,
    velocity: 50,
    origin: { x: "50%", y: "80%" },
    colors: ["#9333EA", "#10B981", "#00D9FF", "#F8589F"],
  },

  side: {
    particleCount: 40,
    spread: 60,
    velocity: 30,
    origin: { x: "90%", y: "20%" },
    colors: ["#F8589F", "#FF3D88", "#FFD700"],
  },
};
