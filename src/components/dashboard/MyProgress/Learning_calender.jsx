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

const Learning_calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: learningData, isLoading } = useQuery({
    queryKey: ["learningCalendar", selectedDate],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get("/progress/count", {
        params: {
          date: format(selectedDate, "yyyy-MM-dd"),
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data || [];
    },
  });

  // Générer les jours de la semaine
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Données fictives - à remplacer par votre structure de données réelle
  const mockInteractions = {
    "2025-01-29": {
      "14:00": 14,
      "16:00": 18,
      "20:00": 10,
    },
    [format(new Date(), "yyyy-MM-dd")]: {
      "10:00": 5,
      "14:00": 8,
      "18:00": 12,
    },
  };

  // Plages horaires à afficher
  const timeSlots = ["10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM", "10 PM"];

  const handlePrevWeek = () => {
    setCurrentDate(subDays(currentDate, 7));
  };

  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  // Obtenir les interactions pour la date sélectionnée
  const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
  const dailyInteractions = mockInteractions[selectedDateKey] || {};

  if (isLoading) {
    return (
      <div className="flex-1">
        <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
          Calendrier d&apos;apprentissage
        </h3>
        <div className="bg-[#FFFFFF] rounded-[16px] py-6 box h-[300px] flex items-center justify-center">
          <div className="animate-pulse">
            Chargement des données du calendrier...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        Calendrier d&apos;apprentissage
      </h3>
      <div className="bg-[#FFFFFF] rounded-[16px] py-6 box h-[520px]">
        <Card className="border-none shadow-none">
          <CardContent>
            {/* Navigation de la semaine */}
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
                <span className="text-sm">Interactions</span>
              </div>

              <div className="ml-auto flex items-center gap-4">
                <button
                  onClick={handlePrevWeek}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide-chevron-left"
                  >
                    <path d="m15 18-6-6 6-6"></path>
                  </svg>
                </button>
                <span className="font-medium">
                  {format(weekStart, "MMM d")} -{" "}
                  {format(weekEnd, "MMM d, yyyy")}
                </span>
                <button
                  onClick={handleNextWeek}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide-chevron-right"
                  >
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* En-tête des jours de la semaine */}
            <div className="flex mb-2">
              {weekDays.map((day) => (
                <div
                  key={day.toString()}
                  className={`flex-1 text-center text-sm py-1 cursor-pointer rounded ${
                    isSameDay(day, selectedDate)
                      ? "bg-pink-100 text-pink-600"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleDateSelect(day)}
                >
                  <div>{format(day, "EEE")}</div>
                  <div
                    className={`text-xs ${
                      isSameDay(day, new Date())
                        ? "text-pink-500 font-bold"
                        : ""
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                </div>
              ))}
            </div>

            {/* Plages horaires avec interactions */}
            <div className="space-y-4">
              {timeSlots.map((time) => {
                const timeKey = time
                  .replace(" AM", ":00")
                  .replace(" PM", ":00");
                const interactionCount = dailyInteractions[timeKey] || 0;

                return (
                  <div key={time} className="flex items-center relative h-8">
                    <div className="w-16 text-right text-gray-500 text-sm pr-4">
                      {time}
                    </div>
                    <div className="w-full border-t border-dashed border-gray-200"></div>

                    {interactionCount > 0 && (
                      <>
                        <div className="absolute left-16 right-0 top-1/2 transform -translate-y-1/2 flex space-x-1">
                          {Array(Math.min(interactionCount, 10))
                            .fill(0)
                            .map((_, i) => (
                              <div
                                key={i}
                                className="w-3 h-3 rounded-full bg-pink-500"
                              ></div>
                            ))}
                        </div>
                        <div className="absolute top-1/2 right-8 transform -translate-y-1/2 text-pink-500 font-medium text-sm">
                          {interactionCount}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Résumé des statistiques */}
            {Object.keys(dailyInteractions).length > 0 && (
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  Total des interactions le{" "}
                  {format(selectedDate, "MMMM d, yyyy")}:{" "}
                  <span className="font-medium text-pink-500">
                    {Object.values(dailyInteractions).reduce(
                      (a, b) => a + b,
                      0
                    )}
                  </span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Heure de pointe:{" "}
                  {
                    Object.entries(dailyInteractions).reduce((a, b) =>
                      a[1] > b[1] ? a : b
                    )[0]
                  }
                </p>
              </div>
            )}

            {Object.keys(dailyInteractions).length === 0 && (
              <div className="mt-8 text-center text-gray-400 text-sm">
                Aucune interaction d&apos;apprentissage enregistrée pour ce jour
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Learning_calendar;
