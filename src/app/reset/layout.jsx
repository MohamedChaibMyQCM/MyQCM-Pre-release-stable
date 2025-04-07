"use client";

import Image from "next/image";
import doctors from "../../../public/ShapeDocters.svg";
import beta from "../../../public/auth/beta.svg";

const Layout = ({ children }) => {
  return (
    <section className="h-[100vh] w-[100vw] overflow-y-auto scrollbar-hide flex bg-[#FB63A6] p-[26px] px-[40px] max-xl:flex-col max-xl:items-center max-md:px-[20px]">
      <div className="flex flex-col gap-4 self-end max-xl:mx-auto">
        <Image
          src={beta}
          alt="version bêta"
          className="w-[150px] ml-[74px] max-xl:mx-auto"
        />
        <h1 className="text-[#FFFFFF] text-[30px] font-semibold text-center w-[300px] leading-[36px] max-xl:w-[600px] max-md:w-[340px]">
          Commencez votre parcours médical
        </h1>
        <p className="w-[280px] mb-[14px] text-[#FFFFFFD6] text-center font-light text-[14px]  max-xl:w-[560px] max-md:w-[340px]">
          Connectez-vous aujourd&apos;hui pour un apprentissage personnalisé
          dans votre domaine passion !
        </p>
        <Image
          src={doctors}
          alt="Médecins"
          className="w-[620px] ml-[-40px] max-xl:hidden"
        />
      </div>
      {children}
    </section>
  );
};

export default Layout;
