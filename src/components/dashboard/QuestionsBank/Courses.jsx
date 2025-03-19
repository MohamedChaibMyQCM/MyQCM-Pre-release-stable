"use client";

import coursePerModule from "../../../../public/Icons/coursePerModule.svg";
import Image from "next/image";
import play from "../../../../public/Icons/play.svg";
import Link from "next/link";
import { useState } from "react";
import TrainingSeason from "./TrainingSeason"; // Import the TrainingSeason component

const Courses = ({ courses, subjectId }) => {
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
  const [selectedCourseId, setSelectedCourseId] = useState(null); // State to store the selected course ID

  // Function to handle the "play" button click
  const handlePlayClick = (courseId) => {
    setSelectedCourseId(courseId); // Set the selected course ID
    setShowPopup(true); // Show the popup
  };

  return (
    <div className="relative px-[22px] py-[28px] rounded-[16px] bg-[#FFFFFF] basis-[41%] box after:w-full after:h-[120px] after:bg-gradient-to-t after:from-white after:to-transparent after:absolute after:left-0 after:bottom-0 after:rounded-br-[16px] after:rounded-bl-[16px] max-md:w-[100%]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="#0C092A text-[#191919] font-medium text-[18px]">
          Q/C per course
        </h3>
        <Link
          href={`/dashboard/QuestionsBank/${subjectId}/QuestionPerCourse`}
          className="text-[13px] font-medium text-[#F8589F] cursor-pointer"
        >
          Voir Tout
        </Link>
      </div>
      <ul className="flex flex-col gap-4 ">
        {courses == "" || courses == undefined
          ? ""
          : courses.slice(0, 6).map((item) => {
              return (
                <li
                  className="flex items-center justify-between border border-[#E4E4E4] rounded-[16px] px-[22px] py-[14px] max-md:px-[16px]"
                  key={item.id}
                >
                  <div className="flex items-center gap-4 max-md:w-[80%]">
                    <Image
                      src={coursePerModule}
                      alt="module"
                      className="w-[40px]"
                    />
                    <div className="flex flex-col gap-[2px]">
                      <span className="font-Poppins text-[#191919] font-[500] text-[14px]">
                        {item.name.length > 36
                          ? `${item.name.slice(0, 36)}...`
                          : item.name}
                      </span>
                      <span className="flex items-center gap-1 text-[#666666] text-[12px] max-md:text-[11px]">
                        UI1 - Cardiology •
                        <span className="text-[#F8589F]">
                          {item.total_mcqs} Question
                        </span>
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handlePlayClick(item.id)}>
                    {" "}
                    {/* Pass the course ID to the handler */}
                    <Image
                      src={play}
                      alt="play"
                      className="max-md:w-[30px] w-[28px]"
                    />
                  </button>
                </li>
              );
            })}
      </ul>

      {showPopup && (
        <TrainingSeason
          setPopup={setShowPopup}
          courseId={selectedCourseId}
        />
      )}
    </div>
  );
};

export default Courses;