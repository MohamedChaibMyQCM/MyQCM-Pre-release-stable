import React from "react";

const Total_Point = ({ userXp }) => {
  // Calculer le pourcentage de progression (en supposant que chaque niveau nécessite 100 XP)
  const progressPercentage = userXp ? ((userXp.xp % 100) / 100) * 100 : 0;

  return (
    <div id="tour-total-point" className="w-[190px] max-xl:w-full">
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        Points totaux
      </h3>
      <div className="bg-[#FFFFFF] flex flex-col box p-5 rounded-[16px]">
        <span className="text-[14px] text-[#B5BEC6] font-[500]">
          Points accumulés
        </span>
        <div className="flex items-center gap-3 my-2 mb-4">
          <span className="text-[#242424] text-[26px] font-[500]">
            {userXp?.xp || 0}
            <span className="text-[#F8589F]">XP</span>
          </span>
          <span className="text-[#47B881] bg-[#E5F5EC] text-[13px] rounded-[10px] px-2 font-[500]">
            Lvl {userXp?.level || 0}
          </span>
        </div>
        <div className="relative h-[8px] w-[100%] bg-[#F5F5F5] rounded-[16px]">
          <div
            className="absolute left-0 top-0 h-[8px] rounded-[16px] bg-[#F8589F]"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Total_Point;
