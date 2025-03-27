"use client";

import Image from "next/image";
import logo from "../../../../../../../public/whiteLogo.svg";
import { QuizImage } from "@/data/data";
import Quiz from "@/components/dashboard/QuestionsBank/Quiz";
import BaseUrl from "@/components/BaseUrl";
import { useMutation } from "react-query";
import { useState, useEffect } from "react";
import { useStore } from "zustand";
import { quizStore } from "@/store/quiz";
import QuizResult from "@/components/dashboard/QuestionsBank/QuizResult";
import toast from "react-hot-toast";

const Page = () => {
  const [answer, setAnswer] = useState();
  const [result, setResult] = useState(false);
  const { quiz } = useStore(quizStore);

  const { mutateAsync: Progress } = useMutation({
    mutationFn: (data) => BaseUrl.post(`/progress`, data),
    onSuccess: (data) => {
      setAnswer(data.data.data);
    },
    onError: (error) => {
      const message = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message[0]
        : error?.response?.data?.message || "Send Response failed";

      toast.error(message);
    },
  });

  const [data, setData] = useState({
    total_mcqs: quiz.quiz_data?.length || 0,
    mcqs_success: 0,
    mcqs_failed: 0,
    mcqs_skipped: 0,
    mcqs_average: 0,
  });

  useEffect(() => {
    const totalAnswered = data.mcqs_success;
    const totalSkipped = data.mcqs_skipped;
    setData((prev) => ({
      ...prev,
      mcqs_average:
        prev.total_mcqs > 0
          ? (totalAnswered / (prev.total_mcqs - totalSkipped)) * 100
          : 0,
    }));
  }, [data.mcqs_success, data.mcqs_failed, data.mcqs_skipped]);

  return (
    <div className="absolute min-h-[100vh] w-screen z-50 top-0 left-0 bg-[#FF6FAF] px-[80px] py-[30px] pb-[100px] flex flex-col gap-10 max-md:px-[20px]">
      <div className="flex items-center justify-between">
        <Image src={logo} alt="logo" className="w-[140px] max-md:w-[120px]" />
        <button
          onClick={() => setResult(true)}
          className="font-Inter font-medium text-[13px] text-[#FFFFFF] rounded-[20px] px-[26px] py-[6px] border-[2px] border-[#FFFFFF]"
        >
          End Season
        </button>
      </div>
      <Quiz
        data={quiz.quiz_data || []}
        Progress={Progress}
        answer={answer}
        data1={data}
        setData={setData}
        setResult={setResult}
        setAnswer={setAnswer}
      />
      {QuizImage.map((item, index) => (
        <Image
          key={index}
          src={item.img}
          alt={item.alt}
          className={item.className}
        />
      ))}
      {result && <QuizResult data={data} setResult={setResult} />}
    </div>
  );
};

export default Page;