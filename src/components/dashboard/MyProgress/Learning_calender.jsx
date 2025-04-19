"use client";

import React, { useState } from "react";
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
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Using lucide icons for consistency

const Learning_calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");

  const { data: fetchedInteractions, isLoading } = useQuery({
    // More specific query key
    queryKey: ["learningCalendarInteractions", formattedSelectedDate],
    queryFn: async () => {
      if (!secureLocalStorage.getItem("token")) return {}; // Return empty object if not logged in
      const token = secureLocalStorage.getItem("token");
      try {
        const response = await BaseUrl.get("/progress/count", {
          params: {
            date: formattedSelectedDate, // Send formatted date
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Assuming response.data.data is an object like: { "10:00": 5, "14:00": 8 }
        return response.data.data || {};
      } catch (error) {
        console.error("Error fetching learning data:", error);
        // Consider showing a toast or error message
        return {}; // Return empty object on error
      }
    },
    enabled: !!secureLocalStorage.getItem("token"), // Only run if token exists
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Week generation logic remains the same
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Assuming week starts on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Use dynamic time slots if needed, or keep fixed
  const timeSlots = [
    "10:00",
    "12:00",
    "14:00",
    "16:00",
    "18:00",
    "20:00",
    "22:00",
  ];

  const handlePrevWeek = () => {
    setCurrentDate(subDays(currentDate, 7));
  };

  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // The useQuery will automatically refetch due to queryKey change
  };

  // Use the fetched data, default to empty object if loading or no data
  const dailyInteractions = !isLoading ? fetchedInteractions || {} : {};
  const totalDailyInteractions = Object.values(dailyInteractions).reduce(
    (a, b) => a + Number(b),
    0
  );

  if (isLoading) {
    // Simplified Loading state to fit your structure
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
              {weekDays.map((day) => (
                <div
                  key={day.toString()}
                  className={`flex-1 text-center py-1 cursor-pointer rounded transition-colors duration-150 ${
                    isSameDay(day, selectedDate)
                      ? "bg-pink-100 text-pink-600 font-semibold"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                  onClick={() => handleDateSelect(day)}
                >
                  <div className="text-[11px] sm:text-xs uppercase tracking-wide">
                    {format(day, "EEE")}
                  </div>
                  <div
                    className={`text-sm sm:text-base font-medium mt-0.5 ${
                      isSameDay(day, new Date()) &&
                      !isSameDay(day, selectedDate)
                        ? "text-pink-500"
                        : ""
                    } ${isSameDay(day, selectedDate) ? "" : "text-gray-800"}`}
                  >
                    {format(day, "d")}
                  </div>
                </div>
              ))}
            </div>
            {/* Time Slots - Adjusted spacing, sizes and positioning */}
            <div className="space-y-2 sm:space-y-3">
              {/* Added visual time lines */}
              <div className="relative border-t border-gray-200 mt-2 mb-2">
                <span className="absolute -top-2 left-2 text-xs text-gray-400 bg-white px-1">
                  Heures
                </span>
              </div>

              {timeSlots.map((time) => {
                const interactionCount = Number(dailyInteractions[time] || 0);
                const hour = parseInt(time.split(":")[0], 10);
                const displayTime = format(
                  new Date(0, 0, 0, hour),
                  "h a"
                ).toLowerCase(); // Format time like '10 am'

                return (
                  <div
                    key={time}
                    className="flex items-center relative min-h-[32px] sm:min-h-[36px]"
                  >
                    {" "}
                    {/* Use min-h */}
                    {/* Adjusted label width, padding and text size */}
                    <div className="w-12 sm:w-14 text-right text-gray-400 text-[10px] sm:text-xs pr-2 sm:pr-3 flex-shrink-0">
                      {displayTime}
                    </div>
                    {/* Ensure line takes up remaining space */}
                    <div className="flex-grow border-t border-dashed border-gray-200 relative top-[1px]"></div>
                    {interactionCount > 0 && (
                      // Container for dots and count, adjusted positioning
                      <div className="absolute top-1/2 transform -translate-y-1/2 left-[54px] sm:left-[62px] right-0 flex items-center justify-between pr-2 sm:pr-4">
                        {/* Display dots - maybe limit number visually */}
                        <div className="flex space-x-1 items-center">
                          {Array(Math.min(interactionCount, 8)) // Limit dots displayed
                            .fill(0)
                            .map((_, i) => (
                              <div
                                key={i}
                                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-pink-500"
                              ></div>
                            ))}
                          {interactionCount > 8 && (
                            <span className="text-[9px] sm:text-[10px] text-pink-400 ml-1">
                              +
                            </span>
                          )}
                        </div>
                        {/* Count - adjusted text size */}
                        <div className="text-pink-500 font-medium text-[11px] sm:text-xs ml-2">
                          {interactionCount}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Added bottom border */}
              <div className="border-t border-gray-200 pt-2"></div>
            </div>
            {/* Summary & Empty State - Adjusted margins and text size */}
            {!isLoading && totalDailyInteractions > 0 && (
              <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-600 border-t border-gray-100 pt-3">
                <p>
                  Total le {format(selectedDate, "d MMMM yyyy")}:{" "}
                  <span className="font-semibold text-pink-500">
                    {totalDailyInteractions} interactions
                  </span>
                </p>
                {/* Optional: Show peak time if desired */}
              </div>
            )}
            {!isLoading && totalDailyInteractions === 0 && (
              <div className="mt-6 text-center text-gray-400 text-xs sm:text-sm py-4">
                Aucune interaction enregistrée pour le{" "}
                {format(selectedDate, "d MMMM yyyy")}.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Learning_calendar;
