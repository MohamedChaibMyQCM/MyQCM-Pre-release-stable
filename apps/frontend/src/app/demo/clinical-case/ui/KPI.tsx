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

export const KPI = ({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: KPIProps) => {
  const palette = toneMap[tone];

  return (
    <div
      className="flex items-center gap-3 rounded-2xl p-4"
      style={{ background: palette.bg, border: `1px solid ${palette.bd}` }}
    >
      {Icon ? <Icon className="h-5 w-5" style={{ color: palette.col }} /> : null}
      <div className="leading-tight">
        <div
          className="text-[11px] font-semibold uppercase tracking-wide"
          style={{ color: COLORS.textMuted }}
        >
          {label}
        </div>
        <div className="text-lg font-semibold" style={{ color: palette.col }}>
          {value}
        </div>
      </div>
    </div>
  );
};
