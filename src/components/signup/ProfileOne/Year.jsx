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
import year from "../../../../public/Icons/Profile/Year.svg";
import arrow from "../../../../public/Icons/Profile/ArrowProfile.svg";
import Image from "next/image";

const Year = ({ name, value, setFieldValue }) => {
  return (
    <div className="w-[48%] flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-[#6C7275C4] font-Inter text-[19px] font-semibold"
      >
        Year of Study?
      </label>
      <Select
        required
        value={value}
        onValueChange={(val) => setFieldValue(name, val)}
      >
        <SelectTrigger className="rounded-[8px] items-center bg-[#FFE7F2] border-none text-[#6C727580] font-Inter font-medium py-6 px-[20px] select">
          <div className="flex items-center gap-3">
            <Image src={year} alt="year" />
            <SelectValue placeholder="Indicate Your Year of Study" />
          </div>
          <Image src={arrow} alt="arrow" />
        </SelectTrigger>
        <SelectContent className="bg-[#FFE7F2] rounded-[8px]">
          <SelectGroup>
            <SelectItem
              value="First Year"
              className="!bg-[#FFE7F2] text-[#FFFFFF] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              First Year
            </SelectItem>
            <SelectItem
              value="Second Year"
              className="!bg-[#FFE7F2] text-[#FFFFFF] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Second Year
            </SelectItem>
            <SelectItem
              value="Third Year"
              className="!bg-[#FFE7F2] text-[#FFFFFF] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Third Year
            </SelectItem>
            <SelectItem
              value="Fourth Year"
              className="!bg-[#FFE7F2] text-[#FFFFFF] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Fourth Year
            </SelectItem>
            <SelectItem
              value="Fifth Year"
              className="!bg-[#FFE7F2] text-[#FFFFFF] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Fifth Year
            </SelectItem>
            <SelectItem
              value="Sixth Year"
              className="!bg-[#FFE7F2] text-[#FFFFFF] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Sixth Year
            </SelectItem>
            <SelectItem
              value="Seventh Year"
              className="!bg-[#FFE7F2] text-[#FFFFFF] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Seventh Year
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default Year;
