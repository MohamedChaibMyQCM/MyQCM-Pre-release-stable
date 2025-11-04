"use client";

import { useFormik } from "formik";
import BaseUrl from "@/components/BaseUrl";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { X } from "phosphor-react";
import secureLocalStorage from "react-secure-storage";
import Image from "next/image";
import season from "../../../../../public/Question_Bank/season.svg";
import Title from "../TrainingInputs/Title";
import TrainingDate from "../TrainingInputs/TrainingDate";
import TrainingHour from "../TrainingInputs/TrainingHour";
import { motion, AnimatePresence } from "framer-motion";

const SynergyShedule = ({ setPopup, courseId, quiz = {} }) => {
  const router = useRouter();

  const { mutate: scheduleSynergySession, isPending } = useMutation({
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
    onSuccess: (/* { data } */) => {
      // Data may not be needed if just closing popup
      setPopup(false);
      toast.success("Séance planifiée avec succès !");
      // Optionally redirect or update UI if needed
    },
    onError: (error) => {
      console.error("Erreur de mutation planification intelligente:", error);
      const responseData = error?.response?.data;
      const message = Array.isArray(responseData?.message)
        ? responseData.message.join(", ")
        : responseData?.message ||
          error.message ||
          "Échec de la planification de la session";
      toast.error(message);
    },
  });

  const formik = useFormik({
    initialValues: {
      title: quiz.title || "",
      training_date: quiz.training_date || "",
      training_time: quiz.training_time || "",
      qcm: quiz.qcm || false,
      qcs: true,
      qroc: quiz.qroc || false,
      time_limit: quiz.time_limit || "",
      number_of_questions: quiz.number_of_questions || "",
      randomize_questions_order: quiz.randomize_questions || false,
      randomize_options_order: quiz.randomize_options || false,
    },
    onSubmit: (values) => {
      if (!values.title) {
        toast.error("Le titre de la séance est requis.");
        return;
      }
      if (!values.training_date) {
        toast.error("La date de la séance est requise.");
        return;
      }
      if (!values.training_time) {
        toast.error("L'heure de la séance est requise.");
        return;
      }

      let scheduledAtISO = null;
      let hours = null;
      let minutes = null;

      if (typeof values.training_time === "string" && values.training_time) {
        const match = values.training_time.match(/^(\d{2}):(\d{2})$/);
        if (match) {
          const parsedHours = parseInt(match[1], 10);
          const parsedMinutes = parseInt(match[2], 10);
          if (
            !isNaN(parsedHours) &&
            !isNaN(parsedMinutes) &&
            parsedHours >= 0 &&
            parsedHours <= 23 &&
            parsedMinutes >= 0 &&
            parsedMinutes <= 59
          ) {
            hours = parsedHours;
            minutes = parsedMinutes;
          }
        }
      }
      if (
        typeof values.training_date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(values.training_date) &&
        hours !== null &&
        minutes !== null
      ) {
        const formattedHours = hours.toString().padStart(2, "0");
        const formattedMinutes = minutes.toString().padStart(2, "0");
        scheduledAtISO = `${values.training_date}T${formattedHours}:${formattedMinutes}:00Z`;
      } else {
        toast.error(
          "Format de date ou d'heure invalide. Vérifiez la sélection (Date) et l'heure (HH:MM)."
        );
        return;
      }
      const finalData = {
        title: values.title,
        status: "scheduled",
        scheduled_at: scheduledAtISO,
        course: courseId,
      };

      scheduleSynergySession(finalData);
    },
    enableReinitialize: true,
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
          <Image src={season} alt="season icon" className="w-[24px]" />
          <span className="text-foreground font-[600] text-[18px]">
            Planification de la séance
          </span>
          <button
            onClick={() => setPopup(false)}
            className="text-foreground hover:text-primary cursor-pointer transition-colors rounded-lg p-1 hover:bg-muted"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        <form className="flex flex-col gap-5" onSubmit={formik.handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <span className="text-[15px] font-[600] text-foreground block">
                Titre de la séance.
              </span>
              <Title
                name="title"
                value={formik.values.title}
                setFieldValue={formik.setFieldValue}
              />
            </div>
            <div className="flex flex-col gap-4">
              <TrainingDate
                name="training_date"
                value={formik.values.training_date}
                setFieldValue={formik.setFieldValue}
              />
              <TrainingHour
                name="training_time"
                value={formik.values.training_time}
                setFieldValue={formik.setFieldValue}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-2">
            <button
              type="submit"
              disabled={isPending}
              className={`w-fit font-medium text-[14px] bg-primary text-white px-[20px] py-[10px] rounded-[24px] hover:opacity-90 transition-all duration-200 hover:scale-105 ${
                isPending ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default SynergyShedule;
