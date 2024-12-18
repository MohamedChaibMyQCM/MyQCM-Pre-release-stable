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
import study from "../../../../public/Icons/Profile/StudyHabits.svg";
import arrow from "../../../../public/Icons/Profile/ArrowProfile.svg";
import Image from "next/image";

const StudyHabits = ({ name, value, setFieldValue }) => {
  return (
    <div className="w-[48%] flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-[#6C7275C4]  text-[19px] font-semibold"
      >
        Tell Us About Your Study Habits
      </label>
      <Select
        required
        value={value}
        onValueChange={(val) => setFieldValue(name, val)}
      >
        <SelectTrigger className="rounded-[8px] items-center bg-[#FFE7F2] border-none text-[#6C727580]  font-medium py-6 px-[20px] select">
          <div className="flex items-center gap-3">
            <Image src={study} alt="study" />
            <SelectValue placeholder="Select your study habits" />
          </div>
          <Image src={arrow} alt="arrow" />
        </SelectTrigger>
        <SelectContent className="bg-[#FFE7F2] rounded-[8px]">
          <SelectGroup>
            <SelectItem
              value="Frequent, Short Study Sessions"
              className="!bg-[#FFE7F2] text-[#ffffff]  font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Frequent, Short Study Sessions
            </SelectItem>
            <SelectItem
              value="Long, Intense Study Sessions"
              className="!bg-[#FFE7F2] text-[#ffffff]  font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Long, Intense Study Sessions
            </SelectItem>
            <SelectItem
              value="Short, Frequent Study Sessions"
              className="!bg-[#FFE7F2] text-[#ffffff]  font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Short, Frequent Study Sessions
            </SelectItem>
            <SelectItem
              value="Detailed Note-Taking"
              className="!bg-[#FFE7F2] text-[#ffffff]  font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Detailed Note-Taking
            </SelectItem>
            <SelectItem
              value="Revisiting Complex Topics Multiple Times"
              className="!bg-[#FFE7F2] text-[#ffffff]  font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Revisiting Complex Topics Multiple Times
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default StudyHabits;
