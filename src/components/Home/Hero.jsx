"use client";

import Image from "next/image";
import play from "../../../public/Icons/play.svg";
import circle from "../../../public/Landing/semi_circle.avif";
import Dash_page from "../../../public/Landing/Dash_page.svg";
import InfiniteCarousel from "./InfiniteCarousel";

const HeroSection = () => {
  return (
    <section className="pt-[60px] mt-[60px]">
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-[#191919] font-[700] text-[56px] italic">
          Avec MYQCM ALJAZAYR
        </h1>
        <p className="text-center text-[#666666] text-[15px] mt-2 mb-8">
          Améliorez votre expérience d&apos;apprentissage avec des QCM
          adaptatifs <br />
          conçus pour personnaliser chaque session selon vos besoins
          individuels, <br />
          et des systèmes de tutorat intelligents qui fournissent des retours{" "}
          <br />
          personnalisés pour vous aider à comprendre les concepts complexes.
        </p>
        <button className="text-[#F8589F] font-[600] text-[14px] px-[28px] py-[10px] flex items-center gap-2 border border-[#F8589F] rounded-[16px] hover:shadow-[0_4px_12px_rgba(248,88,159,0.3)] transition-shadow duration-300">
          <Image src={play} alt="lecture" className="w-[20px]" />
          Voir la vidéo de présentation
        </button>
        <Image src={Dash_page} alt="Tableau de bord" className="z-[50] pr-12" />
      </div>
      <Image
        src={circle}
        alt="cercle décoratif"
        className="absolute w-full left-0 bottom-[-540px]"
      />
      <InfiniteCarousel />
    </section>
  );
};

export default HeroSection;
