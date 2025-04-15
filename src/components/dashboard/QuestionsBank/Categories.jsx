"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import BaseUrl from "@/components/BaseUrl";
import Loading from "@/components/Loading";
import FilterPopup from "./FilterPopup";
import moduleIcon from "../../../../public/Icons/module.svg"; // Verify path & maybe use a more specific name if needed elsewhere
import filter from "../../../../public/Question_Bank/filter.svg"; // Verify path
import secureLocalStorage from "react-secure-storage";
import { motion, AnimatePresence } from "framer-motion";

const Categories = () => {
  const searchParams = useSearchParams();
  const [showFilter, setShowFilter] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const filterRef = useRef(null);
  const selectContentRef = useRef(null); // Passed to FilterPopup to handle clicks inside it

  useEffect(() => {
    const unitId = searchParams.get("unitId");
    if (unitId) {
      setSelectedUnitId(unitId);
    } else {
      setSelectedUnitId(""); // Ensure reset if param removed
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
    data: unitsData,
    isLoading: isUnitsLoading,
    error: unitsError,
  } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      if (!secureLocalStorage.getItem("token")) return [];
      try {
        const token = secureLocalStorage.getItem("token");
        // Increased offset assuming more units might exist than initially thought
        const response = await BaseUrl.get("/unit/me?offset=50", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data?.data?.data || [];
      } catch (err) {
        console.error("Categories: Error fetching units:", err);
        // Avoid duplicate toasts if overall error is handled later
        return [];
      }
    },
    staleTime: 1000 * 60 * 10, // Cache units for 10 mins
    retry: 1,
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
    enabled: !!secureLocalStorage.getItem("token"),
    staleTime: 1000 * 60 * 15,
    retry: 1,
  });

  // Determine the unit ID for fetching subjects
  const unitIdToFetch = selectedUnitId || profileData?.unit?.id;

  const {
    data: subjectsData = [],
    isLoading: isSubjectsLoading,
    isFetching: isSubjectsFetching,
    error: subjectsError,
    // Removed refetchSubjects as React Query handles updates via queryKey change
  } = useQuery({
    queryKey: ["subjects", unitIdToFetch], // Key depends on the actual unit ID used
    queryFn: async () => {
      if (!secureLocalStorage.getItem("token") || !unitIdToFetch) return [];
      const token = secureLocalStorage.getItem("token");
      try {
        // Fetch a larger number of subjects, adjust if pagination is needed
        const response = await BaseUrl.get(
          `/subject/me?unit=${unitIdToFetch}&offset=100`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Your console log from before, kept for debugging if needed
        // console.log(response.data?.data?.data);
        return response.data?.data?.data || [];
      } catch (error) {
        console.error(
          `Categories: Error fetching subjects for unit ${unitIdToFetch}:`,
          error
        );
        return []; // Return empty array on error to prevent breaking map
      }
    },
    // Fetch only when a unit ID is available and the user is logged in
    enabled: !!unitIdToFetch && !!secureLocalStorage.getItem("token"),
    staleTime: 1000 * 60 * 5, // Cache subjects for 5 minutes
    retry: 1,
  });

  const resetFilter = () => {
    setSelectedUnitId("");
    setShowFilter(false); // Query will refetch automatically
  };

  const closeFilter = () => {
    setShowFilter(false);
  };

  // Combined loading state: consider initial load vs background refresh
  const isInitialLoading =
    isUnitsLoading || // Units must load first
    isProfileLoading || // Profile helps determine default unit
    (!!unitIdToFetch &&
      isSubjectsLoading &&
      subjectsData?.length === 0 &&
      !subjectsError); // Subjects loading for the *first* time for the target unit

  const hasError = subjectsError || unitsError || profileError;

  // Display error prominently if any query fails
  if (hasError) {
    const errorMessage =
      unitsError?.message ||
      profileError?.message ||
      subjectsError?.message ||
      "Une erreur est survenue.";
    // Use your original error display structure if preferred
    return (
      <div className="px-[24px] mb-[24px] max-md:px-[20px]">
        <div className="bg-white p-4 rounded-lg text-center text-red-500 border border-red-200 shadow-sm">
          Erreur : {errorMessage}. Veuillez réessayer.
        </div>
      </div>
    );
  }

  // Display loading indicator only during the initial critical path fetches
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

  // Get selected unit name safely for button label
  const selectedUnitName = unitsData?.find(
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

  // Use item.icon from data, fallback to imported moduleIcon
  const getSubjectIcon = (subject) => {
    // Check if subject.icon is a valid URL or path string
    if (
      subject &&
      typeof subject.icon === "string" &&
      subject.icon.length > 0
    ) {
      // Basic check: assume it's a relative path or full URL from backend
      // If backend provides full URLs, this is fine.
      // If backend provides relative paths *needing* BaseUrl, adjust here.
      // Example: return subject.icon.startsWith('http') ? subject.icon : `${process.env.NEXT_PUBLIC_API_BASE_URL}${subject.icon}`;
      return subject.icon;
    }
    // Fallback to the locally imported icon
    return moduleIcon;
  };

  return (
    // Structure and classes exactly as you provided in the prompt
    <div className="px-[24px] mb-[24px] max-md:px-[20px]">
      <div className="relative flex items-center justify-between mb-5">
        <h3 className="text-[#191919] font-[500] text-[18px] max-md:text-[16px]">
          Modules
        </h3>
        <div className="relative" ref={filterRef}>
          {/* Using your original filter button style */}
          <div
            className="flex items-center bg-[#FFFFFF] gap-2 px-4 py-[6px] rounded-[16px] box cursor-pointer transition-colors hover:bg-gray-50"
            onClick={() => setShowFilter(!showFilter)}
            role="button"
            aria-haspopup="true"
            aria-expanded={showFilter}
          >
            {/* Using derived label, keeping your style */}
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
                className="absolute right-0 mt-2 z-20" // z-index from your original
              >
                <FilterPopup
                  selectedUnit={selectedUnitId}
                  setSelectedUnit={setSelectedUnitId}
                  resetFilter={resetFilter}
                  closeFilter={closeFilter}
                  units={unitsData || []} // Pass fetched units
                  selectContentRef={selectContentRef} // Pass the ref
                  isLoading={isUnitsLoading} // Let popup know if units are loading
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Grid layout and styles exactly as you provided */}
      <ul
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#FFF] p-5 rounded-[16px] box transition-opacity duration-300 ${
          // Dim slightly during background fetches after initial load
          isSubjectsFetching && !isInitialLoading
            ? "opacity-75 pointer-events-none"
            : "opacity-100"
        }`}
      >
        {/* Handle empty state after loading and checking length */}
        {!isInitialLoading && subjectsData?.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-4 w-full text-center text-gray-500 py-10">
            {/* Your original empty state icon/text structure */}
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
            {/* Added suggestion if no default unit and no filter */}
            {!selectedUnitId && !profileData?.unit?.id && (
              <p className="text-xs mt-2 text-gray-400">
                Sélectionnez une unité avec le filtre.
              </p>
            )}
          </div>
        ) : (
          // Map over subjects, using your li structure and classes
          subjectsData?.map((item) => (
            <li
              key={item.id}
              className="rounded-[16px] bg-gradient-to-r from-[#F8589F] to-[#FD2E8A] transition-all duration-300 ease-in-out hover:scale-[1.03] hover:shadow-lg"
            >
              <Link
                href={`/dashboard/question-bank/${item.id}`}
                className="flex items-center h-[84px] gap-4 px-[20px] rounded-[16px] cursor-pointer w-full"
              >
                {/* Using the getSubjectIcon logic */}
                <Image
                  src={getSubjectIcon(item)}
                  alt="" // Decorative icon, alt can be empty
                  width={40}
                  height={40}
                  onError={(e) => {
                    e.currentTarget.src = moduleIcon.src;
                  }} // Fallback on image load error
                  className="flex-shrink-0" // Prevent icon shrinking
                />
                <div className="flex flex-col gap-1 overflow-hidden min-w-0">
                  {" "}
                  {/* Allow text truncate */}
                  <span
                    className="text-[#FFFFFF] font-Poppins font-semibold text-[14px] truncate"
                    title={item.name}
                  >
                    {item.name}
                  </span>
                  <span className="text-[#FFC9E1] font-Poppins font-normal text-[12px]">
                    {item.totalQuestions ?? item.total ?? 0} Questions{" "}
                    {/* Use consistent key */}
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
