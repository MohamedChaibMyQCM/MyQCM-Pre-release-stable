"use client";

import Image from "next/image";
import logo from "../../../public/logoMyqcm.png";
import Link from "next/link";
import { aside_links } from "@/data/data";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import settings from "../../../public/Aside/settings.svg";
import Psettings from "../../../public/Aside/Psettings.svg";
import logout from "../../../public/Aside/logout.svg";
import menu from "../../../public/Home/Menu.svg";
import notification from "../../../public/Icons/notification.svg";
import { X } from "lucide-react";
import streak from "../../../public/Icons/streak.svg";
import secureLocalStorage from "react-secure-storage";

const Aside = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const path = usePathname();
  const afterDashboard = path.split("/dashboard/")[1] || "";
  const router = useRouter();

  useEffect(() => {
    // Close menu on route change
    setIsMenuOpen(false);
  }, [path]);

  const handleLogout = () => {
    secureLocalStorage.removeItem("token");
    router.push(`/`);
  };

  const isSettingsActive = afterDashboard.startsWith("settings");

  return (
    // --- MODIFIED HERE ---
    // Changed max-md:* to max-xl:* for mobile/tablet layout
    // Removed the previous max-xl:w-[100%] max-xl:h-[70px] as it's now covered
    <aside className="fixed w-[248px] h-screen justify-between flex flex-col pt-[30px] pb-[18px] top-0 left-0 border-r border-r-[#E4E4E4] bg-white shadow-md z-[50] max-xl:w-full max-xl:flex-row max-xl:items-center max-xl:h-[70px] max-xl:px-[24px] max-xl:py-0">
      {/* Logo or XP/Streak - applies mobile style up to xl */}
      {isMenuOpen ? (
        <div className="flex items-center gap-2">
          <span className="text-[#191919] font-[500] text-[18px]">
            200<span className="text-[#F8589F]">XP</span>
          </span>
          <div className="flex items-center gap-[2px]">
            <span className="text-[#191919] font-[500] text-[18px]">3</span>
            <Image src={streak} alt="série" className="w-[13px]" />
          </div>
        </div>
      ) : (
        <Image
          src={logo}
          alt="logo"
          // --- MODIFIED HERE --- (max-md -> max-xl)
          className="w-[120px] mx-auto max-xl:mx-0 max-xl:w-[80px]"
        />
      )}
      <div className="flex items-center gap-4 xl:hidden">
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
      {/* Main Navigation UL - Applies mobile/tablet styles up to xl */}
      <ul
        // --- MODIFIED HERE --- (max-md -> max-xl)
        className={`flex flex-col mb-40 gap-4 max-xl:absolute max-xl:top-[70px] max-xl:gap-6 max-xl:left-0 max-xl:w-full max-xl:h-[100vh] max-xl:pt-[40px] max-xl:bg-[#FFFFFF] max-xl:items-center max-xl:shadow-lg max-xl:transition-all max-xl:duration-300 max-xl:ease-in-out ${
          isMenuOpen
            ? // --- MODIFIED HERE --- (max-md -> max-xl)
              "max-xl:opacity-100 max-xl:translate-y-0"
            : // --- MODIFIED HERE --- (max-md -> max-xl)
              "max-xl:opacity-0 max-xl:-translate-y-full max-xl:pointer-events-none"
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
              // --- MODIFIED HERE --- (max-md -> max-xl)
              className={`rounded-r-[12px] py-[14px] pl-[20px] w-[88%] max-xl:rounded-[12px] max-xl:pl-0 ${
                isActive ? "text-[#F8589F]" : ""
              }`}
            >
              <Link
                href={`/dashboard/${item.href}`}
                className="text-[#324054] flex items-center gap-4"
              >
                <Image
                  src={isActive ? item.hoverIcon : item.icon}
                  alt="icône"
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
        {/* Settings/Logout links specific to the slide-out menu - hide only on xl and above */}
        <li
          // --- MODIFIED HERE --- (max-md -> max-xl, md:hidden -> xl:hidden)
          className={`rounded-r-[12px] py-[14px] pl-[20px] w-[88%] max-xl:rounded-[12px] max-xl:pl-0 xl:hidden ${
            isSettingsActive ? "text-[#F8589F]" : ""
          }`}
        >
          <Link
            href={`/dashboard/settings`}
            className="text-[#324054] flex items-center gap-4"
          >
            <Image
              src={isSettingsActive ? Psettings : settings}
              alt="paramètres"
              className="w-[16px] font-[500]"
            />
            <span
              className={`text-[13.8px] font-[500] ${
                isSettingsActive ? "text-[#F8589F]" : ""
              }`}
            >
              Paramètres
            </span>
          </Link>
        </li>
        <li
          // --- MODIFIED HERE --- (max-md -> max-xl, md:hidden -> xl:hidden)
          className="rounded-r-[12px] py-[14px] pl-[20px] w-[88%] max-xl:rounded-[12px] max-xl:pl-0 xl:hidden"
        >
          <button
            className="text-[#324054] flex items-center gap-4"
            onClick={handleLogout}
          >
            <Image
              src={logout}
              alt="déconnexion"
              className="w-[16px] font-[500]"
            />
            <span className="text-[13.8px] font-[500] text-[#F64C4C]">
              Déconnexion
            </span>
          </button>
        </li>
      </ul>
      <div className="relative flex flex-col gap-1 pl-5 max-xl:hidden">
        <div
          className={`rounded-r-[12px] py-[14px] w-[88%] ${
            isSettingsActive ? "text-[#F8589F]" : ""
          }`}
        >
          <Link
            href={`/dashboard/settings`}
            className="text-[#324054] flex items-center gap-4"
          >
            <Image
              src={isSettingsActive ? Psettings : settings}
              alt="paramètres"
              className="w-[16px] font-[500]"
            />
            <span
              className={`text-[14.5px] font-[500] ${
                isSettingsActive ? "text-[#F8589F]" : ""
              }`}
            >
              Paramètres
            </span>
          </Link>
        </div>
        <button
          // --- MODIFIED HERE --- (max-md -> max-xl - applied to parent)
          className={`rounded-r-[12px] py-[14px] w-[88%] text-[#324054] flex items-center gap-4`}
          onClick={handleLogout}
        >
          <Image
            src={logout}
            alt="déconnexion"
            className="w-[16px] font-[500]"
          />
          <span className="text-[14.5px] font-[500] text-[#F64C4C]">
            Déconnexion
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Aside;
