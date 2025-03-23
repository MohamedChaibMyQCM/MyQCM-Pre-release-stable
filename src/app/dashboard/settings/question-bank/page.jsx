"use client";

import Path_Mode from "@/components/dashboard/settings/Path_Mode";
import Path_Settings from "@/components/dashboard/settings/Path_Settings";
import React, { useState } from "react";

const Page = () => {
  const [selectedMode, setSelectedMode] = useState("intelligent");
  const [settingsData, setSettingsData] = useState({
    intelligent: {
      learningFocus: "Cardio",
      questionTypes: ["Multiple Choice"],
    },
    guided: {
      modules: "Cardio",
      questionTypes: ["Multiple Choice"],
      challengeLevel: 50,
      questionStatus: "haven't seen",
    },
    custom: {
      modules: "Cardio",
      questionTypes: ["MCQs"],
      difficultyLevel: 50,
      questionsCount: 20,
      timeLimit: true,
      timeValue: "30:00",
      randomize: false,
    },
  });

  const handleSettingsChange = (mode, field, value) => {
    setSettingsData((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [field]: value,
      },
    }));
  };

  const handleStartSession = () => {
    console.log("Starting session with:", {
      mode: selectedMode,
      settings: settingsData[selectedMode],
    });
  };

  return (
    <div className="px-6">
      <Path_Settings
        selectedMode={selectedMode}
        onModeChange={setSelectedMode}
      />
      <Path_Mode
        selectedMode={selectedMode}
        settings={settingsData[selectedMode]}
        onChange={(field, value) =>
          handleSettingsChange(selectedMode, field, value)
        }
      />
      <div className="mt-8 flex justify-end items-center gap-6">
        <button className="text-[#F8589F] text-[13px] font-[500]">
          Return
        </button>
        <button
          className="bg-[#F8589F] text-[#FFFFFF] px-5 py-2 rounded-[16px] text-[13px] font-[500]"
          onClick={handleStartSession}
        >
          Start My Session!
        </button>
      </div>
    </div>
  );
};

export default Page;
