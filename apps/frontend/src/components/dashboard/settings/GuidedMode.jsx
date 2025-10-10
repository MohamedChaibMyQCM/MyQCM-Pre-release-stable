"use client";

import Image from "next/image";
import clipboardImage from "../../../../public/settings/intell_mode.svg";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { CaretDown } from "phosphor-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GuidedMode = () => {
  const [semiology, setSemiology] = useState("Cardio");
  const [questionTypes, setQuestionTypes] = useState(["Multiple Choice"]);
  const [challengeLevels, setChallengeLevels] = useState(["Steady"]); // Updated to an array
  const [questionStatus, setQuestionStatus] = useState(
    "Questions I haven't seen"
  );

  const semiologyOptions = [
    "Cardio",
    "Neurology",
    "Respiratory",
    "Gastrointestinal",
    "Endocrine",
  ];

  const challengeLevelOptions = ["Rookie", "Steady", "Master"]; // Renamed to avoid conflict
  const questionStatusOptions = [
    "Questions I haven't seen",
    "Questions I got wrong",
    "All questions",
  ];

  const handleQuestionTypeSelect = (type) => {
    let newTypes;
    if (questionTypes.includes(type)) {
      if (questionTypes.length > 1) {
        newTypes = questionTypes.filter((t) => t !== type);
      } else {
        return;
      }
    } else {
      newTypes = [...questionTypes, type];
    }
    setQuestionTypes(newTypes);
  };

  const handleChallengeLevelSelect = (level) => {
    let newLevels;
    if (challengeLevels.includes(level)) {
      if (challengeLevels.length > 1) {
        newLevels = challengeLevels.filter((l) => l !== level);
      } else {
        return; // Prevent deselecting the last option
      }
    } else {
      newLevels = [...challengeLevels, level];
    }
    setChallengeLevels(newLevels);
  };

  return (
    <div>
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        Guided Mode Settings
      </h3>

      <div className="relative flex items-center justify-between bg-[#FFFFFF] p-6 rounded-[16px] border border-[#E4E4E4] mb-8">
        <div className="w-[67%]">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-[15px] text-[#191919] font-[500]">
                Choose Your Modules*
              </Label>
              <span className="absolute top-4 right-6 text-[11px] text-[#F8589F]">
                *Required Fields
              </span>
            </div>
            <p className="text-[12px] text-[#666666] mb-4">
              Select modules you wish to practice on.
            </p>

            <div className="relative w-full mb-4">
              <Select value={semiology} onValueChange={setSemiology}>
                <SelectTrigger className="flex items-center justify-between border border-[#E4E4E4] rounded-[24px] !py-[12px] px-5 w-full">
                  <SelectValue className="text-[14px] font-[500] text-[#191919]" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-[#E4E4E4] rounded-[8px] shadow-lg">
                  {semiologyOptions.map((option) => (
                    <SelectItem
                      key={option}
                      value={option}
                      className="p-3 hover:bg-[#FFF5FA] cursor-pointer text-[13px]"
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-6">
            <Label className="text-[15px] text-[#191919] font-[500] mb-2 block">
              Preferred Question Types*
            </Label>
            <p className="text-[12px] text-[#666666] mb-4">
              Select the types of questions you&apos;d like to practice.
            </p>

            <div className="flex gap-3 mb-4">
              <button
                className={`${
                  questionTypes.includes("Multiple Choice")
                    ? "bg-[#FFF5FA] text-[#F8589F] border border-[#F8589F]"
                    : " text-[#191919]"
                } text-[13px] font-[500] px-4 py-2 rounded-[24px]`}
                onClick={() => handleQuestionTypeSelect("Multiple Choice")}
              >
                Multiple Choice
              </button>
              <button
                className={`${
                  questionTypes.includes("Short Answer")
                    ? "bg-[#FFF5FA] text-[#F8589F] border border-[#F8589F]"
                    : "text-[#191919]"
                } text-[13px] font-[500] px-4 py-2 rounded-[24px]`}
                onClick={() => handleQuestionTypeSelect("Short Answer")}
              >
                Short Answer
              </button>
            </div>
          </div>

          <div className="mb-6">
            <Label className="text-[15px] text-[#191919] font-[500] mb-2 block">
              Challenge Level*
            </Label>
            <p className="text-[12px] text-[#666666] mb-4">
              Choose your desired level of challenge. Rookie focuses on
              foundational knowledge, Steady builds understanding, and Master
              tests your expertise.
            </p>

            <div className="flex gap-3 mb-4">
              {challengeLevelOptions.map((level) => (
                <button
                  key={level}
                  className={`${
                    challengeLevels.includes(level)
                      ? "bg-[#FFF5FA] text-[#F8589F] border border-[#F8589F]"
                      : "text-[#191919]"
                  } text-[13px] font-[500] px-4 py-2 rounded-[24px] flex-1`}
                  onClick={() => handleChallengeLevelSelect(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <Label className="text-[15px] text-[#191919] font-[500] mb-2 block">
              Question Status
            </Label>
            <p className="text-[12px] text-[#666666] mb-4">
              Filter questions to target specific areas for practice.
            </p>

            <div className="flex gap-3">
              {questionStatusOptions.map((status) => (
                <button
                  key={status}
                  className={`${
                    questionStatus === status
                      ? "bg-[#FFF5FA] text-[#F8589F] border border-[#F8589F]"
                      : "text-[#191919]"
                  } text-[13px] font-[500] px-4 py-2 rounded-[24px]`}
                  onClick={() => setQuestionStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Image
            src={clipboardImage}
            alt="clipboard"
            className="mr-[20px] w-[270px]"
          />
        </div>
      </div>
    </div>
  );
};

export default GuidedMode;