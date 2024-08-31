"use client";

import Image from "next/image";
import quiz from "../../../../public/Quiz/quiz.png";
import timer from "../../../../public/Quiz/Timer.svg";
import solver from "../../../../public/Aside/wsolver.svg";
import { QuizData } from "@/data/data";
import mind from "../../../../public/Quiz/mind.svg";
import { useState } from "react";
import QuizExplanation from "./QuizExplanation";
import { Input } from "@/components/ui/input";

const Quiz = () => {
  const { type } = QuizData
  const [activeQuiz, setActiveQuiz] = useState(0)

  const [checkAnswer, setCheckAnswer] = useState(true);
  const [seeExplanation, setSeeExplanation] = useState(false);

  return (
    <div className="relative bg-[#FFFFFF] w-[70%] rounded-[16px] mx-auto my-auto p-[20px] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#FF6EAF] flex items-center gap-3 rounded-[12px] px-[16px] py-[8px]">
            <Image src={solver} alt="solver" />
            <span className="text-[13px] text-[#FFFFFF] font-Poppins font-medium">
              Type: {type}
            </span>
          </div>
          <span className="block relative w-[160px] h-[8px] bg-[#dedede] rounded-[20px] after:w-[40px] after:h-[8px] after:rounded-[20px] after:bg-[#FF6EAF] after:absolute after:left-0"></span>
          <span className="bg-[#39FF64] px-[18px] py-[10px] rounded-[10px] text-[#FFFFFF] font-Poppins text-[14px] font-medium">
            {QuizData.Quiz[activeQuiz].difficulty}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[14px] text-[#858494] font-Poppins font-light ">
            Time Remaining{" "}
            <span className="text-[#FF6EAF] font-semibold">
              ({QuizData.Quiz[activeQuiz].time}s)
            </span>
          </span>
          <Image src={timer} alt="timer" className="w-[24px]" />
        </div>
      </div>
      <div className="flex gap-8 justify-between">
        <div>
          <span className="block font-Poppins text-[#858494] text-[13px] font-medium mb-2">
            QUESTION {activeQuiz + 1} OF {QuizData.Quiz.length}
          </span>
          <p className="font-Poppins text-[#0C092A] font-semibold">
            {QuizData.Quiz[activeQuiz].text}
          </p>
        </div>
        <Image src={quiz} alt="quiz image" className="w-[360px]" />
      </div>
      <ul className="flex flex-col gap-4">
        {type === "QCM" ? (
          QuizData.Quiz[activeQuiz].options.map((item, index) => {
            return (
              <li
                key={index}
                className="text-[14px] font-Poppins font-semibold text-[#0C092A] border border-[#EFEEFC] rounded-[16px] px-[20px] py-[8px] cursor-pointer"
              >
                {item.option}
              </li>
            );
          })
        ) : (
          <Input
            className="border-[1.6px] border-[#EFEEFC] text-[#49465F] font-Poppins font-medium placeholder:text-[13px] text-[13px] px-[16px] py-[19px] rounded-[14px]"
            placeholder="Write Your Answer"
          />
        )}
      </ul>

      <div className="self-end flex items-center gap-4">
        <button
          className="bg-[#FFF5FA] text-[#0C092A] font-Poppins font-medium text-[13px] px-[16px] py-[10px] rounded-[14px]"
          onClick={() => setActiveQuiz((prev) => prev + 1)}
        >
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
            {type === "QCM" ? "See Explanation" : "See Analyse"}
          </button>
        )}
      </div>
      <Image
        src={mind}
        alt="mind"
        className="absolute right-[-67px] top-12 w-[120px] z-[-1]"
      />
      {seeExplanation && (
        <QuizExplanation 
          QuizData={QuizData}
          setSeeExplanation={setSeeExplanation}
          type={type}
          activeQuiz={activeQuiz}
        />
      )}
    </div>
  );
};

export default Quiz;