"use client";

import Image from "next/image";
import MultipleChoice from "./TrainingInputs/MultipleChoise";
import ShortAnswer from "./TrainingInputs/ShortAnswer";
import TimeLimit from "./TrainingInputs/TimeLimit";
import NumberOfQuestion from "./TrainingInputs/NumberOfQuestion";
import RandomQuiz from "./TrainingInputs/RandomQuiz";
import { useFormik } from "formik";
import BaseUrl from "@/components/BaseUrl";
import { useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { X } from "phosphor-react";
import RandomOptions from "./TrainingInputs/RandomOptions";
import TrainingDate from "./TrainingInputs/TrainingDate";
import { useState } from "react";
import Title from "./TrainingInputs/Title";
import secureLocalStorage from "react-secure-storage";

const TrainingSeason = ({ setPopup, courseId, quiz = {} }) => {
  const [isSchedule, setIsSchedule] = useState(false);
  const { category: subjectId } = useParams();
  const router = useRouter();

  const { mutate: TrainingSettings, isPending } = useMutation({
    mutationFn: (data) => {
      const token = secureLocalStorage.getItem("token");
      return BaseUrl.post(`/training-session`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: ({ data }) => {
      !isSchedule
        ? router.push(`/dashboard/question-bank/session/${data.data}`)
        : null;
      isSchedule ? toast.success("Session planifiée avec succès !") : null;
      setPopup(false);
    },
    onError: (error) => {
      console.error("Erreur de mutation :", error);
      const responseData = error?.response?.data;
      const message = Array.isArray(responseData?.message)
        ? responseData.message[0]
        : responseData?.message ||
          error.message ||
          (isSchedule
            ? "Échec de la planification"
            : "Échec du démarrage de la session");
      toast.error(message);
    },
  });

  const formik = useFormik({
    initialValues: {
      title: quiz.title || "",
      qcm: quiz.qcm || false,
      qcs: quiz.qcm ?? quiz.qcs ?? false,
      qroc: quiz.qroc || false,
      time_limit: quiz.time_limit || "",
      number_of_questions: quiz.number_of_questions || "",
      randomize_questions_order: quiz.randomize_questions || false,
      randomize_options_order: quiz.randomize_options || false,
      date: quiz.date || null,
      time: quiz.time || "",
      allow_repeat: quiz.allow_repeat || false, // <-- add this line
    },
    onSubmit: (values) => {
      const baseData = {
        title: values.title,
        qcm: values.qcm,
        qcs: values.qcm,
        qroc: values.qroc,
        time_limit: values.time_limit ? Number(values.time_limit) : null,
        number_of_questions: values.number_of_questions
          ? Number(values.number_of_questions)
          : null,
        randomize_questions_order: values.randomize_questions_order,
        randomize_options_order: values.randomize_options_order,
        course: courseId,
        allow_repeat: values.allow_repeat, // <-- add this line
      };

      let finalData;

      if (isSchedule) {
        if (!values.date) {
          toast.error("Veuillez sélectionner une date.");
          return;
        }

        let scheduledAtISO = null;
        try {
          const scheduledDate = new Date(values.date);
          if (isNaN(scheduledDate.getTime())) {
            throw new Error("Date invalide sélectionnée");
          }

          if (values.time) {
            const [hours, minutes] = values.time.split(":").map(Number);
            if (
              isNaN(hours) ||
              isNaN(minutes) ||
              hours < 0 ||
              hours > 23 ||
              minutes < 0 ||
              minutes > 59
            ) {
              throw new Error("Format de l'heure invalide");
            }
            scheduledDate.setHours(hours, minutes, 0, 0);
          } else {
            scheduledDate.setHours(0, 0, 0, 0);
          }

          scheduledAtISO = scheduledDate.toISOString();
        } catch (error) {
          console.error("Erreur lors du traitement de la date/heure :", error);
          toast.error(error.message);
          return;
        }

        finalData = {
          ...baseData,
          status: "scheduled",
          scheduled_at: scheduledAtISO,
        };
      } else {
        finalData = {
          ...baseData,
          status: "in_progress",
        };
      }
      TrainingSettings(finalData);
    },
  });

  return (
    <div className="bg-[#0000004D] fixed top-0 left-0 h-full w-full flex items-center justify-center z-50">
      <div className="bg-[#FFFFFF] w-[500px] rounded-[16px] p-[20px] flex flex-col gap-3 max-md:w-[92%] max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#FD2E8A] font-medium text-[17px]">
            {isSchedule ? "Planifier une session" : "Paramètres de la session"}
          </span>
          <X
            size={22}
            weight="bold"
            className="text-[#B5BEC6] cursor-pointer"
            onClick={() => setPopup(false)}
          />
        </div>
        <form className="flex flex-col gap-4" onSubmit={formik.handleSubmit}>
          <div className="mb-2">
            <span className="text-[15px] font-[600] text-[#191919] mb-[10px] block">
              Titre
            </span>
            <Title
              value={formik.values.title}
              onChange={(e) => formik.setFieldValue("title", e.target.value)}
              name="title"
            />
          </div>

          <div className="mb-2">
            <span className="text-[15px] font-[600] text-[#191919] mb-[10px] block">
              Types de questions
            </span>
            <div
              className={`flex ${
                isSchedule ? "flex-row gap-5" : "flex-col gap-3"
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
              {isSchedule && (
                <TrainingDate
                  value={formik.values.date}
                  onChange={(date) => formik.setFieldValue("date", date)}
                />
              )}
              <TimeLimit
                name="time_limit"
                value={formik.values.time_limit}
                setFieldValue={formik.setFieldValue}
                onChange={(e) =>
                  formik.setFieldValue("time_limit", e.target.value)
                }
              />
              {isSchedule && (
                <div className="flex-1">
                  <span className="font-[600] text-[#191919] text-[15px] block mb-[10px]">
                    Heure
                  </span>
                  <input
                    type="time"
                    name="time"
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
              name="randomize_questions_order"
              value={formik.values.randomize_questions_order}
              setFieldValue={formik.setFieldValue}
            />
            <RandomOptions
              name="randomize_options_order"
              value={formik.values.randomize_options_order}
              setFieldValue={formik.setFieldValue}
            />
          </div>

          <div className="flex items-center justify-center gap-6 mt-2">
            <button
              type="button"
              className="font-medium text-[14px] text-[#FD2E8A] px-[20px] py-[8px] rounded-[24px] hover:bg-pink-50 transition-colors"
              onClick={() => setIsSchedule(!isSchedule)}
            >
              {isSchedule ? "Retour" : "Planifier"}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`font-medium text-[14px] bg-[#FD2E8A] text-[#FFF5FA] px-[20px] py-[8px] rounded-[24px] hover:opacity-90 transition-opacity ${
                isPending ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isPending
                ? "Traitement..."
                : isSchedule
                ? "Enregistrer"
                : "Démarrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainingSeason;
