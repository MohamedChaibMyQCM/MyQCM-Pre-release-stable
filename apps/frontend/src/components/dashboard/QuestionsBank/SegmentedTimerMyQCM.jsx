"use client";
import React from "react";

export default function SegmentedTimerMyQCM({
  total,
  remaining,
  running = false,
  segments = 5,
  warnFrom = 0.25,
  gap = 6,
  barWidth = 140,
  barHeight = 8,
}) {
  const clampedTotal = total ?? 0;
  const clampedRemaining = Math.max(0, remaining ?? 0);
  const p =
    clampedTotal > 0 ? Math.max(0, Math.min(1, clampedRemaining / clampedTotal)) : 0;
  const safeSegments = Math.max(1, segments);
  const exact = safeSegments * p;
  const filled = Math.floor(exact);
  const frac = exact - filled;
  const low = p <= warnFrom;

  const filledClass = low
    ? "bg-[#F64C4C]"
    : "bg-gradient-to-r from-[#F8589F] to-[#E74C8C]";

  return (
    <div
      className="flex items-center gap-2 px-[12px] py-[6px] rounded-[10px] transition-all duration-300 max-md:bg-[#FFFFFF20] max-md:border max-md:border-[#E9ECEF]"
      style={
        low
          ? { background: "rgba(246, 76, 76, 0.08)", boxShadow: "0 8px 20px rgba(246, 76, 76, 0.2)" }
          : { background: "#F8F9FA" }
      }
      role="group"
      aria-label="Timer"
    >
      <div
        className="min-w-[48px] text-[12px] font-bold"
        style={{ color: low ? "#F64C4C" : "#F8589F" }}
        aria-live={running ? "polite" : "off"}
      >
        {Math.max(0, Math.ceil(clampedRemaining))}s
      </div>

      <div className="flex" style={{ width: `${barWidth}px`, columnGap: gap }}>
        {Array.from({ length: safeSegments }).map((_, i) => {
          const isFilled = i < filled;
          const isActive = i === filled && clampedRemaining > 0;
          const base = isFilled ? filledClass : "bg-[#EFEEFC]";

          return (
            <div
              key={i}
              className={`relative flex-1 rounded-[6px] transition-colors duration-300 ${base}`}
              style={{ height: `${barHeight}px` }}
              aria-hidden="true"
            >
              {isActive && (
                <div
                  className={`absolute inset-y-0 left-0 rounded-[6px] ${filledClass}`}
                  style={{ width: `${Math.max(0.1, frac) * 100}%`, opacity: 0.35 }}
                />
              )}
            </div>
          );
        })}
      </div>

      <span className="text-[12px] text-[#6C757D] font-medium max-md:hidden">Temps restant</span>
    </div>
  );
}
