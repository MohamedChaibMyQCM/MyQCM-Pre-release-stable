"use client";

import { motion } from "framer-motion";

const RingProgress = ({
  size = 120,
  stroke = 10,
  value = 60,
  color = "#F8589F",
}) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, value));
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="block -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F8F9FC"
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
          transition={{ type: "tween", duration: 0.9, delay: 0.3 }}
        />
      </svg>
      <motion.div
        className="absolute flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <span className="text-3xl font-bold text-[#191919]">
          {Math.round(value)}%
        </span>
      </motion.div>
    </div>
  );
};

export default RingProgress;
