"use client";

import { useState, useRef, useEffect } from "react";
import yearIcon from "../../../../public/auth/year.svg";
import Image from "next/image";
import { CaretDown } from "phosphor-react";

const Year = ({ name, value, setFieldValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Array of objects with French labels and English IDs
  const years = [
    { label: "Première année", value: "First Year" },
    { label: "Deuxième année", value: "Second Year" },
    { label: "Troisième année", value: "Third Year" },
    { label: "Quatrième année", value: "Fourth Year" },
    { label: "Cinquième année", value: "Fifth Year" },
    { label: "Sixième année", value: "Sixth Year" },
    { label: "Septième année", value: "Seventh Year" },
  ];

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
        Année d'étude ?
      </label>

      <div
        className="rounded-[10px] flex items-center bg-[#FFF] border border-[#E4E4E4] text-[#666666] font-medium py-3 px-[20px] cursor-pointer hover:border-[#F8589F] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 w-full">
          <Image src={yearIcon} alt="année" className="w-[18px]" />
          <span className="truncate text-[14px]">
            {value
              ? years.find((opt) => opt.value === value)?.label
              : "Indiquez votre année d'étude actuelle"}
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
          <ul>
            {years.map((option) => (
              <li
                key={option.value}
                className={`px-4 py-3 cursor-pointer hover:bg-[#FFE7F2] ${
                  value === option.value
                    ? "bg-[#FFE7F2] text-[#F8589F]"
                    : "text-[#191919]"
                }`}
                onClick={() => {
                  setFieldValue(name, option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Year;
