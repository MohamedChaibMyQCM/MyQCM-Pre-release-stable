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
import { useState } from "react";

const Aside = () => {
  const[popup, setPopup] = useState(false)
  const locale = useLocale();
  const path = usePathname();
  const afterDashboard = path.split("/dashboard/")[1] || "";

  return (
    <aside className="fixed w-[248px] h-screen justify-between flex flex-col pt-[30px] pb-[18px] fixed top-0 left-0">
      <Image src={logo} alt="logo" className="w-[180px] mx-auto" />
      <ul className="flex flex-col mb-[40px] gap-1">
        {aside_links.map((item, index) => {
          const isHome = item.href === "";
          const isActive =
            (isHome && afterDashboard === "") ||
            (!isHome && afterDashboard.startsWith(item.href));

          return (
            <li
              key={index}
              className={`rounded-r-[12px] py-[14px] pl-[16px] w-[88%] ${
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
      <div className="relative flex gap-1 items-center pl-3">
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