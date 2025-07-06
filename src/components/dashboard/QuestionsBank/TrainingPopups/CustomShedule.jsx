"use client";

import { useFormik } from "formik";
import BaseUrl from "@/components/BaseUrl";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation"; // Keep if redirection is needed later
import toast from "react-hot-toast";
import { X } from "phosphor-react";
import secureLocalStorage from "react-secure-storage";
import Image from "next/image";
import season from "../../../../../public/Question_Bank/season.svg"; // Verify path

// Corrected import paths assumed based on previous context
import MultipleChoice from "../TrainingInputs/MultipleChoise";
import ShortAnswer from "../TrainingInputs/ShortAnswer";
import TimeLimit from "../TrainingInputs/TimeLimit";
import NumberOfQuestion from "../TrainingInputs/NumberOfQuestion";
import RandomQuiz from "../TrainingInputs/RandomQuiz";
import RandomOptions from "../TrainingInputs/RandomOptions";
import Title from "../TrainingInputs/Title"; // Assumed this accepts name, value, setFieldValue
import TrainingDate from "../TrainingInputs/TrainingDate"; // Use the updated TrainingDate component
import TrainingHour from "../TrainingInputs/TrainingHour"; // Use the updated TrainingHour component (type="time")
import AllowRepeat from "../TrainingInputs/AllowRepeat";

const CustomShedule = ({ setPopup, courseId, quiz = {} }) => {
  const router = useRouter(); // Keep router if needed elsewhere

  const { mutate: scheduleTrainingSession, isPending } = useMutation({
    mutationFn: (data) => {
      const token = secureLocalStorage.getItem("token");
      if (!token) {
        // Handle missing token case, maybe throw error or return early
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
      setPopup(false); // Close popup on success
      toast.success("Séance planifiée avec succès !");
      // Optionally: Redirect or update UI. router.push might be needed depending on UX flow.
    },
    onError: (error) => {
      console.error("Erreur de mutation planification:", error);
      const responseData = error?.response?.data;
      // Improved error message extraction
      const message = Array.isArray(responseData?.message)
        ? responseData.message.join(", ") // Join array messages
        : responseData?.message ||
          error.message ||
          "Échec de la planification de la session";
      toast.error(message);
    },
  });

  const formik = useFormik({
    initialValues: {
      title: quiz.title || "",
      qcm: quiz.qcm || false,
      qcs: true, // Default based on previous examples
      qroc: quiz.qroc || false,
      time_limit: quiz.time_limit || "",
      number_of_questions: quiz.number_of_questions || "",
      randomize_questions_order: quiz.randomize_questions || false,
      randomize_options_order: quiz.randomize_options || false,
      training_date: quiz.training_date || "", // Expecting YYYY-MM-DD string or ""
      training_time: quiz.training_time || "", // Expecting HH:MM string or ""
      allow_repeat: quiz.allow_repeat || false, // <-- added
    },
    onSubmit: (values) => {
      // Validate required fields for scheduling
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

      // --- Time Parsing (Expects HH:MM format from TrainingHour type="time") ---
      if (typeof values.training_time === "string" && values.training_time) {
        const match = values.training_time.match(/^(\d{2}):(\d{2})$/);
        if (match) {
          const parsedHours = parseInt(match[1], 10);
          const parsedMinutes = parseInt(match[2], 10);
          // Basic validation (usually covered by type="time", but good safety check)
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
        // Combine date (YYYY-MM-DD) and time (HH:MM) into ISO 8601 format (UTC assumed)
        scheduledAtISO = `${values.training_date}T${formattedHours}:${formattedMinutes}:00Z`;
      } else {
        // Handle cases where date or time is missing format or parsing failed
        toast.error(
          "Format de date ou d'heure invalide. Vérifiez la sélection (Date) et l'heure (HH:MM)."
        );
        return;
      }
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
        status: "scheduled", // Changed status for scheduling payload
        scheduled_at: scheduledAtISO, // Use the combined ISO string
        course: courseId, // Make sure courseId is passed correctly as prop
        allow_repeat: values.allow_repeat, // <-- added
      };

      scheduleTrainingSession(finalData);
    },
    enableReinitialize: true,
  });

  return (
    // Main modal structure and styling as provided previously
    <div className="bg-[#0000004D] fixed top-0 left-0 h-full w-full flex items-center justify-center z-50">
      <div className="bg-[#FFFFFF] w-[500px] rounded-[16px] p-[20px] flex flex-col gap-3 max-md:w-[92%] max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <Image src={season} alt="Planification icon" className="w-[24px]" />
          <span className="text-[#191919] font-[600] text-[18px]">
            Planification de la séance
          </span>
          <X
            size={20}
            weight="bold"
            className="text-[#191919] cursor-pointer"
            onClick={() => setPopup(false)}
          />
        </div>

        {/* Form section */}
        <form className="flex flex-col gap-5" onSubmit={formik.handleSubmit}>
          {/* Section: Question Types */}
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

          {/* Section: Limits (Number & Time) - Grouped in flex column */}
          <div className="flex flex-col gap-4">
            {/* Number of Questions Sub-section */}
            <div>
              <span className="text-[15px] font-[600] text-[#191919] mb-[10px] block">
                Nombre de questions
              </span>
              <NumberOfQuestion
                name="number_of_questions"
                value={formik.values.number_of_questions}
                setFieldValue={formik.setFieldValue}
              />
            </div>
            {/* Time Limit Sub-section */}
            <div>
              {/* Consider adding a label here if design implies: */}
              {/* <span className="text-[15px] font-[600] text-[#191919] mb-[10px] block">Durée limite (minutes)</span> */}
              <TimeLimit
                name="time_limit"
                value={formik.values.time_limit}
                setFieldValue={formik.setFieldValue}
              />
            </div>
          </div>

          {/* Section: Randomization Options */}
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

          {/* Section: Title, Date, Time */}
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-[15px] font-[600] text-[#191919] mb-[10px] block">
                Titre de la séance
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

          {/* Submit Button Section */}
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

export default CustomShedule;
