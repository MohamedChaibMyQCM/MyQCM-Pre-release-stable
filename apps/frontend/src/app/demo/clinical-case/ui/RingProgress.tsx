"use client";

import { motion } from "framer-motion";
import { COLORS } from "./colors";

type RingProgressProps = {
  size?: number;
  stroke?: number;
  value?: number;
  color?: string;
};

export const RingProgress = ({
  size = 120,
  stroke = 10,
  value = 60,
  color = COLORS.primary,
}: RingProgressProps) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, value));
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg width={size} height={size} className="block">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={COLORS.bgLightGray}
        strokeWidth={stroke}
        fill="none"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={circumference}
        animate={{ strokeDashoffset: offset }}
        transition={{ type: "tween", duration: 0.9 }}
      />
    </svg>
  );
};
