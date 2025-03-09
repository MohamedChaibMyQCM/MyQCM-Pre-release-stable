"use client";

import Image from "next/image";
import logo from "../../../public/logoMyqcm.svg";
import Link from "next/link";
import { aside_links } from "@/data/data";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { FiMenu } from "react-icons/fi";
import settings from "../../../public/Aside/settings.svg";
import Psettings from "../../../public/Aside/Psettings.svg";
import logout from "../../../public/Aside/logout.svg";
import secureLocalStorage from "react-secure-storage";

const Aside = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const path = usePathname();
  const afterDashboard = path.split("/dashboard/")[1] || "";

  useEffect(() => {
    setIsMenuOpen(false);
  }, [path]);

  const handleLogout = () => {
    secureLocalStorage.removeItem("token");
    window.location.href = `/`;
  };

  const isSettingsActive = afterDashboard.startsWith("settings");
  console.log(isSettingsActive);

  return (
    <aside className="fixed w-[248px] h-screen justify-between flex flex-col pt-[30px] pb-[18px] top-0 left-0 border-r border-r-[#E4E4E4] bg-white shadow-md">
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
              className={`rounded-r-[12px] py-[14px] pl-[20px] w-[88%] max-md:rounded-[12px] ${
                isActive ? "text-[#F8589F]" : ""
              }`}
            >
              <Link
                href={`/dashboard/${item.href}`}
                className="text-[#324054] flex items-center gap-4"
              >
                <Image
                  src={isActive ? item.hoverIcon : item.icon}
                  alt="icon"
                  className="w-[17px] font-[500]"
                />
                <span
                  className={`text-[13.8px] font-[500] ${
                    isActive ? "text-[#F8589F]" : ""
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="relative flex flex-col gap-1 pl-5">
        <div
          className={`rounded-r-[12px] py-[14px] w-[88%] max-md:rounded-[12px] ${
            isSettingsActive ? "text-[#F8589F]" : ""
          }`}
        >
          <Link
            href={`/dashboard/settings`}
            className="text-[#324054] flex items-center gap-4"
          >
            <Image
              src={isSettingsActive ? Psettings : settings}
              alt="settings"
              className="w-[16px] font-[500]"
            />
            <span
              className={`text-[14.5px] font-[500] ${
                isSettingsActive ? "text-[#F8589F]" : ""
              }`}
            >
              Settings
            </span>
          </Link>
        </div>

        <button
          className={`rounded-r-[12px] py-[14px] w-[88%] max-md:rounded-[12px] text-[#324054] flex items-center gap-4`}
          onClick={handleLogout}
        >
          <Image src={logout} alt="logout" className="w-[16px] font-[500]" />
          <span className="text-[14.5px] font-[500] text-[#F64C4C]">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Aside;
