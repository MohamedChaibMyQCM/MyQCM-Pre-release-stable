"use client";

import Image from "next/image";
import result from "../../../../public/Quiz/result.svg";
import Link from "next/link";
import { useParams } from "next/navigation";
import { X } from "phosphor-react";

const QuizResult = ({ data, length }) => {
  const { category } = useParams();
  
  const totalQuestions = data.total_mcqs || length;
  const mcqSolved = data.total_mcqs_solved;
  const correctAnswers = data.correct_answers;
  const incorrectAnswers = data.incorrect_answers;
  const skippedQuestions = data.mcqs_skipped;
  const successRatio = data.avg_success_ratio;

  return (
    <div className="bg-[#0000004D] fixed top-0 left-0 h-full w-full flex items-center justify-center z-[100]">
      <div className="bg-[#ffffff] w-[420px] p-[30px] rounded-[16px] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="font-medium text-[#191919] text-[19px]">
            Awesome!
          </span>
          <Link href={`/dashboard/QuestionsBank/${category}/QuestionPerCourse`}>
            <X size={20} weight="bold" className="text-[#B5BEC6]" />
          </Link>
        </div>
        <Image src={result} alt="result" className="cursor-pointer w-full" />
        <div className="flex items-center justify-between flex-wrap gap-5 my-2">
          <div className="basis-[40%] flex flex-col gap-1">
            <span className="text-[#191919] font-medium text-[13px]">
              COMPLETION
            </span>
            <span className="text-[#FD2E8A] font-medium text-[12px]">
              {(successRatio * 100).toFixed(2)}%
            </span>
          </div>
          <div className="basis-[40%] flex flex-col gap-1">
            <span className="text-[font-Poppins] font-medium text-[13px]">
              CORRECT ANSWER
            </span>
            <span className="text-[#FD2E8A] font-medium text-[12px]">
              {correctAnswers} questions
            </span>
          </div>
          <div className="basis-[40%] flex flex-col gap-1">
            <span className="text-[font-Poppins] font-[500] text-[13px]">
              SKIPPED
            </span>
            <span className="text-[#FD2E8A] font-medium text-[12px]">
              {totalQuestions - mcqSolved} questions
            </span>
          </div>
          <div className="basis-[40%] flex flex-col gap-1">
            <span className="text-[font-Poppins] font-medium text-[13px]">
              INCORRECT ANSWER
            </span>
            <span className="text-[#FD2E8A] font-medium text-[12px]">
              {incorrectAnswers} questions
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-6 mt-2">
          <button className="font-medium text-[14px] basis-[48%] border border-[#FD2E8A] text-[#FD2E8A] px-[20px] py-[8px] rounded-[24px] hover:bg-pink-50 transition-colors">
            Share
          </button>
          <Link
            href={`/dashboard/question-bank`}
            className="font-medium text-[14px] basis-[48%] text-center bg-[#FD2E8A] text-[#FFF5FA] px-[20px] py-[8px] rounded-[24px] hover:opacity-90 transition-opacity"
          >
            Done
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;