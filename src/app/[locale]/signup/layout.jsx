"use client"

import Image from "next/image";
import React from "react";
import doctors from '../../../../public/ShapeDocters.svg'
import doctor1 from '../../../../public/doctor1.svg'
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

const Layout = ({ children }) => {
  const path = usePathname() 
  const locale = useLocale()

  return (
    <section className="h-[100vh] w-[100vw] overflow-hidden flex bg-[#FB63A6] p-[26px] px-[40px]">
      {path != `/${locale}/signup/setProfile` ? (
        <>
          <div className="flex flex-col gap-4 self-end">
            <h1 className="font-Poppins text-[#FFFFFF] text-[30px] font-semibold w-[300px]">
              Start Your Medical Journey now
            </h1>
            <p className="font-Poppins w-[280px] mb-[20px] text-[#FFFFFFD6] font-light text-[14px]">
              Sign up today to embark on a personalized, creative learning
              journey in the field you&apos;re passionate about!
            </p>
            <Image
              src={doctors}
              alt="doctors"
              className="w-[620px] ml-[-40px]"
            />
          </div>
          {children}
        </>
      ) : (
        <>
          {children}
          <div className="flex flex-col gap-4 self-end ml-[50px]">
            <h1 className="font-Poppins text-[#FFFFFF] text-[30px] font-semibold w-[320px]">
              Let&apos;s Customize Your Learning Experience
            </h1>
            <p className="font-Poppins w-[300px] mb-[20px] text-[#FFFFFFD6] font-light text-[14px]">
              Answer a few quick questions to help us tailor your medical
              education journey. Your personalized path to success starts here!
            </p>
            <Image
              src={doctor1}
              alt="doctor1"
              className="w-[520px] mt-[20px]"
            />
          </div>
        </>
      )}
    </section>
  );
};

export default Layout;