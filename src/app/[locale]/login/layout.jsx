import Image from "next/image";
import React from "react";
import doctors from "../../../../public/ShapeDocters.svg";

const layout = ({ children }) => {
  return (
    <section className="h-[100vh] w-[100vw] overflow-hidden flex bg-[#FB63A6] p-[26px] px-[40px] max-md:px-[20px]">
      <div className="flex flex-col gap-4 self-end max-md:hidden">
        <h1 className="font-Poppins text-[#FFFFFF] text-[30px] font-semibold w-[300px] leading-[36px]">
          Commencez votre parcours médical
        </h1>
        <p className="font-Poppins w-[280px] mb-[14px] text-[#FFFFFFD6] font-light text-[14px]">
          Connectez-vous aujourd&apos;hui pour un apprentissage personnalisé
          dans votre domaine passion !
        </p>
        <Image src={doctors} alt="doctors" className="w-[620px] ml-[-40px]" />
      </div>
      {children}
    </section>
  );
};

export default layout;
