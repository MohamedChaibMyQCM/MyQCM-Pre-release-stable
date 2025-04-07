"use client";

import React from "react";
import { format } from "date-fns";

const Recent_Quiz = ({ recent_quizzes }) => {
  // Vérifier si les données sont vides ou non disponibles
  if (!recent_quizzes || recent_quizzes.length === 0) {
    return (
      <div className="flex-1">
        <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
          Quiz récents
        </h3>
        <div className="bg-[#FFFFFF] rounded-[16px] px-6 py-4 box h-[390px] overflow-y-auto scrollbar-hide flex items-center justify-center">
          <div className="bg-white px-6 py-3 rounded-full shadow-md border-[2px] border-[#F8589F]">
            <span className="text-[#F8589F] font-medium text-[18px]">
              Aucune donnée disponible pour l'instant
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

  // Calculer le changement de semaine en semaine (simulation - vous aurez besoin des données de la semaine précédente)
  const weekOverWeekChange = 3.4; // Ceci devrait venir de votre API

  return (
    <div className="flex-1">
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        Quiz récents
      </h3>
      <div className="bg-[#FFFFFF] rounded-[16px] px-6 py-4 box h-[390px] overflow-y-auto scrollbar-hide">
        <span className="text-[14px] text-[#B5BEC6]">Moyenne globale</span>
        <div className="flex items-center gap-3 mb-3 mt-1">
          <span className="text-[#242424] font-[500] text-[40px]">
            {overallBand.toFixed(0)}%
          </span>
          {weekOverWeekChange > 0 ? (
            <span className="text-[13px] text-[#47B881] bg-[#E5F5EC] rounded-[12px] px-[10px] py-[2px]">
              +{weekOverWeekChange}% d'augmentation par rapport à la semaine
              dernière
            </span>
          ) : (
            <span className="text-[13px] text-[#F64C4C] bg-[#FFEBEE] rounded-[12px] px-[10px] py-[2px]">
              {weekOverWeekChange}% de diminution par rapport à la semaine
              dernière
            </span>
          )}
        </div>
        <ul className="flex flex-col gap-4">
          {formattedQuizzes.map((quiz) => (
            <li
              key={quiz.id}
              className="border border-[#E4E4E4] p-4 rounded-[12px]"
            >
              <span className="pl-[14px] relative text-[14px] text-[#191919] font-[500] block after:absolute after:w-[6px] after:h-[6px] after:bg-[#F8589F] after:rounded-full after:left-0 after:top-[50%] after:translate-y-[-50%]">
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
                <span className="text-[13px] text-[#B5BEC6]">{quiz.date}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Recent_Quiz;
