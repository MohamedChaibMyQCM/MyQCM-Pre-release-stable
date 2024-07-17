"use client";

import Image from "next/image";
import logo from "../../../public/logoMyqcm.svg";
import logoAr from "../../../public/logoMyQCM_AR.svg";
import SwitchLanguage from "./SwitchLanguage";
import { MdKeyboardArrowDown } from "react-icons/md";
import { IoIosPlayCircle } from "react-icons/io";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const Header = () => {
  const t = useTranslations("home_page.header");
  const locale = useLocale()

  const [hash, setHash] = useState("");

  useEffect(() => {
    const handleHashChange = () => {
      const url = window.location.href;
      const newHash = url.split("#").pop();
      setHash(newHash);
    };

    // Handle initial load
    handleHashChange();

    // Add hash change listener
    window.addEventListener("hashchange", handleHashChange);

    // Clean up listener on component unmount
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <header
      className={`flex justify-between items-center h-[12vh] px-[100px] py-[20px] ${
        locale == "ar" ? "font-Madani" : "font-TTInterphases"
      }`}
    >
      {locale == "ar" ? (
        <Image src={logoAr} alt="logo arabic" className="w-[120px]" />
      ) : (
        <Image src={logo} alt="logo" className="w-[150px]" />
      )}
      <ul className="flex justify-between items-center basis-[50%]">
        <li className="">
          <a
            href="#"
            className={` font-semibold h-[22.5px] block text-[15px] text-[#191919] relative  ${
              hash === "" ? "after:block" : "after:hidden"
            } after:w-[8px] after:h-[8px] after:absolute after:left-[50%] after:bottom-[-10px] after:translate-x-[-50%] after:bg-[#F8589F] after:rounded-[50%]`}
          >
            {t("item_1")}
          </a>
        </li>
        <li className="">
          <a
            href="#features"
            className={`font-semibold text-[15px] text-[#191919] relative  ${
              hash === "features" ? "after:block" : "after:hidden"
            } after:w-[8px] after:h-[8px] flex items-center gap-2 after:absolute after:bottom-[-10px] after:left-[50%] after:translate-x-[-50%] after:bg-[#F8589F] after:rounded-[50%]`}
          >
            {t("item_2")}
            <MdKeyboardArrowDown className="text-[18px] mt-[2.2px]" />
          </a>
        </li>
        <li className="">
          <a
            href="#pricing"
            className={`font-semibold text-[15px] text-[#191919] relative  ${
              hash === "pricing" ? "after:block" : "after:hidden"
            } after:w-[8px] after:h-[8px] flex items-center gap-2 after:absolute after:bottom-[-10px] after:left-[50%] after:translate-x-[-50%] after:bg-[#F8589F] after:rounded-[50%]`}
          >
            {t("item_3")}
            <MdKeyboardArrowDown className="mt-[2.2px] text-[18px]" />
          </a>
        </li>
        <li className="">
          <a
            href="#contact"
            className={`font-semibold h-[22.5px] block text-[15px] text-[#191919] relative  ${
              hash === "contact" ? "after:block" : "after:hidden"
            } after:w-[8px] after:h-[8px] after:absolute after:left-[50%] after:bottom-[-10px] after:translate-x-[-50%] after:bg-[#F8589F] after:rounded-[50%]`}
          >
            {t("item_4")}
          </a>
        </li>
      </ul>
      <div className="flex gap-6 items-center">
        <SwitchLanguage />
        <Link
          href="/SignUp"
          className="bg-[#F8589FCC] py-[8px] flex gap-2 items-center px-[20px] rounded-[10px] font-semibold text-[14px] text-[#fff]"
        >
          {t("button")} <IoIosPlayCircle className="text-[18px]" />
        </Link>
      </div>
    </header>
  );
};

export default Header;