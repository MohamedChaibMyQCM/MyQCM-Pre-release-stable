"use client"

import Image from "next/image";
import quiz from "../../../../public/Quiz/quiz.png";
import timer from "../../../../public/Quiz/Timer.svg";
import solver from "../../../../public/Aside/wsolver.svg";
import { QuizQCMData } from "@/data/data";
import mind from "../../../../public/Quiz/mind.svg";
import { useState } from "react";
import QuizExplanation from "./QuizExplanation";

const Quiz = () => {
  const [checkAnswer, setCheckAnswer] = useState(true)
  const [seeExplanation, setSeeExplanation] = useState(false)

  return (
    <div className="relative bg-[#FFFFFF] w-[70%] rounded-[16px] mx-auto my-auto p-[20px] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#FF6EAF] flex items-center gap-3 rounded-[12px] px-[16px] py-[8px]">
            <Image src={solver} alt="solver" />
            <span className="text-[13px] text-[#FFFFFF] font-Poppins font-medium">
              Type: QCM
            </span>
          </div>
          <span className="block relative w-[160px] h-[8px] bg-[#dedede] rounded-[20px] after:w-[40px] after:h-[8px] after:rounded-[20px] after:bg-[#FF6EAF] after:absolute after:left-0"></span>
          <span className="bg-[#39FF64] px-[18px] py-[10px] rounded-[10px] text-[#FFFFFF] font-Poppins text-[14px] font-medium">
            Easy
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[14px] text-[#858494] font-Poppins font-light ">
            Time Remaining{" "}
            <span className="text-[#FF6EAF] font-semibold">(6s)</span>
          </span>
          <Image src={timer} alt="timer" className="w-[24px]" />
        </div>
      </div>
      <div className="flex gap-8">
        <div>
          <span className="block font-Poppins text-[#858494] text-[13px] font-medium mb-2">
            QUESTION 7 OF 68
          </span>
          <p className="font-Poppins text-[#0C092A] font-semibold">
            Given an enzymatic reaction with Michaelis-Menten kinetics, studied
            using a double-reciprocal plot. Curve 1 represents the variation of
            1/V (s/mol) as a function of 1/S (L/µmol) in an environment without
            inhibitors. Curves 2, 3, and 4 are the results of experiments
            conducted under the same conditions but with inhibitors 2, 3, and 4
            at a concentration of 8×10^(-5) mol/L in each case. Identify the
            true statements:
          </p>
        </div>
        <Image src={quiz} alt="quiz image" className="w-[360px]" />
      </div>
      <ul className="flex flex-col gap-4">
        {QuizQCMData.map((item, index) => {
          return (
            <li
              key={index}
              className="text-[14px] font-Poppins font-semibold text-[#0C092A] border border-[#EFEEFC] rounded-[16px] px-[20px] py-[8px]"
            >
              {item.Option}
            </li>
          );
        })}
      </ul>
      <div className="self-end flex items-center gap-4">
        <button className="bg-[#FFF5FA] text-[#0C092A] font-Poppins font-medium text-[13px] px-[16px] py-[10px] rounded-[14px]">
          Skip Question
        </button>
        {checkAnswer ? (
          <button
            onClick={() => setCheckAnswer(false)}
            className="bg-[#FF6EAF] text-[#FFFFFF] font-Poppins font-medium text-[13px] px-[16px] py-[10px] rounded-[14px]"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={() => setSeeExplanation(true)}
            className="bg-[#FF6EAF] text-[#FFFFFF] font-Poppins font-medium text-[13px] px-[16px] py-[10px] rounded-[14px]"
          >
            See Explanation
          </button>
        )}
      </div>
      <Image
        src={mind}
        alt="mind"
        className="absolute right-[-67px] top-12 w-[120px] z-[-1]"
      />
      {seeExplanation && (
        <QuizExplanation setSeeExplanation={setSeeExplanation} />
      )}
    </div>
  );
};

export default Quiz;