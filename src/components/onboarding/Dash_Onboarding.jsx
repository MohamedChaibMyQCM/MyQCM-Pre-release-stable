// components/onboarding/Dash_Onboarding.js
"use client";

import Image from "next/image";
import React, { useState } from "react";
import streakIcon from "../../../public/Icons/streak.svg";
import notificationIcon from "../../../public/Icons/notification.svg";
import infiniteIcon from "../../../public/Icons/infinite.svg";

const Dash_Onboarding = ({ highlightedElementInfo, isTourActive }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
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
    isHighlighted(id) && highlightedElementInfo.addPadding ? "p-1 -m-1" : "";

  return (
    <div
      className={`relative flex items-center justify-between py-5 px-6 max-md:pt-4`}
    >
      <span className="font-[500] text-[18px] text-[#191919]">
        Bienvenue Ici
      </span>
      <div className="flex items-center gap-10 max-md:hidden">
        <Image
          id="tour-notification-icon"
          src={notificationIcon}
          alt="notification"
          className={`w-[16px] h-[16px] cursor-pointer object-contain rounded-md
            ${
              isHighlighted("tour-notification-icon")
                ? "tour-highlight-active"
                : ""
            }
            ${highlightPaddingClass("tour-notification-icon")}
          `}
          onClick={toggleNotification}
          width={16}
          height={16}
        />
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
        {/* Repeat for qroc, streak, xp */}
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
      {/* Notification component if needed */}
    </div>
  );
};
export default Dash_Onboarding;
