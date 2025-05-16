"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import secureLocalStorage from "react-secure-storage";
import { aside_links } from "../../data/data";
import LogoutConfirmationModal from "../Home/LogoutConfirmationModal";
import { useOnboarding } from "../../context/OnboardingContext";
import infinite from "../../../public/Icons/infinite.svg";
import Notification from "../dashboard/Notification";
import logo from "../../../public/logoMyqcm.png";
import settings from "../../../public/Aside/settings.svg";
import Psettings from "../../../public/Aside/Psettings.svg";
import logoutIcon from "../../../public/Aside/logout.svg";
import menu from "../../../public/Home/Menu.svg";
import notificationIcon from "../../../public/Icons/notification.svg";
import streak from "../../../public/Icons/streak.svg";

const AsideOnboarding = () => {
  // Use the shared context for menu state
  const { isMenuOpen, setIsMenuOpen, currentTourStep, isMobileView } =
    useOnboarding();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const path = usePathname();
  const router = useRouter();

  const afterDashboard = path.split("/dashboard/")[1] || "";
  const isSettingsActive = afterDashboard.startsWith("settings");

  // --- Static Data (as requested) ---
  const userNotification = [
    {
      id: "1",
      message: "Welcome to MyQCM! Explore our features.",
      read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      message: "Your daily streak is active. Keep it up!",
      read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
    {
      id: "3",
      message: "New QCMs added in the 'History' section.",
      read: false,
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    },
  ];

  const isQcmInfinite = true;
  const remainingMcqs = isQcmInfinite ? null : 100; // Example static value
  const remainingQrocs = 50; // Example static value
  const currentStreak = 10; // Example static value
  const currentXp = 1250; // Example static value
  // --- End Static Data ---

  useEffect(() => {
    // Close menus on path change
    setIsMenuOpen(false);
    setShowLogoutConfirm(false);
    setIsNotificationOpen(false);
  }, [path, setIsMenuOpen]);

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (!isNotificationOpen && isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  const confirmLogout = () => {
    if (typeof window !== "undefined") {
      secureLocalStorage.removeItem("token");
      router.push("/login");
    }
  };

  const closeLogoutModal = () => {
    setShowLogoutConfirm(false);
  };

  // Check if element should be highlighted in tour
  const isHighlighted = (id) => currentTourStep === id;

  return (
    <>
      <aside className="fixed w-[248px] h-screen justify-between flex flex-col pt-[30px] pb-[18px] top-0 left-0 border-r border-r-[#E4E4E4] bg-white shadow-md onboarding-aside max-xl:w-full max-xl:flex-row max-xl:items-center max-xl:h-[70px] max-xl:px-[24px] max-xl:py-0">
        {/* Top section / Mobile header content */}
        {isMenuOpen ? ( // Mobile menu open: show stats
          <>
            <div
              id="tour-qcm-display"
              className={`flex-shrink-0 ${
                isHighlighted("tour-qcm-display") ? "tour-highlight-active" : ""
              }`}
            >
              <span className="text-[#191919] font-[500] text-[17px] flex items-center gap-[3px]">
                {isQcmInfinite ? (
                  <div className="cursor-pointer">
                    <Image
                      src={infinite}
                      alt="Infini"
                      width={20}
                      height={12}
                      className="w-[22px]"
                    />
                  </div>
                ) : (
                  remainingMcqs ?? 0
                )}
                <span className="text-[#F8589F]">QCM</span>
              </span>
            </div>
            <div
              id="tour-qroc-display"
              className={`flex-shrink-0 ${
                isHighlighted("tour-qroc-display")
                  ? "tour-highlight-active"
                  : ""
              }`}
            >
              <span className="text-[#191919] font-[500] text-[17px] flex items-center gap-[3px]">
                {remainingQrocs ?? 0}
                <span className="text-[#F8589F]">QROC</span>
              </span>
            </div>
            <div
              id="tour-streak-display"
              className={`flex items-center gap-1 flex-shrink-0 ${
                isHighlighted("tour-streak-display")
                  ? "tour-highlight-active"
                  : ""
              }`}
            >
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
            <div
              id="tour-xp-display"
              className={`flex-shrink-0 ${
                isHighlighted("tour-xp-display") ? "tour-highlight-active" : ""
              }`}
            >
              <span className="text-[#191919] font-[500] text-[17px] flex items-center gap-[3px]">
                {currentXp}
                <span className="text-[#F8589F]">XP</span>
              </span>
            </div>
          </>
        ) : (
          // Desktop view or Mobile menu closed: show logo
          <div className="cursor-pointer">
            <Image
              src={logo}
              alt="logo"
              className="w-[120px] mx-auto max-xl:mx-0 max-xl:w-[80px]"
              priority
            />
          </div>
        )}

        {/* Mobile menu toggle and notification icon */}
        <div className="flex items-center gap-4 xl:hidden">
          {!isMenuOpen && (
            <div
              id="tour-notification-icon"
              onClick={toggleNotification}
              className={`cursor-pointer relative ${
                isHighlighted("tour-notification-icon")
                  ? "tour-highlight-active"
                  : ""
              }`}
            >
              <Image
                src={notificationIcon}
                alt="notification"
                className="w-[16px]"
              />
              {userNotification.filter((n) => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {userNotification.filter((n) => !n.read).length}
                </span>
              )}
            </div>
          )}

          <div
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`cursor-pointer ${
              isMobileView &&
              currentTourStep?.startsWith("tour-") &&
              !currentTourStep?.includes("notification")
                ? "tour-menu-button-hint"
                : ""
            }`}
          >
            {isMenuOpen ? (
              <X size={26} className="text-[#F8589F]" />
            ) : (
              <Image src={menu} alt="menu" className="w-[16px]" />
            )}
          </div>
        </div>

        {/* Navigation Links */}
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
                <div
                  className="text-[#324054] flex items-center gap-4 max-xl:justify-center cursor-pointer"
                  onClick={() => isMenuOpen && setIsMenuOpen(false)}
                >
                  <Image
                    src={isActive ? item.hoverIcon : item.icon}
                    alt={`${item.name} icon`}
                    className="w-[17px] font-[500]"
                  />
                  <span
                    className={`text-[13.8px] font-[500] max-md:text-[18px] ${
                      isActive ? "text-[#F8589F]" : ""
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
              </li>
            );
          })}

          {/* Settings link (visible in mobile menu) */}
          <li
            className={`rounded-r-[12px] py-[14px] pl-[20px] w-[88%] max-xl:rounded-[12px] max-xl:pl-0 max-xl:w-[90%] xl:hidden ${
              isSettingsActive ? "text-[#F8589F]" : ""
            }`}
          >
            <div
              className="text-[#324054] flex items-center gap-4 max-xl:justify-center cursor-pointer"
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
            </div>
          </li>

          <li className="rounded-r-[12px] py-[14px] pl-[20px] w-[88%] max-xl:rounded-[12px] max-xl:pl-0 max-xl:w-[90%] xl:hidden">
            <button
              className="text-[#324054] flex items-center gap-4 w-full max-xl:justify-center"
              onClick={handleLogoutClick}
            >
              <Image
                src={logoutIcon}
                alt="déconnexion"
                className="w-[16px] font-[500]"
              />
              <span className="text-[13.8px] font-[500] text-[#F64C4C] max-md:text-[18px]">
                Déconnexion
              </span>
            </button>
          </li>
        </ul>

        <div className="relative flex flex-col gap-1 pl-5 max-xl:hidden">
          <div
            className={`rounded-l-[12px] py-[14px] w-[88%] pl-[10px] ${
              isSettingsActive ? "text-[#F8589F]" : ""
            }`}
          >
            <div className="text-[#324054] flex items-center gap-4 cursor-pointer">
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
            </div>
          </div>
          <div className="w-[88%]">
            <button
              className={`rounded-l-[12px] py-[14px] pl-[10px] w-full text-[#324054] flex items-center gap-4 text-left`}
            >
              <Image
                src={logoutIcon}
                alt="déconnexion"
                className="w-[16px] font-[500]"
              />
              <span className="text-[14.5px] font-[500] text-[#F64C4C]">
                Déconnexion
              </span>
            </button>
          </div>
        </div>
      </aside>

      {isNotificationOpen && (
        <Notification
          onClose={toggleNotification}
          notifications={userNotification}
        />
      )}

      <style jsx global>{`
        /* Add specific styling for the onboarding aside */
        .fixed.w-\\[248px\\] {
          z-index: 99 !important; /* Keep z-index lower than highlighted elements */
        }

        /* For mobile menu only, higher z-index to ensure it's accessible */
        .max-xl\\:flex-row.max-xl\\:items-center .mobile-menu-button {
          z-index: 1011 !important;
        }

        .tour-menu-button-hint {
          position: relative;
          animation: pulse-hint 1.5s infinite;
        }

        .tour-menu-button-hint::after {
          content: "Click to see more";
          position: absolute;
          top: -35px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(248, 88, 159, 0.9);
          color: white;
          font-size: 12px;
          padding: 5px 10px;
          border-radius: 4px;
          white-space: nowrap;
          pointer-events: none;
        }

        .tour-menu-button-hint::before {
          content: "";
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 5px;
          border-style: solid;
          border-color: rgba(248, 88, 159, 0.9) transparent transparent
            transparent;
          pointer-events: none;
        }

        @keyframes pulse-hint {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        /* Better styling for mobile menu on onboarding */
        @media (max-width: 1279px) {
          .max-xl\\:translate-x-0 {
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            z-index: 101;
          }

          /* Fix position of highlights relative to tooltips */
          .tour-highlight-active {
            z-index: 1002 !important;
          }

          /* Ensure tooltips appear over highlighted elements */
          .manual-tour-tooltip {
            z-index: 1010 !important;
          }
        }
      `}</style>
    </>
  );
};

export default AsideOnboarding;
