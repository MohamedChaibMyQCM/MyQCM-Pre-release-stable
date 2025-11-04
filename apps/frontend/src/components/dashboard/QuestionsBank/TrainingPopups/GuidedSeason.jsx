"use client";

import MultipleChoice from "../TrainingInputs/MultipleChoise";
import ShortAnswer from "../TrainingInputs/ShortAnswer";
import NumberOfQuestion from "../TrainingInputs/NumberOfQuestion";
import AllowRepeat from "../TrainingInputs/AllowRepeat";
import { useFormik } from "formik";
import BaseUrl from "@/components/BaseUrl";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { X } from "phosphor-react";
import secureLocalStorage from "react-secure-storage";
import season from "../../../../../public/Question_Bank/season.svg";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Renamed component based on file name (GuidedSeason)
const GuidedSeason = ({ setPopup, courseId, quiz = {} }) => {
  const router = useRouter();

  const { mutate: startTrainingSession, isPending } = useMutation({
    mutationFn: (data) => {
      const token = secureLocalStorage.getItem("token");
      if (!token) {
        toast.error("Authentification requise.");
        return Promise.reject(new Error("Token missing"));
      }
      return BaseUrl.post(`/training-session`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: ({ data }) => {
      // Use the actual session ID from the response data
      if (data && data.data) {
        toast.success("Séance démarrée avec succès !");
        router.push(`/dashboard/question-bank/session/${data.data}`);
        setPopup(false);
      } else {
        // Handle cases where expected data is missing
        toast.error("Réponse inattendue du serveur après démarrage.");
        setPopup(false); // Still close popup? Or leave open for user?
      }
    },
    onError: (error) => {
      console.error("Erreur de mutation démarrage séance guidée:", error);
      const responseData = error?.response?.data;
      const message = Array.isArray(responseData?.message)
        ? responseData.message.join(", ")
        : responseData?.message ||
          error.message ||
          "Échec du démarrage de la session";
      toast.error(message);
    },
  });

  const formik = useFormik({
    // Keep relevant initial values needed for the form UI
    initialValues: {
      qcm: quiz.qcm || false,
      qcs: quiz.qcm ?? quiz.qcs ?? false,
      qroc: quiz.qroc || false,
      number_of_questions: quiz.number_of_questions || "",
      allow_repeat: quiz.allow_repeat || false, // <-- added
      // title, time_limit, randomizers are kept here if potentially coming from `quiz`,
      // but won't be included in the submitted 'finalData'.
      // title: quiz.title || "", // Example if needed for display (but not submission)
    },
    onSubmit: (values) => {
      // Validate that number_of_questions has a value before submitting
      if (!values.number_of_questions || values.number_of_questions <= 0) {
        toast.error("Veuillez entrer un nombre de questions valide.");
        return;
      }

      // Construct the finalData object exactly as specified
      const finalData = {
        qcm: values.qcm,
        qcs: values.qcm,
        qroc: values.qroc,
        // Ensure number_of_questions is converted to a Number. Default to null if conversion fails or empty.
        number_of_questions: values.number_of_questions
          ? Number(values.number_of_questions)
          : null,
        allow_repeat: values.allow_repeat, // <-- added
        status: "in_progress",
        course: courseId, // Use the courseId passed as a prop
        // Fields explicitly excluded: title, time_limit, randomize_questions_order, randomize_options_order
      };

      // Ensure number_of_questions ended up as a valid number > 0
      if (
        !finalData.number_of_questions ||
        finalData.number_of_questions <= 0
      ) {
        toast.error("Nombre de questions invalide.");
        return; // Don't submit if conversion resulted in null or 0
      }

      startTrainingSession(finalData);
    },
    enableReinitialize: true, // Keep if `quiz` prop might update
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
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <Image src={season} alt="season" className="w-[24px]" />
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

        {/* Form */}
        <form className="flex flex-col gap-5" onSubmit={formik.handleSubmit}>
          {/* Question Types section */}
          <div className="mb-2">
            <span className="text-[15px] font-[600] text-foreground mb-[14px] block">
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

          {/* Number of Questions section */}
          <div>
            <span className="text-[15px] font-[600] text-foreground mb-[10px] block">
              Nombre de questions
            </span>
            <div className="flex flex-col gap-4">
              <NumberOfQuestion
                name="number_of_questions"
                value={formik.values.number_of_questions}
                setFieldValue={formik.setFieldValue}
                // Removed redundant onChange prop
              />
            </div>
          </div>

          <AllowRepeat
            name="allow_repeat"
            value={formik.values.allow_repeat}
            setFieldValue={formik.setFieldValue}
          />

          {/* Submit button */}
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

export default GuidedSeason;
