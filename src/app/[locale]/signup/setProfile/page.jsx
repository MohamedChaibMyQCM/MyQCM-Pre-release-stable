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
import handleError from "@/components/handleError";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

const Page = () => {
  const [currentStep, setCurrentStep] = useState("SetProfileOne");
  const router = useRouter()
  const locale = useLocale()

  const { mutate: setProfile } = useMutation({
    mutationFn: (data) => BaseUrl.post("/user/profile", data),
    onSuccess: () => {
      router.push(`/${locale}/dashboard`)
    },
    onError: (error) => {
      handleError(error);
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
      const data = {
        ...values,
        learning_goals: ["Master Core Concepts", "Gain Practical Knowledge"],
      };
      setProfile(data);
    },
  });

  return (
    <div
      className={`bg-[#FFF9F9] w-full h-full overflow-hidden overflow-y-scroll rounded-[16px] flex flex-col items-center justify-center gap-4 ${
        currentStep == "SetProfileOne"
          ? "pb-[20px] pt-[300px]"
          : "pb-[20px] pt-[140px]"
      }`}
    >
      <div className="flex items-center gap-5 mb-[10px]">
        <Image src={logo} alt="logo" />
        <Image src={profile} alt="profile picture" className="pb-[12px]" />
      </div>
      <h2 className="font-Inter bg-[#F8589F] text-[15px] font-medium text-[#FFFFFF] w-[70%] text-center py-[8px] rounded-[12px]">
        Setting Up Your Profile
      </h2>
      <div className="h-[16px] w-[420px] bg-[#f7f3f4] rounded-[16px]"></div>
      <form className="w-[100%] px-[40px]" onSubmit={formik.handleSubmit}>
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
            <span className="relative w-[100%] my-2 flex items-center justify-center my-5 text-[#6C727580] font-Inter text-[13px] after:bg-[#6C727580] after:absolute after:w-[41%] after:left-0 after:h-[1px] after:top-[50%] after:translate-y-[-50%] before:bg-[#6C727580] before:absolute before:w-[41%] before:right-0 before:h-[1px] before:top-[50%] before:translate-y-[-50%]">
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
            <span className="relative w-[100%] my-2 flex items-center justify-center my-5 text-[#6C727580] font-Inter text-[13px] after:bg-[#6C727580] after:absolute after:w-[41%] after:left-0 after:h-[1px] after:top-[50%] after:translate-y-[-50%] before:bg-[#6C727580] before:absolute before:w-[41%] before:right-0 before:h-[1px] before:top-[50%] before:translate-y-[-50%]">
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
            <span className="relative w-[100%] my-2 flex items-center justify-center my-5 text-[#6C727580] font-Inter text-[13px] after:bg-[#6C727580] after:absolute after:w-[38%] after:left-0 after:h-[1px] after:top-[50%] after:translate-y-[-50%] before:bg-[#6C727580] before:absolute before:w-[38%] before:right-0 before:h-[1px] before:top-[50%] before:translate-y-[-50%]">
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
            className={`text-[15px] font-Inter font-medium ${
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
            {currentStep === "SetProfileOne" ? "Next" : "Back"}
          </button>
          {currentStep === "SetProfileTwo" && (
            <button
              className="self-end bg-[#F8589F] rounded-[10px] text-[15px] font-Inter text-[#FFFFFF] font-medium py-[8px] px-[50px]"
              type="submit"
            >
              Next
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Page;
