"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import BaseUrl from "@/components/BaseUrl";
import Loading from "@/components/Loading";
import FilterPopup from "./FilterPopup"; // Assuming this exists
import module from "../../../../public/Icons/module.svg"; // Verify path
import filter from "../../../../public/Question_Bank/filter.svg"; // Verify path
import secureLocalStorage from "react-secure-storage";
import { motion, AnimatePresence } from "framer-motion";

const Categories = () => {
  const searchParams = useSearchParams();
  const [showFilter, setShowFilter] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const filterRef = useRef(null);
  const selectContentRef = useRef(null);

  // --- UseEffects remain the same ---
  useEffect(() => {
    const unitId = searchParams.get("unitId");
    if (unitId) {
      setSelectedUnitId(unitId);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target) &&
        selectContentRef.current &&
        !selectContentRef.current.contains(event.target)
      ) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- React Query Hooks remain the same ---
  const {
    data: unitsData,
    isLoading: isUnitsLoading,
    error: unitsError,
  } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      try {
        const token = secureLocalStorage.getItem("token");
        const response = await BaseUrl.get("/unit/me?offset=20", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data?.data?.data || [];
      } catch (err) {
        console.error("Categories: Error fetching units:", err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["userProfileCategories"],
    queryFn: async () => {
      if (!secureLocalStorage.getItem("token")) return null;
      const token = secureLocalStorage.getItem("token");
      try {
        const response = await BaseUrl.get("/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data;
      } catch (error) {
        console.error(
          "Categories: Erreur lors du chargement du profil :",
          error
        );
        return null;
      }
    },
  });

  const {
    data: subjectsData = [],
    isLoading: isSubjectsLoading,
    isFetching: isSubjectsFetching,
    error: subjectsError,
    refetch: refetchSubjects,
  } = useQuery({
    queryKey: ["subjects", selectedUnitId],
    queryFn: async () => {
      if (!secureLocalStorage.getItem("token")) return [];
      const token = secureLocalStorage.getItem("token");
      const unitIdToFetch = selectedUnitId || profileData?.unit?.id;
      if (!unitIdToFetch) return [];
      try {
        const response = await BaseUrl.get(
          `/subject/me?unit=${unitIdToFetch}&offset=50`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return response.data?.data?.data || [];
      } catch (error) {
        console.error(
          "Categories: Erreur lors du chargement des matières :",
          error
        );
        return [];
      }
    },
    enabled: !!selectedUnitId || !!profileData?.unit?.id,
  });

  useEffect(() => {
    if (!!selectedUnitId || !!profileData?.unit?.id) {
      refetchSubjects();
    }
  }, [selectedUnitId, profileData?.unit?.id, refetchSubjects]);

  // --- Filter Handlers remain the same ---
  const resetFilter = () => {
    setSelectedUnitId("");
    setShowFilter(false);
  };

  const closeFilter = () => {
    setShowFilter(false);
  };

  // --- Loading/Error States remain the same ---
  const isInitialLoading =
    isUnitsLoading ||
    isProfileLoading ||
    ((!!selectedUnitId || !!profileData?.unit?.id) &&
      isSubjectsLoading &&
      subjectsData.length === 0);
  const hasError = subjectsError || unitsError || profileError;

  if (isInitialLoading && !hasError) {
    return <Loading />;
  }

  if (hasError) {
    const errorMessage =
      subjectsError?.message ||
      unitsError?.message ||
      profileError?.message ||
      "Une erreur est survenue lors du chargement des catégories.";
    return (
      <div className="px-[24px] mb-[24px]">
        <div className="bg-white p-4 rounded-lg text-center text-red-500 border border-red-200">
          Erreur : {errorMessage}. Veuillez actualiser.
        </div>
      </div>
    );
  }

  // --- Animation variants remain the same ---
  const popupVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: { duration: 0.15, ease: "easeIn" },
    },
  };

  return (
    <div className="px-[24px] mb-[24px] max-md:px-[20px]">
      {/* Header remains the same */}
      <div className="relative flex items-center justify-between mb-5">
        <h3 className="text-[#191919] font-[500] text-[18px] max-md:text-[16px]">
          Modules
        </h3>
        <div className="relative" ref={filterRef}>
          <div
            className="flex items-center bg-[#FFFFFF] gap-2 px-4 py-[6px] rounded-[16px] box cursor-pointer transition-colors hover:bg-gray-50"
            onClick={() => setShowFilter(!showFilter)}
            role="button"
            aria-haspopup="true"
            aria-expanded={showFilter}
          >
            <button className="text-[14px] font-[500]">
              {selectedUnitId
                ? `Unité: ${
                    unitsData
                      ?.find((u) => u.id === selectedUnitId)
                      ?.name?.substring(0, 10) || "Filtrée"
                  }...`
                : "Filtrer"}
            </button>
            <Image src={filter} alt="filtre" className="w-[13px]" />
          </div>
          <AnimatePresence>
            {showFilter && (
              <motion.div
                variants={popupVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute right-0 mt-2 z-20"
              >
                <FilterPopup
                  selectedUnit={selectedUnitId}
                  setSelectedUnit={setSelectedUnitId}
                  resetFilter={resetFilter}
                  closeFilter={closeFilter}
                  units={unitsData || []}
                  selectContentRef={selectContentRef}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ============ MODULE LIST - GRID CHANGES APPLIED HERE ============ */}
      <ul
        // Changed from flex to grid, defined columns and gap
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#FFF] p-5 rounded-[16px] box transition-opacity duration-300 ${
          isSubjectsFetching ? "opacity-75 pointer-events-none" : "opacity-100"
        }`}
      >
        {subjectsData?.length === 0 ? (
          // Empty State - unchanged
          // Spanning the empty message across all columns
          <div className="sm:col-span-2 lg:col-span-4 w-full text-center text-gray-500 py-10">
            <span className="text-xl mb-2 block">🤔</span>
            {selectedUnitId
              ? "Aucun module trouvé pour l'unité sélectionnée."
              : "Aucun module disponible dans votre unité principale."}
            {selectedUnitId && (
              <button
                onClick={resetFilter}
                className="ml-2 text-blue-500 underline text-sm"
              >
                (Voir tout)
              </button>
            )}
          </div>
        ) : (
          // List Items - Removed basis classes, kept transitions
          subjectsData?.map((item) => (
            <li
              key={item.id}
              // Removed basis-[...] and flex-shrink-0 classes
              className="rounded-[16px] bg-gradient-to-r from-[#F8589F] to-[#FD2E8A] transition-all duration-300 ease-in-out hover:scale-[1.03] hover:shadow-lg" // Kept transitions
            >
              {/* Link and content structure remain the same */}
              <Link
                href={`/dashboard/question-bank/${item.id}`}
                className="flex items-center h-[84px] gap-4 px-[20px] rounded-[16px] cursor-pointer w-full"
              >
                <Image
                  src={module}
                  alt="" // Decorative ok if text is descriptive
                  width={40}
                  height={40}
                />
                <div className="flex flex-col gap-1 overflow-hidden">
                  <span className="text-[#FFFFFF] font-Poppins font-semibold text-[14px] truncate">
                    {item.name}
                  </span>
                  <span className="text-[#FFC9E1] font-Poppins font-normal text-[12px]">
                    {item.total ?? 0} Questions
                  </span>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
      {/* ============ END OF MODULE LIST ============ */}
    </div>
  );
};

export default Categories;
