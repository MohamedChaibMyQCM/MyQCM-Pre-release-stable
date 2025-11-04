"use client";

import { CaretDown, CaretLeft, CaretRight } from "phosphor-react";
import { useState, useRef, useEffect } from "react";
import dateIcon from "../../../../../public/Question_Bank/date.svg"; 
import Image from "next/image";
import React from "react";

const toYYYYMMDD = (dateObj) => {
  if (!(dateObj instanceof Date) || isNaN(dateObj)) return "";
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const day = dateObj.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const fromYYYYMMDD = (dateString) => {
  if (
    !dateString ||
    typeof dateString !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
  )
    return null;
  const date = new Date(dateString + "T00:00:00");
  if (isNaN(date.getTime())) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return new Date(year, month - 1, day);
  }
  return date;
};

const TrainingDate = ({ name, value, setFieldValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const initialDateObject = fromYYYYMMDD(value);
  const [currentDate, setCurrentDate] = useState(
    initialDateObject || new Date()
  );
  const [selectedDate, setSelectedDate] = useState(initialDateObject);
  const [view, setView] = useState("days");
  const dropdownRef = useRef(null); // Ref for the container

  useEffect(() => {
    setSelectedDate(fromYYYYMMDD(value));
  }, [value]);

  // Keep click outside logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setView("days");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Date logic functions remain unchanged ---
  const getDaysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const navigateMonth = (direction) => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + (direction === "prev" ? -1 : 1),
        1
      )
    );
  };
  const handleDateSelect = (day) => {
    const newSelectedDateObj = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const newDateString = toYYYYMMDD(newSelectedDateObj);
    setSelectedDate(newSelectedDateObj);
    setFieldValue(name, newDateString);
    setIsOpen(false);
    setView("days");
  };
  const formatDateForDisplay = (dateObj) => {
    if (!dateObj) return "Sélectionner une date";
    return dateObj.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  // --- End Date logic ---

  // --- Render functions (renderDays, renderMonths, renderYears) remain unchanged ---
  const renderDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const dayOffset = firstDay === 0 ? 0 : firstDay;
    for (let i = 0; i < dayOffset; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentDate.getMonth() &&
        selectedDate.getFullYear() === currentDate.getFullYear();
      days.push(
        <button
          key={`day-${day}`}
          type="button"
          className={`w-8 h-8 rounded-full flex items-center justify-center text-[#191919] dark:text-white text-sm transition-colors ${
            isSelected
              ? "bg-[#F8589F] text-white font-semibold"
              : "hover:bg-[#FFE7F2] dark:hover:bg-primary/10"
          }`}
          onClick={() => handleDateSelect(day)}
        >
          {day}
        </button>
      );
    }
    return days;
  };
  const renderMonths = () => {
    return Array.from({ length: 12 }).map((_, month) => (
      <button
        key={month}
        type="button"
        className={`p-2 rounded-lg text-sm w-full text-center transition-colors ${
          currentDate.getMonth() === month
            ? "bg-[#FFE7F2] dark:bg-primary/10 text-[#F8589F] font-semibold"
            : "hover:bg-[#FFE7F2] dark:hover:bg-primary/10 text-[#191919] dark:text-white"
        }`}
        onClick={() => {
          setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
          setView("days");
        }}
      >
        {new Date(0, month)
          .toLocaleString("fr-FR", { month: "short" })
          .replace(".", "")}
      </button>
    ));
  };
  const renderYears = () => {
    const currentYearVal = currentDate.getFullYear();
    const startYear = currentYearVal - 6;
    const years = [];
    for (let i = 0; i < 12; i++) {
      const year = startYear + i;
      years.push(
        <button
          key={year}
          type="button"
          className={`p-2 rounded-lg text-sm w-full text-center transition-colors ${
            currentYearVal === year
              ? "bg-[#FFE7F2] dark:bg-primary/10 text-[#F8589F] font-semibold"
              : "hover:bg-[#FFE7F2] dark:hover:bg-primary/10 text-[#191919] dark:text-white"
          }`}
          onClick={() => {
            setCurrentDate(new Date(year, currentDate.getMonth(), 1));
            setView("days");
          }}
        >
          {year}
        </button>
      );
    }
    return years;
  };
  // --- End Render logic ---

  return (
    <div className="flex-1">
      <label
        htmlFor={`${name}-datepicker-trigger`}
        className="font-semibold text-gray-900 dark:text-white text-sm block mb-2"
      >
        Date de la séance
      </label>
      <div className="relative w-full" ref={dropdownRef}>
        <button
          type="button"
          id={`${name}-datepicker-trigger`}
          className="relative w-full text-left cursor-pointer flex items-center gap-3 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 rounded-xl py-2 px-3"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <Image src={dateIcon} alt="date" className="w-5 h-5 shrink-0 opacity-60 dark:brightness-0 dark:invert" />
          <span className="flex-grow text-[13px] font-medium text-[#191919] dark:text-white">
            {formatDateForDisplay(selectedDate)}
          </span>
          <CaretDown
            size={16}
            className={`text-gray-600 dark:text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <div
            className="absolute z-20 top-[-160px] mb-2 left-1/2 transform -translate-x-1/2 w-[300px] bg-white dark:bg-[#1a1a1a] rounded-[10px] border border-gray-300 dark:border-gray-700 shadow-lg p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <button
                type="button"
                aria-label="Mois/Année précédente"
                onClick={() => {
                  if (view === "days") navigateMonth("prev");
                  else if (view === "years")
                    setCurrentDate(
                      new Date(
                        currentDate.getFullYear() - 12,
                        currentDate.getMonth(),
                        1
                      )
                    );
                }}
                className="p-1 rounded-full hover:bg-[#FFE7F2] dark:hover:bg-primary/10 text-[#F8589F] disabled:opacity-50"
                disabled={view === "months"}
              >
                <CaretLeft size={20} weight="bold" />
              </button>
              <div className="flex gap-2 text-center text-[#191919] dark:text-white">
                <button
                  type="button"
                  className={`font-semibold hover:text-[#F8589F] text-sm p-1 rounded ${
                    view === "months" ? "bg-[#FFE7F2] dark:bg-primary/10" : ""
                  }`}
                  onClick={() => setView("months")}
                >
                  {currentDate.toLocaleString("fr-FR", { month: "long" })}
                </button>
                <button
                  type="button"
                  className={`font-semibold hover:text-[#F8589F] text-sm p-1 rounded ${
                    view === "years" ? "bg-[#FFE7F2] dark:bg-primary/10" : ""
                  }`}
                  onClick={() => setView("years")}
                >
                  {currentDate.getFullYear()}
                </button>
              </div>
              <button
                type="button"
                aria-label="Mois/Année suivante"
                onClick={() => {
                  if (view === "days") navigateMonth("next");
                  else if (view === "years")
                    setCurrentDate(
                      new Date(
                        currentDate.getFullYear() + 12,
                        currentDate.getMonth(),
                        1
                      )
                    );
                }}
                className="p-1 rounded-full hover:bg-[#FFE7F2] dark:hover:bg-primary/10 text-[#F8589F] disabled:opacity-50"
                disabled={view === "months"}
              >
                <CaretRight size={20} weight="bold" />
              </button>
            </div>

            {view === "days" && (
              <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                {["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"].map((day) => (
                  <div key={day} className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {day}
                  </div>
                ))}
              </div>
            )}

            {/* Calendar Grid Content - Original styles/structure */}
            <div
              className={`grid ${
                view === "days" ? "grid-cols-7" : "grid-cols-3"
              } gap-1 place-items-center`}
            >
              {view === "days" && renderDays()}
              {view === "months" && renderMonths()}
              {view === "years" && renderYears()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingDate;
