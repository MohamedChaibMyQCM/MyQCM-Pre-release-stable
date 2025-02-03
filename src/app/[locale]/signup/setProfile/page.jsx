"use client";

import Image from "next/image";
import profile from "../../../../../public/Icons/Profile.svg";
import logo from "../../../../../public/Icons/logo Myqcm 1.svg";
import { useState } from "react";
import University from "../../../../components/signup/ProfileOne/University";
import Field from "../../../../components/signup/ProfileOne/Field";
import Annexe from "../../../../components/signup/ProfileOne/Annexe";
import Year from "../../../../components/signup/ProfileOne/Year";
import Feedback from "../../../../components/signup/ProfileOne/Feedback";
import PrefLearning from "../../../../components/signup/ProfileOne/PrefLearning";
import LearningPace from "../../../../components/signup/ProfileOne/LearningPace";
import StudyHabits from "../../../../components/signup/ProfileOne/StudyHabits";
import PrefContentFormat from "../../../../components/signup/ProfileOne/PrefContentFormat";
import ClinicalExperience from "../../../../components/signup/ProfileTwo/ClinicalExperience";
import CertOrExam from "../../../../components/signup/ProfileTwo/CertOrExam";
import LearningGoals from "../../../../components/signup/ProfileTwo/LearningGoals";
import LearningPath from "../../../../components/signup/ProfileTwo/LearningPath";
import MemoryRetention from "../../../../components/signup/ProfileTwo/MemoryRetention";
import AttentionSpan from "../../../../components/signup/ProfileTwo/AttentionSpan";
import { useMutation } from "react-query";
import BaseUrl from "@/components/BaseUrl";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

const Page = () => {
  const [currentStep, setCurrentStep] = useState("SetProfileOne");
  const router = useRouter();
  const locale = useLocale();

  const { mutate: setProfile } = useMutation({
    mutationFn: (data) => BaseUrl.post("/user/profile", data),
    onSuccess: () => {
      router.push(`/${locale}/dashboard`);
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
      university: "",
      faculty: "",
      field: "",
      year_of_study: "",
      feedback_preference: "",
      learning_style: "",
      learning_pace: "",
      study_habits: "",
      prefered_content: "",
      clinical_experience: "",
      certification_exam: "",
      learning_goals: "",
      learning_path: "",
      memory_retention: "",
      attention_span: "",
    },
    onSubmit: (values) => {
      console.log(values);
      setProfile(values);
    },
  });

  const calculateProgress = () => {
    const totalFields = 15;
    const filledFields = Object.values(formik.values).filter(
      (value) => value
    ).length;
    return Math.round((filledFields / totalFields) * 100);
  };

  const progress = calculateProgress();

  return (
    <div
      className={`bg-[#FFF9F9] w-[100%] h-[100%] overflow-y-scroll rounded-[16px] flex flex-col items-center justify-center ${
        currentStep == "SetProfileOne"
          ? "pb-[20px] pt-[300px]"
          : "pb-[20px] pt-[140px]"
      }`}
    >
      <div className="flex items-center gap-5 mb-[10px] max-md:mt-[200px]">
        <Image src={logo} alt="logo" />
        <Image src={profile} alt="profile picture" className="pb-[12px]" />
      </div>
      <h2 className="bg-[#F8589F] text-[15px] mb-3 font-medium text-[#FFFFFF] w-[70%] text-center py-[8px] rounded-[12px] max-md:mb-8">
        Configuration de votre profil
      </h2>
      <div className="relative w-[420px] py-[10px] bg-[#f7f3f4] rounded-[16px] mt-[16px] mb-[24px] max-md:hidden">
        <div
          className="bg-[#F8589F] h-[100%] rounded-[16px] flex items-center justify-center font-medium text-[#FFF] text-[11px] absolute left-0 top-0 transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        >
          {progress > 20 && `${progress}% terminé`}
        </div>
      </div>
      <form className="w-[100%] px-[40px] max-md:px-[20px]" onSubmit={formik.handleSubmit}>
        {currentStep == "SetProfileOne" && (
          <div className="w-[100%] flex flex-col justify-center items-center">
            <div className="flex items-center justify-between flex-wrap w-[100%] gap-5">
              <University
                name="university"
                value={formik.values.university}
                setFieldValue={formik.setFieldValue}
              />
              <Annexe
                name="faculty"
                uniValue={formik.values.university}
                value={formik.values.faculty}
                setFieldValue={formik.setFieldValue}
              />
              <Field
                name="field"
                value={formik.values.field}
                setFieldValue={formik.setFieldValue}
              />
              <Year
                name="year_of_study"
                value={formik.values.year_of_study}
                setFieldValue={formik.setFieldValue}
              />
              <Feedback
                name="feedback_preference"
                value={formik.values.feedback_preference}
                setFieldValue={formik.setFieldValue}
              />
            </div>
            <span className="relative w-[100%] my-2 flex items-center justify-center my-5 text-[#6C727580] text-[13px] after:bg-[#6C727580] after:absolute after:w-[41%] after:max-md:w-[24%] after:left-0 after:h-[1px] after:top-[50%] after:translate-y-[-50%] before:bg-[#6C727580] before:absolute before:w-[41%] before:w-[26%] before:right-0 before:h-[1px] before:top-[50%] before:translate-y-[-50%]">
              Learning Preferences
            </span>
            <div className="flex items-center justify-between flex-wrap w-[100%] gap-5 mb-16">
              <PrefLearning
                name="learning_style"
                value={formik.values.learning_style}
                setFieldValue={formik.setFieldValue}
              />
              <LearningPace
                name="learning_pace"
                value={formik.values.learning_pace}
                setFieldValue={formik.setFieldValue}
              />
              <StudyHabits
                name="study_habits"
                value={formik.values.study_habits}
                setFieldValue={formik.setFieldValue}
              />
              <PrefContentFormat
                name="prefered_content"
                value={formik.values.prefered_content}
                setFieldValue={formik.setFieldValue}
              />
            </div>
          </div>
        )}
        {currentStep == "SetProfileTwo" && (
          <div className="w-[100%]">
            <div className="flex items-center justify-between flex-wrap w-[100%] gap-5">
              <ClinicalExperience
                name="clinical_experience"
                value={formik.values.clinical_experience}
                setFieldValue={formik.setFieldValue}
              />
              <CertOrExam
                name="certification_exam"
                value={formik.values.certification_exam}
                setFieldValue={formik.setFieldValue}
              />
            </div>
            <span className="relative w-[100%] my-2 flex items-center justify-center my-5 text-[#6C727580] text-[13px] after:bg-[#6C727580] after:absolute after:w-[41%] after:left-0 after:h-[1px] after:top-[50%] after:translate-y-[-50%] before:bg-[#6C727580] before:absolute before:w-[41%] before:right-0 before:h-[1px] before:top-[50%] before:translate-y-[-50%]">
              Goals and Objectives
            </span>
            <div className="flex items-center justify-between flex-wrap w-[100%] gap-5">
              <LearningGoals
                name="learning_goals"
                value={formik.values.learning_goals}
                setFieldValue={formik.setFieldValue}
              />
              <LearningPath
                name="learning_path"
                value={formik.values.learning_path}
                setFieldValue={formik.setFieldValue}
              />
            </div>
            <span className="relative w-[100%] my-2 flex items-center justify-center my-5 text-[#6C727580] text-[13px] after:bg-[#6C727580] after:absolute after:w-[38%] after:left-0 after:h-[1px] after:top-[50%] after:translate-y-[-50%] before:bg-[#6C727580] before:absolute before:w-[38%] before:right-0 before:h-[1px] before:top-[50%] before:translate-y-[-50%]">
              Cognitive and Behavioral Data
            </span>
            <div className="flex items-center justify-between flex-wrap w-[100%] gap-5 mb-16">
              <MemoryRetention
                name="memory_retention"
                value={formik.values.memory_retention}
                setFieldValue={formik.setFieldValue}
              />
              <AttentionSpan
                name="attention_span"
                value={formik.values.attention_span}
                setFieldValue={formik.setFieldValue}
              />
            </div>
          </div>
        )}
        <div className="flex items-center justify-end gap-10 mt-5">
          <button
            className={`text-[15px] font-medium ${
              currentStep === "SetProfileOne"
                ? "self-end bg-[#F8589F] rounded-[10px] text-[#FFFFFF] py-[8px] px-[50px]"
                : "text-[#F8589F]"
            }`}
            type="button"
            onClick={() =>
              setCurrentStep(
                currentStep === "SetProfileOne"
                  ? "SetProfileTwo"
                  : "SetProfileOne"
              )
            }
          >
            {currentStep === "SetProfileOne" ? "Suivant" : "Retour"}
          </button>
          {currentStep === "SetProfileTwo" && (
            <button
              className="self-end bg-[#F8589F] rounded-[10px] text-[15px] text-[#FFFFFF] font-medium py-[8px] px-[50px]"
              type="submit"
            >
              Suivant
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Page;
