"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import secureLocalStorage from "react-secure-storage";
import { useQuery } from "@tanstack/react-query";
import { aside_links } from "@/data/data";
import LogoutConfirmationModal from "../Home/LogoutConfirmationModal";
import BaseUrl from "../BaseUrl";
import infinite from "../../../public/Icons/infinite.svg";
import Notification from "./Notification";
import logo from "../../../public/logoMyqcm.png";
import settings from "../../../public/Aside/settings.svg";
import Psettings from "../../../public/Aside/Psettings.svg";
import logout from "../../../public/Aside/logout.svg";
import menu from "../../../public/Home/Menu.svg";
import notificationIcon from "../../../public/Icons/notification.svg";
import streak from "../../../public/Icons/streak.svg";

const Aside = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const path = usePathname();
  const router = useRouter();

  const afterDashboard = path.split("/dashboard/")[1] || "";
  const isSettingsActive = afterDashboard.startsWith("settings");

  const fetchData = async (url) => {
    const token = secureLocalStorage.getItem("token");
    if (!token || typeof token !== "string") {
      console.warn(`No valid token found for fetching ${url}.`);
      return null;
    }
    try {
      const response = await BaseUrl.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        error;
      console.error(`Failed to fetch ${url}:`, errorMsg);
      return null;
    }
  };

  const queryOptions = {
    enabled: !!secureLocalStorage.getItem("token"),
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 seconds instead of 5 minutes
    refetchInterval: 1000 * 60, // Refetch every minute
  };

  const { data: userNotification } = useQuery({
    queryKey: ["userNotification"],
    queryFn: () => fetchData("/notification"),
    staleTime: 1000 * 15, // 15 seconds for notifications
    refetchInterval: 1000 * 30, // Refetch every 30 seconds for notifications
    refetchOnWindowFocus: true,
    enabled: !!secureLocalStorage.getItem("token"),
  });

  const { data: userSubscription } = useQuery({
    queryKey: ["userSubscription"],
    queryFn: () => fetchData("/user/subscription/me"),
    staleTime: 1000 * 30, // 30 seconds instead of 15 minutes
    refetchInterval: 1000 * 60, // Refetch every minute
    refetchOnWindowFocus: true,
    enabled: !!secureLocalStorage.getItem("token"),
  });

  const { data: streakData } = useQuery({
    queryKey: ["userStreak"],
    queryFn: () => fetchData("/user/streak/me"),
    ...queryOptions,
  });

  const { data: xpData } = useQuery({
    queryKey: ["userXp"],
    queryFn: () => fetchData("/user/xp/me"),
    ...queryOptions,
  });

  const isQcmInfinite = userSubscription?.plan?.mcqs === null;
  const remainingMcqs = !isQcmInfinite
    ? Math.max(
        0,
        (userSubscription?.plan?.mcqs ?? 0) - (userSubscription?.used_mcqs ?? 0)
      )
    : null;
  const remainingQrocs = Math.max(
    0,
    (userSubscription?.plan?.qrocs ?? 0) - (userSubscription?.used_qrocs ?? 0)
  );
  const currentStreak = streakData?.current_streak ?? 0;
  const currentXp = xpData?.xp ?? 0;

  useEffect(() => {
    setIsMenuOpen(false);
    setShowLogoutConfirm(false);
    setIsNotificationOpen(false);
  }, [path]);

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (!isNotificationOpen && isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  // Extract notifications array from the response
  const notificationsArray = userNotification?.data || [];
  const unreadCount = notificationsArray.filter(
    (notification) => notification.status === "pending"
  ).length;

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  const confirmLogout = () => {
    secureLocalStorage.removeItem("token");
    router.push(`/`);
    setShowLogoutConfirm(false);
  };

  const closeLogoutModal = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <aside className="fixed w-[248px] h-screen justify-between flex flex-col pt-[30px] pb-[18px] top-0 left-0 border-r border-r-[#E4E4E4] bg-white shadow-md z-[50] max-xl:w-full max-xl:flex-row max-xl:items-center max-xl:h-[70px] max-xl:px-[24px] max-xl:py-0">
        {isMenuOpen ? (
          <>
            {" "}
            <div className="flex-shrink-0">
              {" "}
              <span className="text-[#191919] font-[500] text-[17px] flex items-center gap-[3px]">
                {isQcmInfinite ? (
                  <Link href="/dashboard">
                    <Image
                      src={infinite}
                      alt="Infini"
                      width={20}
                      height={12}
                      className="w-[22px]"
                    />
                  </Link>
                ) : (
                  remainingMcqs ?? 0
                )}
                <span className="text-[#F8589F]">QCM</span>
              </span>
            </div>
            <div className="flex-shrink-0">
              {" "}
              <span className="text-[#191919] font-[500] text-[17px] flex items-center gap-[3px]">
                {remainingQrocs ?? 0}
                <span className="text-[#F8589F]">QROC</span>
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {" "}
              <span className="text-[#191919] font-[500] text-[17px]">
                {currentStreak}
              </span>
              <Image
                src={streak}
                alt="série"
                className="w-[13px]"
                width={13}
                height={13}
              />
            </div>
            <div className="flex-shrink-0">
              {" "}
              <span className="text-[#191919] font-[500] text-[17px] flex items-center gap-[3px]">
                {currentXp}
                <span className="text-[#F8589F]">XP</span>
              </span>
            </div>
          </>
        ) : (
          <Link href="/dashboard">
            <Image
              src={logo}
              alt="logo"
              className="w-[120px] mx-auto max-xl:mx-0 max-xl:w-[80px]"
            />
          </Link>
        )}
        <div className="flex items-center gap-4 xl:hidden">
          {!isMenuOpen && (
            <div
              onClick={toggleNotification}
              className="cursor-pointer relative"
            >
              <Image
                src={notificationIcon}
                alt="notification"
                className="w-[16px]"
              />
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-[#F8589F] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </div>
              )}
            </div>
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
          className={`flex flex-col mb-40 gap-4 max-xl:absolute max-xl:top-[70px] max-xl:gap-6 max-xl:left-0 max-xl:w-full max-xl:h-[calc(100vh-70px)] max-xl:pt-[60px] max-xl:pb-[90px] max-xl:bg-[#FFFFFF] max-xl:items-center max-xl:shadow-lg max-xl:transition-transform max-xl:duration-300 max-xl:ease-in-out max-xl:overflow-y-auto max-xl:justify-between ${
            isMenuOpen
              ? "max-xl:translate-x-0"
              : "max-xl:-translate-x-full max-xl:pointer-events-none"
          }`}
          style={{
            transition: "transform 0.3s ease-in-out, opacity 0.3s ease-in-out",
          }}
        >
          {aside_links.map((item, index) => {
            const isHome = item.href === "";
            const currentPathSegment = afterDashboard
              .split("?")[0]
              .split("/")[0];
            const itemHrefSegment = item.href.split("?")[0].split("/")[0];
            const isActive =
              (isHome && currentPathSegment === "") ||
              (!isHome &&
                item.href !== "" &&
                currentPathSegment === itemHrefSegment);

            return (
              <li
                key={index}
                className={`rounded-r-[12px] py-[14px] pl-[20px] w-[88%] max-xl:rounded-[12px] max-xl:pl-0 max-xl:w-[90%] ${
                  isActive ? "text-[#F8589F]" : ""
                }`}
              >
                <Link
                  href={`/dashboard/${item.href}`}
                  className="text-[#324054] flex items-center gap-4 max-xl:justify-center"
                  onClick={() => isMenuOpen && setIsMenuOpen(false)}
                >
                  <Image
                    src={isActive ? item.hoverIcon : item.icon}
                    alt="icône"
                    className="w-[17px] font-[500]"
                  />
                  <span
                    className={`text-[13.8px] font-[500] max-md:text-[18px] ${
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
            className={`rounded-r-[12px] py-[14px] pl-[20px] w-[88%] max-xl:rounded-[12px] max-xl:pl-0 max-xl:w-[90%] xl:hidden ${
              isSettingsActive ? "text-[#F8589F]" : ""
            }`}
          >
            <Link
              href={`/dashboard/settings`}
              className="text-[#324054] flex items-center gap-4 max-xl:justify-center"
              onClick={() => isMenuOpen && setIsMenuOpen(false)}
            >
              <Image
                src={isSettingsActive ? Psettings : settings}
                alt="paramètres"
                className="w-[16px] font-[500]"
              />
              <span
                className={`text-[13.8px] font-[500] max-md:text-[18px] ${
                  isSettingsActive ? "text-[#F8589F]" : ""
                }`}
              >
                Paramètres
              </span>
            </Link>
          </li>

          <li className="rounded-r-[12px] py-[14px] pl-[20px] w-[88%] max-xl:rounded-[12px] max-xl:pl-0 max-xl:w-[90%] xl:hidden">
            {" "}
            <button
              className="text-[#324054] flex items-center gap-4 w-full max-xl:justify-center"
              onClick={handleLogoutClick}
            >
              <Image
                src={logout}
                alt="déconnexion"
                className="w-[16px] font-[500]"
              />
              <span className="text-[13.8px] font-[500] text-[#F64C4C] max-md:text-[18px]">
                {" "}
                Déconnexion
              </span>
            </button>
          </li>
        </ul>
        <div className="relative flex flex-col gap-1 pl-5 max-xl:hidden">
          {" "}
          <div
            className={`rounded-l-[12px] py-[14px] w-[88%] pl-[10px] ${
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
          <div className="w-[88%]">
            {" "}
            <button
              className={`rounded-l-[12px] py-[14px] pl-[10px] w-full text-[#324054] flex items-center gap-4 text-left`}
              onClick={handleLogoutClick}
            >
              <Image
                src={logout}
                alt="déconnexion"
                className="w-[16px] font-[500]"
              />
              <span className="text-[14.5px] font-[500] text-[#F64C4C]">
                {" "}
                Déconnexion
              </span>
            </button>
          </div>
        </div>
      </aside>

      <LogoutConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={closeLogoutModal}
        onConfirm={confirmLogout}
      />

      {isNotificationOpen && (
        <Notification
          onClose={toggleNotification}
          notifications={notificationsArray}
        />
      )}
    </>
  );
};

export default Aside;
