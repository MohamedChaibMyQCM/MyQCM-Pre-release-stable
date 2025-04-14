"use client";

import { useState, useRef, useEffect } from "react";
import calendarIcon from "../../../../public/auth/date.svg";
import Image from "next/image";
import { CaretDown, CaretLeft, CaretRight } from "phosphor-react";

const EndingDate = ({ name, value, setFieldValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("days");
  const [currentDate, setCurrentDate] = useState(
    value ? new Date(value + "T12:00:00") : new Date()
  );
  const dropdownRef = useRef(null);

  const selectedDate = value ? new Date(value + "T12:00:00") : null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handleDateSelect = (day) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const formattedMonth = String(month).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const newDateString = `${year}-${formattedMonth}-${formattedDay}`;
    setFieldValue(name, newDateString);
    setIsOpen(false);
    setView("days");
  };

  const navigateMonth = (direction) => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + (direction === "prev" ? -1 : 1),
        1
      )
    );
  };

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = (getFirstDayOfMonth(currentDate) + 6) % 7;
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayNames = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="w-7 h-7 sm:w-8 sm:h-8"></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentDate.getMonth() &&
        selectedDate.getFullYear() === currentDate.getFullYear();

      const currentDayDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const isToday = currentDayDate.getTime() === today.getTime();

      days.push(
        <button
          key={`day-${day}`}
          type="button"
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors duration-150 ease-in-out
            ${
              isSelected
                ? "bg-[#F8589F] text-white hover:bg-[#e04287]"
                : isToday
                ? "text-[#F8589F] border border-[#F8589F] hover:bg-[#FFF5FA]"
                : "text-[#191919] hover:bg-[#f0f0f0]"
            }
          `}
          onClick={() => handleDateSelect(day)}
          aria-label={`Select day ${day}`}
        >
          {day}
        </button>
      );
    }

    return (
      <>
        {dayNames.map((dName) => (
          <div
            key={dName}
            className="text-center text-xs text-[#666666] font-medium w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center"
          >
            {dName}
          </div>
        ))}
        {days}
      </>
    );
  };

  const renderMonths = () => {
    return Array.from({ length: 12 }).map((_, month) => (
      <button
        key={month}
        type="button"
        className={`p-1.5 sm:p-2 rounded-lg text-xs sm:text-sm font-medium transition-colors
            ${
              currentDate.getMonth() === month
                ? "bg-[#FFF5FA] text-[#F8589F]"
                : "hover:bg-[#f0f0f0] text-[#191919]"
            }
            ${
              selectedDate?.getFullYear() === currentDate.getFullYear() &&
              selectedDate?.getMonth() === month
                ? "ring-2 ring-[#F8589F] ring-offset-1"
                : ""
            }
            `}
        onClick={() => {
          setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
          setView("days");
        }}
        aria-label={`Select month ${new Date(0, month).toLocaleString("fr-FR", {
          month: "long",
        })}`}
      >
        {new Date(0, month)
          .toLocaleString("fr-FR", { month: "short" })
          .replace(".", "")}
      </button>
    ));
  };

  const renderYears = () => {
    const currentYear = currentDate.getFullYear();
    const startYear = currentYear - 5;
    return Array.from({ length: 12 }).map((_, i) => {
      const year = startYear + i;
      return (
        <button
          key={year}
          type="button"
          className={`p-1.5 sm:p-2 rounded-lg text-xs sm:text-sm font-medium transition-colors
                ${
                  currentDate.getFullYear() === year
                    ? "bg-[#FFF5FA] text-[#F8589F]"
                    : "hover:bg-[#f0f0f0] text-[#191919]"
                }
                 ${
                   selectedDate?.getFullYear() === year
                     ? "ring-2 ring-[#F8589F] ring-offset-1"
                     : ""
                 }
            `}
          onClick={() => {
            setCurrentDate(new Date(year, currentDate.getMonth(), 1));
            setView("days");
          }}
          aria-label={`Select year ${year}`}
        >
          {year}
        </button>
      );
    });
  };

  return (
    <div
      className="w-full flex flex-col gap-2 relative basis-full md:basis-[calc(50%-12px)]"
      ref={dropdownRef}
    >
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 sm:right-auto z-20 mb-2 bg-white rounded-[12px] border border-[#E4E4E4] shadow-lg p-2 sm:p-3 w-full sm:w-[300px] overflow-hidden">
          <div className="flex justify-between items-center mb-2 sm:mb-3">
            <button
              type="button"
              onClick={() =>
                view === "days"
                  ? navigateMonth("prev")
                  : setCurrentDate(
                      new Date(
                        currentDate.getFullYear() - (view === "years" ? 12 : 1),
                        currentDate.getMonth(),
                        1
                      )
                    )
              }
              className="p-1 sm:p-1.5 rounded-full hover:bg-[#FFE7F2] text-[#F8589F] transition-colors"
              aria-label={
                view === "days"
                  ? "Mois précédent"
                  : view === "years"
                  ? "Previous 12 years"
                  : "Année précédente"
              }
            >
              <CaretLeft size={18} weight="bold" />
            </button>

            <div className="flex gap-1 text-xs sm:text-sm">
              {view !== "months" && (
                <button
                  type="button"
                  className="font-semibold hover:text-[#F8589F] py-1 px-1 sm:px-2 rounded-md hover:bg-[#f0f0f0] transition-colors"
                  onClick={() => setView("months")}
                >
                  {currentDate.toLocaleString("fr-FR", { month: "long" })}
                </button>
              )}
              <button
                type="button"
                className="font-semibold hover:text-[#F8589F] py-1 px-1 sm:px-2 rounded-md hover:bg-[#f0f0f0] transition-colors"
                onClick={() => setView("years")}
              >
                {currentDate.getFullYear()}
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                view === "days"
                  ? navigateMonth("next")
                  : setCurrentDate(
                      new Date(
                        currentDate.getFullYear() + (view === "years" ? 12 : 1),
                        currentDate.getMonth(),
                        1
                      )
                    )
              }
              className="p-1 sm:p-1.5 rounded-full hover:bg-[#FFE7F2] text-[#F8589F] transition-colors"
              aria-label={
                view === "days"
                  ? "Mois suivant"
                  : view === "years"
                  ? "Next 12 years"
                  : "Année suivante"
              }
            >
              <CaretRight size={18} weight="bold" />
            </button>
          </div>

          <div
            className={`grid gap-1 place-items-center ${
              view === "days" ? "grid-cols-7" : "grid-cols-4"
            }`}
          >
            {view === "days" && renderDays()}
            {view === "months" && renderMonths()}
            {view === "years" && renderYears()}
          </div>
        </div>
      )}

      <label
        htmlFor={name}
        className="text-[#191919] text-sm sm:text-[16px] font-[500]"
      >
        Date de fin prévue
      </label>

      <button
        type="button"
        id={name}
        className="text-left rounded-[10px] flex items-center bg-[#FFF] border border-[#E4E4E4] text-[#666666] font-medium py-2.5 sm:py-3 px-3 sm:px-[20px] cursor-pointer hover:border-[#F8589F] transition-colors focus:outline-none focus:ring-1 focus:ring-[#F8589F]"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 sm:gap-3 w-full">
          <Image
            src={calendarIcon}
            alt=""
            className="w-4 sm:w-[18px] flex-shrink-0"
            aria-hidden="true"
            width={18}
            height={18}
          />
          <span
            className={`flex-grow truncate text-xs sm:text-[14px] ${
              value ? "text-[#191919]" : "text-[#666666]"
            }`}
          >
            {selectedDate
              ? selectedDate.toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Sélectionnez votre date de fin prévue"}
          </span>
          <CaretDown
            size={20}
            className={`text-[#F8589F] ml-auto flex-shrink-0 transition-transform duration-200 ease-in-out ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </div>
      </button>
    </div>
  );
};

export default EndingDate;
