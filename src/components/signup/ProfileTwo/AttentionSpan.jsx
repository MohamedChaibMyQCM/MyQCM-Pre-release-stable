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
import attention from "../../../../public/Icons/Profile/AttentionSpan.svg";
import arrow from "../../../../public/Icons/Profile/ArrowProfile.svg";
import Image from "next/image";

const AttentionSpan = ({ name, value, setFieldValue }) => {
  return (
    <div className="w-[48%] flex flex-col gap-2 max-md:w-full">
      <label
        htmlFor={name}
        className="text-[#6C7275C4]  text-[19px] font-semibold"
      >
        What&apos;s Your Attention Span?
      </label>
      <Select
        required
        value={value}
        onValueChange={(val) => setFieldValue(name, val)}
      >
        <SelectTrigger className="rounded-[8px] items-center bg-[#FFE7F2] border-none text-[#6C7275C4]  font-medium py-6 px-[20px] select">
          <div className="flex items-center gap-3">
            <Image src={attention} alt="attention" />
            <SelectValue placeholder="Rate your attention span" />
          </div>
          <Image src={arrow} alt="arrow" />
        </SelectTrigger>
        <SelectContent className="bg-[#FFE7F2] rounded-[8px] border-none">
          <SelectGroup>
            <SelectItem
              value="Short"
              className="!bg-[#FFE7F2] text-[#6C7275C4]  font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Short (&lt; 15 minutes)
            </SelectItem>
            <SelectItem
              value="Moderate"
              className="!bg-[#FFE7F2] text-[#6C7275C4]  font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Moderate (15-30 minutes)
            </SelectItem>
            <SelectItem
              value="Long"
              className="!bg-[#FFE7F2] text-[#6C7275C4]  font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Long (&gt; 30 minutes)
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default AttentionSpan;
