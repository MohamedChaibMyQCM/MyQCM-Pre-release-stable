"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import secureLocalStorage from "react-secure-storage";
import BaseUrl from "@/components/BaseUrl";
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  startOfDay,
  endOfDay,
  isValid,
  isWithinInterval,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const MotionDiv = motion.div;
const MotionButton = motion.button;
// --- Tooltip component (Keep the working version with click/touch) ---
const Tooltip = ({ children, content, onActivate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const checkTouch = () =>
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(checkTouch());
  }, []);

  const handleMouseEnter = () => {
    if (!isTouchDevice) setIsVisible(true);
  };
  const handleMouseLeave = () => {
    if (!isTouchDevice) setIsVisible(false);
  };
  const handleClick = (event) => {
    if (!isTouchDevice) return;
    event.stopPropagation();
    if (typeof onActivate === "function") {
      onActivate();
      setIsVisible(false);
      return;
    }
    setIsVisible((prev) => !prev);
  };

  useEffect(() => {
    if (!isTouchDevice || !isVisible) return;
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setIsVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isVisible, isTouchDevice]);

  return (
    <div
      ref={tooltipRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
      {isVisible && (
        <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded py-1 px-2 min-w-max shadow-lg">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-800 dark:border-t-gray-700"></div>
        </div>
      )}
    </div>
  );
};

// *** Define timeSlots OUTSIDE the component ***
const timeSlots = [
  "10:00",
  "12:00",
  "14:00",
  "16:00",
  "18:00",
  "20:00",
  "22:00",
];

const SEASON_STATUS_CONFIG = {
  good: { label: "Bonnes réponses", color: "#22c55e" },
  bad: { label: "Réponses incorrectes", color: "#ef4444" },
  neutral: { label: "Neutres", color: "#facc15" },
  skipped: { label: "Ignorées", color: "#ec4899" },
};

const SEASON_STATUS_SUMMARY = {
  good: "Saison réussie",
  bad: "Saison à retravailler",
  neutral: "Saison équilibrée",
  skipped: "Questions ignorées",
};

const getTimeSlotLabelFromHour = (hour = 0) => {
  if (hour < 10) return "10:00";
  if (hour < 12) return "12:00";
  if (hour < 14) return "14:00";
  if (hour < 16) return "16:00";
  if (hour < 18) return "18:00";
  if (hour < 20) return "20:00";
  return "22:00";
};

const getTimeSlotLabelFromDate = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return getTimeSlotLabelFromHour();
  }
  return getTimeSlotLabelFromHour(date.getHours());
};

const categorizeProgressAttempt = (attempt) => {
  if (!attempt) return "neutral";
  if (attempt.is_skipped) return "skipped";
  const ratio =
    typeof attempt.success_ratio === "number" ? attempt.success_ratio : null;
  if (ratio === null) return "neutral";
  if (ratio >= 0.8) return "good";
  if (ratio <= 0.4) return "bad";
  return "neutral";
};

const getDominantCategory = (counts) => {
  let dominant = "neutral";
  let max = -1;
  Object.entries(counts).forEach(([key, value]) => {
    if (value > max) {
      dominant = key;
      max = value;
    }
  });
  return dominant;
};

const buildSeasonDotStyle = (counts) => {
  const total = Object.values(counts || {}).reduce((sum, val) => sum + val, 0);
  if (!total) {
    return { backgroundColor: "rgba(255, 255, 255, 0.2)" };
  }

  if (counts.skipped === total) {
    return { backgroundColor: SEASON_STATUS_CONFIG.skipped.color };
  }

  const order = ["good", "neutral", "bad", "skipped"];
  let currentAngle = 0;
  const segments = [];

  order.forEach((key) => {
    const value = counts[key];
    if (!value) return;
    const nextAngle = currentAngle + (value / total) * 360;
    segments.push(
      `${SEASON_STATUS_CONFIG[key].color} ${currentAngle}deg ${nextAngle}deg`,
    );
    currentAngle = nextAngle;
  });

  if (!segments.length) {
    return { backgroundColor: "rgba(255, 255, 255, 0.2)" };
  }

  return {
    background: `conic-gradient(${segments.join(", ")})`,
  };
};

const Learning_calendar = ({ unitId, subjectId, dateRange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const router = useRouter();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.08,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const dayVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2 + i * 0.05,
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    }),
  };

  const timeSlotVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.4 + i * 0.05,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  const dotVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.6 + i * 0.05,
        type: "spring",
        stiffness: 400,
        damping: 20,
      },
    }),
  };

  const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");

  const dateRangeKey = useMemo(() => {
    if (!dateRange?.from) return "all";
    const fromKey = format(dateRange.from, "yyyy-MM-dd");
    const toKey = dateRange.to
      ? format(dateRange.to, "yyyy-MM-dd")
      : fromKey;
    return `${fromKey}:${toKey}`;
  }, [dateRange]);

  const { data: fetchedProgress, isLoading } = useQuery({
    queryKey: [
      "learningCalendarProgress",
      formattedSelectedDate,
      unitId || "all-units",
      subjectId || "all-subjects",
      dateRangeKey,
    ],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      if (!token) return [];
      try {
        const params = {
          date: formattedSelectedDate,
          offset: 250,
          page: 1,
        };
        if (unitId) params.unit = unitId;
        if (subjectId) params.subject = subjectId;

        const response = await BaseUrl.get("/progress", {
          params,
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data?.progress || [];
      } catch (error) {
        toast.error(
          "Erreur lors de la récupération des données d'apprentissage.",
        );
        console.error("Fetch error:", error);
        return [];
      }
    },
    enabled: !!formattedSelectedDate,
  });

  useEffect(() => {
    if (!dateRange?.from) return;
    const rangeStart = startOfDay(dateRange.from);
    const rangeEnd = endOfDay(dateRange.to ?? dateRange.from);

    const isInsideRange = isWithinInterval(selectedDate, {
      start: rangeStart,
      end: rangeEnd,
    });

    if (!isInsideRange) {
      setSelectedDate(rangeStart);
      setCurrentDate(rangeStart);
    }
  }, [dateRange, selectedDate]);

  const seasonAggregation = useMemo(() => {
    const baseTimeMap = {};
    const baseDetailsMap = {};
    timeSlots.forEach((slot) => {
      baseTimeMap[slot] = 0;
      baseDetailsMap[slot] = [];
    });

    if (!Array.isArray(fetchedProgress) || fetchedProgress.length === 0) {
      return {
        timeMap: baseTimeMap,
        detailMap: baseDetailsMap,
        totalSeasons: 0,
      };
    }

    const seasonsMap = new Map();

    fetchedProgress.forEach((item) => {
      if (!item) return;
      const sessionId = item.session?.id ?? `standalone-${item.id}`;
      const attemptDate =
        item.createdAt && typeof item.createdAt === "string"
          ? parseISO(item.createdAt)
          : null;
      const validDate =
        attemptDate && isValid(attemptDate) ? attemptDate : null;
      const isSessionless = !item.session?.id;
      if (!seasonsMap.has(sessionId)) {
        const fallbackTitle = isSessionless
          ? "Pratique libre"
          : "Saison sans titre";
        seasonsMap.set(sessionId, {
          id: sessionId,
          sessionId: item.session?.id ?? null,
          sessionTitle:
            item.session?.title?.trim() && item.session?.title.length > 0
              ? item.session.title
              : fallbackTitle,
          counts: { good: 0, bad: 0, neutral: 0, skipped: 0 },
          totalMcqs: 0,
          sumSuccessRatio: 0,
          totalXp: 0,
          attempts: [],
          earliest: validDate,
          latest: validDate,
        });
      }

      const season = seasonsMap.get(sessionId);
      const category = categorizeProgressAttempt(item);

      season.counts[category] += 1;
      season.totalMcqs += 1;
      season.totalXp += item.gained_xp ?? 0;
      if (typeof item.success_ratio === "number") {
        season.sumSuccessRatio += item.success_ratio;
      }
      if (validDate) {
        if (!season.earliest || validDate < season.earliest) {
          season.earliest = validDate;
        }
        if (!season.latest || validDate > season.latest) {
          season.latest = validDate;
        }
      }
      season.attempts.push({
        id: item.id || `attempt-${Math.random()}`,
        createdAt: validDate,
        category,
        isSkipped: item.is_skipped,
      });
    });

    const seasons = Array.from(seasonsMap.values()).map((season) => {
      const total = season.totalMcqs;
      const avgSuccessRatio =
        total > 0 ? season.sumSuccessRatio / total : 0;
      const earliest = season.earliest ?? null;
      const timeSlot = getTimeSlotLabelFromDate(
        earliest ?? new Date(currentDate),
      );

      return {
        ...season,
        avgSuccessRatio,
        earliest,
        timeSlot,
        isAllSkipped: total > 0 && season.counts.skipped === total,
        dominantCategory: getDominantCategory(season.counts),
      };
    });

    seasons.forEach((season) => {
      const slot = season.timeSlot ?? timeSlots[timeSlots.length - 1];
      if (!baseDetailsMap[slot]) {
        baseDetailsMap[slot] = [];
        baseTimeMap[slot] = 0;
      }
      baseDetailsMap[slot].push(season);
      baseTimeMap[slot] += 1;
    });

    Object.values(baseDetailsMap).forEach((details) => {
      details.sort((a, b) => {
        const aTime = a.earliest ? a.earliest.getTime() : 0;
        const bTime = b.earliest ? b.earliest.getTime() : 0;
        return aTime - bTime;
      });
    });

    return {
      timeMap: baseTimeMap,
      detailMap: baseDetailsMap,
      totalSeasons: seasons.length,
    };
  }, [fetchedProgress, currentDate]);

  const interactionsByTime = seasonAggregation.timeMap;
  const interactionDetails = seasonAggregation.detailMap;
  const totalDailyInteractions = seasonAggregation.totalSeasons;

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const handlePrevWeek = () => {
    setCurrentDate(subDays(currentDate, 7));
  };

  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  if (isLoading) {
    return (
      <div className="flex-1 mb-6 md:mb-0">
        <h3 className="font-[500] text-[16px] sm:text-[17px] mb-3 sm:mb-4 text-[#191919] dark:text-white">
          Calendrier d&apos;apprentissage
        </h3>
        <div className="bg-[#FFFFFF] dark:bg-[#1a1a1a] rounded-[16px] p-4 sm:py-6 sm:px-6 box min-h-[400px] flex items-center justify-center text-center text-gray-500 dark:text-gray-400 border border-transparent dark:border-gray-700">
          <div>Chargement...</div>
        </div>
      </div>
    );
  }

  // Keep the rest of the JSX exactly the same as your last provided version
  return (
    <MotionDiv
      id="tour-learning-calendar"
      className="flex-1 mb-6 md:mb-0"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h3
        className="font-[500] text-[16px] sm:text-[17px] mb-3 sm:mb-4 text-[#191919] dark:text-white"
        variants={headerVariants}
      >
        Calendrier d&apos;apprentissage
      </motion.h3>
      <MotionDiv
        className="bg-[#FFFFFF] dark:bg-[#1a1a1a] rounded-[16px] p-4 sm:py-6 sm:px-6 box border border-transparent dark:border-gray-700"
        variants={cardVariants}
        whileHover={{
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.1)",
          transition: { duration: 0.3 },
        }}
      >
        <Card className="border-none shadow-none">
          <CardContent className="p-0">
            {/* Header: Legend and Navigation */}
            <motion.div
              className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4 mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Saisons (clic/survol pour détails)
                </span>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {Object.entries(SEASON_STATUS_CONFIG).map(([key, meta]) => (
                    <div key={key} className="flex items-center gap-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/20"
                        style={{ backgroundColor: meta.color }}
                        aria-hidden="true"
                      ></span>
                      <span className="text-[11px] sm:text-xs">{meta.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <MotionButton
                  onClick={handlePrevWeek}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                  aria-label="Semaine précédente"
                  whileHover={{ scale: 1.1, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
                </MotionButton>
                <motion.span
                  className="font-medium text-xs sm:text-sm text-center w-[140px] sm:w-auto text-gray-700 dark:text-white"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  {format(weekStart, "d MMM")} -{" "}
                  {format(weekEnd, "d MMM, yyyy")}
                </motion.span>
                <MotionButton
                  onClick={handleNextWeek}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                  aria-label="Semaine suivante"
                  whileHover={{ scale: 1.1, x: 2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
                </MotionButton>
              </div>
            </motion.div>

            {/* Week Day Selector */}
            <div className="flex mb-3 sm:mb-4">
              {weekDays.map((day, index) => {
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                return (
                  <MotionDiv
                    key={day.toISOString()} // Use ISO string for key
                    className={`flex-1 text-center py-1 cursor-pointer rounded transition-colors duration-150 ${
                      isSelected ? "bg-pink-100 dark:bg-pink-900/30" : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => handleDateSelect(day)}
                    role="button"
                    aria-pressed={isSelected}
                    tabIndex={0} // Make it focusable
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      handleDateSelect(day)
                    }
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={dayVariants}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div
                      className={`text-[11px] sm:text-xs uppercase tracking-wide ${
                        isSelected
                          ? "text-pink-600 font-semibold"
                          : "text-gray-700 dark:text-gray-300"
                      } ${isToday && !isSelected ? "text-pink-500" : ""}`}
                    >
                      {format(day, "EEE", { locale: fr })}
                    </div>
                    <div
                      className={`text-sm sm:text-base font-medium mt-0.5 ${
                        isSelected
                          ? "text-pink-600 font-semibold"
                          : "text-gray-800 dark:text-white"
                      } ${isToday && !isSelected ? "text-pink-500" : ""}`}
                    >
                      {format(day, "d")}
                    </div>
                  </MotionDiv>
                );
              })}
            </div>

            {/* Time Slots Display */}
            <div className="space-y-2 sm:space-y-3">
              <div className="relative border-t border-gray-200 dark:border-gray-700 mt-2 mb-2">
                <span className="absolute -top-2.5 left-2 text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-[#1a1a1a] px-1">
                  Heures
                </span>
              </div>

              {timeSlots.map((time, timeIndex) => {
                const interactionCount = interactionsByTime[time] || 0;
                const details = interactionDetails[time] || [];
                const hour = parseInt(time.split(":")[0], 10);
                // Using 'HH' for 24-hour format, adjust if needed
                const displayTime = format(new Date(0, 0, 0, hour), "HH:mm");

                return (
                  <MotionDiv
                    key={time}
                    className="flex items-center relative min-h-[32px] sm:min-h-[36px]"
                    custom={timeIndex}
                    initial="hidden"
                    animate="visible"
                    variants={timeSlotVariants}
                  >
                    {/* Time Label */}
                    <div className="w-12 sm:w-14 text-right text-gray-400 dark:text-gray-500 text-[10px] sm:text-xs pr-2 sm:pr-3 flex-shrink-0 tabular-nums">
                      {displayTime}
                    </div>
                    {/* Dashed Line */}
                    <div className="flex-grow border-t border-dashed border-gray-200 dark:border-gray-700 relative top-[1px]"></div>

                    {/* Interaction Dots and Count (only if count > 0) */}
                    {interactionCount > 0 && (
                      // Position dots container relative to the dashed line start
                      <div className="absolute top-1/2 transform -translate-y-1/2 left-[54px] sm:left-[62px] right-0 flex items-center justify-between pr-2 sm:pr-4">
                        {/* Container for the dots */}
                        <div className="flex space-x-1 items-center">
                          {details.slice(0, 8).map((detail, dotIndex) => {
                            const dominantMeta =
                              SEASON_STATUS_CONFIG[detail.dominantCategory] ||
                              SEASON_STATUS_CONFIG.neutral;
                            const dotStyle = buildSeasonDotStyle(detail.counts);
                            const hoverShadowColor = dominantMeta.color;
                            const timeLabel = detail.earliest
                              ? format(detail.earliest, "HH:mm")
                              : "—";
                            const endTimeLabel =
                              detail.latest &&
                              detail.earliest &&
                              detail.latest.getTime() !== detail.earliest.getTime()
                                ? format(detail.latest, "HH:mm")
                                : null;
                            const isReplayAvailable = Boolean(detail.sessionId);
                            const accuracyDisplay =
                              typeof detail.avgSuccessRatio === "number" &&
                              !Number.isNaN(detail.avgSuccessRatio)
                                ? `${Math.round(detail.avgSuccessRatio * 100)}%`
                                : "—";
                            const summaryCounts = Object.entries(detail.counts || {}).filter(
                              ([, value]) => value > 0,
                            );

                            const navigateToReplay = () => {
                              if (!isReplayAvailable) {
                                toast.error("Aucun replay disponible pour cette saison.");
                                return;
                              }
                              router.push(
                                `/dashboard/question-bank/session/${detail.sessionId}/replay?date=${formattedSelectedDate}`,
                              );
                            };

                            return (
                              <Tooltip
                                key={detail.id}
                                content={
                                  <div className="text-xs text-left space-y-2 max-w-[220px]">
                                    <div>
                                      <div className="font-semibold text-white">
                                        {detail.sessionTitle}
                                      </div>
                                      <div className="text-[10px] text-gray-300">
                                        {timeLabel}
                                        {endTimeLabel ? ` - ${endTimeLabel}` : ""}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                                      {summaryCounts.length === 0 && (
                                        <span className="col-span-2 text-gray-300">
                                          Aucune donnée disponible
                                        </span>
                                      )}
                                      {summaryCounts.map(([key, value]) => (
                                        <span key={key} className="flex items-center gap-1">
                                          <span
                                            className="w-2 h-2 rounded-full"
                                            style={{
                                              backgroundColor:
                                                SEASON_STATUS_CONFIG[key]?.color,
                                            }}
                                            aria-hidden="true"
                                          ></span>
                                          <span>
                                            {SEASON_STATUS_CONFIG[key]?.label}: {value}
                                          </span>
                                        </span>
                                      ))}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-200">
                                      <span>
                                        MCQ : <strong>{detail.totalMcqs}</strong>
                                      </span>
                                      <span>
                                        Précision : <strong>{accuracyDisplay}</strong>
                                      </span>
                                      {detail.totalXp > 0 && (
                                        <span>
                                          XP : <strong>+{detail.totalXp}</strong>
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-gray-200">
                                      {SEASON_STATUS_SUMMARY[detail.dominantCategory] ||
                                        SEASON_STATUS_SUMMARY.neutral}
                                    </div>
                                    <div className="pt-1 text-[10px] text-gray-300 opacity-80">
                                      {isReplayAvailable
                                        ? "Cliquer pour revoir la saison"
                                        : "Replay indisponible"}
                                    </div>
                                  </div>
                                }
                                onActivate={isReplayAvailable ? navigateToReplay : undefined}
                              >
                                <motion.div
                                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full cursor-pointer shadow-sm border border-white/40"
                                  style={dotStyle}
                                  aria-label={`Saison ${detail.sessionTitle}`}
                                  custom={dotIndex}
                                  initial="hidden"
                                  animate="visible"
                                  variants={dotVariants}
                                  whileHover={{
                                    scale: 1.2,
                                    boxShadow: `0 0 12px ${hoverShadowColor}99`,
                                  }}
                                  whileTap={{ scale: 0.92 }}
                                  onClick={isReplayAvailable ? navigateToReplay : undefined}
                                ></motion.div>
                              </Tooltip>
                            );
                          })}
                          {/* Indicator if more dots exist */}
                          {interactionCount > 8 && (
                            <motion.span
                              className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 ml-1 font-medium"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.65, type: "spring", stiffness: 280 }}
                            >
                              +{interactionCount - 8}
                            </motion.span>
                          )}
                        </div>
                        {/* Total count for the time slot */}
                        <motion.div
                          className="text-gray-600 dark:text-gray-200 font-medium text-[11px] sm:text-xs ml-2 tabular-nums"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6, duration: 0.3 }}
                        >
                          {interactionCount}
                        </motion.div>
                      </div>
                    )}
                  </MotionDiv>
                );
              })}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2"></div>
            </div>

            {/* Summary Footer */}
            <AnimatePresence mode="wait">
              {!isLoading && totalDailyInteractions > 0 && (
                <motion.div
                  className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                >
                  <p>
                    Total le {format(selectedDate, "d MMMM yyyy", { locale: fr })}
                    :{" "}
                    <motion.span
                      className="font-semibold text-pink-500"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1, type: "spring", stiffness: 200 }}
                    >
                      {totalDailyInteractions} saison
                      {totalDailyInteractions > 1 ? "s" : ""}
                    </motion.span>
                  </p>
                </motion.div>
              )}
              {!isLoading && totalDailyInteractions === 0 && (
                <motion.div
                  className="mt-6 text-center text-gray-400 dark:text-gray-500 text-xs sm:text-sm py-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  Aucune saison enregistrée pour le{" "}
                  {format(selectedDate, "d MMMM yyyy", { locale: fr })}.
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </MotionDiv>
    </MotionDiv>
  );
};

export default Learning_calendar;
