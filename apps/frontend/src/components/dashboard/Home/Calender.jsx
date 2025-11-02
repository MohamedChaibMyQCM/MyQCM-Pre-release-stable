"use client";

import { useState, useMemo } from "react";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import SchedulePopup from "./SchedulePopup";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import secureLocalStorage from "react-secure-storage";
import BaseUrl from "@/components/BaseUrl";
import toast from "react-hot-toast";

const Calendar = () => {
  const queryClient = useQueryClient();
  const {
    data: scheduleInfo,
    isLoading: isUnitsLoading,
    error: unitsError,
  } = useQuery({
    queryKey: ["SheduleInfo"],
    queryFn: async () => {
      try {
        const token = secureLocalStorage.getItem("token");
        const response = await BaseUrl.get(
          "/training-session?status=scheduled&offset=50",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return response.data?.data?.data || [];
      } catch (err) {
        toast.error(
          "Échec du chargement des sessions planifiées. Veuillez réessayer plus tard."
        );
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

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

  const { daysInMonth, firstDay } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return {
      daysInMonth: new Date(year, month + 1, 0).getDate(),
      firstDay: new Date(year, month, 1).getDay(),
    };
  }, [currentDate]);

  const scheduledDates = useMemo(() => {
    return (
      scheduleInfo?.map((session) => {
        const date = new Date(session.scheduled_at);
        return {
          year: date.getFullYear(),
          month: date.getMonth(),
          day: date.getDate(),
          id: session.id,
        };
      }) || []
    );
  }, [scheduleInfo]);

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

    const hasSession = scheduledDates.some(
      ({ year, month, day: scheduledDay }) =>
        year === currentDate.getFullYear() &&
        month === currentDate.getMonth() &&
        scheduledDay === day
    );

    if (hasSession) {
      toast("Cette date a déjà une session planifiée", { icon: "ℹ️" });
      return;
    }

    setSelectedDate(selected);
    setIsPopupOpen(true);
  };

  const hasScheduledSession = (day) => {
    return scheduledDates.some(
      ({ year, month, day: scheduledDay }) =>
        year === currentDate.getFullYear() &&
        month === currentDate.getMonth() &&
        scheduledDay === day
    );
  };

  const handleNewSession = (newSession) => {
    queryClient.setQueryData(["SheduleInfo"], (oldData) => {
      return [...(oldData || []), newSession];
    });
    queryClient.invalidateQueries(["SheduleInfo"]);
  };

  const renderCalendar = () => {
    const totalCells = 42;
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<td key={`empty-start-${i}`} className="w-[30px]"></td>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isScheduled = hasScheduledSession(day);
      days.push(
        <td
          key={`day-${day}`}
          className={`text-[14px] font-Poppins font-medium w-[30px] h-[30px] flex items-center justify-center cursor-pointer rounded-full transition-colors ${
            isScheduled
              ? "bg-primary text-primary-foreground"
              : "text-card-foreground hover:bg-primary hover:text-primary-foreground"
          }`}
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
    <div id="tour-calendar-section" className="w-[100%]">
      <h2 className="text-foreground font-[500] text-[17px] mb-6 max-md:mb-4">
        Planifiez votre apprentissage
      </h2>
      <div className="bg-card box py-[18px] px-[40px] rounded-[16px] max-md:px-0 w-[100%] h-[316px] max-md:px-[20px] border border-border">
        <div className="flex items-center justify-between mb-4">
          <MdOutlineKeyboardArrowLeft
            className="text-muted-foreground text-[20px] cursor-pointer hover:text-foreground transition-colors"
            onClick={() => changeMonth(-1)}
          />
          <span className="font-Poppins text-card-foreground font-medium text-[15px]">
            {`${
              monthNames[currentDate.getMonth()]
            } ${currentDate.getFullYear()}`}
          </span>
          <MdOutlineKeyboardArrowRight
            className="text-muted-foreground text-[20px] cursor-pointer hover:text-foreground transition-colors"
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
                    className="text-[12px] text-muted-foreground font-medium w-[30px]"
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
          onSessionCreated={handleNewSession}
        />
      )}
    </div>
  );
};

export default Calendar;
