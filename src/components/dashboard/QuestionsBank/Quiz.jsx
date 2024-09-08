"use client";

import Image from "next/image";
import quiz from "../../../../public/Quiz/quiz.png";
import timer from "../../../../public/Quiz/Timer.svg";
import solver from "../../../../public/Aside/wsolver.svg";
import mind from "../../../../public/Quiz/mind.svg";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import QuizResult from "./QuizResult";
import { useMutation, useQuery } from "react-query";
import BaseUrl from "@/components/BaseUrl";
import QuizExplanation from "./QuizExplanation";
import { useFormik } from "formik";

const Quiz = ({ data, Progres }) => {
  const [checkAnswer, setCheckAnswer] = useState(true);
  const [skip, setSkip] = useState(false);
  const [seeExplanation, setSeeExplanation] = useState(false);
  const [response, setResponse] = useState('') 
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleOptionClick = (option) => {
    setSelectedOptions((prevSelected) => {
      if (prevSelected.includes(option)) {
        return prevSelected.filter((item) => item !== option);
      }
      return [...prevSelected, option];
    });
  };

  const formik = useFormik({
    initialValues: {
      mcq: data.id,
      response_options: selectedOptions,
      response: response,
      time_spent: data.estimated_time,
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

   useEffect(() => {
     formik.setFieldValue("response_options", selectedOptions);
   }, [selectedOptions]);

  return (
    <div className="relative bg-[#FFFFFF] w-[70%] rounded-[16px] mx-auto my-auto p-[20px] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#FF6EAF] flex items-center gap-3 rounded-[12px] px-[16px] py-[8px]">
            <Image src={solver} alt="solver" />
            <span className="text-[13px] text-[#FFFFFF] font-Poppins font-medium">
              Type: {data.type}
            </span>
          </div>
          <span className="block relative w-[160px] h-[8px] bg-[#dedede] rounded-[20px] after:w-[40px] after:h-[8px] after:rounded-[20px] after:bg-[#FF6EAF] after:absolute after:left-0"></span>
          <span
            className={`px-[18px] py-[10px] rounded-[10px] text-[#FFFFFF] font-Poppins text-[14px] font-medium ${
              data.difficulty == "easy"
                ? "bg-[#39FF64]"
                : data.difficulty == "medium"
                ? "bg-[#ECD14E]"
                : "bg-red-600"
            }`}
          >
            {data.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[14px] text-[#858494] font-Poppins font-light ">
            Time Remaining{" "}
            <span className="text-[#FF6EAF] font-semibold">
              ({data.estimated_time}s)
            </span>
          </span>
          <Image src={timer} alt="timer" className="w-[24px]" />
        </div>
      </div>

      <div className="flex gap-8 justify-between">
        <div>
          <span className="block font-Poppins text-[#858494] text-[13px] font-medium mb-2">
            {/* QUESTION {activeQuiz + 1} OF {QuizData.Quiz.length} */}
          </span>
          <p className="font-Poppins text-[#0C092A] font-semibold">
            {data.question}
          </p>
        </div>
        <Image src={quiz} alt="quiz image" className="w-[360px]" />
      </div>

      <form className="flex flex-col gap-4" onSubmit={formik.handleSubmit}>
        <ul className="flex flex-col gap-4">
          {data.type == "qcm" || data.type == "qcs" ? (
            data.options.map((item, index) => {
              const isSelected = selectedOptions.includes(item.id);
              return (
                <li
                  key={index}
                  className={`text-[14px] font-Poppins font-semibold text-[#0C092A] border border-[#EFEEFC] rounded-[16px] px-[20px] py-[8px] cursor-pointer ${
                    isSelected ? "bg-[#FFF5FA] text-[#0C092A]" : ""
                  }`}
                  onClick={() => handleOptionClick(item.id)}
                >
                  {item.content}
                </li>
              );
            })
          ) : (
            <Input
              className="border-[1.6px] border-[#EFEEFC] text-[#49465F] font-Poppins font-medium placeholder:text-[13px] text-[13px] px-[16px] py-[19px] rounded-[14px]"
              placeholder="Write Your Answer"
              value={response}
              onValueChange={(e) => setResponse(e.target.value)}
            />
          )}
        </ul>

        <div className="self-end flex items-center gap-4">
          onClick={() => setSkip(true)}
          <button className="bg-[#FFF5FA] text-[#0C092A] font-Poppins font-medium text-[13px] px-[16px] py-[10px] rounded-[14px]">
            Skip Question
          </button>
          {checkAnswer ? (
            <button
              onClick={() => setCheckAnswer(false)}
              type="submit"
              className="bg-[#FF6EAF] text-[#FFFFFF] font-Poppins font-medium text-[13px] px-[16px] py-[10px] rounded-[14px]"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={() => setSeeExplanation(true)}
              className="bg-[#FF6EAF] text-[#FFFFFF] font-Poppins font-medium text-[13px] px-[16px] py-[10px] rounded-[14px]"
            >
              {data.type == "qcm" || data.type == "qcs"
                ? "See Explanation"
                : "See Analyse"}
            </button>
          )}
        </div>
      </form>
      <Image
        src={mind}
        alt="mind"
        className="absolute right-[-67px] top-12 w-[120px] z-[-1]"
      />
      {seeExplanation && (
        <QuizExplanation
          QuizData={data}
          setSeeExplanation={setSeeExplanation}
          type={data.type}
        />
      )}
      {skip && <QuizResult setSkip={setSkip} />}
    </div>
  );
};

export default Quiz;