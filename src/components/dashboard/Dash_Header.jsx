"use client";

import Image from "next/image";
import streak from "../../../public/Icons/streak.svg";
import notification from "../../../public/Icons/notification.svg";
import infinite from "../../../public/Icons/infinite.svg";
import Notification from "./Notification";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import BaseUrl from "../BaseUrl";
import secureLocalStorage from "react-secure-storage";

const Dash_Header = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const { data: userData } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      // Added basic token check
      if (!token) return null;
      const response = await BaseUrl.get("/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    },
  });

  const { data: userNotification } = useQuery({
    queryKey: ["userNotification"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      if (!token) return null;
      const response = await BaseUrl.get("/notification", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    },
  });

  const { data: userSubscription } = useQuery({
    queryKey: ["userSubscription"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      if (!token) return null;
      const response = await BaseUrl.get("/user/subscription/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    },
  });

  const { data: streakData } = useQuery({
    queryKey: ["userStreak"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      if (!token) return null;
      const response = await BaseUrl.get("/user/streak/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    },
  });

  const { data: xpData } = useQuery({
    queryKey: ["userXp"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      if (!token) return null;
      const response = await BaseUrl.get("/user/xp/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    },
  });

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const isQcmInfinite = userSubscription?.plan?.mcqs === null;
  const remainingMcqs = !isQcmInfinite
    ? (userSubscription?.plan?.mcqs ?? 0) - (userSubscription?.used_mcqs ?? 0)
    : null;

  return (
    <div className="relative flex items-center justify-between py-5 px-6">
      <span className="text-[#191919] font-[600] text-[18px]">
        Bon retour{" "}
        <span className="text-[#F8589F]">{userData?.name ?? ""}!</span>{" "}
      </span>
      <div className="flex items-center gap-10 max-md:hidden">
        <Image
          src={notification}
          alt="notification"
          className="w-[16px] cursor-pointer"
          onClick={toggleNotification}
          width={16}
          height={16}
        />
        <div>
          <span className="text-[#191919] font-[500] text-[17px] flex items-center gap-[3px]">
            {isQcmInfinite ? (
              <Image
                src={infinite}
                alt="Infini"
                width={20}
                height={12}
                className="w-[22px]" 
              />
            ) : (
              remainingMcqs 
            )}
            <span className="text-[#F8589F]">QCM</span>
          </span>
        </div>
        {/* End QCM Display Logic */}
        <div>
          <span className="text-[#191919] font-[500] text-[17px] flex items-center gap-[3px]">
            {/* Apply same logic for QROC if needed, otherwise keep original */}
            {(userSubscription?.plan?.qrocs ?? 0) -
              (userSubscription?.used_qrocs ?? 0)}
            <span className="text-[#F8589F]">QROC</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[#191919] font-[500] text-[17px]">
            {streakData?.current_streak ?? 0}
          </span>
          <Image
            src={streak}
            alt="série"
            className="w-[13px]"
            width={13}
            height={13}
          />
        </div>
        <div>
          <span className="text-[#191919] font-[500] text-[17px] flex items-center gap-[3px]">
            {xpData?.xp ?? 0}
            <span className="text-[#F8589F]">XP</span>
          </span>
        </div>
      </div>

      {isNotificationOpen && (
        <Notification
          onClose={toggleNotification}
          notifications={userNotification}
        />
      )}
    </div>
  );
};

export default Dash_Header;
