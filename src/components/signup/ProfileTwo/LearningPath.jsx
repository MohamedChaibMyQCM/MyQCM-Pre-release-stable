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
import path from "../../../../public/Icons/Profile/LearningPath.svg";
import arrow from "../../../../public/Icons/Profile/ArrowProfile.svg";
import Image from "next/image";

const LearningPath = ({ name, value, setFieldValue }) => {
  return (
    <div className="w-[48%] flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-[#6C7275C4] font-Inter text-[19px] font-semibold"
      >
        Choose Your Learning Path
      </label>
      <Select value={value} onValueChange={(val) => setFieldValue(name, val)}>
        <SelectTrigger className="rounded-[8px] items-center bg-[#FFE7F2] border-none text-[#6C7275C4] font-Inter font-medium py-6 px-[20px] select">
          <div className="flex items-center gap-3">
            <Image src={path} alt="path" />
            <SelectValue placeholder="Do you prefer free path or supported path" />
          </div>
          <Image src={arrow} alt="arrow" />
        </SelectTrigger>
        <SelectContent className="bg-[#FFE7F2] rounded-[8px]">
          <SelectGroup>
            <SelectItem
              value="Free"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Free Path (Self-directed learning)
            </SelectItem>
            <SelectItem
              value="Supported"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Supported Path (Guided learning with feedback)
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LearningPath;
