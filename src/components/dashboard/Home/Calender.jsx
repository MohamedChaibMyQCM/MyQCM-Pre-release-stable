"use client"
import React, { useState } from "react";
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const changeMonth = (increment) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + increment);
      return newDate;
    });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const totalCells = 42; // 6 rows * 7 days
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<td key={`empty-start-${i}`} className="w-[40px]"></td>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <td
          key={`day-${day}`}
          className="text-[14px] text-[#4A5660] font-Poppins font-medium w-[40px] text-center"
        >
          {day}
        </td>
      );
    }

    const remainingCells = totalCells - days.length;
    for (let i = 0; i < remainingCells; i++) {
      days.push(<td key={`empty-end-${i}`} className="w-[40px]"></td>);
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
    <div className="mb-[30px]">
      <h2 className="font-Inter text-[#121212] font-bold text-[17px] mb-5">
        Your learning path
      </h2>
      <div className="bg-[#FFFFFF] box py-[18px] px-[40px] rounded-[16px]">
        <div className="flex items-center justify-between mb-4">
          <MdOutlineKeyboardArrowLeft
            className="text-[#B5BEC6] text-[20px] cursor-pointer"
            onClick={() => changeMonth(-1)}
          />
          <span className="font-Poppins text-[#4A5660] font-medium text-[15px]">
            {`${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
          </span>
          <MdOutlineKeyboardArrowRight
            className="text-[#B5BEC6] text-[20px] cursor-pointer"
            onClick={() => changeMonth(1)}
          />
        </div>
        <div className="w-[80%] mx-auto">
          <table className="w-[100%]">
            <thead className="w-full">
              <tr className="flex justify-between items-center mb-2 w-[100%]">
                {daysOfWeek.map(day => (
                  <th key={day} className="text-[12px] text-[#B5BEC6] font-Poppins font-medium w-[40px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{renderCalendar()}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Calendar;