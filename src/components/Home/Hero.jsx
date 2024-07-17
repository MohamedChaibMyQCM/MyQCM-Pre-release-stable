import Image from "next/image";
import doctors from "../../../public/Doctors.svg";
import { IoIosArrowDropright } from "react-icons/io";
import { IoIosPlayCircle } from "react-icons/io";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

const HeroSection = () => {
  const t = useTranslations("home_page.hero");
  const locale = useLocale();

  return (
    <section
      className={`h-[88vh] bg-[#F8F8F8] flex items-center justify-between ${
        locale == "ar"
          ? "pr-[100px] pl-[60px] font-Madani"
          : "pl-[100px] font-TTInterphases"
      }`}
    >
      <div className={`flex flex-col ${locale == "ar" ? "gap-6" : "gap-4"}`}>
        <h1
          className={`text-[70px]  leading-[80px] ${
            locale == "ar"
              ? "font-Madani leading-[90px] font-medium"
              : "font-Genty leading-[80px]"
          }`}
        >
          <span
            className={`text-[#00000078] stroke ${
              locale == "ar" ? "text-[#2C2A2A78]" : "text-[#00000078]"
            }`}
          >
            {t("header_part1")} <br /> {t("header_part2")}
          </span>
          <span className="text-[#000000C7]">
            {" "}
            <br />
            {t("header_part3")} <span className="text-[#F8589FC9]">MY</span>QCM{" "}
            <br /> {t("header_part5")}
          </span>
        </h1>
        <p className=" text-[17px] text-[#000] font-light">
          {t("paragraph_part_1")}{" "}
          <span className="text-[#F8589F] font-semibold">
            {t("paragraph_part_2")} {"  "}
          </span>
          {t("paragraph_part_3")}
          <span className=" font-semibold">
            {t("paragraph_part_4")}
          </span> 
          <br /> 
          {t("paragraph_part_5")}
          <span className="font-semibold text-[#F8589F]">
            {" "}
            {t("paragraph_part_6")}
          </span>
          {t("paragraph_part_7")}{" "}
          <br className={`${locale == "ar" ? "hidden" : "block"}`} />{" "}
          <span className="font-semibold">{t("paragraph_part_8")}</span>{" "}
          <br className={`${locale == "ar" ? "block" : "hidden"}`} />
          {t("paragraph_part_9")}{" "}
          <br className={`${locale == "ar" ? "hidden" : "block"}`} />{" "}
          {t("paragraph_part_1_9")}{" "}
          <span className="text-[#EE4590] font-semibold">
            {t("paragraph_part_10")}
          </span>{" "}
          <br className={`${locale == "ar" ? "block" : "hidden"}`} />
          <span className="font-semibold">
            {t("paragraph_part_11")}
            <br /> {t("paragraph_part_12")}
          </span>
        </p>
        <div className="flex items-center gap-8">
          <Link
            href="/SignUp"
            className=" bg-[#F8589FCC] w-fit py-[8px] flex gap-2 items-center px-[20px] rounded-[10px] font-semibold text-[14px] text-[#fff]"
          >
            {t("try_now")}
            <IoIosArrowDropright className="text-[18px]" />
          </Link>
          <button className="flex items-center gap-3">
            <div className="relative after:w-[30px] after:h-[30px] after:absolute after:z-10 after:left-[-6.6px] after:top-[-6px] after:rounded-[50%] after:bg-[#EE459045]">
              <IoIosPlayCircle className="text-[#F8589FD6] text-[18px] z-50" />
            </div>
            <span className=" font-semibold text-[14px] text-[#433E3E]">
              {t("watch_video")}{" "}
            </span>
          </button>
        </div>
      </div>
      <Image src={doctors} alt="doctors" className="w-[580px] self-end" />
    </section>
  );
};

export default HeroSection;