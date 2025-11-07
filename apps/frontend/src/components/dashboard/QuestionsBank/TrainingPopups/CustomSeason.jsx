"use client";

import MultipleChoice from "../TrainingInputs/MultipleChoise";
import ShortAnswer from "../TrainingInputs/ShortAnswer";
import TimeLimit from "../TrainingInputs/TimeLimit";
import NumberOfQuestion from "../TrainingInputs/NumberOfQuestion";
import RandomQuiz from "../TrainingInputs/RandomQuiz";
import RandomOptions from "../TrainingInputs/RandomOptions";
import { useFormik } from "formik";
import BaseUrl from "@/components/BaseUrl";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { X } from "phosphor-react";
import secureLocalStorage from "react-secure-storage";
import season from "../../../../../public/Question_Bank/season.svg";
import Image from "next/image";
import AllowRepeat from "../TrainingInputs/AllowRepeat";
import { motion } from "framer-motion";

const CustomSeason = ({ setPopup, courseId, quiz = {} }) => {
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
      toast.success("Séance démarrée avec succès !");
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
      qcs: quiz.qcm ?? quiz.qcs ?? false,
      qroc: quiz.qroc || false,
      time_limit: quiz.time_limit || "",
      number_of_questions: quiz.number_of_questions || "",
      randomize_questions_order: quiz.randomize_questions || false,
      randomize_options_order: quiz.randomize_options || false,
      date: quiz.date || null,
      time: quiz.time || "",
      allow_repeat: quiz.allow_repeat || false, // <-- added
    },
    onSubmit: (values) => {
      const finalData = {
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
        date: values.date,
        time: values.time,
        allow_repeat: values.allow_repeat, // <-- added
        status: "in_progress",
        course: courseId,
      };
      // console.log("Final Data:", finalData);

      startTrainingSession(finalData);
    },
  });

  return (
    <motion.div
      className="bg-black/40 dark:bg-black/70 fixed top-0 left-0 h-full w-full flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bg-card border border-border w-[500px] rounded-[16px] p-[20px] flex flex-col gap-3 max-md:w-[92%] max-h-[90vh] overflow-y-auto scrollbar-hide shadow-xl"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="flex items-center justify-between mb-3">
          <Image
            src={season}
            alt="Start season icon"
            className="w-[24px] opacity-80 dark:brightness-0 dark:invert"
          />
          <span className="text-foreground font-[600] text-[18px]">
            Paramètres de la séance
          </span>
          <button
            onClick={() => setPopup(false)}
            className="text-foreground hover:text-primary cursor-pointer transition-colors rounded-lg p-1 hover:bg-muted"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        <form className="flex flex-col gap-5" onSubmit={formik.handleSubmit}>
          <div className="mb-2">
            <span className="text-[15px] font-[600] text-foreground mb-[14px] block">
              Types de questions.
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

          <div className="flex flex-col gap-2">
            <div>
              <span className="text-[15px] font-[600] text-foreground mb-[10px] block">
                Nombre de questions.
              </span>
              <NumberOfQuestion
                name="number_of_questions"
                value={formik.values.number_of_questions}
                setFieldValue={formik.setFieldValue}
              />
            </div>
            <div className="">
              <TimeLimit
                name="time_limit"
                value={formik.values.time_limit}
                setFieldValue={formik.setFieldValue}
              />
            </div>
          </div>

          <div className="flex flex-col gap-5 mb-2 mt-3">
            <AllowRepeat
              name="allow_repeat"
              value={formik.values.allow_repeat}
              setFieldValue={formik.setFieldValue}
            />
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
              type="submit"
              disabled={isPending}
              className={`w-fit font-medium text-[14px] bg-primary text-white px-[20px] py-[10px] rounded-[24px] hover:opacity-90 transition-all duration-200 hover:scale-105 ${
                isPending ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isPending ? "Traitement..." : "Commencer la séance"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CustomSeason;
