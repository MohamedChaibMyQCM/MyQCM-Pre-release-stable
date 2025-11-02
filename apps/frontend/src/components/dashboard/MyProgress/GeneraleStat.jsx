"use client";

import quiz_attemp from "../../../../public/Icons/quiz_attem.svg";
import accuracy from "../../../../public/Icons/accuracy.svg";
import time_spent from "../../../../public/Icons/time_spent.svg";
import Image from "next/image";
import { motion } from "framer-motion";

const GeneraleStat = ({ overall_summary }) => {
  // Premium animation variants
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

  return (
    <motion.div
      id="tour-general-stats"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h3
        className="font-[500] text-[17px] mb-4 text-[#191919]"
        variants={headerVariants}
      >
        Général
      </motion.h3>
      <motion.ul
        className="flex items-center gap-4"
        variants={containerVariants}
      >
        <motion.li
          id="tour-question-tentées"
          className="bg-[#FFFFFF] flex items-center justify-between py-3 px-4 rounded-[20px] flex-1 box max-md:flex-col max-md:gap-2 max-md:h-[154px]"
          variants={cardVariants}
          whileHover={{
            y: -5,
            boxShadow: "0 15px 35px rgba(248, 88, 159, 0.15)",
            transition: { type: "spring", stiffness: 300, damping: 20 },
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex flex-col gap-1 max-md:text-center">
            <span className="font-[500] text-[15px]">Questions tentées</span>
            <span className="text-[#F8589F] font-[500] text-[14px]">
              {overall_summary?.total_mcqs_attempted}
            </span>
          </div>
          <Image src={quiz_attemp} alt="Quiz tentés" />
        </motion.li>
        <motion.li
          id="tour-précision"
          className="bg-[#FFFFFF] flex items-center justify-between py-3 px-4 rounded-[20px] flex-1 box max-md:flex-col max-md:gap-[32px] max-md:h-[154px]"
          variants={cardVariants}
          whileHover={{
            y: -5,
            boxShadow: "0 15px 35px rgba(248, 88, 159, 0.15)",
            transition: { type: "spring", stiffness: 300, damping: 20 },
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex flex-col gap-1 max-md:text-center">
            <span className="font-[500] text-[15px]">Précision</span>
            <span className="text-[#F8589F] font-[500] text-[14px]">
              {overall_summary?.overall_accuracy?.percentage}%
            </span>
          </div>
          <Image src={accuracy} alt="Précision" />
        </motion.li>
        <motion.li
          id="tour-temps-passé"
          className="bg-[#FFFFFF] flex items-center justify-between py-3 px-4 rounded-[20px] flex-1 box max-md:flex-col max-md:gap-2 max-md:h-[154px]"
          variants={cardVariants}
          whileHover={{
            y: -5,
            boxShadow: "0 15px 35px rgba(248, 88, 159, 0.15)",
            transition: { type: "spring", stiffness: 300, damping: 20 },
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex flex-col gap-1 max-md:text-center">
            <span className="font-[500] text-[15px]">Temps passé</span>
            <span className="text-[#F8589F] font-[500] text-[14px]">
              {overall_summary?.total_time_spent}s
            </span>
          </div>
          <Image src={time_spent} alt="Temps passé" />
        </motion.li>
      </motion.ul>
    </motion.div>
  );
};

export default GeneraleStat;
