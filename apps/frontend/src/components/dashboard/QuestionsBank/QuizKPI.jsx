"use client";

import { motion } from "framer-motion";

const toneClasses = {
  neutral: {
    container: "bg-background dark:bg-card border border-border",
    icon: "text-foreground",
    value: "text-foreground",
  },
  success: {
    container: "bg-[#E5F5EC] dark:bg-[#47B881]/20 border border-[#47B881]/30",
    icon: "text-[#47B881]",
    value: "text-[#47B881]",
  },
  warning: {
    container: "bg-[#FFF7E1] dark:bg-[#FFAD0D]/20 border border-[#FFAD0D]/30",
    icon: "text-[#FFAD0D]",
    value: "text-[#FFAD0D]",
  },
  danger: {
    container: "bg-[#FEECEC] dark:bg-[#F64C4C]/20 border border-[#F64C4C]/30",
    icon: "text-[#F64C4C]",
    value: "text-[#F64C4C]",
  },
};

const QuizKPI = ({ icon: Icon, label, value, tone = "neutral" }) => {
  const classes = toneClasses[tone];

  return (
    <motion.div
      className={`flex items-center gap-3 rounded-2xl p-4 ${classes.container}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
        transition: { duration: 0.2 },
      }}
    >
      {Icon && <Icon className={`h-5 w-5 shrink-0 ${classes.icon}`} />}
      <div className="leading-tight min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className={`text-lg font-semibold truncate ${classes.value}`}>
          {value}
        </div>
      </div>
    </motion.div>
  );
};

export default QuizKPI;
