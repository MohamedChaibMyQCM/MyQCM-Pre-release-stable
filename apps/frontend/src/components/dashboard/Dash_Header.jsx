"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import secureLocalStorage from "react-secure-storage";
import BaseUrl from "../BaseUrl";
import Notification from "./Notification";
import { ThemeToggle } from "../ui/ThemeToggle";
import streakIcon from "../../../public/Icons/streak.svg";
import notificationIcon from "../../../public/Icons/notification.svg";
import infiniteIcon from "../../../public/Icons/infinite.svg";
import { motion, AnimatePresence } from "framer-motion";
import { useWhatsNew } from "@/hooks/useWhatsNew";
import WhatsNewModal from "@/components/onboarding-v2/WhatsNewModal";

const isUuidV4 = (str) => {
  if (typeof str !== "string") return false;
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(str);
};

const Dash_Header = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [hoveredCounter, setHoveredCounter] = useState(null);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const pathname = usePathname();
  const token = isClient ? secureLocalStorage.getItem("token") || null : null;

  // What's New hook
  const { hasNewFeatures } = useWhatsNew();

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

  const CounterTooltip = ({ title, description, isVisible, alignRight = false }) => (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={`absolute top-full mt-2 z-50 pointer-events-none ${
            alignRight ? 'right-0' : 'left-1/2 transform -translate-x-1/2'
          }`}
        >
          <div className="bg-card rounded-[12px] shadow-lg border-2 border-border px-4 py-3 min-w-[200px] max-w-[240px]"
          >
            <p className="text-[13px] font-bold text-card-foreground mb-1">{title}</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p>
            <div className={`absolute -top-2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-card ${
              alignRight ? 'right-4' : 'left-1/2 transform -translate-x-1/2'
            }`}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const notificationsArray = userNotification?.data || [];
  const unreadCount = notificationsArray.filter(
    (notification) => notification.status === "pending"
  ).length;
  const totalCount = notificationsArray.length;

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
              <span className="text-foreground">Bienvenue </span>
              <span className="text-primary">
                {userName || "Utilisateur"}!
              </span>
            </>
          ) : (
            <>
              <span className="text-foreground">Bon retour </span>
              <span className="text-primary">
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
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground ml-1">Dashboard</span>
          </span>
        );
      }

      return (
        <span className="font-[500] text-[16px] flex items-center max-md:hidden">
          {pathParts.length > 0 && <span className="text-muted-foreground">/</span>}
          {pathParts.map((part, index) => {
            const isFirst = index === 0;
            const isLast = index === pathParts.length - 1;
            const linkHref = `/dashboard/${pathParts
              .slice(0, index + 1)
              .join("/")}`;
            const decodedPart = decodeURIComponent(part);
            const textColorClass = isFirst
              ? "text-muted-foreground"
              : "text-primary";
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
                {!isLast && <span className="text-muted-foreground">/</span>}{" "}
              </React.Fragment>
            );
          })}
        </span>
      );
    } else {
      return (
        <span className="text-foreground font-[500] text-[18px]">
          {pathname}
        </span>
      );
    }
  };

  return (
    <div className="relative flex items-center justify-between py-5 px-6 max-md:pt-4">
      {renderHeaderText()}

      {/* Mobile/Tablet Theme Toggle - only visible on small screens */}
      <div className="md:hidden">
        <ThemeToggle />
      </div>

      <div className="flex items-center gap-10 max-md:hidden">
        <ThemeToggle />

        <div className="relative">
          <Image
            id="tour-notification-icon"
            src={notificationIcon}
            alt="notification"
            className="w-[16px] cursor-pointer hover:opacity-70 transition-opacity dark:invert"
            onClick={toggleNotification}
            width={16}
            height={16}
            style={{ height: "auto" }}
          />
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}
        </div>

        {/* What's New Button */}
        <div className="relative">
          <button
            onClick={() => setIsWhatsNewOpen(true)}
            className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all hover:scale-105 focus-ring group"
            aria-label="Voir les nouveautés"
          >
            <span className="text-lg">✨</span>
            <span className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors">
              Nouveautés
            </span>
            {hasNewFeatures && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
            )}
          </button>
        </div>

        <div
          id="tour-qcm-display"
          className="relative"
          onMouseEnter={() => setHoveredCounter('qcm')}
          onMouseLeave={() => setHoveredCounter(null)}
        >
          {userSubscription && isQcmInfinite ? (
            <div className="flex gap-1 cursor-pointer transition-transform hover:scale-105">
              <Image
                src={infiniteIcon}
                alt="Infini"
                width={20}
                height={12}
                className="w-[22px] dark:invert"
                style={{ height: "auto" }}
              />
              <span className="text-primary font-[500] text-[17px] flex items-center">
                QCM
              </span>
            </div>
          ) : (
            <span className="text-foreground font-[500] text-[17px] flex items-center gap-[3px] cursor-pointer transition-transform hover:scale-105">
              {remainingMcqs} <span className="text-primary">QCM</span>
            </span>
          )}
          <CounterTooltip
            title="Questions à Choix Multiples"
            description={isQcmInfinite ? "Profitez de QCM illimités ! Pratiquez autant que vous le souhaitez pour maîtriser vos examens." : `Il vous reste ${remainingMcqs} QCM. Pratiquez intelligemment et réussissez vos examens !`}
            isVisible={hoveredCounter === 'qcm'}
          />
        </div>

        <div
          id="tour-qroc-display"
          className="relative"
          onMouseEnter={() => setHoveredCounter('qroc')}
          onMouseLeave={() => setHoveredCounter(null)}
        >
          <span className="text-foreground font-[500] text-[17px] flex items-center gap-[3px] cursor-pointer transition-transform hover:scale-105">
            {remainingQrocs} <span className="text-primary">QROC</span>
          </span>
          <CounterTooltip
            title="Questions Rédactionnelles"
            description={`${remainingQrocs} QROC disponibles. Maîtrisez le raisonnement clinique avec nos questions ouvertes !`}
            isVisible={hoveredCounter === 'qroc'}
          />
        </div>

        <div
          id="tour-streak-display"
          className="relative flex items-center gap-1"
          onMouseEnter={() => setHoveredCounter('streak')}
          onMouseLeave={() => setHoveredCounter(null)}
        >
          <span className="text-foreground font-[500] text-[17px] cursor-pointer transition-transform hover:scale-105">
            {currentStreak}
          </span>
          <Image
            src={streakIcon}
            alt="série"
            className="w-[13px] cursor-pointer"
            width={13}
            height={13}
            style={{ height: "auto" }}
          />
          <CounterTooltip
            title="Série Quotidienne"
            description={currentStreak > 0 ? `${currentStreak} jour${currentStreak > 1 ? 's' : ''} consécutif${currentStreak > 1 ? 's' : ''} ! Continuez sur votre lancée pour développer une habitude d'apprentissage solide.` : "Commencez votre série aujourd'hui ! Pratiquez chaque jour pour développer une routine gagnante."}
            isVisible={hoveredCounter === 'streak'}
            alignRight={true}
          />
        </div>

        <div
          id="tour-xp-display"
          className="relative"
          onMouseEnter={() => setHoveredCounter('xp')}
          onMouseLeave={() => setHoveredCounter(null)}
        >
          <span className="text-foreground font-[500] text-[17px] flex items-center gap-[3px] cursor-pointer transition-transform hover:scale-105">
            {currentXp} <span className="text-primary">XP</span>
          </span>
          <CounterTooltip
            title="Points d'Expérience"
            description={`${currentXp} XP accumulés. Montez en niveau et débloquez de nouvelles récompenses en continuant votre apprentissage !`}
            isVisible={hoveredCounter === 'xp'}
            alignRight={true}
          />
        </div>
      </div>

      {isNotificationOpen && (
        <Notification
          onClose={toggleNotification}
          notifications={notificationsArray}
        />
      )}

      {/* What's New Modal */}
      <WhatsNewModal
        isOpen={isWhatsNewOpen}
        onClose={() => setIsWhatsNewOpen(false)}
      />
    </div>
  );
};

export default Dash_Header;
