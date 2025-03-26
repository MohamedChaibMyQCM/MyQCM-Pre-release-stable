"use client";

import Image from "next/image";
import MultipleChoice from "./TrainingInputs/MultipleChoise";
import ShortAnswer from "./TrainingInputs/ShortAnswer";
import TimeLimit from "./TrainingInputs/TimeLimit";
import NumberOfQuestion from "./TrainingInputs/NumberOfQuestion";
import RandomQuiz from "./TrainingInputs/RandomQuiz";
import { useFormik } from "formik";
import BaseUrl from "@/components/BaseUrl";
import { useMutation } from "react-query";
import { useParams, useRouter } from "next/navigation";
import { quizStore } from "@/store/quiz";
import { useStore } from "zustand";
import toast from "react-hot-toast";
import { X } from "phosphor-react";
import RandomOptions from "./TrainingInputs/RandomOptions";
import TrainingDate from "./TrainingInputs/TrainingDate";
import { useState } from "react";
import Title from "./TrainingInputs/Title";

const TrainingSeason = ({ setPopup, courseId }) => {
  const [isShedule, setIsShedule] = useState(false);
  const { category: subjectId } = useParams();
  const { quiz, updateQuiz } = useStore(quizStore);
  const router = useRouter();

  const { mutate: TrainingSettings } = useMutation({
    mutationFn: (data) => BaseUrl.post(`/course/next-mcqs/${courseId}`, data),
    onSuccess: ({ data }) => {
      updateQuiz(data.data);
      router.push(
        `/dashboard/QuestionsBank/${subjectId}/QuestionPerCourse/${courseId}`
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
      title: quiz.title || "",
      qcm: quiz.qcm || false,
      qcs: true,
      qroc: quiz.qroc || false,
      time_limit: quiz.time_limit || "",
      number_of_questions: quiz.number_of_questions || "",
      randomize_questions: quiz.randomize_questions || false,
      randomize_options: quiz.options_questions || false,
      date: quiz.date || null,
      time: "",
    },
    onSubmit: (values) => {
      const data = {
        ...values,
        time_limit: Number(values.time_limit),
        number_of_questions: Number(values.number_of_questions),
      };
      TrainingSettings(data);
    },
  });

  return (
    <div className="bg-[#0000004D] fixed top-0 left-0 h-full w-full flex items-center justify-center z-50">
      <div className="bg-[#FFFFFF] w-[500px] rounded-[16px] p-[20px] flex flex-col gap-3 max-md:w-[92%]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#FD2E8A] font-medium text-[17px]">
            {isShedule ? "Schedule season" : "Training Season Settings"}
          </span>
          <X
            size={22}
            weight="bold"
            className="text-[#B5BEC6] cursor-pointer"
            onClick={() => setPopup(false)}
          />
        </div>
        <form className="flex flex-col gap-4" onSubmit={formik.handleSubmit}>
          {isShedule && (
            <div className="mb-2">
              <span className="text-[15px] font-[600] text-[#191919] mb-[10px] block">
                Title
              </span>
              <Title
                value={formik.values.title}
                onChange={(e) => formik.setFieldValue("title", e.target.value)}
              />
            </div>
          )}
          <div className="mb-2">
            <span className="text-[15px] font-[600] text-[#191919] mb-[10px] block">
              Question Types
            </span>
            <div
              className={`flex ${
                isShedule ? "flex-row gap-5" : "flex-col gap-3"
              }`}
            >
              <MultipleChoice
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
          </div>
          <div>
            <span className="text-[15px] font-[600] text-[#191919] mb-[10px] block">
              Number of Questions
            </span>
            <div className="flex flex-col gap-4">
              <NumberOfQuestion
                name="number_of_questions"
                value={formik.values.number_of_questions}
                setFieldValue={formik.setFieldValue}
              />
              <TrainingDate
                value={formik.values.date}
                onChange={(date) => formik.setFieldValue("date", date)}
              />
              {isShedule && (
                <div className="flex-1">
                  <span className="font-[600] text-[#191919] text-[15px]">
                    Time
                  </span>
                  <input
                    type="time"
                    value={formik.values.time}
                    onChange={(e) =>
                      formik.setFieldValue("time", e.target.value)
                    }
                    className="w-full rounded-[24px] bg-white border border-gray-300 text-[#191919] text-[14px] py-[10px] px-4 mt-2 focus:outline-none focus:border-[#F8589F]"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-5 mb-2 mt-3">
            <RandomQuiz
              name="randomize_questions"
              value={formik.values.randomize_questions}
              setFieldValue={formik.setFieldValue}
            />
            <RandomOptions
              name="randomize_options"
              value={formik.values.randomize_options}
              setFieldValue={formik.setFieldValue}
            />
          </div>
          <div className="flex items-center justify-center gap-6 mt-2">
            <button
              type="button"
              className="font-medium text-[14px] text-[#FD2E8A] px-[20px] py-[10px] rounded-[16px]"
              onClick={() => setIsShedule(!isShedule)}
            >
              {isShedule ? "Back" : "Schedule"}
            </button>
            <button
              type="submit"
              className="font-medium text-[14px] bg-[#FD2E8A] text-[#FFF5FA] px-[20px] py-[8px] rounded-[24px]"
            >
              {isShedule ? "Save" : "Start"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainingSeason;
