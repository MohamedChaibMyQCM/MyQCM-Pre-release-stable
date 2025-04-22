"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import TrainingSeason from "./TrainingSeason";
import play from "../../../../public/Icons/play.svg";
import planification from "../../../../public/Icons/planification.svg";

const ITEM_PLUS_GAP_HEIGHT_APPROX = 80;
const MAX_VISIBLE_ITEMS = 6;
const GRADIENT_OVERLAY_HEIGHT = 120;

const Courses = ({ courses, subjectId, subjectData }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const handlePlayClick = (courseId) => {
    setSelectedCourseId(courseId);
    setShowPopup(true);
  };

  const validCourses = courses || [];

  const listMaxHeight =
    validCourses.length > MAX_VISIBLE_ITEMS
      ? `${MAX_VISIBLE_ITEMS * ITEM_PLUS_GAP_HEIGHT_APPROX}px`
      : "none";

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
        {validCourses.length === 0 ? (
          <li className="text-center text-gray-500 py-10">
            Aucun cours disponible.
          </li>
        ) : (
          validCourses.map((item) => {
            return (
              <li
                className="flex items-center justify-between border border-[#E4E4E4] rounded-[16px] px-[22px] py-[14px] max-md:px-[16px] duration-200 hover:shadow-md transition-all"
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
                  <button onClick={() => handlePlayClick(item.id)}>
                    <Image
                      src={planification}
                      alt="planification"
                      className="max-md:w-[24px] w-[24px] hover:scale-110 duration-200"
                      width={28}
                      height={28}
                    />
                  </button>
                  <button onClick={() => handlePlayClick(item.id)}>
                    <Image
                      src={play}
                      alt="jouer"
                      className="max-md:w-[24px] w-[24px] hover:scale-110 duration-200"
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

      {showPopup && (
        <TrainingSeason setPopup={setShowPopup} courseId={selectedCourseId} />
      )}
    </div>
  );
};

export default Courses;
