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
import module from "../../../../public/Icons/module.svg";
import filter from "../../../../public/Question_Bank/filter.svg";
import secureLocalStorage from "react-secure-storage";

const Categories = () => {
  const searchParams = useSearchParams();
  const [showFilter, setShowFilter] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const filterRef = useRef(null);
  const selectContentRef = useRef(null);

  useEffect(() => {
    const unitId = searchParams.get("unitId");
    console.log(unitId);

    if (unitId) {
      setSelectedUnitId(unitId);
    }
  }, [searchParams]);

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data?.data?.data || [];
      } catch (err) {
        toast.error(
          "Échec de la récupération des unités. Veuillez réessayer plus tard."
        );
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
    refetch: refetchSubjects,
  } = useQuery({
    queryKey: ["subjects", selectedUnitId],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const unitId = selectedUnitId || profileData?.unit?.id;
      if (!unitId) return [];

      const response = await BaseUrl.get(`/subject/me?unit=${unitId}&offset=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data?.data?.data || [];
    },
    enabled: !!profileData?.unit?.id || !!selectedUnitId,
    onError: (error) => {
      console.error("Erreur lors du chargement des matières :", error);
    },
  });

  useEffect(() => {
    if (selectedUnitId || profileData?.unit?.id) {
      refetchSubjects();
    }
  }, [selectedUnitId, profileData?.unit?.id, refetchSubjects]);

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

  const resetFilter = () => {
    setSelectedUnitId("");
    setShowFilter(false);
  };

  const closeFilter = () => {
    setShowFilter(false);
  };

  const isInitialLoading =
    isUnitsLoading || isSubjectsLoading || isProfileLoading;
  const hasError = subjectsError || unitsError || profileError;

  if (isInitialLoading && !hasError) {
    return <Loading />;
  }

  if (hasError) {
    const errorMessage =
      subjectsError?.message ||
      unitsError?.message ||
      profileError?.message ||
      "Une erreur est survenue";
    return (
      <div className="px-[24px] mb-[24px]">
        <div className="bg-white p-4 rounded-lg text-center text-red-500">
          Erreur : {errorMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="px-[24px] mb-[24px] max-md:px-[20px]">
      <div className="relative flex items-center justify-between mb-5">
        <h3 className="text-[#191919] font-[500] text-[18px] max-md:text-[16px]">
          Modules
        </h3>
        <div className="relative" ref={filterRef}>
          <div
            className="flex items-center bg-[#FFFFFF] gap-2 px-4 py-[6px] rounded-[16px] box cursor-pointer"
            onClick={() => setShowFilter(!showFilter)}
          >
            <button className="text-[14px] font-[500]">
              {selectedUnitId ? "Filtre actif" : "Filtrer"}
            </button>
            <Image src={filter} alt="filtre" className="w-[13px]" />
          </div>
          {showFilter && (
            <FilterPopup
              selectedUnit={selectedUnitId}
              setSelectedUnit={setSelectedUnitId}
              resetFilter={resetFilter}
              closeFilter={closeFilter}
              units={unitsData || []}
              selectContentRef={selectContentRef}
            />
          )}
        </div>
      </div>
      <ul
        className={`flex items-center flex-wrap gap-4 bg-[#FFF] p-5 rounded-[16px] box transition-opacity duration-300 ${
          isSubjectsFetching ? "opacity-75" : "opacity-100"
        }`}
      >
        {subjectsData?.length === 0 ? (
          <div className="w-full text-center text-[#666]">
            {selectedUnitId
              ? "Aucun résultat correspondant à votre filtre."
              : "Aucune catégorie disponible."}
          </div>
        ) : (
          subjectsData?.map((item) => (
            <li
              key={item.id}
              className="basis-[calc(25%-12px)] max-md:basis-[100%] max-xl:basis-[calc(50%-12px)] rounded-[16px] bg-gradient-to-r from-[#F8589F] to-[#FD2E8A]"
            >
              <Link
                href={`/dashboard/question-bank/${item.id}`}
                className="flex items-center h-[84px] gap-4 px-[20px] rounded-[20px] cursor-pointer w-full"
              >
                <Image src={module} alt="logo du module" />
                <div className="flex flex-col gap-1">
                  <span className="text-[#FFFFFF] font-Poppins font-semibold text-[14px]">
                    {item.name}
                  </span>
                  <span className="text-[#FFC9E1] font-Poppins font-extralight text-[12px]">
                    {item.total} Questions
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
