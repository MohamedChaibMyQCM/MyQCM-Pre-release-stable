// components/onboarding/Dash_Onboarding.js
"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useOnboarding } from "../../context/OnboardingContext";
import streakIcon from "../../../public/Icons/streak.svg";
import notificationIcon from "../../../public/Icons/notification.svg";
import infiniteIcon from "../../../public/Icons/infinite.svg";

const Dash_Onboarding = ({ highlightedElementInfo, isTourActive }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { isMobileView, currentTourStep } = useOnboarding();

  const staticUserData = { name: "Valued User" };
  const staticUserSubscription = {
    plan: { mcqs: null, qrocs: 100 },
    used_mcqs: 50,
    used_qrocs: 20,
  };
  const staticStreakData = { current_streak: 5 };
  const staticXpData = { xp: 750 };

  const toggleNotification = () => setIsNotificationOpen(!isNotificationOpen);
  const isQcmInfinite = staticUserSubscription?.plan?.mcqs === null;
  const remainingMcqs = !isQcmInfinite
    ? Math.max(
        0,
        (staticUserSubscription?.plan?.mcqs ?? 0) -
          (staticUserSubscription?.used_mcqs ?? 0)
      )
    : null;
  const remainingQrocs = Math.max(
    0,
    (staticUserSubscription?.plan?.qrocs ?? 0) -
      (staticUserSubscription?.used_qrocs ?? 0)
  );
  const currentStreak = staticStreakData?.current_streak ?? 0;
  const currentXp = staticXpData?.xp ?? 0;
  const userName = staticUserData?.name ?? "User";

  const isHighlighted = (id) =>
    isTourActive && highlightedElementInfo && highlightedElementInfo.id === id;
  const highlightPaddingClass = (id) =>
    isHighlighted(id) && highlightedElementInfo.addPadding ? "p-1 -m-1" : ""; // Reverted back to p-1 -m-1

  return (
    <div
      className={`relative flex items-center justify-between py-5 px-6 max-md:pt-4`}
    >
      <span className="font-[500] text-[18px] text-[#191919]">
        Bienvenue Ici
      </span>

      {/* Desktop notification icon */}
      <div className="flex items-center gap-10 max-xl:hidden">
        <div
          id="tour-notification-icon"
          className={`relative flex items-center justify-center w-[36px] h-[36px] cursor-pointer rounded-full transition-all duration-300
            ${
              isHighlighted("tour-notification-icon")
                ? "tour-highlight-active"
                : "hover:bg-pink-50 hover:scale-105"
            }
            ${highlightPaddingClass("tour-notification-icon")}
          `}
          onClick={toggleNotification}
          style={{
            zIndex: isHighlighted("tour-notification-icon") ? 1002 : "auto",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.02 2.91C8.71 2.91 6.02 5.6 6.02 8.91V11.8C6.02 12.41 5.76 13.34 5.45 13.86L4.3 15.77C3.59 16.95 4.08 18.26 5.38 18.7C9.69 20.14 14.34 20.14 18.65 18.7C19.86 18.3 20.39 16.87 19.73 15.77L18.58 13.86C18.28 13.34 18.02 12.41 18.02 11.8V8.91C18.02 5.61 15.32 2.91 12.02 2.91Z"
              stroke="#292D32"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
            />
            <path
              d="M13.87 3.2C13.56 3.11 13.24 3.04 12.91 3C11.95 2.88 11.03 2.95 10.17 3.2C10.46 2.46 11.18 1.94 12.02 1.94C12.86 1.94 13.58 2.46 13.87 3.2Z"
              stroke="#292D32"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15.02 19.06C15.02 20.71 13.67 22.06 12.02 22.06C11.2 22.06 10.44 21.72 9.9 21.18C9.36 20.64 9.02 19.88 9.02 19.06"
              stroke="#292D32"
              strokeWidth="1.5"
              strokeMiterlimit="10"
            />
          </svg>
        </div>

        <div
          id="tour-qcm-display"
          className={`flex items-center rounded-md
            ${isHighlighted("tour-qcm-display") ? "tour-highlight-active" : ""}
            ${highlightPaddingClass("tour-qcm-display")}
          `}
        >
          {/* QCM Content */}
          {isQcmInfinite ? (
            <div className="flex gap-1 items-center">
              <Image
                src={infiniteIcon}
                alt="Infini"
                width={20}
                height={12}
                className="w-[22px]"
                style={{ height: "auto" }}
              />
              <span className="text-[#F8589F] font-[500] text-[17px]">QCM</span>
            </div>
          ) : (
            <span className="text-[#191919] font-[500] text-[17px] flex items-center gap-[3px]">
              {remainingMcqs} <span className="text-[#F8589F]">QCM</span>
            </span>
          )}
        </div>
        <div
          id="tour-qroc-display"
          className={`flex items-center rounded-md ${
            isHighlighted("tour-qroc-display") ? "tour-highlight-active" : ""
          } ${highlightPaddingClass("tour-qroc-display")}`}
        >
          <span className="text-[#191919] font-[500] text-[17px] flex items-center gap-[3px]">
            {remainingQrocs} <span className="text-[#F8589F]">QROC</span>
          </span>
        </div>
        <div
          id="tour-streak-display"
          className={`flex items-center gap-1 rounded-md ${
            isHighlighted("tour-streak-display") ? "tour-highlight-active" : ""
          } ${highlightPaddingClass("tour-streak-display")}`}
        >
          <span className="text-[#191919] font-[500] text-[17px]">
            {currentStreak}
          </span>
          <Image
            src={streakIcon}
            alt="série"
            className="w-[13px] h-[13px] object-contain"
            width={13}
            height={13}
          />
        </div>
        <div
          id="tour-xp-display"
          className={`flex items-center rounded-md ${
            isHighlighted("tour-xp-display") ? "tour-highlight-active" : ""
          } ${highlightPaddingClass("tour-xp-display")}`}
        >
          <span className="text-[#191919] font-[500] text-[17px] flex items-center gap-[3px]">
            {currentXp} <span className="text-[#F8589F]">XP</span>
          </span>
        </div>
      </div>

      {/* For mobile screens */}
      {isMobileView &&
        isTourActive &&
        highlightedElementInfo?.id === "tour-notification-icon" && (
          <div
            id="tour-notification-icon-mobile"
            className={`absolute right-6 top-4 flex items-center justify-center w-[36px] h-[36px] rounded-full 
              ${
                isHighlighted("tour-notification-icon")
                  ? "tour-highlight-active"
                  : ""
              }
            `}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.02 2.91C8.71 2.91 6.02 5.6 6.02 8.91V11.8C6.02 12.41 5.76 13.34 5.45 13.86L4.3 15.77C3.59 16.95 4.08 18.26 5.38 18.7C9.69 20.14 14.34 20.14 18.65 18.7C19.86 18.3 20.39 16.87 19.73 15.77L18.58 13.86C18.28 13.34 18.02 12.41 18.02 11.8V8.91C18.02 5.61 15.32 2.91 12.02 2.91Z"
                stroke="#292D32"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
              />
              <path
                d="M13.87 3.2C13.56 3.11 13.24 3.04 12.91 3C11.95 2.88 11.03 2.95 10.17 3.2C10.46 2.46 11.18 1.94 12.02 1.94C12.86 1.94 13.58 2.46 13.87 3.2Z"
                stroke="#292D32"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15.02 19.06C15.02 20.71 13.67 22.06 12.02 22.06C11.2 22.06 10.44 21.72 9.9 21.18C9.36 20.64 9.02 19.88 9.02 19.06"
                stroke="#292D32"
                strokeWidth="1.5"
                strokeMiterlimit="10"
              />
            </svg>
          </div>
        )}

      {/* Mobile help text */}
      {isMobileView &&
        isTourActive &&
        !document.getElementById(highlightedElementInfo?.id) && (
          <div className="hidden-element-note text-sm text-gray-500 italic ml-auto">
            {(highlightedElementInfo?.id === "tour-qcm-display" ||
              highlightedElementInfo?.id === "tour-qroc-display" ||
              highlightedElementInfo?.id === "tour-streak-display" ||
              highlightedElementInfo?.id === "tour-xp-display") &&
              "Cliquez sur menu pour voir cet élément →"}
          </div>
        )}
    </div>
  );
};
export default Dash_Onboarding;
