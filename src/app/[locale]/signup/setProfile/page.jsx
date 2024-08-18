"use client";

import Image from "next/image";
import profile from "../../../../../public/Icons/Profile.svg";
import logo from "../../../../../public/Icons/logo Myqcm 1.svg";
import { useState } from "react";
import SetProfileOne from "@/components/signup/SetProfileOne";
import SetProfileTwo from "@/components/signup/SetProfileTwo";

const Page = () => {
  const [currentStep, setCurrentStep] = useState("SetProfileOne");

  return (
    <div
      className={`bg-[#FFF9F9] w-full h-full overflow-hidden overflow-y-scroll rounded-[16px] flex flex-col items-center justify-center gap-4 ${
        currentStep == "SetProfileOne" ? "pb-[20px] pt-[300px]" : "pb-[20px] pt-[140px]"
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
      <form className="w-[100%] px-[40px]">
        {currentStep == "SetProfileOne" && (
          <SetProfileOne setCurrentStep={setCurrentStep} />
        )}
        {currentStep == "SetProfileTwo" && (
          <SetProfileTwo setCurrentStep={setCurrentStep} />
        )}
      </form>
    </div>
  );
};

export default Page;