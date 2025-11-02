"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import secureLocalStorage from "react-secure-storage";
import { useQuery } from "@tanstack/react-query";
import { motion, useAnimationControls, useInView } from "motion/react";
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
import { MdReportGmailerrorred } from "react-icons/md";

// Animated Counter Component
const AnimatedCounter = ({ value, suffix = "", isInfinite = false }) => {
  const [count, setCount] = useState(0);
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true });

  useEffect(() => {
    if (isInView && !isInfinite && typeof value === 'number') {
      let start = 0;
      const end = value;
      const duration = 1000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [value, isInView, isInfinite]);

  if (isInfinite) {
    return <span ref={nodeRef}>{value}</span>;
  }

  return <span ref={nodeRef}>{count}</span>;
};

const Aside = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const path = usePathname();
  const router = useRouter();

  const afterDashboard = path.split("/dashboard/")[1] || "";
  const isSettingsActive = afterDashboard.startsWith("settings");
  const isReportActive = afterDashboard.startsWith("report");

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
  const isAlphaSubscriber = Boolean(userSubscription?.plan?.is_alpha);
  const navigationLinks = aside_links.filter(
    (item) => !item.requiresAlpha || isAlphaSubscriber
  );

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
      <motion.aside
        initial={{ x: -248, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          duration: 0.6
        }}
        className="fixed w-[248px] h-screen justify-between flex flex-col pt-[30px] pb-[18px] gap-3 top-0 left-0 border-r border-r-[#E4E4E4] bg-white shadow-md z-[50] max-xl:w-full max-xl:flex-row max-xl:items-center max-xl:h-[70px] max-xl:px-[24px] max-xl:py-0 max-xl:gap-0">
        {isMenuOpen ? (
          <>
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <span className="text-[#191919] font-[500] text-[17px] flex items-center gap-[3px]">
                {isQcmInfinite ? (
                  <Link href="/dashboard">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Image
                        src={infinite}
                        alt="Infini"
                        width={20}
                        height={12}
                        className="w-[22px]"
                      />
                    </motion.div>
                  </Link>
                ) : (
                  <AnimatedCounter value={remainingMcqs ?? 0} />
                )}
                <span className="text-[#F8589F]">QCM</span>
              </span>
            </motion.div>
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span className="text-[#191919] font-[500] text-[17px] flex items-center gap-[3px]">
                <AnimatedCounter value={remainingQrocs ?? 0} />
                <span className="text-[#F8589F]">QROC</span>
              </span>
            </motion.div>
            <motion.div
              className="flex items-center gap-1 flex-shrink-0"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <span className="text-[#191919] font-[500] text-[17px]">
                <AnimatedCounter value={currentStreak} />
              </span>
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <Image
                  src={streak}
                  alt="série"
                  className="w-[13px]"
                  width={13}
                  height={13}
                />
              </motion.div>
            </motion.div>
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <span className="text-[#191919] font-[500] text-[17px] flex items-center gap-[3px]">
                <AnimatedCounter value={currentXp} />
                <span className="text-[#F8589F]">XP</span>
              </span>
            </motion.div>
          </>
        ) : (
          <Link href="/dashboard">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src={logo}
                alt="logo"
                className="w-[120px] mx-auto max-xl:mx-0 max-xl:w-[80px]"
              />
            </motion.div>
          </Link>
        )}
        <div className="flex items-center gap-4 xl:hidden">
          {!isMenuOpen && (
            <motion.div
              onClick={toggleNotification}
              className="cursor-pointer relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                animate={unreadCount > 0 ? { rotate: [0, -15, 15, -15, 0] } : {}}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <Image
                  src={notificationIcon}
                  alt="notification"
                  className="w-[16px]"
                />
              </motion.div>
              {unreadCount > 0 && (
                <motion.div
                  className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-[#F8589F] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </motion.div>
              )}
              {isNotificationOpen && (
                <Notification
                  onClose={toggleNotification}
                  notifications={notificationsArray}
                />
              )}
            </motion.div>
          )}

          <motion.div
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {isMenuOpen ? (
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 90 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <X size={26} className="text-[#F8589F]" />
              </motion.div>
            ) : (
              <Image src={menu} alt="menu" className="w-[16px]" />
            )}
          </motion.div>
        </div>
        <motion.ul
          className={`flex flex-col mb-8 gap-4 max-xl:absolute max-xl:top-[70px] max-xl:gap-6 max-xl:left-0 max-xl:w-full max-xl:h-[calc(100vh-70px)] max-xl:pt-[60px] max-xl:pb-[90px] max-xl:bg-[#FFFFFF] max-xl:items-center max-xl:shadow-lg max-xl:transition-transform max-xl:duration-300 max-xl:ease-in-out max-xl:overflow-y-auto max-xl:justify-between ${
            isMenuOpen
              ? "max-xl:translate-x-0"
              : "max-xl:-translate-x-full max-xl:pointer-events-none"
          }`}
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
              }
            }
          }}
        >
          {navigationLinks.map((item, index) => {
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
              <motion.li
                key={index}
                className={`relative rounded-r-[12px] py-[14px] pl-[20px] w-[88%] max-xl:rounded-[12px] max-xl:pl-0 max-xl:w-[90%] transition-colors duration-200 ${
                  isActive ? "text-[#F8589F] bg-[#FFF5FA]" : "hover:bg-[#F9F9F9]"
                }`}
                variants={{
                  hidden: { opacity: 0, x: -50 },
                  visible: { opacity: 1, x: 0 }
                }}
                whileHover={{
                  scale: 1.05,
                  x: 5,
                  transition: { type: "spring", stiffness: 300 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={`/dashboard/${item.href}`}
                  className="text-[#324054] flex items-center gap-4 max-xl:justify-center"
                  onClick={() => isMenuOpen && setIsMenuOpen(false)}
                >
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                    className={item.requiresAlpha && !isActive ? "relative" : ""}
                  >
                    <Image
                      src={isActive ? item.hoverIcon : item.icon}
                      alt="icône"
                      className={`font-[500] ${
                        item.requiresAlpha
                          ? "w-[20px] h-[20px]"
                          : "w-[17px]"
                      }`}
                      style={
                        item.requiresAlpha && !isActive
                          ? {
                              filter: "brightness(0) saturate(100%) invert(44%) sepia(82%) saturate(2449%) hue-rotate(297deg) brightness(98%) contrast(98%)",
                            }
                          : undefined
                      }
                    />
                    {item.requiresAlpha && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-[#F8589F] to-[#FF89C8] rounded-full"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [1, 0.7, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                  </motion.div>
                  <span
                    className={`text-[13.8px] font-[500] max-md:text-[18px] ${
                      isActive ? "text-[#F8589F]" : ""
                    } ${item.requiresAlpha && !isActive ? "bg-gradient-to-r from-[#F8589F] to-[#FF89C8] bg-clip-text text-transparent font-semibold" : ""}`}
                  >
                    {item.name}
                  </span>
                </Link>
                {isActive && (
                  <motion.div
                    className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#F8589F] to-[#FF89C8] rounded-l-full"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.li>
            );
          })}

          <motion.li
            className={`relative rounded-r-[12px] py-[14px] pl-[20px] w-[88%] max-xl:rounded-[12px] max-xl:pl-0 max-xl:w-[90%] xl:hidden transition-colors duration-200 ${
              isSettingsActive ? "text-[#F8589F] bg-[#FFF5FA]" : "hover:bg-[#F9F9F9]"
            }`}
            variants={{
              hidden: { opacity: 0, x: -50 },
              visible: { opacity: 1, x: 0 }
            }}
            whileHover={{
              scale: 1.05,
              x: 5,
              transition: { type: "spring", stiffness: 300 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href={`/dashboard/settings/personal-info`}
              className="text-[#324054] flex items-center gap-4 max-xl:justify-center"
              onClick={() => isMenuOpen && setIsMenuOpen(false)}
            >
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src={isSettingsActive ? Psettings : settings}
                  alt="paramètres"
                  className="w-[16px] font-[500]"
                />
              </motion.div>
              <span
                className={`text-[13.8px] font-[500] max-md:text-[18px] ${
                  isSettingsActive ? "text-[#F8589F]" : ""
                }`}
              >
                Paramètres
              </span>
            </Link>
          </motion.li>

          <motion.li
            className="relative rounded-r-[12px] py-[14px] pl-[20px] w-[88%] max-xl:rounded-[12px] max-xl:pl-0 max-xl:w-[90%] xl:hidden transition-colors duration-200 hover:bg-[#FFF1F1]"
            variants={{
              hidden: { opacity: 0, x: -50 },
              visible: { opacity: 1, x: 0 }
            }}
            whileHover={{
              scale: 1.05,
              x: 5,
              transition: { type: "spring", stiffness: 300 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              className="text-[#324054] flex items-center gap-4 w-full max-xl:justify-center"
              onClick={handleLogoutClick}
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src={logout}
                  alt="déconnexion"
                  className="w-[16px] font-[500]"
                />
              </motion.div>
              <span className="text-[13.8px] font-[500] text-[#F64C4C] max-md:text-[18px]">
                Déconnexion
              </span>
            </button>
          </motion.li>
        </motion.ul>
        <motion.div
          className="relative flex flex-col gap-1 pl-5 mb-8 max-xl:hidden"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <motion.div
            className={`py-[14px] w-[88%] pl-[8px] rounded-r-[12px] transition-colors duration-200 ${
              isReportActive ? "bg-[#FFF5FA]" : "hover:bg-[#F9F9F9]"
            }`}
            whileHover={{
              scale: 1.05,
              x: 5,
              transition: { type: "spring", stiffness: 300 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href={`/dashboard/report`}
              className="text-[#324054] flex items-center gap-4"
            >
              <motion.div
                whileHover={{ rotate: [0, -15, 15, -15, 0], scale: 1.2 }}
                transition={{ duration: 0.5 }}
              >
                <MdReportGmailerrorred
                  className={`w-[20px] h-[20px] ${
                    isReportActive ? "text-[#F8589F]" : "text-[#324054]"
                  }`}
                />
              </motion.div>
              <span
                className={`text-[14.5px] font-[500] ${
                  isReportActive ? "text-[#F8589F]" : ""
                }`}
              >
                Signaler des bugs
              </span>
            </Link>
          </motion.div>
          <motion.div
            className={`rounded-r-[12px] py-[14px] w-[88%] pl-[10px] transition-colors duration-200 ${
              isSettingsActive ? "bg-[#FFF5FA]" : "hover:bg-[#F9F9F9]"
            }`}
            whileHover={{
              scale: 1.05,
              x: 5,
              transition: { type: "spring", stiffness: 300 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href={`/dashboard/settings/personal-info`}
              className="text-[#324054] flex items-center gap-4"
            >
              <motion.div
                whileHover={{ rotate: 180, scale: 1.2 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src={isSettingsActive ? Psettings : settings}
                  alt="paramètres"
                  className="w-[16px] font-[500]"
                />
              </motion.div>
              <span
                className={`text-[14.5px] font-[500] ${
                  isSettingsActive ? "text-[#F8589F]" : ""
                }`}
              >
                Paramètres
              </span>
            </Link>
          </motion.div>
          <motion.div
            className="w-[88%] rounded-r-[12px] transition-colors duration-200 hover:bg-[#FFF1F1]"
            whileHover={{
              scale: 1.05,
              x: 5,
              transition: { type: "spring", stiffness: 300 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              className="py-[14px] pl-[10px] w-full text-[#324054] flex items-center gap-4 text-left"
              onClick={handleLogoutClick}
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.2 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src={logout}
                  alt="déconnexion"
                  className="w-[16px] font-[500]"
                />
              </motion.div>
              <span className="text-[14.5px] font-[500] text-[#F64C4C]">
                Déconnexion
              </span>
            </button>
          </motion.div>
        </motion.div>
      </motion.aside>

      <LogoutConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={closeLogoutModal}
        onConfirm={confirmLogout}
      />
    </>
  );
};

export default Aside;
