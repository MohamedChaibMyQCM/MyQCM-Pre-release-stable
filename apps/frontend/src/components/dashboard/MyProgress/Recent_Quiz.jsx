"use client";

import React from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const MotionDiv = motion.div;
const MotionH3 = motion.h3;
const MotionUl = motion.ul;
const MotionLi = motion.li;

const Recent_Quiz = ({ recent_quizzes }) => {
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
        staggerChildren: 0.1,
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };
  // Vérifier si les données sont vides ou non disponibles
  if (!recent_quizzes || recent_quizzes.length === 0) {
    return (
      <div id="tour-recent-quizzes" className="flex-1">
        <h3 className="font-[500] text-[17px] mb-4 text-[#191919] dark:text-white">
          Quiz récents
        </h3>
        <div className="bg-[#FFFFFF] dark:bg-[#1a1a1a] rounded-[16px] px-6 py-4 box h-[390px] overflow-y-auto scrollbar-hide flex items-center justify-center border border-transparent dark:border-gray-700">
          <div className="bg-white dark:bg-[#1a1a1a] px-6 py-3 rounded-full shadow-md border-[2px] border-[#F8589F]">
            <span className="text-[#F8589F] font-medium text-[18px]">
              Aucune donnée disponible pour l&apos;instant
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Calculer la moyenne globale
  const overallBand =
    recent_quizzes.reduce((sum, quiz) => {
      return sum + parseFloat(quiz.accuracy || 0);
    }, 0) / recent_quizzes.length;

  // Formater les données du quiz à partir de l'API
  const formattedQuizzes = recent_quizzes.map((quiz, index) => {
    const accuracy = parseFloat(quiz.accuracy);

    // Déterminer le statut basé sur la précision
    let status, statusColor, statusBg;
    if (accuracy >= 80) {
      status = "Excellent";
      statusColor = "#F8589F";
      statusBg = "#FFE5F0";
    } else if (accuracy >= 60) {
      status = "Bon";
      statusColor = "#47B881";
      statusBg = "#E5F5EC";
    } else if (accuracy >= 40) {
      status = "Moyenne";
      statusColor = "#FFAD0D";
      statusBg = "#FFF7E1";
    } else {
      status = "Nécessite du travail";
      statusColor = "#F64C4C";
      statusBg = "#FFEBEE";
    }

    // Formater la date
    const formattedDate = quiz.date
      ? format(new Date(quiz.date), "EEE, d 'à' HH:mm")
      : "Pas de date";

    return {
      id: index,
      title: quiz.subject || "Quiz sans titre",
      score: `${accuracy.toFixed(0)}%`,
      status,
      statusColor,
      statusBg,
      date: formattedDate,
      rawAccuracy: accuracy,
    };
  });

  return (
    <MotionDiv
      id="tour-recent-quizzes"
      className="flex-1"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <MotionH3
        className="font-[500] text-[17px] mb-4 text-[#191919] dark:text-white"
        variants={headerVariants}
      >
        Quiz récents
      </MotionH3>
      <MotionDiv
        className="bg-[#FFFFFF] dark:bg-[#1a1a1a] rounded-[16px] px-6 py-4 box h-[390px] overflow-y-auto scrollbar-hide border border-transparent dark:border-gray-700"
        variants={cardVariants}
        whileHover={{
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.1)",
          transition: { duration: 0.3 },
        }}
      >
        <span className="text-[14px] text-[#B5BEC6] dark:text-gray-400">Moyenne globale</span>
        <div className="flex items-center gap-3 mb-3 mt-1">
          <span className="text-[#242424] dark:text-white font-[500] text-[40px]">
            {overallBand.toFixed(0)}%
          </span>
        </div>
        <MotionUl
          className="flex flex-col gap-4"
          variants={containerVariants}
        >
          {formattedQuizzes.map((quiz) => (
            <MotionLi
              key={quiz.id}
              className="border border-[#E4E4E4] dark:border-gray-700 p-4 rounded-[12px]"
              variants={itemVariants}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
                borderColor: "#F8589F",
                transition: { duration: 0.2 },
              }}
            >
              <span className="pl-[14px] relative text-[14px] text-[#191919] dark:text-white font-[500] block after:absolute after:w-[6px] after:h-[6px] after:bg-[#F8589F] after:rounded-full after:left-0 after:top-[50%] after:translate-y-[-50%]">
                {quiz.title}
              </span>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <span
                    className="font-[500] text-[20px]"
                    style={{
                      color: quiz.rawAccuracy >= 60 ? "#F8589F" : "#F64C4C",
                    }}
                  >
                    {quiz.score}
                  </span>
                  <span
                    className="text-[13px] rounded-[12px] px-[10px] py-[2px] font-[500]"
                    style={{
                      color: quiz.statusColor,
                      backgroundColor: quiz.statusBg,
                    }}
                  >
                    {quiz.status}
                  </span>
                </div>
                <span className="text-[13px] text-[#B5BEC6] dark:text-gray-400">{quiz.date}</span>
              </div>
            </MotionLi>
          ))}
        </MotionUl>
      </MotionDiv>
    </MotionDiv>
  );
};

export default Recent_Quiz;
