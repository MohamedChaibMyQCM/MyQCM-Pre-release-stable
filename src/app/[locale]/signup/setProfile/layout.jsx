"use client"

import Image from "next/image";
import doctor1 from "../../../../../public/doctor1.svg";
import AuthProfile from "@/components/auth/AuthProfile";

const layout = ({ children }) => {
  return (
    <section className="w-[100%] h-screen overflow-hidden flex bg-[#FB63A6] p-[26px] px-[40px]">
      {children}
      <div className="flex flex-col gap-4 self-end ml-[50px]">
        <h1 className="font-Poppins text-[#FFFFFF] text-[30px] font-semibold w-[300px] leading-[36px]">
          Personnalisons votre expérience d&apos;apprentissage
        </h1>
        <p className="font-Poppins w-[310px] mb-[36px] text-[#FFFFFFD6] font-light text-[14px]">
          Répondez à quelques questions rapides pour nous aider à adapter votre
          parcours d&apos;éducation médicale. Votre chemin personnalisé vers le
          succès commence ici !
        </p>
        <Image src={doctor1} alt="doctor1" className="w-[520px] mt-[0px]" />
      </div>
    </section>
  );
};

export default AuthProfile(layout)