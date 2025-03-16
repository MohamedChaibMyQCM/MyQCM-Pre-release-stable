"use client"

import Path_Mode from "@/components/dashboard/settings/Path_Mode";
import Path_Settings from "@/components/dashboard/settings/Path_Settings";
import React, { useState } from "react";

const Page = () => {
  const [selectedMode, setSelectedMode] = useState("intelligent");

  return (
    <div className="px-6">
      <Path_Settings
        selectedMode={selectedMode} 
        onModeChange={setSelectedMode}
      />
      <Path_Mode selectedMode={selectedMode} />
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

export default Page;
