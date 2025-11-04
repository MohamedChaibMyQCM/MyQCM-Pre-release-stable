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
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

// --- Tooltip component (Keep the working version with click/touch) ---
const Tooltip = ({ children, content }) => {
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
    if (isTouchDevice) {
      event.stopPropagation();
      setIsVisible((prev) => !prev);
    }
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

const Learning_calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [interactionsByTime, setInteractionsByTime] = useState({});
  const [interactionDetails, setInteractionDetails] = useState({});

  const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");

  const { data: fetchedProgress, isLoading } = useQuery({
    queryKey: ["learningCalendarProgress", formattedSelectedDate],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      if (!token) return [];
      try {
        const response = await BaseUrl.get("/progress", {
          params: {
            date: formattedSelectedDate,
            offset: 100, // Request higher offset to capture all attempts for heavy study days
            page: 1
          },
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data?.progress || [];
      } catch (error) {
        toast.error(
          "Erreur lors de la récupération des données d'apprentissage."
        );
        console.error("Fetch error:", error);
        return [];
      }
    },
    enabled: !!formattedSelectedDate,
  });

  // Get appropriate feedback summary (keep original logic)
  const getFeedbackSummary = (feedback) => {
    if (!feedback) return "Pas de feedback";
    if (typeof feedback !== "string") return "Feedback invalide";

    if (feedback.includes("Perfect") || feedback.includes("completely correct"))
      return "Réponse parfaite";
    if (
      feedback.includes("pertinente") ||
      feedback.includes("aborde les principaux")
    )
      return "Réponse partiellement correcte";
    // Keep original fallback
    return "Réponse à améliorer";
  };

  // Get appropriate color based on feedback (keep original logic)
  const getFeedbackColor = (feedback) => {
    if (!feedback || typeof feedback !== "string") return "gray";

    if (feedback.includes("Perfect") || feedback.includes("completely correct"))
      return "green";
    if (
      feedback.includes("pertinente") ||
      feedback.includes("aborde les principaux")
    )
      return "yellow";
    // Keep original fallback
    return "red"; // Or "pink" if preferred
  };

  // useEffect logic
  useEffect(() => {
    // Initialize maps outside the conditional logic
    const initialTimeMap = {};
    const initialDetailsMap = {};
    timeSlots.forEach((time) => {
      initialTimeMap[time] = 0;
      initialDetailsMap[time] = [];
    });

    if (fetchedProgress && fetchedProgress.length > 0) {
      // Check if fetchedProgress has data
      const timeMap = { ...initialTimeMap }; // Start with initialized map
      const detailsMap = { ...initialDetailsMap }; // Start with initialized map

      const selectedDateStart = startOfDay(selectedDate);
      const selectedDateEnd = endOfDay(selectedDate);

      fetchedProgress.forEach((item) => {
        if (!item || !item.createdAt) return;
        try {
          const itemDate = parseISO(item.createdAt);
          if (
            !isNaN(itemDate) &&
            itemDate >= selectedDateStart &&
            itemDate <= selectedDateEnd
          ) {
            const hour = itemDate.getHours();
            let timeSlot;
            if (hour < 10) timeSlot = "10:00";
            else if (hour < 12) timeSlot = "12:00";
            else if (hour < 14) timeSlot = "14:00";
            else if (hour < 16) timeSlot = "16:00";
            else if (hour < 18) timeSlot = "18:00";
            else if (hour < 20) timeSlot = "20:00";
            else timeSlot = "22:00";

            // Only update if the slot exists (it always should now)
            if (timeMap.hasOwnProperty(timeSlot)) {
              timeMap[timeSlot] += 1;
              detailsMap[timeSlot].push({
                id: item.id || `detail-${Math.random()}`,
                time: format(itemDate, "HH:mm"),
                feedback: item.feedback || null,
                success_ratio: item.success_ratio ?? 0,
                timeSpent: item.time_spent ?? 0,
                xp: item.gained_xp ?? 0,
              });
            }
          }
        } catch (e) {
          console.error("Error processing progress item:", item, e);
        }
      });

      setInteractionsByTime(timeMap);
      setInteractionDetails(detailsMap);
    } else {
      // Reset to empty maps if fetchedProgress is empty, null, or undefined
      setInteractionsByTime(initialTimeMap);
      setInteractionDetails(initialDetailsMap);
    }
    // *** Remove timeSlots from dependency array ***
  }, [fetchedProgress, selectedDate]);

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

  const totalDailyInteractions = useMemo(() => {
    return Object.values(interactionsByTime).reduce(
      (sum, count) => sum + (count || 0),
      0
    );
  }, [interactionsByTime]);

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
    <div id="tour-learning-calendar" className="flex-1 mb-6 md:mb-0">
      <h3 className="font-[500] text-[16px] sm:text-[17px] mb-3 sm:mb-4 text-[#191919] dark:text-white">
        Calendrier d&apos;apprentissage
      </h3>
      <div className="bg-[#FFFFFF] dark:bg-[#1a1a1a] rounded-[16px] p-4 sm:py-6 sm:px-6 box border border-transparent dark:border-gray-700">
        <Card className="border-none shadow-none">
          <CardContent className="p-0">
            {/* Header: Legend and Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4 mb-4">
              <div className="flex items-center">
                {/* Using a neutral color dot for the legend */}
                <div className="w-3 h-3 bg-pink-500 rounded-full mr-2 flex-shrink-0"></div>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Interactions (clic/survol pour détails)
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={handlePrevWeek}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                  aria-label="Semaine précédente"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
                </button>
                <span className="font-medium text-xs sm:text-sm text-center w-[140px] sm:w-auto text-gray-700 dark:text-white">
                  {format(weekStart, "d MMM")} -{" "}
                  {format(weekEnd, "d MMM, yyyy")}
                </span>
                <button
                  onClick={handleNextWeek}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                  aria-label="Semaine suivante"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Week Day Selector */}
            <div className="flex mb-3 sm:mb-4">
              {weekDays.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                return (
                  <div
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
                  </div>
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

              {timeSlots.map((time) => {
                const interactionCount = interactionsByTime[time] || 0;
                const details = interactionDetails[time] || [];
                const hour = parseInt(time.split(":")[0], 10);
                // Using 'HH' for 24-hour format, adjust if needed
                const displayTime = format(new Date(0, 0, 0, hour), "HH:mm");

                return (
                  <div
                    key={time}
                    className="flex items-center relative min-h-[32px] sm:min-h-[36px]"
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
                          {details.slice(0, 8).map((detail) => {
                            // Limit to showing 8 dots initially
                            const color = getFeedbackColor(detail.feedback);
                            return (
                              <Tooltip
                                key={detail.id}
                                content={
                                  <div className="text-xs text-left">
                                    <div className="font-medium mb-1">
                                      {detail.time}
                                    </div>
                                    <div
                                      className={`capitalize ${
                                        color === "green"
                                          ? "text-green-400"
                                          : color === "yellow"
                                          ? "text-yellow-400"
                                          : "text-pink-400" // Assuming pink for 'red' case
                                      }`}
                                    >
                                      {getFeedbackSummary(detail.feedback)}
                                    </div>
                                    {/* Keep original null/undefined checks */}
                                    {detail.timeSpent != null && (
                                      <div>Durée: {detail.timeSpent}s</div>
                                    )}
                                    {detail.xp != null && detail.xp > 0 && (
                                      <div>XP: +{detail.xp}</div>
                                    )}
                                  </div>
                                }
                              >
                                {/* The actual colored dot */}
                                <div
                                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full cursor-pointer shadow-sm border border-white ${
                                    color === "green"
                                      ? "bg-green-500 hover:bg-green-400"
                                      : color === "yellow"
                                      ? "bg-yellow-400 hover:bg-yellow-300"
                                      : "bg-pink-500 hover:bg-pink-400" // Keep original pink/red logic
                                  }`}
                                  aria-label={`Interaction à ${detail.time}`}
                                ></div>
                              </Tooltip>
                            );
                          })}
                          {/* Indicator if more dots exist */}
                          {interactionCount > 8 && (
                            <span className="text-[9px] sm:text-[10px] text-pink-400 ml-1 font-medium">
                              +{interactionCount - 8}
                            </span>
                          )}
                        </div>
                        {/* Total count for the time slot */}
                        <div className="text-pink-500 font-medium text-[11px] sm:text-xs ml-2 tabular-nums">
                          {interactionCount}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2"></div>
            </div>

            {/* Summary Footer */}
            {!isLoading && totalDailyInteractions > 0 && (
              <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
                <p>
                  Total le {format(selectedDate, "d MMMM yyyy", { locale: fr })}
                  :{" "}
                  <span className="font-semibold text-pink-500">
                    {totalDailyInteractions} interaction
                    {totalDailyInteractions > 1 ? "s" : ""}
                  </span>
                </p>
              </div>
            )}
            {!isLoading && totalDailyInteractions === 0 && (
              <div className="mt-6 text-center text-gray-400 dark:text-gray-500 text-xs sm:text-sm py-4">
                Aucune interaction enregistrée pour le{" "}
                {format(selectedDate, "d MMMM yyyy", { locale: fr })}.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Learning_calendar;
