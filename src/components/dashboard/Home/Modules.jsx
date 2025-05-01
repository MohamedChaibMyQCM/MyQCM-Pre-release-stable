"use client";

import Image from "next/image";
import right_arrow from "../../../../public/Home/rigth_arrow.svg"; // Ensure paths are correct
import left_arrow from "../../../../public/Home/left_arrow.svg";
import play from "../../../../public/Home/pink_play.svg";
import module1 from "../../../../public/Home/module1.avif";
import module2 from "../../../../public/Home/module2.avif";
import module3 from "../../../../public/Home/module3.avif";
import module4 from "../../../../public/Home/module4.avif";
import { useState, useRef, useEffect, useCallback } from "react"; // Added useCallback
import secureLocalStorage from "react-secure-storage";
import BaseUrl from "@/components/BaseUrl";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/Loading";
import Link from "next/link";

// Helper function (no changes needed)
const extractAndTruncateUnitName = (fullUnitName) => {
  if (!fullUnitName || typeof fullUnitName !== "string") {
    return "Unité inconnue";
  }
  let namePart = fullUnitName;
  const colonIndex = fullUnitName.indexOf(":");
  if (colonIndex !== -1) {
    namePart = fullUnitName.substring(colonIndex + 1).trim();
  } else {
    namePart = namePart.trim();
  }
  if (namePart.length > 30) {
    return namePart.slice(0, 29) + "...";
  }
  return namePart || "Unité spécifiée";
};

const Modules = () => {
  // Removed currentIndex state as transform is no longer used for positioning
  // const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollContainerRef = useRef(null); // Ref for the scrollable container
  const containerRef = useRef(null); // Ref for the outer container width check

  const ITEM_WIDTH = 240; // Width of each module card
  const GAP = 16; // Gap between cards (in px)

  // --- Data Fetching (no changes) ---
  const {
    data: profileData,
    isLoading: isProfileLoading,
    // isFetching: isProfileFetching, // Can be removed if not used
    error: profileError,
  } = useQuery({
    queryKey: ["userProfileModules"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      if (!token) return null;
      try {
        const response = await BaseUrl.get("/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data;
      } catch (error) {
        console.error("Error fetching profile:", error); // Added console log
        throw error;
      }
    },
    retry: 1, // Retry once on failure
  });

  const {
    data: subjectsData = [],
    isLoading: isSubjectsLoading,
    // isFetching: isSubjectsFetching, // Can be removed if not used
    error: subjectsError,
  } = useQuery({
    queryKey: ["subjects", profileData?.unit?.id],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      // Ensure profileData and unit.id exist before fetching
      if (!token || !profileData?.unit?.id) {
        return [];
      }
      try {
        const response = await BaseUrl.get(
          `/subject/me?unit=${profileData.unit.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return response.data?.data?.data || [];
      } catch (error) {
        console.error("Error fetching subjects:", error); // Added console log
        throw error;
      }
    },
    enabled: !!profileData?.unit?.id, // Only run query if unit.id exists
    retry: 1, // Retry once on failure
  });

  // --- Data Mapping (no changes) ---
  const modulesData =
    subjectsData.length > 0 && profileData?.unit?.name
      ? subjectsData.map((subject, index) => {
          const fullUnitName = profileData.unit.name;
          const displayUnitName = extractAndTruncateUnitName(fullUnitName);
          return {
            id: subject.id || `fallback-${index}`,
            image: [module1, module2, module3, module4][index % 4],
            title: subject.name || "Matière inconnue",
            unit: displayUnitName,
            fullUnitForTitle: fullUnitName,
            progress: subject.progress_percentage ?? 0,
            views: `+${subject.total_xp ?? 0} Xp`,
            subjectId: subject.id,
          };
        })
      : [];

  // --- Scroll Button State Update Logic ---
  const checkScrollButtons = useCallback(() => {
    const element = scrollContainerRef.current;
    if (element) {
      // Check if scrollable at all
      const isScrollable = element.scrollWidth > element.clientWidth;
      if (!isScrollable) {
        setCanScrollPrev(false);
        setCanScrollNext(false);
        return;
      }
      // Use a small tolerance (e.g., 1px) for floating point inaccuracies
      const tolerance = 1;
      setCanScrollPrev(element.scrollLeft > tolerance);
      setCanScrollNext(
        element.scrollLeft <
          element.scrollWidth - element.clientWidth - tolerance
      );
    } else {
      setCanScrollPrev(false);
      setCanScrollNext(false);
    }
  }, []); // No dependencies needed if it only reads refs

  // --- Effects ---
  // Effect to update scroll buttons on mount, resize, and data change
  useEffect(() => {
    const scrollElement = scrollContainerRef.current;
    checkScrollButtons(); // Initial check

    // Add event listener for resize
    window.addEventListener("resize", checkScrollButtons);
    // Add event listener for scroll events on the container
    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkScrollButtons);
    }

    // Cleanup function
    return () => {
      window.removeEventListener("resize", checkScrollButtons);
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", checkScrollButtons);
      }
    };
  }, [modulesData.length, checkScrollButtons]); // Rerun when data length changes or function reference changes

  // --- Scroll Button Handlers ---
  const scrollSmoothly = (amount) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: amount,
        behavior: "smooth",
      });
    }
  };

  const nextSlide = () => {
    // Scroll by approx one item width + gap
    const scrollAmount = ITEM_WIDTH + GAP;
    scrollSmoothly(scrollAmount);
  };

  const prevSlide = () => {
    // Scroll back by approx one item width + gap
    const scrollAmount = -(ITEM_WIDTH + GAP);
    scrollSmoothly(scrollAmount);
  };

  // --- Loading and Error States ---
  const isLoading = isProfileLoading || (!!profileData && isSubjectsLoading);
  const hasError = profileError || (!!profileData && subjectsError);

  if (isLoading) {
    return (
      <div className="mt-8 px-1">
        <Loading />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="mt-8 text-center text-red-600 p-4 border border-red-300 bg-red-50 rounded-lg mx-1">
        Une erreur est survenue lors du chargement des modules. <br />
        Veuillez actualiser la page ou réessayer plus tard.
        {/* Optional: Display specific error message for debugging */}
        {/* <pre className="text-xs mt-2 text-left">{JSON.stringify(profileError || subjectsError)}</pre> */}
      </div>
    );
  }

  // Check if there are enough items to warrant showing arrows
  // This check should consider the actual container width vs scrollWidth
  // We rely on canScrollPrev/Next state updated by checkScrollButtons instead
  const showArrows = canScrollPrev || canScrollNext;

  return (
    <div id="tour-modules-section" className="mt-8" ref={containerRef}>
      {/* Header with Title and Arrows */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-[500] text-[17px] text-[#191919]">
          Continuer l&apos;apprentissage
        </h3>
        {/* Show arrows only if scrolling is possible */}
        {showArrows && (
          <div className="flex items-center gap-3">
            <button
              aria-label="Précédent"
              onClick={prevSlide}
              disabled={!canScrollPrev}
              className={`p-1 transition-opacity duration-200 ${
                !canScrollPrev
                  ? "opacity-30 cursor-not-allowed"
                  : "opacity-100 hover:bg-gray-100 rounded-full"
              }`}
            >
              <Image src={left_arrow} alt="" width={28} height={28} />
            </button>
            <button
              aria-label="Suivant"
              onClick={nextSlide}
              disabled={!canScrollNext}
              className={`p-1 transition-opacity duration-200 ${
                !canScrollNext
                  ? "opacity-30 cursor-not-allowed"
                  : "opacity-100 hover:bg-gray-100 rounded-full"
              }`}
            >
              <Image src={right_arrow} alt="" width={28} height={28} />
            </button>
          </div>
        )}
      </div>

      {/* Modules List Container */}
      {modulesData.length > 0 ? (
        // This div is now the scroll container
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 ml-3 py-2 pb-6 scrollbar-hide scroll-smooth" // Added scrollbar-hide and scroll-smooth
          // Added scroll snapping properties
          style={{
            scrollSnapType: "x mandatory", // Snap strictly to items horizontally
            WebkitOverflowScrolling: "touch", // Enable momentum scrolling on iOS
          }}
        >
          {/*
            The UL no longer needs transform or calculated width.
            It simply holds the flex items.
          */}
          <ul className="flex gap-4 flex-shrink-0">
            {" "}
            {/* Ensure ul doesn't shrink */}
            {modulesData.map((module) => (
              <li
                key={module.id}
                className="p-4 bg-[#FFFFFF] rounded-[16px] w-[240px] min-h-[270px] shadow-[0px_2px_8px_rgba(0,0,0,0.04)] flex flex-col flex-shrink-0 transition-shadow duration-300 ease-in-out hover:shadow-lg"
                // Added scroll snap alignment
                style={{ scrollSnapAlign: "start" }} // Each item aligns to the start on snap
              >
                {/* --- Card Content (no changes needed) --- */}
                <div className="relative w-full h-[96px] rounded-md overflow-hidden mb-2">
                  <Image
                    src={module.image}
                    alt={`Illustration pour ${module.title}`}
                    fill
                    sizes="224px" // ~ width of card content area
                    className="object-cover"
                    priority={false} // Set priority maybe for first few visible items if needed
                  />
                </div>
                <div className="flex flex-col flex-grow">
                  <span className="text-[#FD2E8A] text-[12px] my-2 font-semibold block bg-[#FFF5FA] rounded-[8px] px-2 py-1 w-fit">
                    {module.title}
                  </span>
                  <div className="mt-1 mb-3 flex-grow">
                    <span
                      className="text-[13px] text-[#11142D] font-[500] block"
                      title={module.fullUnitForTitle} // Keep full title on hover
                    >
                      {module.unit} {/* Truncated name */}
                    </span>
                    {/* Progress Bar */}
                    <div className="relative flex items-center w-full justify-between mt-[4px]">
                      <div className="w-[76%] h-[6px] bg-gray-200 rounded-full relative overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#F8589F] to-[#FD2E8A] rounded-full"
                          style={{ width: `${module.progress}%` }}
                        />
                      </div>
                      <span className="text-[12px] font-medium text-[#FD2E8A]">
                        {module.progress.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
                {/* Footer: Views and Play Button */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                  <span className="text-[12px] text-[#F8589F] font-[500]">
                    {module.views}
                  </span>
                  <Link
                    href={`/dashboard/question-bank/${module.subjectId}`}
                    passHref // Recommended with custom `<a>` tag
                    legacyBehavior // Required because child is `<a>` not component
                  >
                    <a
                      className="p-1 rounded-full hover:bg-pink-100 transition-colors duration-200 ease-in-out"
                      title="Commencer le module"
                      aria-label={`Commencer le module ${module.title}`}
                    >
                      <Image
                        src={play}
                        alt="" // Alt handled by aria-label on link
                        width={22}
                        height={22}
                        className="cursor-pointer"
                      />
                    </a>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        // --- No Modules Display (no changes needed) ---
        <div className="text-center py-10 px-4 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 mt-4 mx-1">
          <p className="text-lg mb-2">📚</p>
          <p>
            Aucun module d&apos;apprentissage disponible pour l&apos;unité
            actuelle.
          </p>
        </div>
      )}
    </div>
  );
};

export default Modules;
