import React from "react";

const Ranking = () => {
  return (
    <div className="mt-6 w-[190px]">
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">Ranking</h3>
      <div className="bg-[#FFFFFF] flex flex-col box p-4 rounded-[16px]">
        <span className="text-[14px] text-[#B5BEC6] font-[500]">You are</span>
        <span className="text-[#242424] text-[26px] font-[500] my-2">
          Top <span className="text-[#F8589F]">5%</span>
        </span>
        <span className="text-[#47B881] font-[500] text-[14px]">
          Keep going
        </span>
      </div>
    </div>
  );
};

export default Ranking;
