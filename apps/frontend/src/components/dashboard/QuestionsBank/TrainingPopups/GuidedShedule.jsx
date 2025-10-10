"use client";

import { useFormik } from "formik";
import BaseUrl from "@/components/BaseUrl";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { X } from "phosphor-react";
import secureLocalStorage from "react-secure-storage";
import Image from "next/image";
import season from "../../../../../public/Question_Bank/season.svg"; // Verify path

// Assuming paths are correct relative to GuidedShedule.jsx
import MultipleChoice from "../TrainingInputs/MultipleChoise";
import ShortAnswer from "../TrainingInputs/ShortAnswer";
// Removed TimeLimit from imports as its value isn't submitted
import NumberOfQuestion from "../TrainingInputs/NumberOfQuestion";
// Removed RandomQuiz and RandomOptions from imports as their values aren't submitted
import Title from "../TrainingInputs/Title";
import TrainingDate from "../TrainingInputs/TrainingDate";
import TrainingHour from "../TrainingInputs/TrainingHour";
import AllowRepeat from "../TrainingInputs/AllowRepeat";

const GuidedShedule = ({ setPopup, courseId, quiz = {} }) => {
  const router = useRouter();

  const { mutate: scheduleTrainingSession, isPending } = useMutation({
    // Renamed mutate
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
      // data might not be needed for simple success message
      setPopup(false);
      toast.success("Séance (Mode Guidé) planifiée avec succès !");
      // Optional: redirect or UI update
    },
    onError: (error) => {
      console.error("Erreur de mutation planification guidée:", error);
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
      // Keep all fields needed by the UI components, even if not submitted
      title: quiz.title || "",
      qcm: quiz.qcm || false,
      qcs: true, // Hardcoded based on required payload
      qroc: quiz.qroc || false,
      time_limit: quiz.time_limit || "", // Keep for UI component if present
      number_of_questions: quiz.number_of_questions || "",
      randomize_questions_order: quiz.randomize_questions || false, // Keep for UI component if present
      randomize_options_order: quiz.randomize_options || false, // Keep for UI component if present
      training_date: quiz.training_date || "", // Expecting YYYY-MM-DD
      training_time: quiz.training_time || "", // Expecting HH:MM
      allow_repeat: quiz.allow_repeat || false, // <-- added
    },
    onSubmit: (values) => {
      // --- Validation ---
      if (!values.title) {
        toast.error("Le titre de la séance est requis.");
        return;
      }
      if (!values.number_of_questions || values.number_of_questions <= 0) {
        toast.error("Veuillez entrer un nombre de questions valide.");
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

      // --- Time Parsing (expects HH:MM from TrainingHour type="time") ---
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
      // --- End Time Parsing ---

      // --- Date & Time Combination (expects YYYY-MM-DD from TrainingDate) ---
      if (
        typeof values.training_date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(values.training_date) &&
        hours !== null &&
        minutes !== null
      ) {
        const formattedHours = hours.toString().padStart(2, "0");
        const formattedMinutes = minutes.toString().padStart(2, "0");
        // Combine to ISO 8601 format, assuming UTC ('Z') as required by example payload
        scheduledAtISO = `${values.training_date}T${formattedHours}:${formattedMinutes}:00Z`; // Assume 00 seconds
      } else {
        // Handle invalid format or parsing failure
        toast.error(
          "Format de date ou d'heure invalide. Vérifiez la sélection (Date) et l'heure (HH:MM)."
        );
        return;
      }
      // --- End Date & Time Combination ---

      // Construct the final payload *exactly* as required
      const finalData = {
        title: values.title,
        qcm: values.qcm,
        qcs: values.qcs, // Always true
        qroc: values.qroc,
        number_of_questions: values.number_of_questions
          ? Number(values.number_of_questions) // Ensure it's a number
          : null, // Or handle error if conversion fails / value is empty
        allow_repeat: values.allow_repeat, // <-- added
        status: "scheduled", // Correct spelling
        scheduled_at: scheduledAtISO, // Combined ISO timestamp
        course: courseId,
        // Fields NOT included: time_limit, randomize_questions_order, randomize_options_order, scheduled_date, scheduled_time
      };

      // Final validation check on converted number_of_questions
      if (
        !finalData.number_of_questions ||
        finalData.number_of_questions <= 0
      ) {
        toast.error("Nombre de questions invalide après conversion.");
        return;
      }

      // console.log("Submitting Guided Schedule Data:", finalData); // Debug if needed
      scheduleTrainingSession(finalData);
    },
    enableReinitialize: true, // Keep if quiz prop might update
  });

  // --- Return JSX (Unchanged Design/Styling as requested) ---
  return (
    <div className="bg-[#0000004D] fixed top-0 left-0 h-full w-full flex items-center justify-center z-50">
      <div className="bg-[#FFFFFF] w-[500px] rounded-[16px] p-[20px] flex flex-col gap-3 max-md:w-[92%] max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Header (Unchanged) */}
        <div className="flex items-center justify-between mb-3">
          <Image src={season} alt="season icon" className="w-[24px]" />
          <span className="text-[#191919] font-[600] text-[18px]">
            Planification de la séance (Mode Guidé)
          </span>
          <X
            size={20}
            weight="bold"
            className="text-[#191919] cursor-pointer"
            onClick={() => setPopup(false)}
          />
        </div>

        {/* Form (Unchanged Structure) */}
        <form className="flex flex-col gap-5" onSubmit={formik.handleSubmit}>
          {/* Question Types Section (Unchanged) */}
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

          {/* Number of Questions Section (Unchanged) */}
          <div>
            <span className="text-[15px] font-[600] text-[#191919] mb-[10px] block">
              Nombre de questions
            </span>
            <div className="flex flex-col gap-4">
              <NumberOfQuestion
                name="number_of_questions"
                value={formik.values.number_of_questions}
                setFieldValue={formik.setFieldValue}
              />
            </div>
          </div>

          <AllowRepeat
            name="allow_repeat"
            value={formik.values.allow_repeat}
            setFieldValue={formik.setFieldValue}
          />

          {/* Title, Date, Time Section (Unchanged) */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {" "}
              {/* Keep wrapper consistent */}
              <span className="text-[15px] font-[600] text-[#191919] block">
                {" "}
                {/* Adjusted margin based on original */}
                Titre de la séance
              </span>
              <Title
                name="title"
                value={formik.values.title}
                setFieldValue={formik.setFieldValue}
              />
            </div>
            <div className="flex flex-col gap-4">
              {" "}
              {/* Keep layout */}
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

          {/* Submit Button (Unchanged) */}
          <div className="flex items-center justify-center gap-6 mt-2">
            <button
              type="submit"
              disabled={isPending}
              className={`w-fit font-medium text-[14px] bg-[#FD2E8A] text-[#FFF5FA] px-[20px] py-[10px] rounded-[24px] hover:opacity-90 transition-opacity ${
                isPending ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuidedShedule;
