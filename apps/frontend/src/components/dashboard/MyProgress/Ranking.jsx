"use client";

import React from "react";
import { motion } from "framer-motion";

const Ranking = ({ userXp }) => {
  const ranking = userXp?.ranking;
  const percentile = ranking.rank_percentile;

  const percentileNumber = parseInt(percentile.replace("%", ""));

  const invertedPercentile = 100 - percentileNumber;

  // Premium animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.2,
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
      id="tour-ranking"
      className="mt-6 w-[190px] max-xl:w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h3
        className="font-[500] text-[17px] mb-4 text-[#191919]"
        variants={headerVariants}
      >
        Classement
      </motion.h3>
      <motion.div
        className="bg-[#FFFFFF] flex flex-col box p-4 rounded-[16px]"
        variants={cardVariants}
        whileHover={{
          y: -5,
          boxShadow: "0 15px 35px rgba(248, 88, 159, 0.15)",
          transition: { type: "spring", stiffness: 300, damping: 20 },
        }}
      >
        <span className="text-[14px] text-[#B5BEC6] font-[500]">Vous êtes</span>
        <span className="text-[#242424] text-[26px] font-[500] my-2">
          Top <span className="text-[#F8589F]">{invertedPercentile}%</span>
        </span>
        <span className="text-[#47B881] font-[500] text-[14px]">
          Continuez comme ça
        </span>
      </motion.div>
    </motion.div>
  );
};

export default Ranking;
