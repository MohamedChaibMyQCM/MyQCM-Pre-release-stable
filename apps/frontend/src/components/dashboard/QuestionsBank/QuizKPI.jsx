"use client";

import { motion } from "framer-motion";

const toneMap = {
  neutral: { bg: "#FFFFFF", bd: "#EAEFF4", col: "#191919" },
  success: { bg: "#E5F5EC", bd: "#E5F5EC", col: "#47B881" },
  warning: { bg: "#FFF7E1", bd: "#FFF7E1", col: "#FFAD0D" },
  danger: { bg: "#FEECEC", bd: "#FEECEC", col: "#F64C4C" },
};

const QuizKPI = ({ icon: Icon, label, value, tone = "neutral" }) => {
  const palette = toneMap[tone];

  return (
    <motion.div
      className="flex items-center gap-3 rounded-2xl p-4"
      style={{ background: palette.bg, border: `1px solid ${palette.bd}` }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
        transition: { duration: 0.2 },
      }}
    >
      {Icon && <Icon className="h-5 w-5 shrink-0" style={{ color: palette.col }} />}
      <div className="leading-tight min-w-0 flex-1">
        <div
          className="text-[11px] font-semibold uppercase tracking-wide text-[#858494]"
        >
          {label}
        </div>
        <div className="text-lg font-semibold truncate" style={{ color: palette.col }}>
          {value}
        </div>
      </div>
    </motion.div>
  );
};

export default QuizKPI;
