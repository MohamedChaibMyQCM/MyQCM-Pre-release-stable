"use client";

import Image from "next/image";
import doctor1 from "../../../../public/doctor1.svg";

const Layout = ({ children }) => {
  return (
    <section className="h-screen w-[100%] flex bg-[#FB63A6] p-[26px] px-[40px] max-md:px-[20px]">
      {children}
      <div className="flex flex-col gap-4 self-end ml-[50px] max-md:hidden">
        <h1 className="text-[#FFFFFF] text-[30px] font-semibold w-[300px] leading-[36px]">
          Personnalisons votre expérience d&apos;apprentissage
        </h1>
        <p className="w-[310px] mb-[36px] text-[#FFFFFFD6] font-light text-[14px]">
          Répondez à quelques questions rapides pour nous aider à adapter votre
          parcours d&apos;éducation médicale. Votre chemin personnalisé vers le
          succès commence ici !
        </p>
        <Image
          src={doctor1}
          alt="doctor1"
          className="w-[520px] mt-[0px]"
          priority
        />
      </div>
    </section>
  );
};

export default Layout