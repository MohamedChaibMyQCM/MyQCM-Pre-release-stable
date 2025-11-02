"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import University from "../../../components/signup/ProfileOne/University";
import Field from "../../../components/signup/ProfileOne/Field";
import Year from "../../../components/signup/ProfileOne/Year";
import CurrentUnit from "../../../components/signup/ProfileOne/CurrentUnit";
import EndingDate from "../../../components/signup/ProfileOne/EndingDate";
import LearningModeStep from "@/components/signup/LearningModeSelection";
import { useMutation } from "@tanstack/react-query";
import BaseUrl from "@/components/BaseUrl";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import secureLocalStorage from "react-secure-storage";

const Page = () => {
  const [currentStep, setCurrentStep] = useState("SetProfileOne");
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [selectedMode, setSelectedMode] = useState(null);

  const formik = useFormik({
    initialValues: {
      university: "",
      field: "",
      year_of_study: "",
      unit: "",
      ending_date: "",
      learning_mode: null,
    },
    onSubmit: (values) => {
      if (currentStep === "SetProfileOne") {
        setCurrentStep("SetProfileTwo");
      } else {
        handleFinalSubmit(values);
      }
    },
  });

  const { mutate: setProfile } = useMutation({
    mutationFn: (data) => {
      const token = secureLocalStorage.getItem("token");
      return BaseUrl.post(
        "/user/profile",
        {
          study_field: data.field,
          year_of_study: data.year_of_study,
          unit: data.current_unit,
          university: data.university,
          ending_date: data.ending_date,
          mode: data.learning_mode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: () => {
      toast.success("Profil configuré avec succès");
      router.push("/dashboard");
    },
    onError: (error) => {
      const message = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message[0]
        : error?.response?.data?.message ||
          "Échec de la configuration du profil";
      toast.error(message);
    },
  });

  useEffect(() => {
    const calculateProgress = () => {
      const stepOneFieldsCount = 5;
      const stepOneWeight = 65;
      const stepTwoWeight = 35;

      if (currentStep === "SetProfileOne") {
        const filledFieldsStepOne = Object.values(formik.values).filter(
          (value, key) =>
            key !== "learning_mode" && value && String(value).trim() !== ""
        ).length;
        const stepOneProgress =
          (filledFieldsStepOne / stepOneFieldsCount) * stepOneWeight;
        return Math.round(stepOneProgress);
      } else {
        const stepTwoProgress = formik.values.learning_mode ? stepTwoWeight : 0;
        return stepOneWeight + stepTwoProgress;
      }
    };
    setProgress(calculateProgress());
  }, [formik.values, currentStep]);

  const handleFinalSubmit = (values) => {
    if (!values.learning_mode) {
      toast.error("Veuillez sélectionner un mode d'apprentissage.");
      return;
    }
    if (!values.field) {
      toast.error("Veuillez sélectionner un domaine d'étude.");
      return;
    }
    setProfile(values);
  };

  const handleModeSelect = (modeId) => {
    formik.setFieldValue("learning_mode", modeId);
    setSelectedMode(modeId);
  };

  return (
    <div
      className={`bg-[#FFF] outline-none w-[100%] h-[100%] rounded-[16px] overflow-y-auto scrollbar-hide flex flex-col items-center justify-center ${
        currentStep === "SetProfileOne"
          ? "pb-[20px] max-xl:pt-[130px] max-md:pt-[0px]"
          : "pb-[20px] pt-[140px] max-xl:pt-[290px] max-md:pt-[710px] max-md:pb-[20px]"
      }`}
    >
      <div className="flex items-center gap-5 mb-[10px] max-md:mt-[200px] mt-8 max-md:mt-[180px]">
        <Image
          src="/logoMyqcm.png"
          alt="logo"
          width={140}
          height={140}
          className="w-[140px] h-auto mb-6"
          priority
        />
      </div>

      <div className="w-full relative flex items-center justify-between mb-[24px] px-[40px] max-md:px-[20px] max-md:gap-4">
        <div className="relative w-[420px] bg-[#F5F5F5] h-[18px] rounded-[16px] overflow-hidden">
          <div
            className="bg-[#F8589F] h-[18px] rounded-[16px] flex items-center justify-center font-medium text-[#FFF] text-[11px] transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          >
            {progress >= 30 && `${progress}% terminé`}
          </div>
        </div>
        <span className="text-[#F8589F] border border-[#F8589F] bg-[#FFF5FA] px-[16px] py-[6px] rounded-[12px] text-[14px] max-md:py-1">
          Configuration <span className="max-md:hidden">du profil</span>
        </span>
      </div>

      {currentStep === "SetProfileOne" ? (
        <form
          className="w-[100%] px-[40px] max-md:px-[20px] mt-4"
          onSubmit={formik.handleSubmit}
        >
          <div className="w-[100%] flex flex-col justify-center items-center relative">
            <div className="flex items-center justify-between flex-wrap w-[100%] gap-6">
              <University
                name="university"
                value={formik.values.university}
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
              <CurrentUnit
                name="current_unit"
                value={formik.values.current_unit}
                setFieldValue={formik.setFieldValue}
                year_of_study={formik.values.year_of_study}
              />
              <EndingDate
                name="ending_date"
                value={formik.values.ending_date}
                setFieldValue={formik.setFieldValue}
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-10 mt-5 relative z-0">
            <button
              className="self-end bg-gradient-to-t from-[#FD2E8A] to-[#F8589F] rounded-[10px] text-[#FFFFFF] py-[8px] px-[50px] text-[15px] font-medium"
              type="submit"
            >
              Suivant
            </button>
          </div>
        </form>
      ) : (
        <LearningModeStep
          selectedMode={selectedMode}
          onModeChange={handleModeSelect}
          onSubmit={() => formik.handleSubmit()}
          onReturn={() => {
            setCurrentStep("SetProfileOne");
          }}
        />
      )}
    </div>
  );
};

export default Page;
