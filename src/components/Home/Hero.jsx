"use client";

import Image from "next/image";
import doctors from "../../../public/Doctors.svg";
import { IoIosArrowDropright } from "react-icons/io";
import Typewriter from "typewriter-effect";
import { IoIosPlayCircle } from "react-icons/io";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import IntroVideo from "./IntroVideo";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

const HeroSection = () => {
  useEffect(() => {
    AOS.init({});
  }, []);

  const [video, setVideo] = useState(false)
  const t = useTranslations("home_page.hero");
  const locale = useLocale();
  const typewriterOptions = {
    strings: [t("header.0"), t("header.1"), t("header.2"), t("header.3")],
    autoStart: true,
    loop: true,
  };

  return (
    <section
      className={`h-[88vh] overflow-hidden bg-[#F8F8F8] flex items-center justify-between ${
        locale == "ar"
          ? "pr-[100px] pl-[60px] font-Madani"
          : "pl-[100px] font-TTInterphases"
      }`}
    >
      <div
        data-aos="fade-right"
        className={`flex flex-col ${locale == "ar" ? "gap-6" : "gap-4"}`}
      >
        <h1
          className={`text-[70px]  leading-[80px] ${
            locale == "ar"
              ? "font-Madani leading-[90px] font-medium"
              : "font-Genty leading-[80px]"
          }`}
        >
          <span
            className={`text-[#00000078] stroke block h-[160px] ${
              locale == "ar" ? "text-[#2C2A2A78]" : "text-[#00000078]"
            } ${locale == "fr" ? "w-[800px]" : "w-[500px]"}`}
          >
            <Typewriter options={typewriterOptions} />
          </span>
          <span className="text-[#000000C7] mt-[-72px] block">
            {" "}
            <br />
            {t("header_part3")} <span className="text-[#F8589FC9]">MY</span>QCM{" "}
            <br /> {t("header_part5")}
          </span>
        </h1>
        <p
          className={`text-[17px] text-[#000] font-[300] ${
            locale == "ar" ? "max-w-[440px] " : "max-w-[464px]"
          }`}
        >
          {t("paragraph_part_1")}{" "}
          <span
            className={`text-[#F8589F] ${
              locale === "ar" ? "font-medium" : "font-semibold"
            }`}
          >
            {t("paragraph_part_2")} {"  "}
          </span>
          {t("paragraph_part_3")}
          <span
            className={`${locale === "ar" ? "font-medium" : "font-semibold"}`}
          >
            {t("paragraph_part_4")}
          </span>
          {t("paragraph_part_5")}
          <span
            className={`text-[#F8589F] ${
              locale === "ar" ? "font-medium" : "font-semibold"
            }`}
          >
            {" "}
            {t("paragraph_part_6")}
          </span>
          {t("paragraph_part_7")}{" "}
          <span
            className={`${locale === "ar" ? "font-medium" : "font-semibold"}`}
          >
            {t("paragraph_part_8")}
          </span>{" "}
          {t("paragraph_part_9")} {t("paragraph_part_1_9")}{" "}
          <span
            className={`text-[#F8589F] ${
              locale === "ar" ? "font-medium" : "font-semibold"
            }`}
          >
            {t("paragraph_part_10")}
          </span>{" "}
          <span
            className={`${locale === "ar" ? "font-medium" : "font-semibold"}`}
          >
            {t("paragraph_part_11")}
            {t("paragraph_part_12")}
          </span>
        </p>
        <div className="flex items-center gap-8">
          <Link
            href={`${locale}/signup`}
            className={`bg-[#F8589FCC] w-fit py-[8px] flex gap-3 items-center px-[20px] rounded-[10px] text-[14px] text-[#fff] ${
              locale === "ar" ? "font-medium" : "font-semibold"
            }`}
          >
            {t("try_now")}
            <IoIosArrowDropright className="text-[19px]" />
          </Link>
          <button
            className="flex items-center gap-3"
            onClick={() => setVideo(true)}
          >
            <div className="relative wave_animation w-[30px] h-[30px] bg-[#EE459045] rounded-full flex items-center justify-center">
              <IoIosPlayCircle className="text-[#F8589FD6] text-[19px] absolute " />
            </div>
            <span
              className={`text-[14px] text-[#433E3E] ${
                locale === "ar" ? "font-medium" : "font-semibold"
              }`}
            >
              {t("watch_video")}{" "}
            </span>
          </button>
        </div>
      </div>
      {video && <IntroVideo setVideo={setVideo} />}
      <Image
        src={doctors}
        alt="doctors"
        data-aos="fade-left"
        className="w-[580px] relative bottom-[-0.5px] self-end fade-left"
      />
    </section>
  );
};

export default HeroSection;