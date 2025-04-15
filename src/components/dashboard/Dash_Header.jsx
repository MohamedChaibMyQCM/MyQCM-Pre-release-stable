"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react"; 
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import secureLocalStorage from "react-secure-storage";
import streak from "../../../public/Icons/streak.svg";
import notification from "../../../public/Icons/notification.svg"; 
import infinite from "../../../public/Icons/infinite.svg";
import Notification from "./Notification";
import BaseUrl from "../BaseUrl";

const Dash_Header = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const pathname = usePathname();

  const fetchData = async (url) => {
    const token = secureLocalStorage.getItem("token");
     if (!token || typeof token !== 'string') {
       console.warn(`No valid token found in secureLocalStorage for fetching ${url}.`);
       return null;
     }
    try {
      const response = await BaseUrl.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch ${url}:`, error.response?.data || error.message || error);
      return null;
    }
  };

  const { data: userData } = useQuery({
    queryKey: ["user"],
    queryFn: () => fetchData("/user/me"),
  });

  const { data: userNotification } = useQuery({
    queryKey: ["userNotification"],
    queryFn: () => fetchData("/notification"),
  });

  const { data: userSubscription } = useQuery({
    queryKey: ["userSubscription"],
    queryFn: () => fetchData("/user/subscription/me"),
  });

  const { data: streakData } = useQuery({
    queryKey: ["userStreak"],
    queryFn: () => fetchData("/user/streak/me"),
  });

  const { data: xpData } = useQuery({
    queryKey: ["userXp"],
    queryFn: () => fetchData("/user/xp/me"),
  });

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };


  const isQcmInfinite = userSubscription?.plan?.mcqs === null;
  const remainingMcqs = !isQcmInfinite
    ? (userSubscription?.plan?.mcqs ?? 0) - (userSubscription?.used_mcqs ?? 0)
    : null;
  const remainingQrocs = (userSubscription?.plan?.qrocs ?? 0) - (userSubscription?.used_qrocs ?? 0);
  const currentStreak = streakData?.current_streak ?? 0;
  const currentXp = xpData?.xp ?? 0;
  const userName = userData?.name ?? ""; 

  const renderHeaderText = () => {
    if (pathname === "/dashboard") {
      return (
        <span className="font-[500] text-[18px]">
          {!userData?.completed_introduction ? (
            <> 
              <span className="text-[#191919]">Bienvenue </span>
              <span className="text-[#F8589F]">{userName}!</span>
            </>
          ) : (
            <> 
              <span className="text-[#191919]">Bon retour </span>
              <span className="text-[#F8589F]">{userName}!</span>
            </>
          )}
        </span>
      );
    } else if (pathname && pathname.startsWith("/dashboard/")) {
      const subPath = pathname.substring("/dashboard/".length);
      const pathParts = subPath.split("/").filter((part) => part.length > 0);

       if (pathParts.length === 0 && pathname === '/dashboard/') {
          return (
            <span className="font-[500] text-[18px] flex items-center">
                <span className="text-[#B5BEC6]">/</span>
                <span className="text-[#B5BEC6] ml-1">Dashboard</span>
            </span>
           );
       }

      return (
        <span className="font-[500] text-[18px] flex items-center">
          <span className="text-[#B5BEC6]">/</span>
          {pathParts.map((part, index) => {
            const isFirst = index === 0; 
            const isLast = index === pathParts.length - 1;
            const linkHref = `/dashboard/${pathParts.slice(0, index + 1).join("/")}`;
            const displayPart = decodeURIComponent(part); 
            const textColorClass = isFirst ? "text-[#B5BEC6]" : "text-[#F8589F]";

            return (
              <React.Fragment key={linkHref}>
                  <Link
                  href={linkHref}
                  className={`${textColorClass} hover:underline mx-1`}
                >
                  {displayPart}
                </Link>
                {!isLast && <span className="text-[#B5BEC6]">/</span>}
              </React.Fragment>
            );
          })}
        </span>
      );
    } else {
      return (
        <span className="text-[#191919] font-[500] text-[18px]">
          {pathname}
        </span>
      );
    }
  };

  return (
    <div className="relative flex items-center justify-between py-5 px-6"> 
      {renderHeaderText()}
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
        <div>
          <span className="text-[#191919] font-[500] text-[17px] flex items-center gap-[3px]">
            {remainingQrocs}
            <span className="text-[#F8589F]">QROC</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
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
        <div>
          <span className="text-[#191919] font-[500] text-[17px] flex items-center gap-[3px]">
            {currentXp} 
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