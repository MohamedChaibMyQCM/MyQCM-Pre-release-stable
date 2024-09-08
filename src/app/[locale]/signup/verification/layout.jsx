"use client" 

import Image from "next/image";
import doctors from "../../../../../public/ShapeDocters.svg";
import AuthEmail from "@/components/auth/AuthEmail";

const Layout = ({ children }) => {
  return (
    <section className="h-[100vh] w-[100vw] overflow-hidden flex bg-[#FB63A6] p-[26px] px-[40px]">
      <div className="flex flex-col gap-4 self-end">
        <h1 className="font-Poppins text-[#FFFFFF] text-[30px] font-semibold w-[300px]">
          Start Your Medical Journey now
        </h1>
        <p className="font-Poppins w-[280px] mb-[20px] text-[#FFFFFFD6] font-light text-[14px]">
          Sign up today to embark on a personalized, creative learning journey
          in the field you&apos;re passionate about!
        </p>
        <Image src={doctors} alt="doctors" className="w-[620px] ml-[-40px]" />
      </div>
      {children}
    </section>
  );
};

export default AuthEmail(Layout);