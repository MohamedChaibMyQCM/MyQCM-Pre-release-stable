"use client";

import Image from "next/image";
import doctor from "../../../public/doctor.svg";
import vector from "../../../public/vector.svg";
import vector1 from "../../../public/Icons/vector1.svg";
import vector2 from "../../../public/Icons/vector2.svg";
import vector3 from "../../../public/Icons/vector3.svg";
import vector4 from "../../../public/Icons/vector4.svg";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

const Features = () => {
  useEffect(() => {
    AOS.init({});
  }, []);

  return (
    <section className="pt-[30px] mb-[-0.7px] px-[60px] overflow-hidden max-md:px-[20px] max-md:my-16">
      <h4 className="uppercase text-center font-Poppins text-[#433E3E] font-semibold text-[16px]">
        Fonctionnalités
      </h4>
      <h2 className="relative text-center mt-[30px] font-[600] text-[46px] w-[900px] leading-[66px] text-center mx-auto text-[#000000C7] max-md:mb-8 max-md:text-[40px] max-md:w-full">
        <span className="text-[#838383]">
          Découvrez votre expertise médicale{" "}
        </span>
        dans chaque coin du monde
        <Image
          src={vector}
          alt="vector"
          className="absolute bottom-[-16px] right-[110px] feature_anim !w-[360px] max-md:hidden"
        />
      </h2>
      <div className="flex items-center justify-between max-md:flex-col max-md:gap-12 max-md:pb-4">
        <div className="flex flex-col justify-between h-[300px] basis-[30%] max-md:gap-16">
          <div
            className="relative w-[300px] py-[18px] px-[30px] box rounded-[10px] self-end"
            data-aos="fade-right"
          >
            <h3 className="font-Genty text-[#000000C7] text-[20px] mb-2">
              Parcours adaptatifs
            </h3>
            <p className="text-[14px]">
              Parcours d&apos;apprentissage personnalisés pour les étudiants.
            </p>
            <Image
              src={vector3}
              alt="vector"
              className="absolute w-[50px] top-[-24px] right-[-24px]"
            />
          </div>
          <div
            className="relative w-[300px] py-[18px] px-[30px] box rounded-[10px] self-start"
            data-aos="fade-right"
          >
            <h3 className="font-Genty text-[#000000C7] text-[20px] mb-2">
              Quiz interactifs
            </h3>
            <p className="text-[14px]">
              Quiz engageants avec retours instantanés.
            </p>
            <Image
              src={vector4}
              alt="vector"
              className="absolute w-[50px] top-[-24px] right-[-24px]"
            />
          </div>
        </div>
        <div className="basis-[30%] flex items-center justify-center">
          <Image
            src={doctor}
            alt="doctor"
            className="w-[400px] mt-[40px] mr-[30px] max-md:hidden"
          />
        </div>
        <div
          className="flex flex-col justify-between basis-[30%] h-[300px] max-md:gap-16"
          data-aos="fade-left"
        >
          <div className="relative w-[300px] py-[18px] px-[30px] box rounded-[10px]">
            <h3 className="font-Genty text-[#000000C7] text-[20px] mb-2">
              Bibliothèque de vidéos
            </h3>
            <p className="text-[14px]">
              Vidéos divisées en segments spécifiques par sujet.
            </p>
            <Image
              src={vector2}
              alt="vector"
              className="absolute w-[50px] top-[-24px] left-[-24px]"
            />
          </div>
          <div
            className="relative w-[300px] py-[18px] px-[30px] box rounded-[10px] self-end"
            data-aos="fade-left"
          >
            <h3 className="font-Genty text-[#000000C7] text-[20px] mb-2">
              Analytique détaillée
            </h3>
            <p className="text-[14px]">
              Informations et rapports de performance approfondis.
            </p>
            <Image
              src={vector1}
              alt="vector"
              className="absolute w-[50px] top-[-24px] left-[-24px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
