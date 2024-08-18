import React from "react";
import ClinicalExperience from "./ProfileTwo/ClinicalExperience";
import CertOrExam from "./ProfileTwo/CertOrExam";
import LearningGoals from "./ProfileTwo/LearningGoals";
import LearningPath from "./ProfileTwo/LearningPath";
import MemoryRetention from "./ProfileTwo/MemoryRetention";
import AttentionSpan from "./ProfileTwo/AttentionSpan";

const SetProfileTwo = ({ setCurrentStep }) => {
  return (
    <div className="w-[100%]">
      <div className="flex items-center justify-between flex-wrap w-[100%] gap-5">
        <ClinicalExperience />
        <CertOrExam />
      </div>
      <span className="relative w-[100%] my-2 flex items-center justify-center my-5 text-[#6C727580] font-Inter text-[13px] after:bg-[#6C727580] after:absolute after:w-[41%] after:left-0 after:h-[1px] after:top-[50%] after:translate-y-[-50%] before:bg-[#6C727580] before:absolute before:w-[41%] before:right-0 before:h-[1px] before:top-[50%] before:translate-y-[-50%]">
        Goals and Objectives
      </span>
      <div className="flex items-center justify-between flex-wrap w-[100%] gap-5">
        <LearningGoals />
        <LearningPath />
      </div>
      <span className="relative w-[100%] my-2 flex items-center justify-center my-5 text-[#6C727580] font-Inter text-[13px] after:bg-[#6C727580] after:absolute after:w-[38%] after:left-0 after:h-[1px] after:top-[50%] after:translate-y-[-50%] before:bg-[#6C727580] before:absolute before:w-[38%] before:right-0 before:h-[1px] before:top-[50%] before:translate-y-[-50%]">
        Cognitive and Behavioral Data
      </span>
      <div className="flex items-center justify-between flex-wrap w-[100%] gap-5 mb-16">
        <MemoryRetention />
        <AttentionSpan />
      </div>
      <div className="flex items-center justify-end gap-10">
        <button
          className="text-[#F8589F] text-[15px] font-Inter font-medium"
          onClick={() => setCurrentStep("SetProfileOne")}
        >
          Back
        </button>
        <button
          className="self-end bg-[#F8589F] rounded-[10px] text-[15px] font-Inter text-[#FFFFFF] font-medium py-[8px] px-[50px]"
          type="submit"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SetProfileTwo;
