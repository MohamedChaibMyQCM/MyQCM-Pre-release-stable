"use client";

import React, { useState, useEffect } from "react";
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

// Tooltip component
const Tooltip = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 bg-gray-800 text-white text-xs rounded py-1 px-2 min-w-max">
          {content}
          <div className="tooltip-arrow absolute top-full left-1/2 transform -translate-x-1/2 border-t-4 border-l-4 border-r-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

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
      try {
        const response = await BaseUrl.get("/progress", {
          params: {
            date: formattedSelectedDate,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data.data?.progress || [];
      } catch (error) {
        toast.error(
          "Erreur lors de la récupération des données d'apprentissage."
        );
        return [];
      }
    },
  });

  // Define time slots
  const timeSlots = [
    "10:00",
    "12:00",
    "14:00",
    "16:00",
    "18:00",
    "20:00",
    "22:00",
  ];

  // Get appropriate feedback summary
  const getFeedbackSummary = (feedback) => {
    if (!feedback) return "Pas de feedback";
    
    if (feedback.includes("Perfect") || feedback.includes("completely correct")) {
      return "Réponse parfaite";
    }
    
    if (feedback.includes("pertinente") || feedback.includes("aborde les principaux")) {
      return "Réponse partiellement correcte";
    }
    
    return "Réponse à améliorer";
  };

  // Get appropriate color based on feedback
  const getFeedbackColor = (feedback) => {
    if (!feedback) return "gray";
    
    if (feedback.includes("Perfect") || feedback.includes("completely correct")) {
      return "green";
    }
    
    if (feedback.includes("pertinente") || feedback.includes("aborde les principaux")) {
      return "yellow";
    }
    
    return "red";
  };

  useEffect(() => {
    if (fetchedProgress) {
      const timeMap = {};
      const detailsMap = {};

      // Initialize time slots with 0 and empty arrays
      timeSlots.forEach((time) => {
        timeMap[time] = 0;
        detailsMap[time] = [];
      });

      // Filter progress data for the selected date
      const selectedDateStart = startOfDay(selectedDate);
      const selectedDateEnd = endOfDay(selectedDate);
      
      const filteredProgress = fetchedProgress.filter(item => {
        if (!item.createdAt) return false;
        
        const itemDate = parseISO(item.createdAt);
        return itemDate >= selectedDateStart && itemDate <= selectedDateEnd;
      });

      // Count interactions per time slot for the filtered data
      filteredProgress.forEach((item) => {
        if (item.createdAt) {
          const date = parseISO(item.createdAt);
          const hour = date.getHours();
          
          // Find the appropriate time slot based on hour
          let timeSlot;
          if (hour <= 10) timeSlot = "10:00";
          else if (hour <= 12) timeSlot = "12:00";
          else if (hour <= 14) timeSlot = "14:00";
          else if (hour <= 16) timeSlot = "16:00";
          else if (hour <= 18) timeSlot = "18:00";
          else if (hour <= 20) timeSlot = "20:00";
          else timeSlot = "22:00";
          
          if (timeMap[timeSlot] !== undefined) {
            timeMap[timeSlot] += 1;
            
            // Store details for tooltip
            detailsMap[timeSlot].push({
              id: item.id,
              time: format(date, "HH:mm"),
              feedback: item.feedback,
              success: item.success_ratio > 0,
              timeSpent: item.time_spent,
              xp: item.gained_xp
            });
          }
        }
      });

      setInteractionsByTime(timeMap);
      setInteractionDetails(detailsMap);
    }
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

  const totalDailyInteractions = Object.values(interactionsByTime).reduce(
    (sum, count) => sum + count,
    0
  );

  if (isLoading) {
    return (
      <div className="flex-1 mb-6 md:mb-0">
        <h3 className="font-[500] text-[16px] sm:text-[17px] mb-3 sm:mb-4 text-[#191919]">
          Calendrier d&apos;apprentissage
        </h3>
        <div className="bg-[#FFFFFF] rounded-[16px] p-4 sm:py-6 sm:px-6 box min-h-[400px] flex items-center justify-center text-center text-gray-500">
          <div>Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div id="tour-learning-calendar" className="flex-1 mb-6 md:mb-0">
      <h3 className="font-[500] text-[16px] sm:text-[17px] mb-3 sm:mb-4 text-[#191919]">
        Calendrier d&apos;apprentissage
      </h3>
      <div className="bg-[#FFFFFF] rounded-[16px] p-4 sm:py-6 sm:px-6 box">
        <Card className="border-none shadow-none">
          <CardContent className="p-0">
            <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4 mb-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-pink-500 rounded-full mr-2 flex-shrink-0"></div>
                <span className="text-xs sm:text-sm text-gray-600">
                  Interactions
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={handlePrevWeek}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                  aria-label="Semaine précédente"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <span className="font-medium text-xs sm:text-sm text-center w-[140px] sm:w-auto">
                  {format(weekStart, "d MMM")} -{" "}
                  {format(weekEnd, "d MMM, yyyy")}
                </span>
                <button
                  onClick={handleNextWeek}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                  aria-label="Semaine suivante"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>
            <div className="flex mb-3 sm:mb-4">
              {weekDays.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toString()}
                    className={`flex-1 text-center py-1 cursor-pointer rounded transition-colors duration-150 ${
                      isSelected ? "bg-pink-100" : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleDateSelect(day)}
                  >
                    <div
                      className={`text-[11px] sm:text-xs uppercase tracking-wide ${
                        isSelected
                          ? "text-pink-600 font-semibold"
                          : "text-gray-700"
                      } ${isToday && !isSelected ? "text-pink-500" : ""}`}
                    >
                      {format(day, "EEE", { locale: fr })}
                    </div>
                    <div
                      className={`text-sm sm:text-base font-medium mt-0.5 ${
                        isSelected
                          ? "text-pink-600 font-semibold"
                          : "text-gray-800"
                      } ${isToday && !isSelected ? "text-pink-500" : ""}`}
                    >
                      {format(day, "d")}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Only show time slots for selected day */}
            <div className="space-y-2 sm:space-y-3">
              <div className="relative border-t border-gray-200 mt-2 mb-2">
                <span className="absolute -top-2 left-2 text-xs text-gray-400 bg-white px-1">
                  Heures
                </span>
              </div>

              {timeSlots.map((time) => {
                const interactionCount = interactionsByTime[time] || 0;
                const details = interactionDetails[time] || [];
                const hour = parseInt(time.split(":")[0], 10);
                const displayTime = format(
                  new Date(0, 0, 0, hour),
                  "h a"
                ).toLowerCase();

                return (
                  <div
                    key={time}
                    className="flex items-center relative min-h-[32px] sm:min-h-[36px]"
                  >
                    <div className="w-12 sm:w-14 text-right text-gray-400 text-[10px] sm:text-xs pr-2 sm:pr-3 flex-shrink-0">
                      {displayTime}
                    </div>
                    <div className="flex-grow border-t border-dashed border-gray-200 relative top-[1px]"></div>
                    {interactionCount > 0 && (
                      <div className="absolute top-1/2 transform -translate-y-1/2 left-[54px] sm:left-[62px] right-0 flex items-center justify-between pr-2 sm:pr-4">
                        <div className="flex space-x-1 items-center">
                          {details.map((detail, i) => (
                            i < 8 && (
                              <Tooltip 
                                key={i} 
                                content={
                                  <div className="text-xs">
                                    <div className="font-medium mb-1">{detail.time}</div>
                                    <div className={`text-${getFeedbackColor(detail.feedback)}-400`}>
                                      {getFeedbackSummary(detail.feedback)}
                                    </div>
                                    <div>Durée: {detail.timeSpent}s</div>
                                    {detail.xp && <div>XP: +{detail.xp}</div>}
                                  </div>
                                }
                              >
                                <div
                                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full cursor-pointer ${
                                    getFeedbackColor(detail.feedback) === "green"
                                      ? "bg-green-500"
                                      : getFeedbackColor(detail.feedback) === "yellow"
                                      ? "bg-yellow-500"
                                      : "bg-pink-500"
                                  }`}
                                ></div>
                              </Tooltip>
                            )
                          ))}
                          {interactionCount > 8 && (
                            <span className="text-[9px] sm:text-[10px] text-pink-400 ml-1">
                              +
                            </span>
                          )}
                        </div>
                        <div className="text-pink-500 font-medium text-[11px] sm:text-xs ml-2">
                          {interactionCount}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="border-t border-gray-200 pt-2"></div>
            </div>

            {!isLoading && totalDailyInteractions > 0 && (
              <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-600 border-t border-gray-100 pt-3">
                <p>
                  Total le {format(selectedDate, "d MMMM yyyy", { locale: fr })}:{" "}
                  <span className="font-semibold text-pink-500">
                    {totalDailyInteractions} interactions
                  </span>
                </p>
              </div>
            )}
            {!isLoading && totalDailyInteractions === 0 && (
              <div className="mt-6 text-center text-gray-400 text-xs sm:text-sm py-4">
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