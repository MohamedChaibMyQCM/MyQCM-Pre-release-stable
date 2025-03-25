"use client";

import Image from "next/image";
import logo from "../../../../public/logoMyqcm.svg";
import { useState } from "react";
import University from "../../../components/signup/ProfileOne/University";
import Field from "../../../components/signup/ProfileOne/Field";
import Year from "../../../components/signup/ProfileOne/Year";
import CurrentUnit from "../../../components/signup/ProfileOne/CurrentUnit";
import EndingDate from "../../../components/signup/ProfileOne/EndingDate";
import LearningModeStep from "@/components/signup/LearningModeSelection";
import { useMutation } from "react-query";
import BaseUrl from "@/components/BaseUrl";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const Page = () => {
  const [currentStep, setCurrentStep] = useState("SetProfileOne");
  const [formData, setFormData] = useState({});
  const router = useRouter();

  const { mutate: setProfile } = useMutation({
    mutationFn: (data) => BaseUrl.post("/user/profile", data),
    onSuccess: () => {
      toast.success("Profile set successfully");
      router.push("/dashboard");
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
      current_unit: "",
      ending_date: "",
    },
    onSubmit: (values) => {
      setFormData(values);
      setCurrentStep("SetProfileTwo");
    },
  });

  const calculateProgress = () => {
    const stepOneFields = 6; // Total fields in Step 1
    const stepTwoFields = 7; // Step 1 fields + learning_mode
    const totalFields = stepTwoFields;
    const currentValues =
      currentStep === "SetProfileOne" ? formik.values : formData;
    const filledFields = Object.values(currentValues).filter(
      (value) => value
    ).length;

    if (currentStep === "SetProfileOne") {
      return Math.round((filledFields / stepOneFields) * 50); // First step is 50% of total progress
    } else {
      return 50 + Math.round((filledFields / stepTwoFields) * 50); // Second step completes the remaining 50%
    }
  };

  const progress = calculateProgress();

  return (
    <div
      className={`bg-[#FFF] w-[100%] h-[100%] rounded-[16px] overflow-y-auto scrollbar-hide flex flex-col items-center justify-center ${
        currentStep === "SetProfileOne" ? "pb-[20px]" : "pb-[20px] pt-[140px]"
      }`}
    >
      <div className="flex items-center gap-5 mb-[10px] max-md:mt-[200px] mt-8">
        <Image src={logo} alt="logo" className="w-[140px] mb-6" />
      </div>

      <div className="w-full relative flex items-center justify-between mb-[24px] px-[40px]">
        <div className="relative w-[420px] bg-[#F5F5F5] h-[18px] rounded-[16px] overflow-hidden">
          <div
            className="bg-[#F8589F] h-[18px] rounded-[16px] flex items-center justify-center font-medium text-[#FFF] text-[11px] transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          >
            {progress > 20 && `${progress}% terminé`}
          </div>
        </div>
        <span className="text-[#F8589F] border border-[#F8589F] bg-[#FFF5FA] px-[16px] py-[6px] rounded-[12px] text-[14px]">
          Setting up your profile
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
          formData={formData}
          onSubmit={setProfile}
          onReturn={() => setCurrentStep("SetProfileOne")}
        />
      )}
    </div>
  );
};

export default Page;
