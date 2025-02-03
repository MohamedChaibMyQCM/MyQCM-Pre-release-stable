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
import clinical from "../../../../public/Icons/Profile/ClinicalExp.svg";
import arrow from "../../../../public/Icons/Profile/ArrowProfile.svg";
import Image from "next/image";

const ClinicalExperience = ({ name, value, setFieldValue }) => {
  return (
    <div className="w-[48%] flex flex-col gap-2 max-md:w-full">
      <label
        htmlFor={name}
        className="text-[#6C7275C4]  text-[19px] font-semibold"
      >
        Do You Have Clinical Experience?
      </label>
      <Select
        required
        value={value}
        onValueChange={(val) => setFieldValue(name, val)}
      >
        <SelectTrigger className="rounded-[8px] items-center bg-[#FFE7F2] border-none text-[#6C7275C4]  font-medium py-6 px-[20px] select">
          <div className="flex items-center gap-3">
            <Image src={clinical} alt="clinical" />
            <SelectValue placeholder="Select Yes or No" />
          </div>
          <Image src={arrow} alt="arrow" />
        </SelectTrigger>
        <SelectContent className="bg-[#FFE7F2] rounded-[8px]">
          <SelectGroup>
            <SelectItem
              value="Yes"
              className="!bg-[#FFE7F2] text-[#ffffff]  font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Yes
            </SelectItem>
            <SelectItem
              value="No"
              className="!bg-[#FFE7F2] text-[#ffffff]  font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              No
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ClinicalExperience;
