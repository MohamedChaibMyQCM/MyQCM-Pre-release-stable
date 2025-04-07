"use client";

import { useState, useRef, useEffect } from "react";
import unitIcon from "../../../../public/auth/unit.svg";
import Image from "next/image";
import { CaretDown } from "phosphor-react";
import { useQuery } from "@tanstack/react-query";
import BaseUrl from "@/components/BaseUrl";
import toast from "react-hot-toast";
import secureLocalStorage from "react-secure-storage";

const CurrentUnit = ({ name, value, setFieldValue, year_of_study }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const dropdownRef = useRef(null);

  const { data: units = [], isLoading } = useQuery({
    queryKey: ["units", year_of_study],
    queryFn: async () => {
      if (!year_of_study) return [];
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get(
        `/unit?year_of_study=${year_of_study}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data.units || [];
    },
    enabled: !!year_of_study,
  });

  useEffect(() => {
    if (value && units.length > 0) {
      const unit = units.find((u) => u.id === value);
      if (unit) setSelectedUnit(unit);
    }
  }, [value, units]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="w-[100%] flex flex-col gap-2 max-md:w-full relative"
      ref={dropdownRef}
    >
      <label className="text-[#191919] text-[16px] font-[500]">
        Unité actuelle
      </label>

      <div
        className="rounded-[10px] flex items-center bg-[#FFF] border border-[#E4E4E4] text-[#666666] font-medium py-3 px-[20px] cursor-pointer hover:border-[#F8589F] transition-colors"
        onClick={() => {
          if (!year_of_study) {
            toast.error("Veuillez d'abord sélectionner votre année d'étude");
            return;
          }
          setIsOpen(!isOpen);
        }}
      >
        <div className="flex items-center gap-3 w-full">
          <Image src={unitIcon} alt="unité" className="w-[18px]" />
          <span className="truncate text-[14px]">
            {selectedUnit?.name || "Sélectionnez votre unité actuelle"}
          </span>
          <CaretDown
            size={20}
            className={`text-[#F8589F] ml-auto transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white rounded-[10px] border border-[#E4E4E4] shadow-md max-h-60 overflow-auto">
          {isLoading ? (
            <div className="px-4 py-3 text-[#666666]">
              Chargement des unités...
            </div>
          ) : units.length === 0 ? (
            <div className="px-4 py-3 text-[#666666]">
              Aucune unité disponible pour cette année
            </div>
          ) : (
            <ul>
              {units.map((unit) => (
                <li
                  key={unit.id}
                  className={`px-4 py-3 cursor-pointer hover:bg-[#FFE7F2] ${
                    selectedUnit?.id === unit.id
                      ? "bg-[#FFE7F2] text-[#F8589F]"
                      : "text-[#191919]"
                  }`}
                  onClick={() => {
                    setSelectedUnit(unit);
                    setFieldValue(name, unit.id);
                    setIsOpen(false);
                  }}
                >
                  {unit.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrentUnit;
