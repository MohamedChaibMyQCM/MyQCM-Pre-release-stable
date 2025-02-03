"use client";

import Image from "next/image";
import logo from "../../../public/logoMyqcm.svg";
import arrows from "../../../public/Aside/list.svg";
import user from "../../../public/Aside/user.svg";
import Link from "next/link";
import { aside_links } from "@/data/data";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import ProfilePopup from "./ProfilePopup";
import { useState, useEffect } from "react";
import { FiMenu } from "react-icons/fi";

const Aside = () => {
  const [popup, setPopup] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const locale = useLocale();
  const path = usePathname();
  const afterDashboard = path.split("/dashboard/")[1] || "";

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [path]);

  return (
    <aside className="fixed w-[248px] h-screen justify-between flex flex-col pt-[30px] pb-[18px] fixed top-0 left-0 max-md:w-[100%] max-md:flex-row max-md:bg-[#FFFFFF] max-md:h-[70px] max-md:z-50 max-md:py-0 max-md:px-[24px] max-md:items-center max-md:text-[24px]">
      <Image
        src={logo}
        alt="logo"
        className="w-[180px] mx-auto max-md:mx-0 max-md:w-[100px]"
      />
      <FiMenu
        className="md:hidden cursor-pointer"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      />
      <ul
        className={`flex flex-col mb-[40px] gap-1 max-md:absolute max-md:top-[70px] max-md:gap-6 max-md:left-0 max-md:w-full max-md:h-[100vh] max-md:pt-[40px] max-md:bg-[#FFFFFF] max-md:items-center max-md:shadow-lg max-md:transition-all max-md:duration-300 max-md:ease-in-out ${
          isMenuOpen
            ? "max-md:opacity-100 max-md:translate-y-0"
            : "max-md:opacity-0 max-md:-translate-y-full max-md:pointer-events-none"
        }`}
      >
        {aside_links.map((item, index) => {
          const isHome = item.href === "";
          const isActive =
            (isHome && afterDashboard === "") ||
            (!isHome && afterDashboard.startsWith(item.href));

          return (
            <li
              key={index}
              className={`rounded-r-[12px] py-[14px] pl-[16px] w-[88%] max-md:rounded-[12px] ${
                isActive ? "bg-[#F8589F]" : ""
              }`}
            >
              <Link
                href={`/${locale}/dashboard/${item.href}`}
                className="text-[#808191] flex items-center gap-4"
              >
                <Image
                  src={isActive ? item.hoverIcon : item.icon}
                  alt="icon"
                  className="w-[20px] font-[500]"
                />
                <span
                  className={`font-Poppins text-[13.7px] font-[500] ${
                    isActive ? "text-[#FFFFFF]" : ""
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="relative flex gap-1 items-center pl-3 max-md:hidden">
        <div className="flex items-center gap-1">
          <Image src={user} alt="user" className="w-[42px]" />
          <div className="flex flex-col font-Inter">
            <span className="text-[13.4px] text-[#11142D] font-[600]">
              Chaib Mohamed
            </span>
            <span className="text-[12.4px] text-[#808191] font-[500]">
              Compte Premium + IA
            </span>
          </div>
        </div>
        <button onClick={() => setPopup(!popup)}>
          <Image src={arrows} alt="arrows" className="w-[24px]" />
        </button>
        {popup && <ProfilePopup />}
      </div>
    </aside>
  );
};

export default Aside;