import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import goals from "../../../../public/Icons/Profile/LearningGoal.svg";
import arrow from "../../../../public/Icons/Profile/ArrowProfile.svg";
import Image from "next/image";

const LearningGoals = ({ name, value, setFieldValue }) => {
  return (
    <div className="w-[48%] flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-[#6C7275C4] font-Inter text-[19px] font-semibold"
      >
        Learning Goals
      </label>
      <Select value={value} onValueChange={(val) => setFieldValue(name, val)}>
        <SelectTrigger className="rounded-[8px] items-center bg-[#FFE7F2] border-none text-[#6C7275C4] font-Inter font-medium py-6 px-[20px] select">
          <div className="flex items-center gap-3">
            <Image src={goals} alt="goals" />
            <SelectValue placeholder="Set Your Learning Goals" />
          </div>
          <Image src={arrow} alt="arrow" />
        </SelectTrigger>
        <SelectContent className="bg-[#FFE7F2] rounded-[8px]">
          <SelectGroup>
            <SelectItem
              value="Master core concepts"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Master core concepts
            </SelectItem>
            <SelectItem
              value="Improve test scores"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Improve test scores
            </SelectItem>
            <SelectItem
              value="Enhance clinical skills"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Enhance clinical skills
            </SelectItem>
            <SelectItem
              value="Gain practical knowledge"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Gain practical knowledge
            </SelectItem>
            <SelectItem
              value="Advance in specialty"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Advance in specialty
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LearningGoals;
