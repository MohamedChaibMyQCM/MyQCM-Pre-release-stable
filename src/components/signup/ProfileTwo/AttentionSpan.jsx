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

const AttentionSpan = () => {
  return (
    <div className="w-[48%] flex flex-col gap-2">
      <label
        htmlFor=""
        className="text-[#6C7275C4] font-Inter text-[19px] font-semibold"
      >
        What&apos;s Your Attention Span?
      </label>
      <Select>
        <SelectTrigger className="rounded-[8px] items-center bg-[#FFE7F2] border-none text-[#6C727580] font-Inter font-medium py-6 px-[20px] select">
          <div className="flex items-center gap-3">
            <Image src={attention} alt="attention" />
            <SelectValue placeholder="Rate your attention span " />
          </div>
          <Image src={arrow} alt="arrow" />
        </SelectTrigger>
        <SelectContent className="bg-[#FFE7F2] rounded-[8px]">
          <SelectGroup>
            <SelectItem
              value="blida"
              className="!bg-[#FFE7F2] text-[#6C727580] font-Inter font-medium"
            >
              University of Saad Dahleb, Blida
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default AttentionSpan