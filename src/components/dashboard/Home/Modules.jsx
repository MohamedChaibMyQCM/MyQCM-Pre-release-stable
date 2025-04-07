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
    queryKey: ["userProfile"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get("/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data;
    },
    onError: (error) => {
      console.error("Erreur lors du chargement du profil :", error);
    },
  });

  const {
    data: subjectsData = [],
    isLoading: isSubjectsLoading,
    isFetching: isSubjectsFetching,
    error: subjectsError,
  } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get(
        `/subject/me?unit=${profileData?.unit.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data?.data?.data || [];
    },
    onError: (error) => {
      console.error("Erreur lors du chargement des matières :", error);
    },
  });

  const modulesData =
    subjectsData.length > 0
      ? subjectsData.map((subject, index) => ({
          id: subject.id || index,
          image: [module1, module2, module3, module4][index % 4],
          title: subject.name || "Matière inconnue",
          unit: `Unité : ${subject.unit || "Général"}`,
          progress: Math.min(100, Math.max(0, subject.progress || 0)),
          views: `+${Math.floor((subject.progress || 0) * 2)} xp`,
        }))
      : [];

  const updateItemsPerView = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const totalItemWidth = ITEM_WIDTH + GAP;
      const calculatedItems = Math.floor(containerWidth / totalItemWidth);
      const newItemsPerView = Math.max(
        1,
        Math.min(calculatedItems, modulesData.length)
      );
      setItemsPerView(newItemsPerView);
    }
  };

  useEffect(() => {
    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, [modulesData.length]);

  const nextSlide = () => {
    if (currentIndex < modulesData.length - itemsPerView) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (isProfileLoading || isSubjectsLoading) {
    return (
      <div className="mt-8">
        <Loading />
      </div>
    );
  }

  if (profileError || subjectsError) {
    return (
      <div className="mt-8 text-red-500">
        Une erreur est survenue. Veuillez actualiser la page.
      </div>
    );
  }

  return (
    <div className="mt-8" ref={containerRef}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-[500] text-[17px] text-[#191919]">
          Continuer l'apprentissage
        </h3>
        <div className="flex items-center gap-3">
          <Image
            src={left_arrow}
            alt="Précédent"
            className={`cursor-pointer  ${
              currentIndex === 0 ? "opacity-50" : ""
            }`}
            onClick={prevSlide}
          />
          <Image
            src={right_arrow}
            alt="Suivant"
            className={`cursor-pointer ${
              currentIndex >= modulesData.length - itemsPerView
                ? "opacity-50"
                : ""
            }`}
            onClick={nextSlide}
          />
        </div>
      </div>

      {modulesData.length > 0 ? (
        <div className="overflow-hidden">
          <ul
            ref={carouselRef}
            className="flex gap-4 transition-transform duration-500 ease-in-out pb-4"
            style={{
              transform: `translateX(-${currentIndex * (ITEM_WIDTH + GAP)}px)`,
            }}
          >
            {modulesData.map((module) => (
              <li
                key={module.id}
                className="p-4 bg-[#FFFFFF] rounded-[16px] w-[240px] h-[270px] box flex-shrink-0"
              >
                <Image
                  src={module.image}
                  alt={module.title}
                  className="w-full h-[96px]"
                />
                <span className="text-[#FD2E8A] text-[13px] my-3 font-[500] block bg-[#FFF5FA] rounded-[8px] px-2 py-1 w-fit">
                  {module.title}
                </span>
                <div className="my-4">
                  <span className="text-[13px] text-[11142D] font-[500]">
                    {module.unit}
                  </span>
                  <div className="relative flex items-center w-[100%] justify-between mt-[2px]">
                    <div className="w-[76%] h-[8px] bg-[#F5F5F5] rounded-[20px] relative">
                      <div
                        className="absolute h-[8px] bg-[#FD2E8A] rounded-[20px]"
                        style={{ width: `${module.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-[13px] font-[500]">
                      {module.progress.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-5">
                  <span className="text-[13px] text-[#F8589F] font-[500]">
                    {module.views}
                  </span>
                  <Link href={`/dashboard/question-bank/${module.id}`}>
                    <Image
                      src={play}
                      alt="Lire"
                      width={22}
                      height={22}
                      className="cursor-pointer"
                    />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Aucun module d’apprentissage disponible
        </div>
      )}
    </div>
  );
};

export default Modules;
