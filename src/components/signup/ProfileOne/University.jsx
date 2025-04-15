"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import university from "../../../../public/auth/univ.svg";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import BaseUrl from "@/components/BaseUrl";
import { CaretDown } from "phosphor-react";
import secureLocalStorage from "react-secure-storage";

const University = ({ name, value, setFieldValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");
  const [selectedLabel, setSelectedLabel] = useState(
    "Sélectionnez votre université"
  );
  const dropdownRef = useRef(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["universities"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get("/university", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    },
  });

  useEffect(() => {
    if (value && data) {
      const selectedUni = data.find((univer) => univer.id === value);
      if (selectedUni) {
        setSelectedLabel(selectedUni.name);
      }
    }
  }, [value, data]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (id, name) => {
    setSelectedValue(id);
    setSelectedLabel(name);
    setFieldValue("university", id);
    setIsOpen(false);
  };

  return (
    <div
      className="w-[48%] flex flex-col gap-3 max-md:w-full relative"
      ref={dropdownRef}
    >
      <label htmlFor={name} className="text-[#191919] text-[16px] font-[500]">
        Institution/Université ?
      </label>

      <div
        className="rounded-[10px] flex items-center bg-[#FFF] border border-[#E4E4E4] text-[#666666] font-medium py-3 px-[20px] cursor-pointer hover:border-[#F8589F] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 w-full">
          <Image src={university} alt="université" className="w-[22px]" />
          <span className="truncate text-[14px]">{selectedLabel}</span>
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
            <p className="p-4 text-gray-600">Chargement des universités...</p>
          ) : error ? (
            <p className="p-4 text-red-600">
              Erreur lors du chargement des universités
            </p>
          ) : (
            <ul>
              {data.map((univer) => (
                <li
                  key={univer.id}
                  className={`px-4 py-3 text-[14px] cursor-pointer hover:bg-[#FFE7F2] ${
                    selectedValue === univer.id
                      ? "bg-[#FFE7F2] text-[#F8589F]"
                      : "text-[#191919]"
                  }`}
                  onClick={() => handleSelect(univer.id, univer.name)}
                >
                  {univer.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default University;
