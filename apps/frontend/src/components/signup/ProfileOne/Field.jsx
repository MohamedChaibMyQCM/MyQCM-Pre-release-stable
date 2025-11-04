"use client";

import { useState, useRef, useEffect } from "react";
import field from "../../../../public/auth/field.svg";
import Image from "next/image";
import { CaretDown } from "phosphor-react";

const FIELDS = [
  { id: "General Medicine", name: "Médecine Générale" },
  { id: "Dentistry", name: "Dentisterie" },
  { id: "Pharmacy", name: "Pharmacie" },
];

const Field = ({ name, value, setFieldValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");
  const [selectedLabel, setSelectedLabel] = useState(
    "Sélectionnez votre domaine d'étude"
  );
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (value) {
      const selectedField = FIELDS.find((field) => field.id === value);
      if (selectedField) setSelectedLabel(selectedField.name);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id, name) => {
    setSelectedValue(id);
    setSelectedLabel(name);
    setFieldValue("field", id);
    setIsOpen(false);
  };

  return (
    <div
      className="w-[48%] flex flex-col gap-2 max-md:w-full relative"
      ref={dropdownRef}
    >
      <label htmlFor={name} className="text-[#191919] text-[16px] font-[500]">
        Domaine d&apos;étude ?
      </label>

      <div
        className="rounded-[10px] flex items-center bg-[#FFF] border border-[#E4E4E4] text-[#666666] font-medium py-3 px-[20px] cursor-pointer hover:border-[#F8589F] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 w-full">
          <Image src={field} alt="domaine" width={22} height={22} />
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
        <div className="absolute top-0 left-0 right-0 z-10 mt-1 bg-white rounded-[10px] border border-[#E4E4E4] shadow-md max-h-60 overflow-auto">
          <ul>
            {FIELDS.map((field) => (
              <li
                key={field.id}
                className={`px-4 py-3 text-[14px] cursor-pointer hover:bg-[#FFE7F2] ${
                  selectedValue === field.id
                    ? "bg-[#FFE7F2] text-[#F8589F]"
                    : "text-[#191919]"
                }`}
                onClick={() => handleSelect(field.id, field.name)}
              >
                {field.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Field;
