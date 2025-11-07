"use client";

import { motion } from "framer-motion";
import { ListBullets, Target, HourglassHigh } from "phosphor-react";

const GeneraleStat = ({ overall_summary }) => {
  const formatTimeSpent = (seconds) => {
    if (!seconds || seconds === 0) return "0s";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    if (minutes > 0) {
      return `${minutes}m`;
    }
    return `${secs}s`;
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const iconWrapperClasses =
    "flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFE7F2] text-[#F8589F] dark:bg-white/10 dark:text-white shrink-0";

  return (
    <motion.div
      id="tour-general-stats"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h3
        className="font-[500] text-[17px] mb-4 text-[#191919] dark:text-white"
        variants={headerVariants}
      >
        Général
      </motion.h3>
      <motion.ul
        className="flex flex-wrap items-stretch gap-4"
        variants={containerVariants}
      >
        <motion.li
          id="tour-question-tentées"
          className="bg-[#FFFFFF] dark:bg-[#1a1a1a] flex items-center justify-between py-3 px-4 rounded-[20px] flex-1 min-w-[230px] box max-md:flex-col max-md:gap-2 max-md:h-[154px] border border-transparent dark:border-gray-700"
          variants={cardVariants}
          whileHover={{
            y: -5,
            boxShadow: "0 15px 35px rgba(248, 88, 159, 0.15)",
            transition: { type: "spring", stiffness: 300, damping: 20 },
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex flex-col gap-1 max-md:text-center">
            <span className="font-[500] text-[15px] text-[#191919] dark:text-white">Questions tentées</span>
            <span className="text-[#F8589F] font-[500] text-[14px]">
              {overall_summary?.total_mcqs_attempted}
            </span>
            {overall_summary?.unique_mcqs && (
              <span className="text-[#B5BEC6] dark:text-gray-400 font-[400] text-[12px]">
                {overall_summary.unique_mcqs} uniques
              </span>
            )}
          </div>
          <span className={iconWrapperClasses}>
            <ListBullets size={24} weight="fill" />
          </span>
        </motion.li>
        <motion.li
          id="tour-précision"
          className="bg-[#FFFFFF] dark:bg-[#1a1a1a] flex items-center justify-between py-3 px-4 rounded-[20px] flex-1 min-w-[230px] box max-md:flex-col max-md:gap-[32px] max-md:h-[154px] border border-transparent dark:border-gray-700"
          variants={cardVariants}
          whileHover={{
            y: -5,
            boxShadow: "0 15px 35px rgba(248, 88, 159, 0.15)",
            transition: { type: "spring", stiffness: 300, damping: 20 },
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex flex-col gap-1 max-md:text-center">
            <span className="font-[500] text-[15px] text-[#191919] dark:text-white">Précision</span>
            <span className="text-[#F8589F] font-[500] text-[14px]">
              {overall_summary?.overall_accuracy?.percentage}%
            </span>
          </div>
          <span className={iconWrapperClasses}>
            <Target size={24} weight="fill" />
          </span>
        </motion.li>
        <motion.li
          id="tour-temps-passé"
          className="bg-[#FFFFFF] dark:bg-[#1a1a1a] flex items-center justify-between py-3 px-4 rounded-[20px] flex-1 min-w-[230px] box max-md:flex-col max-md:gap-2 max-md:h-[154px] border border-transparent dark:border-gray-700"
          variants={cardVariants}
          whileHover={{
            y: -5,
            boxShadow: "0 15px 35px rgba(248, 88, 159, 0.15)",
            transition: { type: "spring", stiffness: 300, damping: 20 },
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex flex-col gap-1 max-md:text-center">
            <span className="font-[500] text-[15px] text-[#191919] dark:text-white">Temps passé</span>
            <span className="text-[#F8589F] font-[500] text-[14px]">
              {formatTimeSpent(overall_summary?.total_time_spent)}
            </span>
            {overall_summary?.average_time_spent && (
              <span className="text-[#B5BEC6] dark:text-gray-400 font-[400] text-[12px]">
                Moy: {formatTimeSpent(overall_summary.average_time_spent)}/Q
              </span>
            )}
          </div>
          <span className={iconWrapperClasses}>
            <HourglassHigh size={24} weight="fill" />
          </span>
        </motion.li>
      </motion.ul>
    </motion.div>
  );
};

export default GeneraleStat;
