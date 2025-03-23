"use client";

import Image from "next/image";
import clipboardImage from "../../../../public/settings/intell_mode.svg";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { CaretDown } from "phosphor-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CustomMode = () => {
  const [semiology, setSemiology] = useState("Cardio");
  const [questionTypes, setQuestionTypes] = useState(["MCQs"]);
  const [difficultyLevels, setDifficultyLevels] = useState(["Steady"]); // Updated to an array
  const [questionsCount, setQuestionsCount] = useState(20);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [randomize, setRandomize] = useState(false);

  const semiologyOptions = [
    "Cardio",
    "Neurology",
    "Respiratory",
    "Gastrointestinal",
    "Endocrine",
  ];

  const difficultyLevelOptions = ["Rookie", "Steady", "Master"]; // Renamed to avoid conflict

  const handleQuestionTypeSelect = (type) => {
    let newTypes;
    if (questionTypes.includes(type)) {
      if (questionTypes.length > 1) {
        newTypes = questionTypes.filter((t) => t !== type);
      } else {
        return;
      }
    } else {
      newTypes = [...questionTypes, type];
    }
    setQuestionTypes(newTypes);
  };

  const handleDifficultyLevelSelect = (level) => {
    let newLevels;
    if (difficultyLevels.includes(level)) {
      if (difficultyLevels.length > 1) {
        newLevels = difficultyLevels.filter((l) => l !== level);
      } else {
        return; // Prevent deselecting the last option
      }
    } else {
      newLevels = [...difficultyLevels, level];
    }
    setDifficultyLevels(newLevels);
  };

  const incrementQuestions = () => {
    setQuestionsCount((prev) => prev + 1); // Increment by 1
  };

  const decrementQuestions = () => {
    if (questionsCount > 1) {
      setQuestionsCount((prev) => prev - 1); // Decrement by 1
    }
  };

  const incrementTimer = () => {
    setTimerMinutes((prev) => prev + 1); // Increment by 1
  };

  const decrementTimer = () => {
    if (timerMinutes > 1) {
      setTimerMinutes((prev) => prev - 1); // Decrement by 1
    }
  };

  return (
    <div>
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        Manual Mode Settings
      </h3>

      <div className="relative flex items-center justify-between bg-[#FFFFFF] p-6 rounded-[16px] border border-[#E4E4E4] mb-8">
        <div className="w-[67%]">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-[15px] text-[#191919] font-[500]">
                Choose Modules/Categories*
              </Label>
              <span className="absolute top-4 right-6 text-[11px] text-[#F8589F]">
                *Required Fields
              </span>
            </div>
            <p className="text-[12px] text-[#666666] mb-4">
              Select modules or categories you want to practice on.
            </p>

            <div className="relative w-full mb-4">
              <Select value={semiology} onValueChange={setSemiology}>
                <SelectTrigger className="flex items-center justify-between border border-[#E4E4E4] rounded-[24px] !py-[12px] px-5 w-full">
                  <SelectValue className="text-[14px] font-[500] text-[#191919]" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-[#E4E4E4] rounded-[8px] shadow-lg">
                  {semiologyOptions.map((option) => (
                    <SelectItem
                      key={option}
                      value={option}
                      className="p-3 hover:bg-[#FFF5FA] cursor-pointer text-[13px]"
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-6">
            <Label className="text-[15px] text-[#191919] font-[500] mb-2 block">
              Preferred Question Types*
            </Label>
            <p className="text-[12px] text-[#666666] mb-4">
              Select the types of questions you&apos;d like to practice.
            </p>

            <div className="flex gap-3 mb-4">
              <button
                className={`${
                  questionTypes.includes("MCQs")
                    ? "bg-[#FFF5FA] text-[#F8589F] border border-[#F8589F]"
                    : "text-[#191919]"
                } text-[13px] font-[500] px-4 py-2 rounded-[24px]`}
                onClick={() => handleQuestionTypeSelect("MCQs")}
              >
                Multiple Choice
              </button>
              <button
                className={`${
                  questionTypes.includes("QRCPs")
                    ? "bg-[#FFF5FA] text-[#F8589F] border border-[#F8589F]"
                    : "text-[#191919]"
                } text-[13px] font-[500] px-4 py-2 rounded-[24px]`}
                onClick={() => handleQuestionTypeSelect("QRCPs")}
              >
                Short Answer
              </button>
            </div>
          </div>

          <div className="mb-6">
            <Label className="text-[15px] text-[#191919] font-[500] mb-2 block">
              Difficulty Level*
            </Label>
            <p className="text-[12px] text-[#666666] mb-4">
              Choose your desired level of challenge. Rookie focuses on
              foundational knowledge, Steady builds understanding, and Master
              tests your expertise.
            </p>

            <div className="flex gap-3 mb-4">
              {difficultyLevelOptions.map((level) => (
                <button
                  key={level}
                  className={`${
                    difficultyLevels.includes(level)
                      ? "bg-[#FFF5FA] text-[#F8589F] border border-[#F8589F]"
                      : "text-[#191919]"
                  } text-[13px] font-[500] px-4 py-2 rounded-[24px] flex-1`}
                  onClick={() => handleDifficultyLevelSelect(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between mb-6 mt-10">
            <div className="w-1/2 pr-4">
              <Label className="text-[15px] text-[#191919] font-[500] mb-2 block">
                Number of Questions*
              </Label>
              <p className="text-[12px] text-[#666666] mb-4">
                How many questions you want?
              </p>

              <div className="flex items-center">
                <button
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FFF5FA] text-[#F8589F] border border-[#F8589F]"
                  onClick={decrementQuestions}
                >
                  -
                </button>
                <span className="mx-4 text-[14px] font-[500]">
                  {questionsCount}
                </span>
                <button
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FFF5FA] text-[#F8589F] border border-[#F8589F]"
                  onClick={incrementQuestions}
                >
                  +
                </button>
              </div>
            </div>

            <div className="w-1/2 pl-4">
              <Label className="text-[15px] text-[#191919] font-[500] mb-2 block">
                Time Limit
              </Label>
              <p className="text-[12px] text-[#666666] mb-4">
                Set a time limit
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className={`w-12 h-6 ${
                      timerEnabled
                        ? "bg-[#F8589F] border border-[#F8589F]"
                        : "bg-gray-200"
                    } rounded-full p-1 transition-colors duration-300 flex ${
                      timerEnabled ? "justify-end" : "justify-start"
                    } cursor-pointer`}
                    onClick={() => setTimerEnabled(!timerEnabled)}
                  >
                    <div
                      className={`${
                        timerEnabled ? "bg-white" : "bg-white"
                      } w-4 h-4 rounded-full`}
                    ></div>
                  </div>
                  <span className="ml-2 text-[13px]">
                    {timerEnabled ? "On" : "Off"}
                  </span>
                </div>

                {timerEnabled && (
                  <div className="flex items-center">
                    <button
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FFF5FA] text-[#F8589F] border border-[#F8589F]"
                      onClick={decrementTimer}
                    >
                      -
                    </button>
                    <span className="mx-4 text-[14px] font-[500]">
                      {timerMinutes}:00
                    </span>
                    <button
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FFF5FA] text-[#F8589F] border border-[#F8589F]"
                      onClick={incrementTimer}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6 flex items-center">
            <div>
              <Label className="text-[15px] text-[#191919] font-[500] mb-2 block">
                Randomize Question Order
              </Label>
              <p className="text-[12px] text-[#666666] mb-2">
                Display question within a random order
              </p>
            </div>

            <div className="ml-auto flex items-center">
              <div
                className={`w-12 h-6 ${
                  randomize
                    ? "bg-[#F8589F] border border-[#F8589F]"
                    : "bg-gray-200"
                } rounded-full p-1 transition-colors duration-300 flex ${
                  randomize ? "justify-end" : "justify-start"
                } cursor-pointer`}
                onClick={() => setRandomize(!randomize)}
              >
                <div
                  className={`${
                    randomize ? "bg-white" : "bg-white"
                  } w-4 h-4 rounded-full`}
                ></div>
              </div>
              <span className="ml-2 text-[13px]">
                {randomize ? "On" : "Off"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Image
            src={clipboardImage}
            alt="clipboard"
            className="mr-[20px] w-[270px]"
          />
        </div>
      </div>
    </div>
  );
};

export default CustomMode;
