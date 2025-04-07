"use client";

import { useState, useRef, useEffect } from "react";
import calendarIcon from "../../../../public/auth/date.svg";
import Image from "next/image";
import { CaretDown, CaretLeft, CaretRight } from "phosphor-react";

const EndingDate = ({ name, value, setFieldValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("days");
  const [currentDate, setCurrentDate] = useState(new Date());
  const dropdownRef = useRef(null);

  const selectedDate = value ? new Date(value) : null;

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

  const getDaysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handleDateSelect = (day) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setFieldValue(name, newDate.toISOString().split("T")[0]);
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
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
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
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
            ${
              isSelected
                ? "bg-[#F8589F] text-white"
                : "hover:bg-[#FFE7F2] text-[#191919]"
            }
          `}
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
        className={`p-2 rounded-lg text-sm
          ${
            currentDate.getMonth() === month
              ? "bg-[#FFE7F2] text-[#F8589F]"
              : "hover:bg-[#FFE7F2] text-[#191919]"
          }
        `}
        onClick={() => {
          setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
          setView("days");
        }}
      >
        {new Date(0, month).toLocaleString("fr-FR", { month: "short" })}
      </button>
    ));
  };

  const renderYears = () => {
    const currentYear = currentDate.getFullYear();
    return Array.from({ length: 12 }).map((_, i) => {
      const year = currentYear - 6 + i;
      return (
        <button
          key={year}
          className={`p-2 rounded-lg text-sm
            ${
              currentDate.getFullYear() === year
                ? "bg-[#FFE7F2] text-[#F8589F]"
                : "hover:bg-[#FFE7F2] text-[#191919]"
            }
          `}
          onClick={() => {
            setCurrentDate(new Date(year, currentDate.getMonth(), 1));
            setView("days");
          }}
        >
          {year}
        </button>
      );
    });
  };

  return (
    <div className="w-full flex flex-col gap-2 relative" ref={dropdownRef}>
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 z-10 mb-2 bg-white rounded-[10px] border border-[#E4E4E4] shadow-md p-4 w-[300px]">
          {/* En-tête */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-1 rounded-full hover:bg-[#FFE7F2] text-[#F8589F]"
            >
              <CaretLeft size={20} />
            </button>

            <div className="flex gap-2">
              <button
                className="font-medium hover:text-[#F8589F] text-sm"
                onClick={() => setView("months")}
              >
                {currentDate.toLocaleString("fr-FR", { month: "long" })}
              </button>
              <button
                className="font-medium hover:text-[#F8589F] text-sm"
                onClick={() => setView("years")}
              >
                {currentDate.getFullYear()}
              </button>
            </div>

            <button
              onClick={() => navigateMonth("next")}
              className="p-1 rounded-full hover:bg-[#FFE7F2] text-[#F8589F]"
            >
              <CaretRight size={20} />
            </button>
          </div>

          {view === "days" && (
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"].map((day) => (
                <div key={day} className="text-center text-sm text-[#666666]">
                  {day}
                </div>
              ))}
            </div>
          )}

          <div
            className={`grid ${
              view === "days" ? "grid-cols-7" : "grid-cols-4"
            } gap-1`}
          >
            {view === "days" && renderDays()}
            {view === "months" && renderMonths()}
            {view === "years" && renderYears()}
          </div>
        </div>
      )}

      <label className="text-[#191919] text-[16px] font-[500]">
        Date de fin prévue
      </label>

      <div
        className="rounded-[10px] flex items-center bg-[#FFF] border border-[#E4E4E4] text-[#666666] font-medium py-3 px-[20px] cursor-pointer hover:border-[#F8589F] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 w-full">
          <Image src={calendarIcon} alt="calendrier" className="w-[18px]" />
          <span className="truncate text-[14px]">
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
            className={`text-[#F8589F] ml-auto transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
};

export default EndingDate;
