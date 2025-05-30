"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import secureLocalStorage from "react-secure-storage";
import BaseUrl from "../BaseUrl";
import Notification from "./Notification";
import streakIcon from "../../../public/Icons/streak.svg";
import notificationIcon from "../../../public/Icons/notification.svg";
import infiniteIcon from "../../../public/Icons/infinite.svg";

const isUuidV4 = (str) => {
  if (typeof str !== "string") return false;
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(str);
};

const Dash_Header = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const token = isClient ? secureLocalStorage.getItem("token") || null : null;

  useEffect(() => {
    setIsClient(true);
    setIsNotificationOpen(false);
  }, [pathname]);

  const fetchData = async (url) => {
    if (!token) {
      return null;
    }
    try {
      const response = await BaseUrl.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error(
        `Fetch Error ${url}:`,
        error.response?.data || error.message || error
      );
      return null;
    }
  };

  const { data: userData } = useQuery({
    queryKey: ["user"],
    queryFn: () => fetchData("/user/me"),
    enabled: !!token && isClient,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 seconds instead of 5 minutes
    refetchInterval: 1000 * 60, // Refetch every minute
  });

  const isOnboardingComplete = userData
    ? userData.completed_introduction ?? true
    : true;

  const queryOptionsConditional = {
    enabled: !!token && isOnboardingComplete && isClient,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 seconds instead of 5 minutes
    refetchInterval: 1000 * 60, // Refetch every minute
  };

  const { data: userNotification } = useQuery({
    queryKey: ["userNotification"],
    queryFn: () => fetchData("/notification"),
    enabled: !!token && isClient,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 15, // 15 seconds for notifications
    refetchInterval: 1000 * 30, // Refetch every 30 seconds for notifications
  });

  const { data: userSubscription } = useQuery({
    queryKey: ["userSubscription"],
    queryFn: () => fetchData("/user/subscription/me"),
    staleTime: 1000 * 30, // 30 seconds instead of 15 minutes
    refetchInterval: 1000 * 60, // Refetch every minute
    ...queryOptionsConditional,
  });

  const { data: streakData } = useQuery({
    queryKey: ["userStreak"],
    queryFn: () => fetchData("/user/streak/me"),
    refetchInterval: 1000 * 60, // Refetch every minute
    ...queryOptionsConditional,
  });

  const { data: xpData } = useQuery({
    queryKey: ["userXp"],
    queryFn: () => fetchData("/user/xp/me"),
    refetchInterval: 1000 * 60, // Refetch every minute
    ...queryOptionsConditional,
  });

  let potentialSubjectId = null;
  if (pathname?.startsWith("/dashboard/question-bank/")) {
    const parts = pathname.split("/");
    if (
      parts.length > 3 &&
      parts[2] === "question-bank" &&
      isUuidV4(parts[3])
    ) {
      potentialSubjectId = parts[3];
    }
  }

  const { data: subjectData } = useQuery({
    queryKey: ["subjectName", potentialSubjectId],
    queryFn: () => fetchData(`/subject/${potentialSubjectId}`),
    enabled: !!token && !!potentialSubjectId && isClient,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });

  const toggleNotification = () => setIsNotificationOpen(!isNotificationOpen);

  const isQcmInfinite = userSubscription?.plan?.mcqs === null;
  const remainingMcqs = userSubscription
    ? !isQcmInfinite
      ? Math.max(
          0,
          (userSubscription?.plan?.mcqs ?? 0) -
            (userSubscription?.used_mcqs ?? 0)
        )
      : null
    : 0;
  const remainingQrocs = userSubscription
    ? Math.max(
        0,
        (userSubscription?.plan?.qrocs ?? 0) -
          (userSubscription?.used_qrocs ?? 0)
      )
    : 0;
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
              <span className="text-[#F8589F]">
                {userName || "Utilisateur"}!
              </span>
            </>
          ) : (
            <>
              <span className="text-[#191919]">Bon retour </span>
              <span className="text-[#F8589F]">
                {userName || "Utilisateur"}!
              </span>
            </>
          )}
        </span>
      );
    } else if (pathname && pathname.startsWith("/dashboard/")) {
      const subPath = pathname.substring("/dashboard/".length);
      const pathParts = subPath.split("/").filter((part) => part.length > 0);

      if (pathParts.length === 0 && pathname === "/dashboard/") {
        return (
          <span className="font-[500] text-[16px] flex items-center">
            <span className="text-[#B5BEC6]">/</span>
            <span className="text-[#B5BEC6] ml-1">Dashboard</span>
          </span>
        );
      }

      return (
        <span className="font-[500] text-[16px] flex items-center max-md:hidden">
          {pathParts.length > 0 && <span className="text-[#B5BEC6]">/</span>}
          {pathParts.map((part, index) => {
            const isFirst = index === 0;
            const isLast = index === pathParts.length - 1;
            const linkHref = `/dashboard/${pathParts
              .slice(0, index + 1)
              .join("/")}`;
            const decodedPart = decodeURIComponent(part);
            const textColorClass = isFirst
              ? "text-[#B5BEC6]"
              : "text-[#F8589F]";
            const isSubjectIdSegment =
              index > 0 &&
              pathParts[index - 1] === "question-bank" &&
              isUuidV4(part);
            const isThisFetchedSubjectId =
              isSubjectIdSegment && part === potentialSubjectId;
            let displayPartContent = decodedPart;

            if (isClient && isThisFetchedSubjectId) {
              displayPartContent = subjectData?.name || decodedPart;
            }

            return (
              <React.Fragment key={linkHref}>
                {" "}
                <Link
                  href={linkHref}
                  className={`${textColorClass} hover:underline mx-1`}
                >
                  {displayPartContent}
                </Link>{" "}
                {!isLast && <span className="text-[#B5BEC6]">/</span>}{" "}
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
    <div className="relative flex items-center justify-between py-5 px-6 max-md:pt-4">
      {renderHeaderText()}

      <div className="flex items-center gap-10 max-md:hidden">
        <Image
          id="tour-notification-icon"
          src={notificationIcon}
          alt="notification"
          className="w-[16px] cursor-pointer"
          onClick={toggleNotification}
          width={16}
          height={16}
          style={{ height: "auto" }}
        />

        <div id="tour-qcm-display">
          {userSubscription && isQcmInfinite ? (
            <div className="flex gap-1">
              <Image
                src={infiniteIcon}
                alt="Infini"
                width={20}
                height={12}
                className="w-[22px]"
                style={{ height: "auto" }}
              />
              <span className="text-[#F8589F] font-[500] text-[17px] flex items-center">
                QCM
              </span>
            </div>
          ) : (
            <span className="text-[#191919] font-[500] text-[17px] flex items-center gap-[3px]">
              {remainingMcqs} <span className="text-[#F8589F]">QCM</span>
            </span>
          )}
        </div>

        <div id="tour-qroc-display">
          <span className="text-[#191919] font-[500] text-[17px] flex items-center gap-[3px]">
            {remainingQrocs} <span className="text-[#F8589F]">QROC</span>
          </span>
        </div>

        <div id="tour-streak-display" className="flex items-center gap-1">
          <span className="text-[#191919] font-[500] text-[17px]">
            {" "}
            {currentStreak}{" "}
          </span>
          <Image
            src={streakIcon}
            alt="série"
            className="w-[13px]"
            width={13}
            height={13}
            style={{ height: "auto" }}
          />
        </div>

        <div id="tour-xp-display">
          <span className="text-[#191919] font-[500] text-[17px] flex items-center gap-[3px]">
            {currentXp} <span className="text-[#F8589F]">XP</span>
          </span>
        </div>
      </div>

      {isNotificationOpen && (
        <Notification
          onClose={toggleNotification}
          notifications={userNotification || []}
        />
      )}
    </div>
  );
};

export default Dash_Header;
