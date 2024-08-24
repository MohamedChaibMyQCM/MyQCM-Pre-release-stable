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
import prefLearning from "../../../../public/Icons/Profile/PrefLearning.svg";
import arrow from "../../../../public/Icons/Profile/ArrowProfile.svg";
import Image from "next/image";

const PrefLearning = () => {
  return (
    <div className="w-[48%] flex flex-col gap-2">
      <label
        htmlFor=""
        className="text-[#6C7275C4] font-Inter text-[19px] font-semibold"
      >
        Preferred Learning Style
      </label>
      <Select>
        <SelectTrigger className="rounded-[8px] items-center bg-[#FFE7F2] border-none text-[#6C727580] font-Inter font-medium py-6 px-[20px] select">
          <div className="flex items-center gap-3">
            <Image src={prefLearning} alt="prefLearning" />
            <SelectValue placeholder="What's Your Preferred Learning Style?" />
          </div>
          <Image src={arrow} alt="arrow" />
        </SelectTrigger>
        <SelectContent className="bg-[#FFE7F2] rounded-[8px]">
          <SelectGroup>
            <SelectItem
              value="Repetitive Learning (Flashcards, Repetition Drills)"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Repetitive Learning (Flashcards, Repetition Drills)
            </SelectItem>
            <SelectItem
              value="Visual Aids (Diagrams, Flowcharts)"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Visual Aids (Diagrams, Flowcharts)
            </SelectItem>
            <SelectItem
              value="Problem-Based Learning"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Problem-Based Learning
            </SelectItem>
            <SelectItem
              value="Case Study Analysis"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Case Study Analysis
            </SelectItem>
            <SelectItem
              value="Interactive Learning (Quizzes, Gamified Content)"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Interactive Learning (Quizzes, Gamified Content)
            </SelectItem>
            <SelectItem
              value="Short, Engaging Content (Microlearning)"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Short, Engaging Content (Microlearning)
            </SelectItem>
            <SelectItem
              value="Focused on Details (Detailed Notes, Annotated Diagrams)"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Focused on Details (Detailed Notes, Annotated Diagrams)
            </SelectItem>
            <SelectItem
              value="Needs Help Connecting Concepts (Mind Maps)"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Needs Help Connecting Concepts (Mind Maps)
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PrefLearning;
