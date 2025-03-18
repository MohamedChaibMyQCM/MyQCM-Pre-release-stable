import React from "react";

const Total_Point = () => {
  return (
    <div className="w-[190px] max-md:w-full">
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        Total points
      </h3>
      <div className="bg-[#FFFFFF] flex flex-col box p-5 rounded-[16px]">
        <span className="text-[14px] text-[#B5BEC6] font-[500]">
          Points gathered
        </span>
        <div className="flex items-center gap-3 my-2 mb-4">
          <span className="text-[#242424] text-[26px] font-[500]">
            356<span className="text-[#F8589F]">XP</span>
          </span>
          <span className="text-[#47B881] bg-[#E5F5EC] text-[13px] rounded-[10px] px-2 font-[500]">Lvl 4</span>
        </div>
        <div className="relative h-[8px] w-[100%] bg-[#F5F5F5] rounded-[16px] after:w-[80%] after:h-[8px] after:rounded-[16px] after:absolute after:left-0 after:top-0 after:bg-[#F8589F]"></div>
      </div>
    </div>
  );
};

export default Total_Point;
