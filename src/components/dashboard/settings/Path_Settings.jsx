"use client";

import Image from "next/image";
import path from "../../../../public/settings/path.svg";
import { Label } from "@/components/ui/label";

const Path_Settings = ({ selectedMode, onModeChange }) => {
  const modes = [
    {
      id: "intelligent",
      title: "Intelligent Mode",
      subtitle: "Powered by Synergy",
      description:
        "In Intelligent Mode, Synergy – our advanced learning engine – personalizes your experience. It's like having a dedicated tutor who understands your strengths, weaknesses, and learning style. Synergy adapts in real-time, focusing on what you need to master, making every study session incredibly effective. It's the fastest way to build confidence and achieve true understanding.",
    },
    {
      id: "guided",
      title: "Guided Mode",
      subtitle: "Your Focus, Our AI",
      description:
        "In Guided Mode, you're in control of the direction, while still benefiting from Synergy's intelligent question selection. Perfect for when you want to focus on specific areas, like preparing for an upcoming exam or reinforcing your knowledge of a particular module. We'll help you make every minute count.",
    },
    {
      id: "custom",
      title: "Custom Mode",
      subtitle: "Craft Your Challenge",
      description:
        "Custom Mode is your playground for focused practice. Perfect for simulating exam conditions, testing your knowledge on specific topics, or challenging yourself with exactly the questions you want.",
    },
  ];

  return (
    <div className="mt-12 rounded-[16px]">
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        Choose your path to mastery
      </h3>
      <div className="bg-[#FFFFFF] pl-6 pr-12 py-6 flex items-center justify-between rounded-[16px] box ">
        <form className="w-full">
          {modes.map((mode) => (
            <div
              key={mode.id}
              className={`flex flex-col p-4 rounded-[8px] w-[90%] border ${
                selectedMode === mode.id
                  ? "bg-[#FFF5FA] border-[#F8589F]"
                  : "border-[#E4E4E4]"
              } ${mode.id !== "custom" ? "mb-4" : ""}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => onModeChange(mode.id)}
                  className={`w-5 h-5 rounded-full border-2 border-[#FF6EAF] cursor-pointer transition-colors ${
                    selectedMode === mode.id
                      ? "bg-[#FF6EAF] border-[#FF6EAF]"
                      : "bg-transparent"
                  }`}
                />
                <Label
                  htmlFor={mode.id}
                  className="text-[#191919] font-[500] text-[15px]"
                >
                  {mode.title} {"("}
                  <span className="text-[#F8589F]">{mode.subtitle}</span>
                  {")"}
                </Label>
              </div>
              <p className={`text-[12px] pl-[34px] text-[#666666]`}>
                {mode.description}
              </p>
            </div>
          ))}
        </form>
        <Image src={path} alt="path" />
      </div>
    </div>
  );
};

export default Path_Settings;