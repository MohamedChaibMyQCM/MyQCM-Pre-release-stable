import Intelligent_Mode from "@/components/dashboard/settings/Intelligent_Mode";
import Path_Settings from "@/components/dashboard/settings/Path_Settings";
import React from "react";

const page = () => {
  return (
    <div className="px-6">
      <Path_Settings />
      <Intelligent_Mode />
      <div className="mt-8 flex justify-end items-center gap-6">
        <button className="text-[#F8589F] text-[13px] font-[500]">
          Return
        </button>
        <button className="bg-[#F8589F] text-[#FFFFFF] px-5 py-2 rounded-[16px] text-[13px] font-[500]">
          Start My Session!
        </button>
      </div>
    </div>
  );
};

export default page;