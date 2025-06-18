"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import BaseUrl from "@/components/BaseUrl";
import Loading from "@/components/Loading";
import FilterPopup from "./FilterPopup";
import moduleIcon from "../../../../public/Icons/module.svg";
import filter from "../../../../public/Question_Bank/filter.svg";
import secureLocalStorage from "react-secure-storage";
import { motion, AnimatePresence } from "framer-motion";

const Categories = () => {
  const searchParams = useSearchParams();
  const [showFilter, setShowFilter] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const filterRef = useRef(null);
  const selectContentRef = useRef(null);

  // Define hidden units with their IDs instead of names for more reliable filtering
  const hiddenUnitIds = [
    "22b66563-bd6d-404d-a4a2-f2061b0b751d", // UEI-2: Appareil Neurologique, Locomoteur et cutané
    "bc602e71-b043-47d2-b2e5-b8f59252b12a", // UEI-3: Appareil endocrine, reproduction et urinaire
    "08d2c45d-288c-468b-a12c-687420f4e4f8", // UEI-1: Cardio-Respiratoire et Psychologie médicale
  ];

  // Define hidden module names
  const hiddenModuleNames = [
    "ACP : Anatomie et Cytologie Pathologique",
    "Immunologie",
  ];

  useEffect(() => {
    const unitId = searchParams.get("unitId");
    if (unitId) {
      setSelectedUnitId(unitId);
    } else {
      setSelectedUnitId("");
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
    enabled: !!secureLocalStorage.getItem("token"),
    staleTime: 1000 * 60 * 15,
    retry: 1,
  });

  // Check if user is in fourth year
  const isUserFourthYear = profileData?.year_of_study === "Fourth Year";

  // Special pneumologie module for fourth-year students
  const pneumologieSubject = {
    id: "b7eeafcf-9922-4d58-8896-0c97e0efbe3f",
    name: "Pneumologie",
    totalQuestions: 87,
    icon: "https://res.cloudinary.com/dgxaezwuv/image/upload/v1744685292/Semiology_gbmjbf.svg",
  };

  const {
    data: unitsData,
    isLoading: isUnitsLoading,
    error: unitsError,
  } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      if (!secureLocalStorage.getItem("token")) return [];
      try {
        const token = secureLocalStorage.getItem("token");
        const response = await BaseUrl.get("/unit/me?offset=50", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data?.data?.data || [];
      } catch (err) {
        console.error("Categories: Error fetching units:", err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 10,
    retry: 1,
    enabled: !isUserFourthYear && !!secureLocalStorage.getItem("token"),
  });

  // Filter out hidden units from the fetched units data
  const filteredUnitsData = useMemo(() => {
    if (!unitsData || unitsData.length === 0) return [];
    const filtered = unitsData.filter(
      (unit) => !hiddenUnitIds.includes(unit.id)
    );
    return filtered;
  }, [unitsData]);

  // Check if selected unit is a hidden unit
  const isSelectedUnitHidden = useMemo(() => {
    const isHidden = hiddenUnitIds.includes(selectedUnitId);
    return isHidden;
  }, [selectedUnitId]);

  // Reset selection if a hidden unit is selected
  useEffect(() => {
    if (isSelectedUnitHidden) {
      setSelectedUnitId("");
    }
  }, [isSelectedUnitHidden]);

  // Check if profile's default unit is hidden
  const isProfileUnitHidden = useMemo(() => {
    if (!profileData?.unit?.id) return false;
    const isHidden = hiddenUnitIds.includes(profileData.unit.id);
    return isHidden;
  }, [profileData]);

  // Determine unit ID for fetching, avoiding hidden units
  const unitIdToFetch = useMemo(() => {
    if (isUserFourthYear) return null;

    const result = selectedUnitId
      ? isSelectedUnitHidden
        ? ""
        : selectedUnitId
      : isProfileUnitHidden
      ? ""
      : profileData?.unit?.id;
    return result;
  }, [
    selectedUnitId,
    isSelectedUnitHidden,
    profileData,
    isProfileUnitHidden,
    isUserFourthYear,
  ]);

  const {
    data: subjectsData = [],
    isLoading: isSubjectsLoading,
    isFetching: isSubjectsFetching,
    error: subjectsError,
  } = useQuery({
    queryKey: ["subjects", unitIdToFetch],
    queryFn: async () => {
      if (!secureLocalStorage.getItem("token") || !unitIdToFetch) return [];
      const token = secureLocalStorage.getItem("token");
      try {
        const response = await BaseUrl.get(
          `/subject/me?unit=${unitIdToFetch}&offset=100`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return response.data?.data?.data || [];
      } catch (error) {
        console.error(
          `Categories: Error fetching subjects for unit ${unitIdToFetch}:`,
          error
        );
        return [];
      }
    },
    enabled:
      !!unitIdToFetch &&
      !!secureLocalStorage.getItem("token") &&
      !isUserFourthYear,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Use either pneumologie subject or regular subjects based on user's year
  const displaySubjects = isUserFourthYear
    ? [pneumologieSubject]
    : subjectsData;

  // Filter out the hidden modules
  const filteredDisplaySubjects = useMemo(() => {
    return displaySubjects.filter(
      (subject) => !hiddenModuleNames.includes(subject.name)
    );
  }, [displaySubjects]);

  const resetFilter = () => {
    setSelectedUnitId("");
    setShowFilter(false);
  };

  const closeFilter = () => {
    setShowFilter(false);
  };

  const isInitialLoading =
    (!isUserFourthYear &&
      (isUnitsLoading ||
        isProfileLoading ||
        (!!unitIdToFetch &&
          isSubjectsLoading &&
          subjectsData?.length === 0 &&
          !subjectsError))) ||
    (isUserFourthYear && isProfileLoading);

  const hasError =
    (subjectsError || unitsError || profileError) && !isUserFourthYear;

  if (hasError) {
    const errorMessage =
      unitsError?.message ||
      profileError?.message ||
      subjectsError?.message ||
      "Une erreur est survenue.";
    return (
      <div className="px-[24px] mb-[24px] max-md:px-[20px]">
        <div className="bg-white p-4 rounded-lg text-center text-red-500 border border-red-200 shadow-sm">
          Erreur : {errorMessage}. Veuillez réessayer.
        </div>
      </div>
    );
  }

  if (isInitialLoading) {
    return <Loading />;
  }

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

  const selectedUnitName = filteredUnitsData?.find(
    (u) => u.id === selectedUnitId
  )?.name;
  const filterButtonLabel = selectedUnitId
    ? `Unité: ${
        selectedUnitName
          ? selectedUnitName.length > 10
            ? selectedUnitName.substring(0, 10) + "..."
            : selectedUnitName
          : "Filtrée"
      }`
    : "Filtrer";

  const getSubjectIcon = (subject) => {
    if (
      subject &&
      typeof subject.icon === "string" &&
      subject.icon.length > 0
    ) {
      return subject.icon;
    }
    return moduleIcon;
  };

  return (
    <div className="px-[24px] mb-[24px] max-md:px-[20px]">
      <div className="relative flex items-center justify-between mb-5">
        <h3 className="text-[#191919] font-[500] text-[18px] max-md:text-[16px]">
          Modules
        </h3>
        {!isUserFourthYear && (
          <div className="relative" ref={filterRef}>
            <div
              className="flex items-center bg-[#FFFFFF] gap-2 px-4 py-[6px] rounded-[16px] box cursor-pointer transition-colors hover:bg-gray-50"
              onClick={() => setShowFilter(!showFilter)}
              role="button"
              aria-haspopup="true"
              aria-expanded={showFilter}
            >
              <button className="text-[14px] font-[500]">
                {filterButtonLabel}
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
                    units={filteredUnitsData || []}
                    selectContentRef={selectContentRef}
                    isLoading={isUnitsLoading}
                    hiddenUnitIds={hiddenUnitIds}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <ul
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#FFF] p-5 rounded-[16px] box transition-opacity duration-300 ${
          (isSubjectsFetching && !isInitialLoading) ||
          (isUserFourthYear && isProfileLoading)
            ? "opacity-75 pointer-events-none"
            : "opacity-100"
        }`}
      >
        {!isInitialLoading && filteredDisplaySubjects?.length === 0 ? (
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
            {!selectedUnitId && !profileData?.unit?.id && (
              <p className="text-xs mt-2 text-gray-400">
                Sélectionnez une unité avec le filtre.
              </p>
            )}
          </div>
        ) : (
          filteredDisplaySubjects?.map((item) => (
            <li
              key={item.id}
              className="rounded-[16px] bg-gradient-to-r from-[#F8589F] to-[#FD2E8A] transition-all duration-300 ease-in-out hover:scale-[1.03] hover:shadow-lg"
            >
              <Link
                href={`/dashboard/question-bank/${item.id}`}
                className="flex items-center h-[84px] gap-4 px-[20px] rounded-[16px] cursor-pointer w-full"
              >
                <Image
                  src={getSubjectIcon(item)}
                  alt=""
                  width={40}
                  height={40}
                  onError={(e) => {
                    e.currentTarget.src = moduleIcon.src;
                  }}
                  className="flex-shrink-0"
                />
                <div className="flex flex-col gap-1 overflow-hidden min-w-0">
                  <span
                    className="text-[#FFFFFF] font-Poppins font-semibold text-[14px] truncate"
                    title={item.name}
                  >
                    {item.name}
                  </span>
                  <span className="text-[#FFC9E1] font-Poppins font-normal text-[12px]">
                    {item.totalQuestions ?? item.total ?? 0} Questions{" "}
                  </span>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Categories;
