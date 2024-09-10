"use client"

import Image from "next/image";
import doctor1 from "../../../../../public/doctor1.svg";
import AuthProfile from "@/components/auth/AuthProfile";

const layout = ({ children }) => {
  return (
    <section className="h-[100vh] w-[100vw] overflow-hidden flex bg-[#FB63A6] p-[26px] px-[40px]">
      {children}
      <div className="flex flex-col gap-4 self-end ml-[50px]">
        <h1 className="font-Poppins text-[#FFFFFF] text-[30px] font-semibold w-[320px] leading-[36px]">
          Let&apos;s Customize Your Learning Experience
        </h1>
        <p className="font-Poppins w-[300px] mb-[36px] text-[#FFFFFFD6] font-light text-[14px]">
          Answer a few quick questions to help us tailor your medical education
          journey. Your personalized path to success starts here!
        </p>
        <Image src={doctor1} alt="doctor1" className="w-[520px] mt-[20px]" />
      </div>
    </section>
  );
};

export default AuthProfile(layout)