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
import feedback from "../../../../public/Icons/Profile/feedback.svg";
import arrow from "../../../../public/Icons/Profile/ArrowProfile.svg";
import Image from "next/image";

const Feedback = ({ name, value, setFieldValue }) => {
  return (
    <div className="w-[48%] flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-[#6C7275C4] font-Inter text-[19px] font-semibold"
      >
        Feedback Preferences
      </label>
      <Select value={value} onValueChange={(val) => setFieldValue(name, val)}>
        <SelectTrigger className="rounded-[8px] items-center bg-[#FFE7F2] border-none text-[#6C727580] font-Inter font-medium py-6 px-[20px] select">
          <div className="flex items-center gap-3">
            <Image src={feedback} alt="feedback" />
            <SelectValue placeholder="Select your feedback preference" />
          </div>
          <Image src={arrow} alt="arrow" />
        </SelectTrigger>
        <SelectContent className="bg-[#FFE7F2] rounded-[8px]">
          <SelectGroup>
            <SelectItem
              value="Detailed Explanations After Each Question"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Detailed Explanations After Each Question
            </SelectItem>
            <SelectItem
              value="Regular Revision Reminders"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Regular Revision Reminders
            </SelectItem>
            <SelectItem
              value="High-Level Feedback on Complex Questions"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              High-Level Feedback on Complex Questions
            </SelectItem>
            <SelectItem
              value="Advanced Conceptual Challenges"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Advanced Conceptual Challenges
            </SelectItem>
            <SelectItem
              value="Immediate Feedback to Maintain Engagement"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Immediate Feedback to Maintain Engagement
            </SelectItem>
            <SelectItem
              value="Motivational Tips and Reminders"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Motivational Tips and Reminders
            </SelectItem>
            <SelectItem
              value="Conceptual Clarification Sessions"
              className="!bg-[#FFE7F2] text-[#ffffff] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Conceptual Clarification Sessions
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default Feedback;