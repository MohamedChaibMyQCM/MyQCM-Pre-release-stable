"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const MotionDiv = motion.div;
const MotionH3 = motion.h3;

const Progress_per_module = ({ progress_by_module }) => {
  // Premium animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1,
        delayChildren: 0.2,
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

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };
  // Filter out "Non classé" modules early
  const filteredModules = progress_by_module?.filter((module) => {
    const subjectName = module.subject?.split(":")[0]?.trim() || "";
    return subjectName && subjectName.toLowerCase() !== "non classé";
  }) || [];

  // Vérifier si les données sont vides ou non disponibles
  if (!progress_by_module || progress_by_module.length === 0 || filteredModules.length === 0) {
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
    ...filteredModules.map((module) => module.uniqueMcqCount || 0),
    10
  );

  const totalEngagement = filteredModules.reduce(
    (sum, module) => sum + (module.uniqueMcqCount || 0),
    0
  );

  const overallPercentage = Math.min(
    (totalEngagement / (maxCount * filteredModules.length)) * 100,
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
    <MotionDiv
      id="tour-module-progress"
      className="flex-1"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <MotionH3
        className="font-[500] text-[17px] mb-4 text-[#191919]"
        variants={headerVariants}
      >
        Engagement par module
      </MotionH3>
      <MotionDiv
        className="bg-[#FFFFFF] rounded-[16px] py-4 box h-[390px] overflow-y-auto scrollbar-hide"
        variants={cardVariants}
        whileHover={{
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.1)",
          transition: { duration: 0.3 },
        }}
      >
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

            <MotionDiv className="space-y-5" variants={containerVariants}>
              {filteredModules.map((module, index) => {
                const engagementPercentage = Math.min(
                  (module.uniqueMcqCount / maxCount) * 100,
                  100
                );

                return (
                  <MotionDiv key={index} variants={itemVariants}>
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
                  </MotionDiv>
                );
              })}
            </MotionDiv>
          </CardContent>
        </Card>
      </MotionDiv>
    </MotionDiv>
  );
};

export default Progress_per_module;
