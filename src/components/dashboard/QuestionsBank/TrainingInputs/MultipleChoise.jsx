"use client";

import { Label } from "@/components/ui/label";
import { useState } from "react";

const MultipleChoice = ({ name, value, setFieldValue }) => {
  const [isOptionOneChecked, setIsOptionOneChecked] = useState(false);

  const toggleRadio = () => {
    setIsOptionOneChecked(!isOptionOneChecked);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex space-x-2 items-center">
        <button
          type="button"
          onClick={toggleRadio}
          className={`w-[14px] h-[14px] rounded-full border-2 border-[#FD2E8A] cursor-pointer transition-colors ${
            isOptionOneChecked
              ? "bg-[#FD2E8A] border-[#FD2E8A]"
              : "bg-transparent"
          }`}
        />
        <div className="flex flex-col gap-2">
          <Label htmlFor="option-one" className="text-[#FD2E8A] font-[500]">
            MCQs
          </Label>
        </div>
      </div>
    </div>
  );
};

export default MultipleChoice;
