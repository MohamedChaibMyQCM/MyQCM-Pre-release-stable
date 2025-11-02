"use client";

import Image from "next/image";
import right_arrow from "../../../public/Home/rigth_arrow.svg";
import left_arrow from "../../../public/Home/left_arrow.svg";
import play from "../../../public/Home/pink_play.svg";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

const extractAndTruncateUnitName = (fullUnitName) => {
  if (!fullUnitName || typeof fullUnitName !== "string")
    return "Unité inconnue";
  let namePart = fullUnitName;
  const colonIndex = fullUnitName.indexOf(":");
  if (colonIndex !== -1)
    namePart = fullUnitName.substring(colonIndex + 1).trim();
  else namePart = namePart.trim();
  if (namePart.length > 30) return namePart.slice(0, 29) + "...";
  return namePart || "Unité spécifiée";
};

const Modules_onboarding = ({ highlightedElementInfo, isTourActive }) => {
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true); // Assume scrollable initially if there's data
  const scrollContainerRef = useRef(null);
  const ITEM_WIDTH = 240;
  const GAP = 16; // Corresponds to gap-4 (1rem = 16px by default in Tailwind)

  const staticProfileData = {
    unit: {
      id: "static-unit-id-123",
      name: "Unité Statique: Introduction à la Médecine",
    },
  };
  const staticSubjectsData = [
    {
      id: "subject-id-001",
      name: "Anatomie Générale",
      progress_percentage: 75,
      total_xp: 120,
    },
    {
      id: "subject-id-002",
      name: "Physiologie Cardiovasculaire",
      progress_percentage: 40,
      total_xp: 90,
    },
    {
      id: "subject-id-003",
      name: "Biochimie Métabolique",
      progress_percentage: 90,
      total_xp: 150,
    },
    {
      id: "subject-id-004",
      name: "Pharmacologie de Base",
      progress_percentage: 20,
      total_xp: 50,
    },
    {
      id: "subject-id-005",
      name: "Microbiologie Clinique",
      progress_percentage: 60,
      total_xp: 110,
    },
    {
      id: "subject-id-006",
      name: "Pathologie Spéciale",
      progress_percentage: 85,
      total_xp: 130,
    },
    // Add more modules to ensure scrolling is possible for testing
    {
      id: "subject-id-007",
      name: "Immunologie Avancée",
      progress_percentage: 50,
      total_xp: 100,
    },
    {
      id: "subject-id-008",
      name: "Génétique Médicale",
      progress_percentage: 30,
      total_xp: 70,
    },
  ];

  const moduleImages = [
    "/Home/module1.avif",
    "/Home/module2.avif",
    "/Home/module3.avif",
    "/Home/module4.avif",
  ];

  const modulesData = staticSubjectsData.map((subject, index) => ({
    id: subject.id || `fallback-${index}`,
    image: moduleImages[index % moduleImages.length], // Cycle through 4 images
    title: subject.name || "Matière inconnue",
    unit: extractAndTruncateUnitName(staticProfileData.unit.name),
    fullUnitForTitle: staticProfileData.unit.name,
    progress: subject.progress_percentage ?? 0,
    views: `+${subject.total_xp ?? 0} Xp`,
    subjectId: subject.id,
  }));

  const checkScrollButtons = useCallback(() => {
    const element = scrollContainerRef.current;
    if (element) {
      const isScrollable = element.scrollWidth > element.clientWidth;
      if (!isScrollable) {
        setCanScrollPrev(false);
        setCanScrollNext(false);
        return;
      }
      const tolerance = 5; // A bit more tolerance for floating point precision
      setCanScrollPrev(element.scrollLeft > tolerance);
      setCanScrollNext(
        element.scrollLeft <
          element.scrollWidth - element.clientWidth - tolerance
      );
    } else {
      setCanScrollPrev(false);
      setCanScrollNext(false);
    }
  }, []);

  useEffect(() => {
    const scrollElement = scrollContainerRef.current;
    if (scrollElement) {
      // Initial check after elements are rendered
      setTimeout(checkScrollButtons, 0);
      scrollElement.addEventListener("scroll", checkScrollButtons, {
        passive: true,
      });
    }
    window.addEventListener("resize", checkScrollButtons);

    return () => {
      window.removeEventListener("resize", checkScrollButtons);
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", checkScrollButtons);
      }
    };
  }, [modulesData.length, checkScrollButtons]); // Re-check if modules data changes

  const scrollSmoothly = (amount) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };
  const nextSlide = () => scrollSmoothly(ITEM_WIDTH + GAP);
  const prevSlide = () => scrollSmoothly(-(ITEM_WIDTH + GAP));

  // Determine if arrows should be shown based on actual scrollability
  const containerWidth = scrollContainerRef.current?.clientWidth || 0;
  const contentWidth =
    modulesData.length * (ITEM_WIDTH + GAP) -
    (modulesData.length > 0 ? GAP : 0); // Total width of items
  const shouldShowArrows =
    contentWidth > containerWidth && modulesData.length > 0;

  const isActive = (id) =>
    isTourActive && highlightedElementInfo && highlightedElementInfo.id === id;

  return (
    <div
      id="tour-modules-section" // ID for the main tour target
      className={`mt-8 rounded-lg p-1 -m-1 
                    ${
                      isActive("tour-modules-section")
                        ? "tour-highlight-active"
                        : ""
                    }
                    ${isTourActive ? "component-under-tour" : ""}`} // Added p-1 -m-1 for highlight spacing
    >
      <div className="flex items-center justify-between mb-4 px-1">
        {" "}
        {/* px-1 to account for parent's -m-1 */}
        <h3 className="font-[500] text-[17px] text-[#191919]">
          Continuer l&apos;apprentissage
        </h3>
        {shouldShowArrows && ( // Use shouldShowArrows here
          <div className="flex items-center gap-3">
            <button
              aria-label="Précédent"
              onClick={prevSlide}
              disabled={!canScrollPrev}
              className={`p-1.5 transition-all duration-200 rounded-full
                ${
                  !canScrollPrev
                    ? "opacity-30 cursor-not-allowed text-gray-400"
                    : "opacity-100 hover:bg-gray-100 text-gray-700"
                }`}
            >
              <Image src={left_arrow} alt="Previous" width={24} height={24} />
            </button>
            <button
              aria-label="Suivant"
              onClick={nextSlide}
              disabled={!canScrollNext}
              className={`p-1.5 transition-all duration-200 rounded-full
              ${
                !canScrollNext
                  ? "opacity-30 cursor-not-allowed text-gray-400"
                  : "opacity-100 hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Image src={right_arrow} alt="Next" width={24} height={24} />
            </button>
          </div>
        )}
      </div>
      {modulesData.length > 0 ? (
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 ml-2 py-2 pb-6 scrollbar-hide scroll-smooth" // ml-2 to account for parent's -m-1
          style={{
            scrollSnapType: "x proximity", // "proximity" is often better than "mandatory"
            WebkitOverflowScrolling: "touch",
          }}
        >
          {modulesData.map((module) => (
            <div // Using div as direct child of flex container
              key={module.id}
              className="p-4 bg-[#FFFFFF] rounded-[16px] w-[240px] min-h-[270px] shadow-[0px_2px_8px_rgba(0,0,0,0.04)] flex flex-col flex-shrink-0 transition-shadow duration-300 ease-in-out hover:shadow-lg"
              style={{ scrollSnapAlign: "start" }} // Important for snapping behavior
            >
              <div className="relative w-full h-[96px] rounded-md overflow-hidden mb-2">
                <Image
                  src={module.image}
                  alt={`Illustration pour ${module.title}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority={false}
                />
              </div>
              <div className="flex flex-col flex-grow">
                <span className="text-[#FD2E8A] text-[12px] my-2 font-semibold block bg-[#FFF5FA] rounded-[8px] px-2 py-1 w-fit">
                  {module.title}
                </span>
                <div className="mt-1 mb-3 flex-grow">
                  <span
                    className="text-[13px] text-[#11142D] font-[500] block leading-tight" // Added leading-tight
                    title={module.fullUnitForTitle}
                  >
                    {module.unit}
                  </span>
                  <div className="relative flex items-center w-full justify-between mt-[6px]">
                    {" "}
                    {/* Increased mt slightly */}
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
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                {" "}
                {/* Increased pt slightly */}
                <span className="text-[12px] text-[#F8589F] font-[500]">
                  {module.views}
                </span>
                <Link
                  href={
                    module.subjectId
                      ? `/dashboard/question-bank/${module.subjectId}`
                      : "#"
                  } // Fallback href if subjectId is missing
                  passHref
                  legacyBehavior={!!module.subjectId} // Only use legacy if it's a real link
                >
                  <a
                    className={`p-1.5 rounded-full transition-colors duration-200 ease-in-out ${
                      module.subjectId
                        ? "hover:bg-pink-100"
                        : "cursor-default opacity-50"
                    }`}
                    title={
                      module.subjectId
                        ? "Commencer le module"
                        : "Module non disponible"
                    }
                    aria-label={`Commencer le module ${module.title}`}
                    onClick={(e) => !module.subjectId && e.preventDefault()} // Prevent navigation if no ID
                  >
                    <Image
                      src={play}
                      alt="Start module"
                      width={20}
                      height={20}
                    />{" "}
                    {/* Slightly smaller icon */}
                  </a>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 px-4 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 mt-4 mx-1">
          <p className="text-xl mb-2">📚</p>
          <p className="text-sm">
            Aucun module d&apos;apprentissage disponible pour l&apos;unité
            actuelle.
          </p>
        </div>
      )}
    </div>
  );
};

export default Modules_onboarding;
