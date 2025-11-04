"use client";

import React from "react";
import { motion } from "framer-motion";

const Total_Point = ({ userXp }) => {
  // Calculate progress percentage using API-provided level thresholds
  const progressPercentage = (() => {
    if (!userXp) return 0;

    const currentXp = userXp?.xp || 0;

    // Check if API provides level threshold data
    if (
      userXp?.current_level_threshold !== undefined &&
      userXp?.next_level_threshold !== undefined
    ) {
      // Use API-provided thresholds
      const currentLevelThreshold = userXp.current_level_threshold;
      const nextLevelThreshold = userXp.next_level_threshold;

      const xpInCurrentLevel = currentXp - currentLevelThreshold;
      const xpRequiredForNextLevel =
        nextLevelThreshold - currentLevelThreshold;

      return xpRequiredForNextLevel > 0
        ? Math.min((xpInCurrentLevel / xpRequiredForNextLevel) * 100, 100)
        : 0;
    } else {
      // Fallback: assume 100 XP per level (legacy behavior)
      return ((currentXp % 100) / 100) * 100;
    }
  })();

  // Premium animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.15,
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

  return (
    <motion.div
      id="tour-total-point"
      className="w-[190px] max-xl:w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h3
        className="font-[500] text-[17px] mb-4 text-[#191919] dark:text-white"
        variants={headerVariants}
      >
        Points totaux
      </motion.h3>
      <motion.div
        className="bg-[#FFFFFF] dark:bg-[#1a1a1a] flex flex-col box p-5 rounded-[16px] border border-transparent dark:border-gray-700"
        variants={cardVariants}
        whileHover={{
          y: -5,
          boxShadow: "0 15px 35px rgba(248, 88, 159, 0.15)",
          transition: { type: "spring", stiffness: 300, damping: 20 },
        }}
      >
        <span className="text-[14px] text-[#B5BEC6] dark:text-gray-400 font-[500]">
          Points accumulés
        </span>
        <div className="flex items-center gap-3 my-2 mb-4">
          <span className="text-[#242424] dark:text-white text-[26px] font-[500]">
            {userXp?.xp || 0}
            <span className="text-[#F8589F]">XP</span>
          </span>
          <span className="text-[#47B881] bg-[#E5F5EC] text-[13px] rounded-[10px] px-2 font-[500]">
            Lvl {userXp?.level || 0}
          </span>
        </div>
        <div className="relative h-[8px] w-[100%] bg-[#F5F5F5] dark:bg-gray-700 rounded-[16px]">
          <div
            className="absolute left-0 top-0 h-[8px] rounded-[16px] bg-[#F8589F]"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Total_Point;
