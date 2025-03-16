"use client";

import Image from "next/image";
import logo from "../../../public/logoMyqcm.svg";
import Link from "next/link";
import { aside_links } from "@/data/data";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import settings from "../../../public/Aside/settings.svg";
import Psettings from "../../../public/Aside/Psettings.svg";
import logout from "../../../public/Aside/logout.svg";
import menu from "../../../public/Home/menu.svg";
import notification from "../../../public/Icons/notification.svg";
import { X } from "lucide-react"; // Import the X icon
import streak from "../../../public/Icons/streak.svg"; // Import the streak icon
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

  return (
    <aside className="fixed w-[248px] h-screen justify-between flex flex-col pt-[30px] pb-[18px] top-0 left-0 border-r border-r-[#E4E4E4] bg-white shadow-md z-[50] max-md:w-full max-md:flex-row max-md:items-center max-md:h-[70px] max-md:px-[24px] max-md:py-0">
      {isMenuOpen ? (
        <div className="flex items-center gap-2">
          <span className="text-[#191919] font-[500] text-[18px]">
            200<span className="text-[#F8589F]">XP</span>
          </span>
          <div className="flex items-center gap-[2px]">
            <span className="text-[#191919] font-[500] text-[18px]">3</span>
            <Image src={streak} alt="streak" className="w-[13px]" />
          </div>
        </div>
      ) : (
        <Image
          src={logo}
          alt="logo"
          className="w-[120px] mx-auto max-md:mx-0 max-md:w-[80px]"
        />
      )}
      <div className="flex items-center gap-4 md:hidden">
        {!isMenuOpen && (
          <Image
            src={notification}
            alt="notification"
            className="w-[16px] cursor-pointer"
          />
        )}

        <div
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="cursor-pointer"
        >
          {isMenuOpen ? (
            <X size={26} className="text-[#F8589F]" />
          ) : (
            <Image src={menu} alt="menu" className="w-[16px]" />
          )}
        </div>
      </div>
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
              className={`rounded-r-[12px] py-[14px] pl-[20px] w-[88%] max-md:rounded-[12px] max-md:pl-0 ${
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
        <li
          className={`rounded-r-[12px] py-[14px] pl-[20px] w-[88%] max-md:rounded-[12px] max-md:pl-0 md:hidden ${
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
              className={`text-[13.8px] font-[500] ${
                isSettingsActive ? "text-[#F8589F]" : ""
              }`}
            >
              Settings
            </span>
          </Link>
        </li>
        <li className="rounded-r-[12px] py-[14px] pl-[20px] w-[88%] max-md:rounded-[12px] max-md:pl-0 md:hidden">
          <button
            className="text-[#324054] flex items-center gap-4"
            onClick={handleLogout}
          >
            <Image src={logout} alt="logout" className="w-[16px] font-[500]" />
            <span className="text-[13.8px] font-[500] text-[#F64C4C]">
              Logout
            </span>
          </button>
        </li>
      </ul>
      <div className="relative flex flex-col gap-1 pl-5 max-md:hidden">
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
          <span className="text-[14.5px] font-[500] text-[#F64C4C]">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Aside;
