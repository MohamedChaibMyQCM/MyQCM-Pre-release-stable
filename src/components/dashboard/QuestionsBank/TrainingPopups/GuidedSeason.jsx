"use client";

import MultipleChoice from "../TrainingInputs/MultipleChoise";
import ShortAnswer from "../TrainingInputs/ShortAnswer";
import NumberOfQuestion from "../TrainingInputs/NumberOfQuestion";
import { useFormik } from "formik";
import BaseUrl from "@/components/BaseUrl";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { X } from "phosphor-react";
import secureLocalStorage from "react-secure-storage";
import season from "../../../../../public/Question_Bank/season.svg";
import Image from "next/image";

const GuidedSeason = ({ setPopup, courseId, quiz = {} }) => {
  const router = useRouter();

  const { mutate: startTrainingSession, isPending } = useMutation({
    mutationFn: (data) => {
      const token = secureLocalStorage.getItem("token");
      return BaseUrl.post(`/training-session`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: ({ data }) => {
      router.push(`/dashboard/question-bank/session/${data.data}`);
      setPopup(false);
    },
    onError: (error) => {
      console.error("Erreur de mutation :", error);
      const responseData = error?.response?.data;
      const message = Array.isArray(responseData?.message)
        ? responseData.message[0]
        : responseData?.message ||
          error.message ||
          "Échec du démarrage de la session";
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
      randomize_questions_order: quiz.randomize_questions || false,
      randomize_options_order: quiz.randomize_options || false,
    },
    onSubmit: (values) => {
      const finalData = {
        title: values.title,
        qcm: values.qcm,
        qcs: values.qcs,
        qroc: values.qroc,
        time_limit: values.time_limit ? Number(values.time_limit) : null,
        number_of_questions: values.number_of_questions
          ? Number(values.number_of_questions)
          : null,
        randomize_questions_order: values.randomize_questions_order,
        randomize_options_order: values.randomize_options_order,
        course: courseId,
        status: "in_progress",
      };

      startTrainingSession(finalData);
    },
    enableReinitialize: true,
  });

  return (
    <div className="bg-[#0000004D] fixed top-0 left-0 h-full w-full flex items-center justify-center z-50">
      <div className="bg-[#FFFFFF] w-[500px] rounded-[16px] p-[20px] flex flex-col gap-3 max-md:w-[92%] max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between mb-3">
          <Image src={season} alt="season" className="w-[24px]" />
          <span className="text-[#191919] font-[600] text-[18px]">
            Paramètres de la séance
          </span>
          <X
            size={20}
            weight="bold"
            className="text-[#191919] cursor-pointer"
            onClick={() => setPopup(false)}
          />
        </div>

        <form className="flex flex-col gap-5" onSubmit={formik.handleSubmit}>
          <div className="mb-2">
            <span className="text-[15px] font-[600] text-[#191919] mb-[14px] block">
              Types de questions
            </span>
            <div className="flex flex-col gap-5">
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
              Nombre de questions
            </span>
            <div className="flex flex-col gap-4">
              <NumberOfQuestion
                name="number_of_questions"
                value={formik.values.number_of_questions}
                setFieldValue={formik.setFieldValue}
                onChange={(e) =>
                  formik.setFieldValue("number_of_questions", e.target.value)
                }
              />
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 mt-2">
            <button
              type="submit"
              disabled={isPending}
              className={`w-fit font-medium text-[14px] bg-[#FD2E8A] text-[#FFF5FA] px-[20px] py-[10px] rounded-[24px] hover:opacity-90 transition-opacity ${
                isPending ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isPending ? "Traitement..." : "Commencer la séance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuidedSeason
