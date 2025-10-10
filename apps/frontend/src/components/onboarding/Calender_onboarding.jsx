"use client";

import { useState, useMemo } from "react";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";

const Calender_onboarding = ({ highlightedElementInfo, isTourActive }) => {
  const staticScheduleInfo = [
    /* ... as before ... */
    {
      id: "session-1",
      scheduled_at: new Date(2024, 6, 10, 10, 0, 0).toISOString(),
    },
    {
      id: "session-2",
      scheduled_at: new Date(2024, 6, 20, 14, 30, 0).toISOString(),
    },
    {
      id: "session-3",
      scheduled_at: new Date(2024, 7, 5, 9, 0, 0).toISOString(),
    },
  ];
  const [currentDate, setCurrentDate] = useState(new Date(2024, 6, 1));
  // const [selectedDate, setSelectedDate] = useState(null); // selectedDate not strictly needed for static display
  const [localScheduleInfo] = useState(staticScheduleInfo); // localScheduleInfo doesn't need set for static display

  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  const daysOfWeek = ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"];
  const CELL_WIDTH = "w-10";
  const CELL_HEIGHT = "h-[35px]";

  const { daysInMonth, firstDay } = useMemo(() => {
    /* ... as before ... */
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return {
      daysInMonth: new Date(year, month + 1, 0).getDate(),
      firstDay: new Date(year, month, 1).getDay(),
    };
  }, [currentDate]);
  const scheduledDates = useMemo(() => {
    /* ... as before ... */
    return (
      localScheduleInfo?.map((session) => {
        const date = new Date(session.scheduled_at);
        return {
          year: date.getFullYear(),
          month: date.getMonth(),
          day: date.getDate(),
          id: session.id,
        };
      }) || []
    );
  }, [localScheduleInfo]);

  const changeMonth = (increment) => {
    /* ... as before ... */
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(1);
      newDate.setMonth(newDate.getMonth() + increment);
      return newDate;
    });
  };
  const handleDateClick = (day) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    // Date clicked for static demo
  };
  const hasScheduledSession = (day) => {
    /* ... as before ... */
    return scheduledDates.some(
      ({ year, month, day: scheduledDay }) =>
        year === currentDate.getFullYear() &&
        month === currentDate.getMonth() &&
        scheduledDay === day
    );
  };

  const renderCalendar = () => {
    /* ... as before ... */
    const totalCells = daysInMonth + firstDay > 35 ? 42 : 35;
    const daysArray = [];
    for (let i = 0; i < firstDay; i++) {
      daysArray.push(
        <td
          key={`empty-start-${i}`}
          className={`${CELL_WIDTH} ${CELL_HEIGHT}`}
        ></td>
      );
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isScheduled = hasScheduledSession(day);
      daysArray.push(
        <td
          key={`day-${day}`}
          className={`text-[14px] font-Poppins font-medium ${CELL_WIDTH} ${CELL_HEIGHT} flex items-center justify-center rounded-full transition-colors duration-200 ${
            isScheduled
              ? "bg-[#FD2E8A] text-white cursor-not-allowed"
              : "text-[#4A5660] hover:bg-[#F8589F] hover:text-white cursor-pointer"
          }`}
          onClick={() => handleDateClick(day)}
        >
          {" "}
          {day}{" "}
        </td>
      );
    }
    const remainingCells = totalCells - daysArray.length;
    for (let i = 0; i < remainingCells; i++) {
      daysArray.push(
        <td
          key={`empty-end-${i}`}
          className={`${CELL_WIDTH} ${CELL_HEIGHT}`}
        ></td>
      );
    }
    const rows = [];
    for (let i = 0; i < daysArray.length; i += 7) {
      rows.push(
        <tr
          key={`row-${i / 7}`}
          className="flex items-center justify-between mb-1 md:mb-2"
        >
          {daysArray.slice(i, i + 7)}
        </tr>
      );
    }
    return rows;
  };

  const isActive = (id) =>
    isTourActive && highlightedElementInfo && highlightedElementInfo.id === id;

  return (
    <div
      id="tour-calendar-section"
      className={`w-full p-1 -m-1 rounded-lg  
                    ${
                      isActive("tour-calendar-section")
                        ? "tour-highlight-active"
                        : ""
                    }
                    ${isTourActive ? "component-under-tour" : ""}`}
    >
      {" "}
      {/* Added padding to wrapper for highlight room */}
      <h2 className="text-[#191919] font-[500] text-[17px] mb-4 md:mb-6 max-md:mb-4 text-center md:text-left">
        Planifiez votre apprentissage
      </h2>
      <div className="bg-[#FFFFFF] shadow-md py-[18px] px-3 sm:px-4 md:px-[30px] rounded-[16px] w-full">
        {/* ... Rest of Calendar JSX ... */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <button
            onClick={() => changeMonth(-1)}
            aria-label="Mois précédent"
            className="p-1"
          >
            {" "}
            <MdOutlineKeyboardArrowLeft className="text-[#B5BEC6] text-[20px] cursor-pointer hover:text-[#F8589F]" />{" "}
          </button>
          <span className="font-Poppins text-[#4A5660] font-medium text-[15px] select-none">
            {" "}
            {`${
              monthNames[currentDate.getMonth()]
            } ${currentDate.getFullYear()}`}{" "}
          </span>
          <button
            onClick={() => changeMonth(1)}
            aria-label="Mois suivant"
            className="p-1"
          >
            {" "}
            <MdOutlineKeyboardArrowRight className="text-[#B5BEC6] text-[20px] cursor-pointer hover:text-[#F8589F]" />{" "}
          </button>
        </div>
        <div className="w-full">
          {" "}
          <table className="w-full table-fixed">
            {" "}
            <thead>
              {" "}
              <tr className="flex justify-between items-center mb-1 md:mb-2 w-full">
                {" "}
                {daysOfWeek.map((day) => (
                  <th
                    key={day}
                    className={`text-[12px] text-[#B5BEC6] font-medium ${CELL_WIDTH} text-center`}
                  >
                    {day}
                  </th>
                ))}{" "}
              </tr>{" "}
            </thead>{" "}
            <tbody>{renderCalendar()}</tbody>{" "}
          </table>{" "}
        </div>
      </div>
    </div>
  );
};

export default Calender_onboarding;
