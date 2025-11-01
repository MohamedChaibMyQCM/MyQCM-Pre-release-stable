"use client";
import React from "react";
import { Clock } from "lucide-react";

export default function SegmentedTimerMyQCM({
  total,
  remaining,
  running = false,
  segments = 5,
  warnFrom = 0.25,
  gap = 6,
  barWidth = 140,
  barHeight = 10,
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
  const critical = p <= 0.15;

  const filledClass = critical
    ? "bg-gradient-to-r from-[#F64C4C] to-[#FF6B6B]"
    : low
    ? "bg-gradient-to-r from-[#FFA500] to-[#FFB84D]"
    : "bg-gradient-to-r from-[#F8589F] to-[#E74C8C]";

  const containerBgStyle = critical
    ? {
        background: "linear-gradient(135deg, rgba(246, 76, 76, 0.12) 0%, rgba(255, 107, 107, 0.08) 100%)",
        boxShadow: "0 8px 24px rgba(246, 76, 76, 0.25), inset 0 1px 3px rgba(255, 255, 255, 0.4)",
      }
    : low
    ? {
        background: "linear-gradient(135deg, rgba(255, 165, 0, 0.1) 0%, rgba(255, 184, 77, 0.08) 100%)",
        boxShadow: "0 6px 20px rgba(255, 165, 0, 0.2), inset 0 1px 3px rgba(255, 255, 255, 0.4)",
      }
    : {
        background: "linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)",
        boxShadow: "0 4px 16px rgba(248, 88, 159, 0.12), inset 0 1px 3px rgba(255, 255, 255, 0.5)",
      };

  return (
    <div
      className={`flex items-center gap-2 px-[12px] py-[6px] rounded-[10px] transition-all duration-500 border ${
        critical
          ? "border-[#F64C4C]/30 animate-pulse-glow"
          : low
          ? "border-[#FFA500]/30"
          : "border-[#F8589F]/20"
      } backdrop-blur-sm max-md:gap-1.5 max-md:px-[8px] max-md:py-[4px]`}
      style={containerBgStyle}
      role="group"
      aria-label="Timer"
    >
      {/* Clock Icon */}
      <div
        className={`transition-all duration-500 ${
          critical ? "animate-pulse" : ""
        }`}
      >
        <Clock
          className={`${
            critical
              ? "text-[#F64C4C] animate-tick"
              : low
              ? "text-[#FFA500]"
              : "text-[#F8589F]"
          } max-md:w-[14px] max-md:h-[14px]`}
          size={16}
          strokeWidth={2.5}
        />
      </div>

      {/* Timer Display */}
      <div
        className={`font-bold tabular-nums transition-all duration-500 text-[13px] max-md:text-[12px] ${
          critical ? "scale-105" : ""
        }`}
        style={{
          color: critical ? "#F64C4C" : low ? "#FFA500" : "#F8589F",
          textShadow: critical ? "0 0 8px rgba(246, 76, 76, 0.3)" : "none"
        }}
        aria-live={running ? "polite" : "off"}
      >
        {Math.max(0, Math.ceil(clampedRemaining))}s
      </div>

      {/* Segmented Progress Bar - Hidden on mobile */}
      <div
        className="flex relative max-md:hidden"
        style={{ width: `${barWidth}px`, columnGap: gap }}
      >
        {Array.from({ length: safeSegments }).map((_, i) => {
          const isFilled = i < filled;
          const isActive = i === filled && clampedRemaining > 0;
          const base = isFilled ? filledClass : "bg-[#E9ECEF]";

          return (
            <div
              key={i}
              className={`relative flex-1 rounded-[6px] transition-all duration-500 overflow-hidden ${base} ${
                isFilled ? "shadow-sm" : ""
              }`}
              style={{
                height: `${barHeight}px`,
                transform: isFilled && critical ? "scale(1.03)" : "scale(1)",
              }}
              aria-hidden="true"
            >
              {/* Shimmer effect for filled segments */}
              {isFilled && (
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer"
                  style={{
                    backgroundSize: "200% 100%",
                  }}
                />
              )}

              {/* Partial fill for active segment */}
              {isActive && (
                <div
                  className={`absolute inset-y-0 left-0 rounded-[6px] ${filledClass} transition-all duration-300`}
                  style={{
                    width: `${Math.max(0.1, frac) * 100}%`,
                    boxShadow: critical ? "0 0 6px rgba(246, 76, 76, 0.4)" : "none"
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Label - Hidden on mobile */}
      <span className="text-[10px] font-medium text-[#6C757D] whitespace-nowrap max-md:hidden ml-0.5">
        Temps restant
      </span>

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 8px 24px rgba(246, 76, 76, 0.25), inset 0 1px 3px rgba(255, 255, 255, 0.4);
          }
          50% {
            box-shadow: 0 12px 32px rgba(246, 76, 76, 0.4), inset 0 1px 3px rgba(255, 255, 255, 0.4);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes tick {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-10deg);
          }
          75% {
            transform: rotate(10deg);
          }
        }

        .animate-pulse-glow {
          animation: pulse-glow 1.5s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }

        .animate-tick {
          animation: tick 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
