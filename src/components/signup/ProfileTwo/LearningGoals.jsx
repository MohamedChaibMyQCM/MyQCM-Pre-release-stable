import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import goals from "../../../../public/Icons/Profile/LearningGoal.svg";
import arrow from "../../../../public/Icons/Profile/ArrowProfile.svg";
import Image from "next/image";

const LearningGoals = ({ name, value, setFieldValue }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedValues, setSelectedValues] = React.useState(value || []);

  const options = [
    "Master core concepts",
    "Improve test scores",
    "Enhance clinical skills",
    "Gain practical knowledge",
    "Advance in specialty",
  ];

  const handleSelect = (option) => {
    let newSelectedValues;
    if (selectedValues.includes(option)) {
      newSelectedValues = selectedValues.filter((item) => item !== option);
    } else {
      newSelectedValues = [...selectedValues, option];
    }
    setSelectedValues(newSelectedValues);
    setFieldValue(name, newSelectedValues);
  };

  return (
    <div className="w-[48%] flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-[#6C7275C4] font-Inter text-[19px] font-semibold"
      >
        Learning Goals
      </label>
      <div className="relative">
        <Select
          open={isOpen}
          onOpenChange={setIsOpen}
          value={selectedValues.length ? selectedValues[0] : undefined}
        >
          <SelectTrigger
            className="rounded-[8px] items-center bg-[#FFE7F2] border-none text-[#6C7275C4] font-Inter font-medium py-6 px-[20px] select"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-3">
              <Image src={goals} alt="goals" />
              <SelectValue placeholder="Set Your Learning Goals" />
            </div>
            <Image
              src={arrow}
              alt="arrow"
              className={isOpen ? "rotate-180" : ""}
            />
          </SelectTrigger>
          <SelectContent className="bg-[#FFE7F2] rounded-[8px]">
            <SelectGroup>
              {options.map((option) => (
                <SelectItem
                  key={option}
                  value={option}
                  className={`!bg-[#FFE7F2] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px] ${
                    selectedValues.includes(option)
                      ? "!bg-[#ffffff] text-[#F8589F]"
                      : "text-[#ffffff]"
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {selectedValues.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-[#FFE7F2] rounded-[8px] flex flex-wrap gap-2">
            {selectedValues.map((value) => (
              <span
                key={value}
                className="bg-[#ffffff] text-[#F8589F] px-2 py-1 rounded-full text-sm flex items-center"
              >
                {value}
                <button
                  onClick={() => handleSelect(value)}
                  className="ml-2 text-[#F8589F] font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningGoals;