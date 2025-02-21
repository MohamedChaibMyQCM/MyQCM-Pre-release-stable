"use client";

import Image from "next/image";
import path from "../../../../public/settings/path.svg";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const Path_Settings = () => {
  const [selectedMode, setSelectedMode] = useState("intelligent"); 

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
  };

  return (
    <div className="mt-12 rounded-[16px]">
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        Choose your path to mastery
      </h3>
      <div className="bg-[#FFFFFF] pl-6 pr-12 py-6 flex items-center justify-between rounded-[16px] box">
        <form className="">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <button
                type="button"
                onClick={() => handleModeChange("intelligent")}
                className={`w-5 h-5 rounded-full border-2 border-[#FF6EAF] cursor-pointer transition-colors ${
                  selectedMode === "intelligent"
                    ? "bg-[#FF6EAF] border-[#FF6EAF]"
                    : "bg-transparent"
                }`}
              />
              <Label
                htmlFor="intelligent-mode"
                className="text-[#191919] font-[500] text-[15.6px]"
              >
                Intelligent Mode {"("}
                {""}
                <span className="text-[#F8589F]">Powered by Synergy</span>
                {""}
                {")"}
              </Label>
            </div>
            <p className="text-[13px] text-[#666666] pl-[34px]">
              In Intelligent Mode,{" "}
              <span className="text-[#F8589F]">Synergy</span> - our advanced
              learning engine - personalizes your experience. It's like <br />{" "}
              having a dedicated tutor who understands your strengths,
              weaknesses, and learning style. Synergy <br /> adapts in
              real-time, focusing on what you need to master, making every study
              session incredibly <br /> effective. It's the fastest way to build
              confidence and achieve true understanding.
            </p>
          </div>

          {/* Guided Mode */}
          <div className="flex flex-col my-10">
            <div className="flex items-center gap-3 mb-3">
              <button
                type="button"
                onClick={() => handleModeChange("guided")}
                className={`w-5 h-5 rounded-full border-2 border-[#FF6EAF] cursor-pointer transition-colors ${
                  selectedMode === "guided"
                    ? "bg-[#FF6EAF] border-[#FF6EAF]"
                    : "bg-transparent"
                }`}
              />
              <Label
                htmlFor="guided-mode"
                className="text-[#191919] font-[500] text-[15.6px]"
              >
                Guided Mode {"("}
                <span className="text-[#F8589F]">Your Focus, Our AI</span>
                {")"}
              </Label>
            </div>
            <p className="text-[13px] text-[#B5BEC6] pl-[34px]">
              In Guided Mode, you're in control of the direction, while still
              benefiting from Synergy's intelligent <br /> question selection.
              Perfect for when you want to focus on specific areas, like
              preparing for an <br /> upcoming exam or reinforcing your
              knowledge of a particular module. We'll help you make every <br />{" "}
              minute count.
            </p>
          </div>

          {/* Custom Mode */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <button
                type="button"
                onClick={() => handleModeChange("custom")}
                className={`w-5 h-5 rounded-full border-2 border-[#FF6EAF] cursor-pointer transition-colors ${
                  selectedMode === "custom"
                    ? "bg-[#FF6EAF] border-[#FF6EAF]"
                    : "bg-transparent"
                }`}
              />
              <Label
                htmlFor="custom-mode"
                className="text-[#191919] font-[500] text-[15.6px]"
              >
                Custom Mode {"("}
                <span className="text-[#F8589F]">Craft Your Challenge</span>
                {")"}
              </Label>
            </div>
            <p className="text-[13px] text-[#B5BEC6] pl-[34px]">
              Custom Mode is your playground for focused practice. Perfect for
              simulating exam conditions, <br /> testing your knowledge on
              specific topics, or challenging yourself with exactly the
              questions you <br />
              want.
            </p>
          </div>
        </form>
        <Image src={path} alt="path" className="" />
      </div>
    </div>
  );
};

export default Path_Settings;