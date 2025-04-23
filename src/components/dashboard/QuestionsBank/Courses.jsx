"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import play from "../../../../public/Icons/play.svg";
import planification from "../../../../public/Icons/planification.svg";
import { useQuery } from "@tanstack/react-query";
import BaseUrl from "@/components/BaseUrl";
import secureLocalStorage from "react-secure-storage";
import toast from "react-hot-toast"; 
import CustomSeason from "./TrainingPopups/CustomSeason"; 
import CustomSchedule from "./TrainingPopups/CustomShedule"
import GuidedSeason from "./TrainingPopups/GuidedSeason";
import GuidedSchedule from "./TrainingPopups/GuidedShedule"
import SynergySeason from "./TrainingPopups/SynergySeason"; 
import SynergySchedule from './TrainingPopups/SynergyShedule'

const ITEM_PLUS_GAP_HEIGHT_APPROX = 80;
const MAX_VISIBLE_ITEMS = 6;
const GRADIENT_OVERLAY_HEIGHT = 120;

const CUSTOM_MODE = "Custom Mode";
const GUIDED_MODE = "Guided Mode";
const INTELLIGENTE_MODE = "Intelligente Mode"; 

const Courses = ({ courses, subjectId, subjectData }) => {
  const {
    data: userMode,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: ["userProfileMode"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get("/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (
        response.data &&
        response.data.data &&
        response.data.data.mode &&
        response.data.data.mode.name
      ) {
        return response.data.data.mode.name;
      } else {
        toast.error("Unexpected profile data structure");
      }
    },
    onError: (err) => {
      toast.error(`Échec du chargement du mode profil: ${err.message}`);
    },
    enabled: !!secureLocalStorage.getItem("token"), 
  });

  const [activePopup, setActivePopup] = useState(null); 
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const handleScheduleClick = (courseId) => {
    setSelectedCourseId(courseId);
    setActivePopup("schedule");
  };

  const handlePlayClick = (courseId) => {
    setSelectedCourseId(courseId);
    setActivePopup("play");
  };

  const closePopup = () => {
    setActivePopup(null);
    setSelectedCourseId(null);
  };

  const validCourses = courses || [];

  const listMaxHeight =
    validCourses.length > MAX_VISIBLE_ITEMS
      ? `${MAX_VISIBLE_ITEMS * ITEM_PLUS_GAP_HEIGHT_APPROX}px`
      : "none";

  const renderPopup = () => {
    if (!activePopup || !selectedCourseId || isLoadingProfile || !userMode) {
      return null; 
    }

    switch (userMode) {
      case CUSTOM_MODE:
        if (activePopup === "play") {
          return (
            <CustomSeason setPopup={closePopup} courseId={selectedCourseId} />
          );
        }
        if (activePopup === "schedule") {
          return (
            <CustomSchedule setPopup={closePopup} courseId={selectedCourseId} />
          );
        }
        break;
      case GUIDED_MODE:
        if (activePopup === "play") {
          return (
            <GuidedSeason setPopup={closePopup} courseId={selectedCourseId} />
          );
        }
        if (activePopup === "schedule") {
          return (
            <GuidedSchedule setPopup={closePopup} courseId={selectedCourseId} />
          );
        }
        break;
      case INTELLIGENTE_MODE:
        if (activePopup === "play") {
          return (
            // <SynergySeason setPopup={closePopup} courseId={selectedCourseId} />
            <></>
          );
        }
        if (activePopup === "schedule") {
          return (
            <SynergySchedule
              setPopup={closePopup}
              courseId={selectedCourseId}
            />
          );
        }
        break;
      default:
        toast.warn(`Mode utilisateur inconnu: ${userMode}`);
        closePopup();
        return null;
    }
    return null; 
  };

  return (
    <div className="relative px-[22px] py-[28px] rounded-[16px] bg-[#FFFFFF] basis-[41%] box after:w-full after:h-[120px] after:bg-gradient-to-t after:from-white after:to-transparent after:absolute after:left-0 after:bottom-0 after:rounded-br-[16px] after:rounded-bl-[16px] max-md:w-[100%] flex flex-col">
      <div className="flex items-center justify-between mb-5 shrink-0">
        <h3 className="#0C092A text-[#191919] font-medium text-[18px]">
          Q/C par cours
        </h3>
        {validCourses.length > 0 && (
          <Link
            href={`/dashboard/question-bank/${subjectId}/question-per-course`}
            className="text-[13px] font-medium text-[#F8589F] cursor-pointer hover:underline"
          >
            Voir tout
          </Link>
        )}
      </div>

      <ul
        className={`flex flex-col gap-4 flex-grow ${
          validCourses.length > MAX_VISIBLE_ITEMS
            ? "overflow-y-auto scrollbar-hide"
            : "overflow-hidden"
        }`}
        style={{
          maxHeight: listMaxHeight !== "none" ? listMaxHeight : undefined,
          paddingBottom:
            validCourses.length > MAX_VISIBLE_ITEMS
              ? `${GRADIENT_OVERLAY_HEIGHT}px`
              : "0.5rem",
        }}
      >
        {isLoadingProfile && ( 
          <li className="text-center text-gray-500 py-10">
            Chargement du profil...
          </li>
        )}
        {!isLoadingProfile &&
          profileError && (
            <li className="text-center text-red-500 py-10">
              Erreur de chargement du profil.
            </li>
          )}
        {!isLoadingProfile && !profileError && validCourses.length === 0 ? ( 
          <li className="text-center text-gray-500 py-10">
            Aucun cours disponible.
          </li>
        ) : (
          !isLoadingProfile &&
          !profileError &&
          validCourses.map((item) => {
            const buttonsDisabled = isLoadingProfile;

            return (
              <li
                className={`flex items-center justify-between border border-[#E4E4E4] rounded-[16px] px-[22px] py-[14px] max-md:px-[16px] duration-200 transition-all ${
                  buttonsDisabled ? "opacity-50" : "hover:shadow-md"
                }`}
                key={item.id}
              >
                <div className="flex items-center gap-4 max-md:w-[80%]">
                  <Image
                    src={subjectData.icon}
                    alt="cours"
                    className="w-[40px]"
                    width={40}
                    height={40}
                  />
                  <div className="flex flex-col gap-[2px]">
                    <span
                      className="font-Poppins text-[#191919] font-[500] text-[14px]"
                      title={item.name}
                    >
                      {item.name.length > 36
                        ? `${item.name.slice(0, 36)}...`
                        : item.name}
                    </span>
                    <span className="flex items-center gap-1 text-[#666666] text-[12px] max-md:text-[11px]">
                      {subjectData.name} •
                      <span className="text-[#F8589F]">
                        {item.total ?? 0} Questions
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleScheduleClick(item.id)}
                    disabled={buttonsDisabled} 
                    className={`disabled:opacity-50 disabled:cursor-not-allowed ${
                      !buttonsDisabled ? "hover:scale-110 duration-200" : ""
                    }`}
                  >
                    <Image
                      src={planification}
                      alt="planification"
                      className="max-md:w-[24px] w-[24px]"
                      width={28}
                      height={28}
                    />
                  </button>
                  <button
                    onClick={() => handlePlayClick(item.id)}
                    disabled={buttonsDisabled} 
                    className={`disabled:opacity-50 disabled:cursor-not-allowed ${
                      !buttonsDisabled ? "hover:scale-110 duration-200" : ""
                    }`}
                  >
                    <Image
                      src={play}
                      alt="jouer"
                      className="max-md:w-[24px] w-[24px]"
                      width={24}
                      height={24}
                    />
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>

      {renderPopup()}
    </div>
  );
};

export default Courses;