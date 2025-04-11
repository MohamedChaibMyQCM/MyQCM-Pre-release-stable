"use client";

import Image from "next/image";
import play from "../../../public/Icons/play.svg";
import circle from "../../../public/Landing/semi_circle.svg";
import Dash_page from "../../../public/Landing/Dash_page.svg";
import InfiniteCarousel from "./InfiniteCarousel";

const HeroSection = () => {
  return (
    <section className="relative pt-[60px] overflow-hidden">
      {/* Video Background - Constrained to section height */}
      <div className="absolute top-[-440px] left-0 w-full h-[calc(100%+540px)] z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain" // Changed object-cover to object-contain
        >
          <source src="/Landing/main.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30"></div>
      </div>

      <div className="relative z-10 flex flex-col justify-center items-center z-[50] mt-10">
        <h1 className="text-white font-[700] text-[56px] italic">
          Avec MYQCM ALJAZAYR
        </h1>
        <p className="text-center text-white text-[15px] mt-2 mb-8">
          Améliorez votre expérience d'apprentissage avec des QCM adaptatifs{" "}
          <br />
          conçus pour personnaliser chaque session selon vos besoins
          individuels, <br />
          et des systèmes de tutorat intelligents qui fournissent des retours{" "}
          <br />
          personnalisés pour vous aider à comprendre les concepts complexes.
        </p>
        <button className="text-[#F8589F] font-[600] text-[14px] px-[28px] py-[10px] flex items-center gap-2 border border-[#F8589F] rounded-[16px] hover:shadow-[0_4px_12px_rgba(248,88,159,0.3)] transition-shadow duration-300 bg-white">
          <Image src={play} alt="lecture" className="w-[20px]" />
          Voir la vidéo de présentation
        </button>
        <Image
          src={Dash_page}
          alt="Tableau de bord"
          className="z-[50] pr-12 mt-8 "
        />
      </div>

      <Image
        src={circle}
        alt="cercle décoratif"
        className="absolute w-full left-0 bottom-[0px] z-20"
      />

      {/* Carousel */}
      <div className="relative z-30 ">
        <InfiniteCarousel />
      </div>
    </section>
  );
};

export default HeroSection;
