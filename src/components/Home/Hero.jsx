"use client";

import Image from "next/image";
import doctors from "../../../public/Doctors.svg";
import { IoIosArrowDropright } from "react-icons/io";
import Typewriter from "typewriter-effect";
import { IoIosPlayCircle } from "react-icons/io";
import Link from "next/link";
import { useState } from "react";
import IntroVideo from "./IntroVideo";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

const HeroSection = () => {
  useEffect(() => {
    AOS.init({});
  }, []);

   const typewriterOptions = {
     strings: [
       "Personnalisez vos sessions",
       "Questions adaptatives personnalisées",
       "Tutorat médical personnalisé",
       "Améliorez votre apprentissage médical",
     ],
     autoStart: true,
     loop: true,
   };

  const [video, setVideo] = useState(false)

  return (
    <section
      className={`h-[88vh] overflow-hidden bg-[#F8F8F8] flex items-center justify-between max-md:px-[20px] max-md:block max-md:h-[44vh] max-md:pt-10`}
    >
      <div data-aos="fade-right" className={`flex flex-col gap-4 px-[100px]`}>
        <h1
          className={`text-[70px] leading-[80px] max-md:text-[40px] max-md:hidden`}
        >
          <span
            className={`text-[#00000078] stroke block h-[160px] text-[#00000078] w-[800px]`}
          >
            <Typewriter options={typewriterOptions} />
          </span>
          <span className="text-[#000000C7] mt-[-72px] block">
            {" "}
            <br />
            avec <span className="text-[#F8589FC9]">MY</span>QCM <br />{" "}
            Aljazayr.
          </span>
        </h1>

        <div className="flex items-center gap-8 max-md:flex-col max-md:items-start max-md:mt-4">
          <Link
            href={`/signup`}
            className={`bg-[#F8589FCC] w-fit py-[8px] flex gap-3 items-center px-[20px] rounded-[10px] text-[14px] text-[#fff] font-[500] `}
          >
            Essayez-le maintenant gratuitement
            <IoIosArrowDropright className="text-[19px]" />
          </Link>
          <button
            className="flex items-center gap-3 max-md:hidden"
            onClick={() => setVideo(true)}
          >
            <div className="relative wave_animation w-[30px] h-[30px] bg-[#EE459045] rounded-full flex items-center justify-center">
              <IoIosPlayCircle className="text-[#F8589FD6] text-[19px] absolute " />
            </div>
            <span className={`text-[14px] text-[#433E3E] font-semibold `}>
             Regarder la présentation !
            </span>
          </button>
        </div>
      </div>
      {video && <IntroVideo setVideo={setVideo} />}
      <Image
        src={doctors}
        alt="doctors"
        data-aos="fade-left"
        className="w-[580px] relative bottom-[-0.5px] self-end fade-left max-md:hidden"
      />
    </section>
  );
};

export default HeroSection;