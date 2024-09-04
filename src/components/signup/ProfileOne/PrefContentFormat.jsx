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
import format from "../../../../public/Icons/Profile/PrefContentFormat.svg";
import arrow from "../../../../public/Icons/Profile/ArrowProfile.svg";
import Image from "next/image";

const PrefContentFormat = ({ name, value, setFieldValue }) => {
  return (
    <div className="w-[48%] flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-[#6C7275C4] font-Inter text-[19px] font-semibold"
      >
        What’s Your Preferred Content Format?
      </label>
      <Select value={value} onValueChange={(val) => setFieldValue(name, val)}>
        <SelectTrigger className="rounded-[8px] items-center bg-[#FFE7F2] border-none text-[#6C7275C4] font-Inter font-medium py-6 px-[20px] select">
          <div className="flex items-center gap-3">
            <Image src={format} alt="format" />
            <SelectValue placeholder="Choose the types of content you prefer" />
          </div>
          <Image src={arrow} alt="arrow" />
        </SelectTrigger>
        <SelectContent className="bg-[#FFE7F2] rounded-[8px]">
          <SelectGroup>
            <SelectItem
              value="Flashcards"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Flashcards
            </SelectItem>
            <SelectItem
              value="Simplified Notes"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Simplified Notes
            </SelectItem>
            <SelectItem
              value="Advanced Case Studies"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Advanced Case Studies
            </SelectItem>
            <SelectItem
              value="Complex MCQs"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Complex MCQs
            </SelectItem>
            <SelectItem
              value="Interactive Quizzes"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Interactive Quizzes
            </SelectItem>
            <SelectItem
              value="Video Snippets"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Video Snippets
            </SelectItem>
            <SelectItem
              value="Detailed Case Discussions"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Detailed Case Discussions
            </SelectItem>
            <SelectItem
              value="Concept Maps"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Concept Maps
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PrefContentFormat;