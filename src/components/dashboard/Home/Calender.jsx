"use client";

import { useState, useMemo } from "react";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import SchedulePopup from "./SchedulePopup"; 

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null); 
  const [isPopupOpen, setIsPopupOpen] = useState(false); 

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const { daysInMonth, firstDay } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return {
      daysInMonth: new Date(year, month + 1, 0).getDate(),
      firstDay: new Date(year, month, 1).getDay(),
    };
  }, [currentDate]);

  const changeMonth = (increment) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + increment);
      return newDate;
    });
  };

  const handleDateClick = (day) => {
    const selected = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(selected);
    setIsPopupOpen(true);
  };

  const renderCalendar = () => {
    const totalCells = 42;
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<td key={`empty-start-${i}`} className="w-[30px]"></td>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <td
          key={`day-${day}`}
          className="text-[14px] text-[#4A5660] font-Poppins font-medium w-[30px] h-[30px] flex items-center justify-center cursor-pointer hover:bg-[#F8589F] hover:text-white rounded-full"
          onClick={() => handleDateClick(day)}
        >
          {day}
        </td>
      );
    }

    const remainingCells = totalCells - days.length;
    for (let i = 0; i < remainingCells; i++) {
      days.push(<td key={`empty-end-${i}`} className="w-[30px]"></td>);
    }

    const rows = [];
    for (let i = 0; i < totalCells; i += 7) {
      rows.push(
        <tr key={`row-${i}`} className="flex items-center justify-between mb-2">
          {days.slice(i, i + 7)}
        </tr>
      );
    }

    return rows;
  };

  return (
    <div className="w-[100%]">
      <h2 className="text-[#191919] font-[500] text-[17px] mb-6">
        Votre parcours d&apos;apprentissage
      </h2>
      <div className="bg-[#FFFFFF] box py-[18px] px-[40px] rounded-[16px] max-md:px-0 w-[100%] h-[316px]">
        <div className="flex items-center justify-between mb-4">
          <MdOutlineKeyboardArrowLeft
            className="text-[#B5BEC6] text-[20px] cursor-pointer"
            onClick={() => changeMonth(-1)}
          />
          <span className="font-Poppins text-[#4A5660] font-medium text-[15px]">
            {`${
              monthNames[currentDate.getMonth()]
            } ${currentDate.getFullYear()}`}
          </span>
          <MdOutlineKeyboardArrowRight
            className="text-[#B5BEC6] text-[20px] cursor-pointer"
            onClick={() => changeMonth(1)}
          />
        </div>
        <div className="w-full">
          <table className="w-full">
            <thead className="w-full">
              <tr className="flex justify-between items-center mb-2 w-full">
                {daysOfWeek.map((day) => (
                  <th
                    key={day}
                    className="text-[12px] text-[#B5BEC6] font-medium w-[30px]"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{renderCalendar()}</tbody>
          </table>
        </div>
      </div>

      {isPopupOpen && (
        <SchedulePopup
          selectedDate={selectedDate}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </div>
  );
};

export default Calendar;
