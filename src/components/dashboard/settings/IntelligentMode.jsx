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

const IntelligentMode = ({ settings, onChange }) => {
  const [semiology, setSemiology] = useState(
    settings?.learningFocus || "Cardio"
  );
  const [questionTypes, setQuestionTypes] = useState(
    settings?.questionTypes || ["Multiple Choice"]
  );

  const semiologyOptions = [
    "Cardio",
    "Neurology",
    "Respiratory",
    "Gastrointestinal",
    "Endocrine",
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
    if (onChange) {
      onChange("questionTypes", newTypes);
    }
  };

  const handleSemiologyChange = (option) => {
    setSemiology(option);
    if (onChange) {
      onChange("learningFocus", option);
    }
  };

  return (
    <div>
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        Intelligent Mode Settings
      </h3>
      <div className="relative flex items-center justify-between bg-[#FFFFFF] p-6 rounded-[16px] border border-[#E4E4E4] mb-8">
        <div className="w-2/3">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-[15px] text-[#191919] font-[500]">
                Your Learning Focus*
              </Label>
              <span className="absolute top-4 right-6 text-[11px] text-[#F8589F]">
                *Required Fields
              </span>
            </div>
            <p className="text-[12px] text-[#666666] mb-4">
              Setting your focus helps Synergy tailor your experience even
              further, but it will always adapt to your performance.
            </p>

            <div className="relative w-full mb-4">
              <Select value={semiology} onValueChange={handleSemiologyChange}>
                <SelectTrigger className="flex items-center justify-between border border-[#E4E4E4] rounded-[24px] !py-[10px] px-5 w-full">
                  <SelectValue className="text-[14px] text-[#191919] font-[500]" />
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

          <div>
            <Label className="text-[15px] text-[#191919] font-[500] mb-2 block">
              Preferred Question Types*
            </Label>
            <p className="text-[12px] text-[#666666] mb-4">
              Let us know your preferred! Synergy will do its best to
              incorporate them while ensuring a balanced learning experience.
            </p>

            <div className="flex gap-3 mb-6">
              <button
                className={`${
                  questionTypes.includes("Multiple Choice")
                    ? "bg-[#FFF5FA] text-[#F8589F] border border-[#F8589F]"
                    : " text-[#191919]"
                } text-[13px] font-[500] px-4 py-[6px] rounded-[24px]`}
                onClick={() => handleQuestionTypeSelect("Multiple Choice")}
              >
                Multiple Choice
              </button>
              <button
                className={`${
                  questionTypes.includes("Short Answer")
                    ? "bg-[#FFF5FA] text-[#F8589F] border border-[#F8589F]"
                    : "text-[#191919]"
                } text-[13px] font-[500] px-4 py-[6px] rounded-[24px]`}
                onClick={() => handleQuestionTypeSelect("Short Answer")}
              >
                Short Answer
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Image src={clipboardImage} alt="clipboard" className="mr-[60px]" />
        </div>
      </div>
    </div>
  );
};

export default IntelligentMode;
