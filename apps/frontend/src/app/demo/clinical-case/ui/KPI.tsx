"use client";

import { ComponentType, CSSProperties, SVGProps } from "react";
import { COLORS } from "./colors";

type KPITone = "neutral" | "success" | "warning" | "danger";

type KPIProps = {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string | number;
  tone?: KPITone;
};

type ToneConfig = {
  bg: string;
  bd: string;
  col: string;
};

const toneMap: Record<KPITone, ToneConfig> = {
  neutral: { bg: COLORS.white, bd: "#EAEFF4", col: COLORS.text },
  success: { bg: "#E5F5EC", bd: "#E5F5EC", col: "#47B881" },
  warning: { bg: "#FFF7E1", bd: "#FFF7E1", col: "#FFAD0D" },
  danger: { bg: "#FEECEC", bd: "#FEECEC", col: "#F64C4C" },
};

const toneDarkModeClasses: Record<KPITone, string> = {
  neutral: "dark:bg-[#1a1a1a] dark:border-gray-700 dark:text-white",
  success: "dark:bg-green-900/20 dark:border-green-900/20 dark:text-green-400",
  warning: "dark:bg-amber-900/20 dark:border-amber-900/20 dark:text-amber-400",
  danger: "dark:bg-red-900/20 dark:border-red-900/20 dark:text-red-400",
};

export const KPI = ({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: KPIProps) => {
  const palette = toneMap[tone];

  const darkClasses = toneDarkModeClasses[tone];

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl p-4 ${darkClasses}`}
      style={{ background: palette.bg, border: `1px solid ${palette.bd}` }}
    >
      {Icon ? <Icon className="h-5 w-5" style={{ color: palette.col }} /> : null}
      <div className="leading-tight">
        <div
          className="text-[11px] font-semibold uppercase tracking-wide text-[#7D6A90] dark:text-gray-400"
        >
          {label}
        </div>
        <div className={`text-lg font-semibold ${tone === "neutral" ? "text-[#191919] dark:text-white" : ""}`} style={tone !== "neutral" ? { color: palette.col } : {}}>
          {value}
        </div>
      </div>
    </div>
  );
};
