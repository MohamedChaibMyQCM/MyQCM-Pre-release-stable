import React from "react";
import University from "./ProfileOne/University";
import Field from "./ProfileOne/Field";
import Annexe from "./ProfileOne/Annexe";
import Year from "./ProfileOne/Year";
import Feedback from "./ProfileOne/Feedback";
import PrefLearning from "./ProfileOne/PrefLearning";
import LearningPace from "./ProfileOne/LearningPace";
import StudyHabits from "./ProfileOne/StudyHabits";
import PrefContentFormat from "./ProfileOne/PrefContentFormat";

const SetProfileOne = ({ setCurrentStep }) => {
  return (
    <div className="w-[100%] flex flex-col justify-center items-center">
      <div className="flex items-center justify-between flex-wrap w-[100%] gap-5">
        <University />
        <Annexe />
        <Field />
        <Year />
        <Feedback />
      </div>
      <span className="relative w-[100%] my-2 flex items-center justify-center my-5 text-[#6C727580] font-Inter text-[13px] after:bg-[#6C727580] after:absolute after:w-[41%] after:left-0 after:h-[1px] after:top-[50%] after:translate-y-[-50%] before:bg-[#6C727580] before:absolute before:w-[41%] before:right-0 before:h-[1px] before:top-[50%] before:translate-y-[-50%]">
        Learning Preferences
      </span>
      <div className="flex items-center justify-between flex-wrap w-[100%] gap-5 mb-16">
        <PrefLearning />
        <LearningPace />
        <StudyHabits />
        <PrefContentFormat />
      </div>
      <button
        onClick={() => setCurrentStep("SetProfileTwo")}
        className="self-end bg-[#F8589F] rounded-[10px] text-[15px] font-Inter text-[#FFFFFF] font-medium py-[8px] px-[50px]"
      >
        Next
      </button>
    </div>
  );
};

export default SetProfileOne;
