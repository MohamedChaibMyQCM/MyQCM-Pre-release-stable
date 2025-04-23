"use client";
import BaseUrl from "@/components/BaseUrl";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import secureLocalStorage from "react-secure-storage";
import { format } from "date-fns";

const  Mon_Emploi_Du_Temps = () => {
  const {
    data: scheduleData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["SheduleData"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get("/training-session?status=scheduled", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data.data || [];
    },
  });

  const getStatus = (session) => {
    if (session.status === "in_progress") {
      return { text: "En attente", color: "#FFAD0D", bg: "#FFF7E1" };
    }
    if (session.status === "completed") {
      return { text: "Terminé", color: "#47B881", bg: "#E5F5EC" };
    }
    if (!session.accuracy)
      return { text: "En attente", color: "#FFAD0D", bg: "#FFF7E1" };
    if (session.accuracy >= 80)
      return { text: "Excellent", color: "#F8589F", bg: "#FFE5F0" };
    if (session.accuracy >= 60)
      return { text: "Bon", color: "#47B881", bg: "#E5F5EC" };
    return { text: "Moyenne", color: "#FFAD0D", bg: "#FFF7E1" };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "EEE, d 'à' HH:mm");
  };

  if (isLoading) {
    return (
      <div id="tour-my-schedule" className="flex-1">
        <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
          Mon emploi du temps
        </h3>
        <div className="bg-[#FFFFFF] rounded-[16px] px-6 py-4 box h-[320px] flex items-center justify-center">
          <span className="text-[#666666]">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="tour-my-schedule" className="flex-1">
        <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
          Mon emploi du temps
        </h3>
        <div className="bg-[#FFFFFF] rounded-[16px] px-6 py-4 box h-[320px] flex items-center justify-center">
          <span className="text-[#F64C4C]">
            Erreur de chargement de l&apos;emploi du temps
          </span>
        </div>
      </div>
    );
  }

  if (!scheduleData || scheduleData.length === 0) {
    return (
      <div id="tour-my-schedule" className="flex-1">
        <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
          Mon emploi du temps
        </h3>
        <div className="bg-[#FFFFFF] rounded-[16px] px-6 py-4 box h-[320px] flex items-center justify-center">
          <div className="bg-white px-6 py-3 rounded-full shadow-md border-[2px] border-[#F8589F]">
            <span className="text-[#F8589F] font-medium text-[18px]">
              Aucun planning pour le moment
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="tour-my-schedule" className="flex-1">
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        Mon emploi du temps
      </h3>
      <div className="bg-[#FFFFFF] rounded-[16px] px-6 py-4 box h-[320px] overflow-y-auto scrollbar-hide flex flex-col">
        <ul className="flex flex-col gap-4 flex-grow mt-3">
          {scheduleData.map((session) => {
            const status = getStatus(session);
            const score = session.accuracy
              ? `${Math.round(session.accuracy)}%`
              : "0%";
            const date = session.scheduled_at
              ? formatDate(session.scheduled_at)
              : "Non programmé";

            return (
              <li
                key={session.id}
                className="border border-[#E4E4E4] p-4 pl-3 rounded-[12px]"
              >
                <span className="relative bg-[#FFF5FA] w-fit py-1 px-[16px] rounded-[16px] text-[14px] text-[#F8589F] font-[500] block">
                  {session.title}
                </span>
                <div className="flex items-center justify-between mt-3 pl-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#F8589F] font-[500] text-[16px]">
                      {score}
                    </span>
                    <span
                      className="text-[13px] rounded-[12px] px-[10px] py-[2px] font-[500]"
                      style={{
                        color: status.color,
                        backgroundColor: status.bg,
                      }}
                    >
                      {status.text}
                    </span>
                  </div>
                  <span className="text-[13px] text-[#B5BEC6]">{date}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Mon_Emploi_Du_Temps;
