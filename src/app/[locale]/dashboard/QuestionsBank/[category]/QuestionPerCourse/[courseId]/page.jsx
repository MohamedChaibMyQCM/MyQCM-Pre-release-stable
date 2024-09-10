"use client";

import Image from "next/image";
import logo from "../../../../../../../../public/whiteLogo.svg";
import { QuizImage } from "@/data/data";
import Quiz from "@/components/dashboard/QuestionsBank/Quiz";
import BaseUrl from "@/components/BaseUrl";
import { useMutation, useQuery } from "react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import handleError from "@/components/handleError";
import { useStore } from "zustand";
import { quizStore } from "@/store/quiz";
import QuizResult from "@/components/dashboard/QuestionsBank/QuizResult";
import axios from "axios";

const Page = () => {
  const [answer, setAnswer] = useState();
  const [result, setResult] = useState(false);
  const { quiz } = useStore(quizStore);
  const { courseId } = useParams();

  const { mutateAsync: Progress } = useMutation({
    mutationFn: (data) => BaseUrl.post(`/progress`, data),
    onSuccess: (data) => {
      console.log(data.data.data);
      setAnswer(data.data.data);
    },
    onError: (error) => {
      handleError(error);
    },
  });

  const {
    data: data1,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["courseResult", courseId],
    queryFn: async () => {
      const response = await BaseUrl.get(`/course/result/${courseId}`) 
      return response.data.data
    },
  });

  return (
    <div className="absolute min-h-[100vh] w-[100%] z-50 top-0 left-0 bg-[#FF6FAF] px-[80px] py-[30px] pb-[100px] flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <Image src={logo} alt="logo" className="w-[140px]" />
        <button
          onClick={() => setResult(true)}
          className="font-Inter font-medium text-[13px] text-[#FFFFFF] rounded-[12px] px-[12px] py-[6px] border-[2px] border-[#FFFFFF]"
        >
          End Season
        </button>
      </div>
      <Quiz
        data={quiz.quiz_data || []}
        Progress={Progress}
        answer={answer}
        data1={data1}
        setResult={setResult}
      />
      {QuizImage.map((item, index) => (
        <Image
          key={index}
          src={item.img}
          alt={item.alt}
          className={item.className}
        />
      ))}
      {result && <QuizResult data={data1} setResult={setResult} />}
    </div>
  );
};

export default Page;