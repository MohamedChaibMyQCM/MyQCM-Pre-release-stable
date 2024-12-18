"use client";

import Image from "next/image";
import exit from "../../../../public/Icons/exit.svg";
import settings from "../../../../public/Quiz/settings.svg";
import MultipleChoise from "./TrainingInputs/MultipleChoise";
import ShortAnswer from "./TrainingInputs/ShortAnswer";
import TimeLimit from "./TrainingInputs/TimeLimit";
import NumberOfQuestion from "./TrainingInputs/NumberOfQuestion";
import RandomQuiz from "./TrainingInputs/RandomQuiz";
import { useFormik } from "formik";
import BaseUrl from "@/components/BaseUrl";
import { useMutation } from "react-query";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { quizStore } from "@/store/quiz";
import { useStore } from "zustand";
import toast from "react-hot-toast";

const TrainingSeason = ({ setPopup, courseId }) => {
  const { category: subjectId } = useParams();
  const { quiz, updateQuiz } = useStore(quizStore);
  const router = useRouter();
  const locale = useLocale();

  const { mutate: TrainingSettings } = useMutation({
    mutationFn: (data) => BaseUrl.post(`/course/next-mcqs/${courseId}`, data),
    onSuccess: ({ data }) => {
      updateQuiz(data.data);
      router.push(
        `/${locale}/dashboard/QuestionsBank/${subjectId}/QuestionPerCourse/${courseId}`
      );
    },
    onError: (error) => {
      const message = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message[0]
        : error?.response?.data?.message || "Set Profile Failed";

      toast.error(message);
    },
  });

  const formik = useFormik({
    initialValues: {
      qcm: quiz.qcm || false,
      qcs: true,
      qroc: quiz.qroc || false,
      time_limit: quiz.time_limit || "",
      number_of_questions: quiz.number_of_questions || "",
      randomize_questions: quiz.randomize_questions || false,
    },
    onSubmit: (values) => {
      const data = {
        ...values,
        time_limit: Number(values.time_limit),
        number_of_questions: Number(values.number_of_questions),
      };
      console.log(data);
      TrainingSettings(data);
    },
  });

  return (
    <div className="bg-[#0000004D] fixed top-0 left-0 h-full w-full flex items-center justify-center">
      <div className="bg-[#FFFFFF] w-[400px] h-[500px] rounded-[16px] p-[20px] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Image
            src={settings}
            alt="settings"
            className="w-[20px] cursor-pointer"
          />
          <span className="font-Poppins font-semibold text-[17px]">
            Training Season Settings
          </span>
          <Image
            src={exit}
            alt="exit"
            onClick={() => setPopup(false)}
            className="cursor-pointer"
          />
        </div>
        <form className="flex flex-col gap-4" onSubmit={formik.handleSubmit}>
          <div className="flex flex-col gap-3">
            <span className="font-Poppins text-[13px] font-medium text-[#858494] mb-1">
              Question Types
            </span>
            <MultipleChoise
              name="qcm"
              value={formik.values.qcm}
              setFieldValue={formik.setFieldValue}
            />
            <ShortAnswer
              name="qroc"
              value={formik.values.qroc}
              setFieldValue={formik.setFieldValue}
            />
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-Poppins text-[13px] font-medium text-[#858494] mb-1">
              Time Limit
            </span>
            <TimeLimit
              name="time_limit"
              value={formik.values.time_limit}
              setFieldValue={formik.setFieldValue}
            />
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-Poppins text-[13px] font-medium text-[#858494] mb-1">
              Number of Questions
            </span>
            <NumberOfQuestion
              name="number_of_questions"
              value={formik.values.number_of_questions}
              setFieldValue={formik.setFieldValue}
            />
          </div>
          <div className="flex flex-col gap-3 mb-2">
            <span className="font-Poppins text-[13px] font-medium text-[#858494] mb-2">
              Randomize Question Order
            </span>
            <RandomQuiz
              name="randomize_questions"
              value={formik.values.randomize_questions}
              setFieldValue={formik.setFieldValue}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="basis-[48%] font-Poppins font-medium text-[14px] bg-[#FFF5FA] text-[#FF6EAF] px-[20px] py-[10px] rounded-[16px]"
              onClick={() => console.log("Schedule Season clicked")}
            >
              Schedule Season
            </button>
            <button
              type="submit"
              className="basis-[48%] font-Poppins font-medium text-[14px] bg-[#FF6EAF] text-[#FFF5FA] p-[20px] py-[10px] rounded-[16px]"
            >
              Start Season
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainingSeason;