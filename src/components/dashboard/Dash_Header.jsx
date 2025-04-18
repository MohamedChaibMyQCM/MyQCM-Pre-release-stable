"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react"; // Import React and hooks
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import secureLocalStorage from "react-secure-storage";

// Local Imports (Ensure paths are correct)
import BaseUrl from "../BaseUrl";
import Notification from "./Notification"; // Keep your Notification component import

// Image Imports (Using your paths)
import streak from "../../../public/Icons/streak.svg";
import notificationIcon from "../../../public/Icons/notification.svg"; // Use distinct name
import infinite from "../../../public/Icons/infinite.svg";

// Helper function to check if a string looks like a UUID v4
const isUuidV4 = (str) => {
  if (typeof str !== "string") return false;
  // Regex for UUID v4
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(str);
};

const Dash_Header = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const pathname = usePathname();

  // --- Close notification on path change ---
  useEffect(() => {
    setIsNotificationOpen(false);
  }, [pathname]);

  // --- Data Fetching Function (Keep As Is) ---
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
      // IMPORTANT: Adjust based on your API structure (response.data.data vs response.data)
      return response.data.data || response.data;
    } catch (error) {
      console.error(
        `Failed to fetch ${url}:`,
        error.response?.data || error.message || error
      );
      return null;
    }
  };

  // --- Base Queries (User, Notifications, etc.) (Keep As Is) ---
  const queryOptions = {
    enabled: !!secureLocalStorage.getItem("token"),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  };

  const { data: userData } = useQuery({
    queryKey: ["user"],
    queryFn: () => fetchData("/user/me"),
    ...queryOptions,
  });

  const { data: userNotification } = useQuery({
    queryKey: ["userNotification"],
    queryFn: () => fetchData("/notification"),
    ...queryOptions,
  });

  const { data: userSubscription } = useQuery({
    queryKey: ["userSubscription"],
    queryFn: () => fetchData("/user/subscription/me"),
    staleTime: 1000 * 60 * 15,
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

  // --- Find Potential Subject ID for Fetching ---
  let potentialSubjectId = null;
  if (pathname && pathname.startsWith("/dashboard/question-bank/")) {
    const parts = pathname.split("/");
    if (
      parts.length > 3 &&
      parts[2] === "question-bank" &&
      isUuidV4(parts[3])
    ) {
      potentialSubjectId = parts[3];
    }
  }

  // --- Conditional Query for Subject Name (ONLY runs if ID found) ---
  const { data: subjectData, isLoading: isLoadingSubject } = useQuery({
    queryKey: ["subjectName", potentialSubjectId], // Query key includes ID
    queryFn: () => fetchData(`/subject/${potentialSubjectId}`),
    enabled: !!potentialSubjectId, // *** Crucial: Only runs if potentialSubjectId is not null ***
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    refetchOnWindowFocus: false,
  });

  // --- Handlers (Keep As Is) ---
  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  // --- Derived Data (Keep As Is) ---
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
  const userName = userData?.name ?? "";

  // --- renderHeaderText FUNCTION (MODIFIED TO INCLUDE SUBJECT NAME LOGIC) ---
  const renderHeaderText = () => {
    // 1. Welcome message (Your Original Logic)
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
    }
    // 2. Breadcrumb Logic (Modified)
    else if (pathname && pathname.startsWith("/dashboard/")) {
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

      // Render breadcrumbs using your existing structure
      return (
        <span className="font-[500] text-[16px] flex items-center">
          {" "}
          {/* YOUR ORIGINAL SPAN */}
          {/* Show initial slash if pathParts exist */}
          {pathParts.length > 0 && <span className="text-[#B5BEC6]">/</span>}
          {pathParts.map((part, index) => {
            const isFirst = index === 0; // Your Original logic
            const isLast = index === pathParts.length - 1; // Your Original logic
            const linkHref = `/dashboard/${pathParts
              .slice(0, index + 1)
              .join("/")}`;
            const decodedPart = decodeURIComponent(part);
            // Default color logic (Your Original)
            const textColorClass = isFirst
              ? "text-[#B5BEC6]"
              : "text-[#F8589F]";

            // --- Determine if THIS part is the Subject ID we are fetching ---
            const isSubjectIdSegment =
              index > 0 &&
              pathParts[index - 1] === "question-bank" &&
              isUuidV4(part);
            const isThisFetchedSubjectId =
              isSubjectIdSegment && part === potentialSubjectId;

            // --- Determine display text ---
            let displayPartContent = decodedPart; // Default to the original part
            if (isThisFetchedSubjectId) {
              if (isLoadingSubject) {
                displayPartContent = "Chargement..."; // Loading state
              } else if (subjectData?.name) {
                displayPartContent = subjectData.name; // Fetched name!
              } else {
                // Error or no name returned, fallback to the decoded ID
                displayPartContent = decodedPart;
              }
            }

            // *** Render using your EXACT original React.Fragment structure ***
            return (
              <React.Fragment key={linkHref}>
                {" "}
                {/* Your Original Fragment & key */}
                <Link
                  href={linkHref}
                  // Apply your original classes EXACTLY
                  className={`${textColorClass} hover:underline mx-1`}
                >
                  {/* Display the dynamically determined text */}
                  {displayPartContent}
                </Link>
                {/* Your original slash separator logic */}
                {!isLast && <span className="text-[#B5BEC6]">/</span>}
              </React.Fragment>
            );
          })}
        </span>
      );
    }
    // 3. Fallback (Your Original Logic)
    else {
      return (
        <span className="text-[#191919] font-[500] text-[18px]">
          {pathname}
        </span>
      );
    }
  };

  // --- RETURN JSX (Using YOUR Original Structure) ---
  return (
    <div className="relative flex items-center justify-between py-5 px-6">
      {" "}
      {/* YOUR ORIGINAL WRAPPER */}
      {renderHeaderText()} {/* Renders welcome or breadcrumbs */}
      {/* YOUR ORIGINAL Desktop Stats Section */}
      <div className="flex items-center gap-10 max-md:hidden">
        {/* Your Original Notification Icon Structure */}
        <Image
          src={notificationIcon} // Use variable
          alt="notification"
          className="w-[16px] cursor-pointer"
          onClick={toggleNotification}
          width={16} // Add dimensions
          height={16} // Add dimensions
        />

        {/* Your Original QCM Display */}
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
              remainingMcqs ?? 0 // Handle null
            )}
            <span className="text-[#F8589F]">QCM</span>
          </span>
        </div>

        {/* Your Original QROC Display */}
        <div>
          <span className="text-[#191919] font-[500] text-[17px] flex items-center gap-[3px]">
            {remainingQrocs ?? 0} {/* Handle null */}
            <span className="text-[#F8589F]">QROC</span>
          </span>
        </div>

        {/* Your Original Streak Display */}
        <div className="flex items-center gap-1">
          <span className="text-[#191919] font-[500] text-[17px]">
            {currentStreak}
          </span>
          <Image
            src={streak}
            alt="série"
            className="w-[13px]"
            width={13} // Add dimensions
            height={13} // Add dimensions
          />
        </div>

        {/* Your Original XP Display */}
        <div>
          <span className="text-[#191919] font-[500] text-[17px] flex items-center gap-[3px]">
            {currentXp}
            <span className="text-[#F8589F]">XP</span>
          </span>
        </div>
      </div>{" "}
      {/* End original stats section */}
      {/* Notification Popup (Your Original conditional render) */}
      {/* ENSURE YOUR Notification COMPONENT has the correct absolute positioning classes */}
      {isNotificationOpen && (
        <Notification
          onClose={toggleNotification}
          notifications={userNotification || []} // Pass data or empty array
        />
      )}
    </div> // End original main wrapper
  );
};

export default Dash_Header;
