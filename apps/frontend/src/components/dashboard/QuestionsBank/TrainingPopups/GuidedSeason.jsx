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
import season from "../../../../../public/Question_Bank/season.svg"; // Verify path
import Image from "next/image";

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
      qcs: true, // Hardcoded to true based on desired payload
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
        qcs: values.qcs, // Always true based on payload requirement
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
    <div className="bg-[#0000004D] fixed top-0 left-0 h-full w-full flex items-center justify-center z-50">
      <div className="bg-[#FFFFFF] w-[500px] rounded-[16px] p-[20px] flex flex-col gap-3 max-md:w-[92%] max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Header (unchanged) */}
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

        {/* Form (unchanged structure) */}
        <form className="flex flex-col gap-5" onSubmit={formik.handleSubmit}>
          {/* Question Types section (unchanged) */}
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

          {/* Number of Questions section (unchanged UI structure) */}
          <div>
            <span className="text-[15px] font-[600] text-[#191919] mb-[10px] block">
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

          {/* Submit button (unchanged) */}
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

export default GuidedSeason;
