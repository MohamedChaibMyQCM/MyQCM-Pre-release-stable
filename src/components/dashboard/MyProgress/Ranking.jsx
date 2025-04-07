import React from "react";

const Ranking = ({ userXp }) => {
  const ranking = userXp?.ranking;
  const percentile = ranking.rank_percentile;

  const percentileNumber = parseInt(percentile.replace("%", ""));

  const invertedPercentile = 100 - percentileNumber;

  return (
    <div className="mt-6 w-[190px] max-md:w-full">
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">Classement</h3>
      <div className="bg-[#FFFFFF] flex flex-col box p-4 rounded-[16px]">
        <span className="text-[14px] text-[#B5BEC6] font-[500]">Vous êtes</span>
        <span className="text-[#242424] text-[26px] font-[500] my-2">
          Top <span className="text-[#F8589F]">{invertedPercentile}%</span>
        </span>
        <span className="text-[#47B881] font-[500] text-[14px]">
          Continuez comme ça
        </span>
      </div>
    </div>
  );
};

export default Ranking;
