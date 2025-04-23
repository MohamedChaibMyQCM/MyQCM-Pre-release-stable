"use client";

import { CaretDown, CaretLeft, CaretRight } from "phosphor-react";
import { useState, useRef, useEffect } from "react";

const SheduleDate = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    value ? new Date(value) : null
  );
  const [view, setView] = useState("days");
  const dropdownRef = useRef(null);

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
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(newDate);
    onChange?.(newDate);
    setIsOpen(false);
    setView("days");
  };

  const formatDate = (date) => {
    if (!date) return "Sélectionner une date";
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
          type="button"
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
            ${
              isSelected
                ? "bg-[#F8589F] text-white"
                : "hover:bg-[#FFE7F2] text-[#191919]"
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
        className={`p-2 rounded-lg text-sm ${
          currentDate.getMonth() === month
            ? "bg-[#FFE7F2] text-[#F8589F]"
            : "hover:bg-[#FFE7F2] text-[#191919]"
        }`}
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
          type="button"
          className={`p-2 rounded-lg text-sm ${
            currentDate.getFullYear() === year
              ? "bg-[#FFE7F2] text-[#F8589F]"
              : "hover:bg-[#FFE7F2] text-[#191919]"
          }`}
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
    <div className="flex flex-col gap-2 w-full relative">
      <label className="text-[15px] font-[600] text-[#191919]">Date</label>
      <div className="relative w-full" ref={dropdownRef}>
        <div
          className="rounded-[20px] flex items-center bg-white border border-gray-300 text-[#191919] font-medium py-[10px] px-[20px] cursor-pointer hover:border-[#F8589F] transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="flex-grow text-[14px]">
            {formatDate(selectedDate)}
          </span>
          <CaretDown
            size={20}
            className={`text-[#191919] ml-2 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {isOpen && (
          <div className="absolute z-10 bottom-full mb-2 w-full max-md:w-[300px] bg-white rounded-[10px] border border-[#E4E4E4] shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
              <button
                type="button"
                onClick={() => navigateMonth("prev")}
                className="p-1 rounded-full hover:bg-[#FFE7F2] text-[#F8589F]"
              >
                <CaretLeft size={20} />
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="font-medium hover:text-[#F8589F] text-sm"
                  onClick={() => setView("months")}
                >
                  {currentDate.toLocaleString("fr-FR", { month: "long" })}
                </button>
                <button
                  type="button"
                  className="font-medium hover:text-[#F8589F] text-sm"
                  onClick={() => setView("years")}
                >
                  {currentDate.getFullYear()}
                </button>
              </div>

              <button
                type="button"
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
      </div>
    </div>
  );
};

export default SheduleDate;
