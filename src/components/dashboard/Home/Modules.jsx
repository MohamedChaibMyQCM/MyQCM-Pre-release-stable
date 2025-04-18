"use client";

import Image from "next/image";
import right_arrow from "../../../../public/Home/rigth_arrow.svg";
import left_arrow from "../../../../public/Home/left_arrow.svg";
import play from "../../../../public/Home/pink_play.svg";
import module1 from "../../../../public/Home/module1.avif";
import module2 from "../../../../public/Home/module2.avif";
import module3 from "../../../../public/Home/module3.avif";
import module4 from "../../../../public/Home/module4.avif";
import { useState, useRef, useEffect } from "react";
import secureLocalStorage from "react-secure-storage";
import BaseUrl from "@/components/BaseUrl";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/Loading";
import Link from "next/link";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);
  const carouselRef = useRef(null);
  const containerRef = useRef(null);

  const ITEM_WIDTH = 240;
  const GAP = 16;

  const {
    data: profileData,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    error: profileError,
  } = useQuery({
    queryKey: ["userProfileModules"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      if (!token) {
        return null;
      }
      try {
        const response = await BaseUrl.get("/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
  });

  const {
    data: subjectsData = [],
    isLoading: isSubjectsLoading,
    isFetching: isSubjectsFetching,
    error: subjectsError,
  } = useQuery({
    queryKey: ["subjects", profileData?.unit?.id],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      if (!token) {
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
        throw error;
      }
    },
    enabled: !!profileData?.unit?.id,
  });

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

  const updateItemsPerView = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const totalItemWidth = ITEM_WIDTH + GAP;
      const calculatedItems = Math.floor(
        (containerWidth + GAP) / totalItemWidth
      );
      const newItemsPerView = Math.max(
        1,
        modulesData.length > 0
          ? Math.min(calculatedItems, modulesData.length)
          : 1
      );

      if (newItemsPerView !== itemsPerView) {
        setItemsPerView(newItemsPerView);
      }

      if (modulesData.length > 0) {
        const maxPossibleIndex = Math.max(
          0,
          modulesData.length - newItemsPerView
        );
        if (currentIndex > maxPossibleIndex) {
          setCurrentIndex(maxPossibleIndex);
        }
      } else if (currentIndex !== 0) {
        setCurrentIndex(0);
      }
    }
  };

  useEffect(() => {
    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, [modulesData.length]);

  const nextSlide = () => {
    const maxIndex = Math.max(0, modulesData.length - itemsPerView);
    if (currentIndex < maxIndex) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const isLoading = isProfileLoading || (!!profileData && isSubjectsLoading);
  const hasError = profileError || (!!profileData && subjectsError);

  if (isLoading) {
    return (
      <div className="mt-8">
        <Loading />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="mt-8 text-center text-red-600 p-4 border border-red-300 bg-red-50 rounded-lg">
        Une erreur est survenue lors du chargement des modules. <br />
        Veuillez actualiser la page ou réessayer plus tard.
      </div>
    );
  }

  const canScrollPrev = currentIndex > 0;
  const canScrollNext =
    modulesData.length > itemsPerView &&
    currentIndex < modulesData.length - itemsPerView;

  return (
    <div className="mt-8" ref={containerRef}>
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-[500] text-[17px] text-[#191919]">
          Continuer l&apos;apprentissage
        </h3>
        {modulesData.length > itemsPerView && (
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

      {modulesData.length > 0 ? (
        <div className="overflow-hidden">
          <ul
            ref={carouselRef}
            className="flex gap-4 ml-3 transition-transform duration-500 ease-in-out pt-2 pb-6"
            style={{
              transform: `translateX(-${currentIndex * (ITEM_WIDTH + GAP)}px)`,
              width: `${modulesData.length * (ITEM_WIDTH + GAP) - GAP}px`,
            }}
          >
            {modulesData.map((module) => (
              <li
                key={module.id}
                className="p-4 bg-[#FFFFFF] rounded-[16px] w-[240px] min-h-[270px] shadow-[0px_2px_8px_rgba(0,0,0,0.04)] flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out hover:scale-[1.03] hover:shadow-lg"
              >
                <div className="relative w-full h-[96px] rounded-md overflow-hidden mb-2">
                  <Image
                    src={module.image}
                    alt={`Illustration pour ${module.title}`}
                    fill
                    sizes="224px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col flex-grow">
                  <span className="text-[#FD2E8A] text-[12px] my-2 font-semibold block bg-[#FFF5FA] rounded-[8px] px-2 py-1 w-fit">
                    {" "}
                    {module.title}
                  </span>
                  <div className="mt-1 mb-3 flex-grow">
                    <span
                      className="text-[13px] text-[#11142D] font-[500] block" 
                      title={module.fullUnitForTitle}
                    >
                      {module.unit}{" "}
                    </span>
                    <div className="relative flex items-center w-full justify-between mt-[4px]">
                      <div className="w-[76%] h-[6px] bg-gray-200 rounded-full relative overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#F8589F] to-[#FD2E8A] rounded-full"
                          style={{ width: `${module.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-[12px] font-medium text-[#FD2E8A]">
                        {module.progress.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                  <span className="text-[12px] text-[#F8589F] font-[500]">
                    {module.views}
                  </span>
                  <Link
                    href={`/dashboard/question-bank/${module.subjectId}`}
                    legacyBehavior
                  >
                    <a
                      className="p-1 rounded-full hover:bg-pink-100 transition-colors duration-200 ease-in-out"
                      title="Commencer le module"
                    >
                      <Image
                        src={play}
                        alt=""
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
        <div className="text-center py-10 px-4 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 mt-4">
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
