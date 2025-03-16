"use client";

import Image from "next/image";
import play from "../../../public/Icons/play.svg";

const HeroSection = () => {
  return (
    <section className="px-[100px] py-[60px] mt-[60px]">
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-[#191919] font-[700] text-[56px] italic">
          With MYQCM Aljazayr
        </h1>
        <p className="text-center text-[#666666] text-[15px] mt-2 mb-8">
          Enhance your learning experience with adaptive MCQ&apos;S designed to
          tailor <br /> each session to your individual needs, and intelligent
          tutoring systems that <br /> provide personalized feedback and
          guidance to help you understand <br /> complex concepts more
          effectively.
        </p>
        <button className="text-[#F8589F] font-[600] text-[14px] px-[28px] py-[10px] flex items-center gap-2 border border-[#F8589F] rounded-[16px]">
          <Image src={play} alt="play" className="w-[20px]" />
          Watch introduction video
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
