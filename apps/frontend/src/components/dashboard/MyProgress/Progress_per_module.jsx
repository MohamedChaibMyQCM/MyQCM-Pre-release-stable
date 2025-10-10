"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const Progress_per_module = ({ progress_by_module }) => {
  // Vérifier si les données sont vides ou non disponibles
  if (!progress_by_module || progress_by_module.length === 0) {
    return (
      <div id="tour-module-progress" className="flex-1">
        <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
          Engagement par module
        </h3>
        <div className="bg-[#FFFFFF] rounded-[16px] py-4 box h-[390px] overflow-y-auto scrollbar-hide flex items-center justify-center">
          <div className="bg-white px-6 py-3 rounded-full shadow-md border-[2px] border-[#F8589F]">
            <span className="text-[#F8589F] font-medium text-[18px]">
              Aucune donnée pour le moment
            </span>
          </div>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(
    ...progress_by_module.map((module) => module.uniqueMcqCount || 0),
    10
  );

  const totalEngagement = progress_by_module.reduce(
    (sum, module) => sum + (module.uniqueMcqCount || 0),
    0
  );

  const overallPercentage = Math.min(
    (totalEngagement / (maxCount * progress_by_module.length)) * 100,
    100
  );

  const getEngagementStatus = (percentage) => {
    if (percentage >= 80) return { text: "Élevé", color: "#47B881" };
    if (percentage >= 60) return { text: "Bon", color: "#FFAA60" };
    if (percentage >= 40) return { text: "Modéré", color: "#FFAD0D" };
    return { text: "Faible", color: "#F64C4C" };
  };

  const overallStatus = getEngagementStatus(overallPercentage);

  return (
    <div id="tour-module-progress" className="flex-1">
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        Engagement par module
      </h3>
      <div className="bg-[#FFFFFF] rounded-[16px] py-4 box h-[390px] overflow-y-auto scrollbar-hide">
        <Card className="overflow-hidden border-none shadow-none mt-2">
          <CardContent>
            <div className="relative flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#f0f0f0"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={overallStatus.color}
                    strokeWidth="10"
                    strokeDasharray="282.6"
                    strokeDashoffset={282.6 * (1 - overallPercentage / 100)}
                    strokeLinecap="round"
                    transform="rotate(90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">
                    {Math.round(overallPercentage)}%
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: overallStatus.color }}
                  >
                    {overallStatus.text}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {progress_by_module.map((module, index) => {
                const engagementPercentage = Math.min(
                  (module.uniqueMcqCount / maxCount) * 100,
                  100
                );

                return (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[14px] text-[#191919] font-[500]">
                        {module.subject.split(":")[0].trim()}
                      </span>
                      <span className="text-[14px] text-[#191919] font-[500]">
                        {module.uniqueMcqCount} QCM
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#F8589F] to-[#FD2E8A] h-2 rounded-full"
                        style={{ width: `${engagementPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Progress_per_module;
