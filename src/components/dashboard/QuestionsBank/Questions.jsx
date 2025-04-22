"use client";

import Image from "next/image";
import playSeasonIcon from "../../../../public/Icons/play.svg";
import { useState } from "react";
import TrainingSeason from "./TrainingSeason";
import Loading from "@/components/Loading";
import planification from "../../../../public/Icons/planification.svg";

const Questions = ({
  data = [],
  isLoading = false,
  error = null,
  subjectData = { attachement: "", name: "Unknown Subject" },
}) => {
  const [showTrainingPopup, setShowTrainingPopup] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const handlePlayClick = (courseId) => {
    setSelectedCourseId(courseId);
    setShowTrainingPopup(true);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-100 border border-red-400 rounded">
        Erreur lors du chargement : {error.message}
      </div>
    );
  }

  if (data.length === 0 && !isLoading) {
    return (
      <div className="p-4 text-gray-600 bg-gray-100 border border-gray-300 rounded">
        Aucune question trouvée pour ce cours.
      </div>
    );
  }

  return (
    <div className="relative rounded-[20px]">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-Poppins font-[500] text-[22px] text-[#191919]">
          Questions par cours
        </h1>
      </div>
      <ul className="flex flex-col gap-4 bg-[#FFFFFF] p-5 rounded-[16px]">
        {data.map((item) => {
          const MAX_NAME_LENGTH = 36;
          const progress = item.progress_percentage || 0;
          const displayName =
            item.name.length > MAX_NAME_LENGTH
              ? `${item.name.slice(0, MAX_NAME_LENGTH)}...`
              : item.name;
          const questionLabel = `Question${item.total !== 1 ? "s" : ""}`;

          return (
            <li
              className="flex items-center justify-between border border-[#E4E4E4] rounded-[16px] px-[22px] py-[14px] max-md:px-[16px] hover:shadow-md duration-200"
              key={item.id}
            >
              <div className="basis-[34%] flex items-center gap-4 max-md:gap-3 max-md:basis-[80%]">
                <Image
                  src={subjectData.icon || "/default-icon.svg"}
                  alt={`Icon for ${subjectData.name}`}
                  width={40}
                  height={40}
                  className="w-[40px] h-[40px] max-md:w-[34px] max-md:h-[34px]"
                  onError={(e) => {
                    e.target.src = "/default-icon.svg";
                  }}
                />
                <div className="flex flex-col gap-[2px]">
                  <span
                    className="font-Poppins text-[#191919] font-[500] text-[14px]"
                    title={item.name}
                  >
                    {displayName}
                  </span>
                  <span className="font-Poppins text-[#666666] text-[12px]">
                    {subjectData.name} •{" "}
                    <span className="text-[#F8589F]">
                      {item.total} {questionLabel}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-8 mr-5 max-md:hidden">
                <span className="text-[14px] text-[#F8589F] font-Inter font-medium">
                  Précision
                </span>
                <div className="flex items-center gap-3 mr-5">
                  <span
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label={`Progression: ${progress.toFixed(1)}%`}
                    className="relative block w-[200px] h-[12px] bg-[#F5F5F5] rounded-[16px] overflow-hidden"
                  >
                    <span
                      className="absolute left-0 h-[12px] bg-gradient-to-r from-[#F8589F] to-[#FD2E8A]"
                      style={{ width: `${progress}%` }}
                    ></span>
                  </span>
                  <span className="text-[#191919] font-Inter font-medium text-[13px]">
                    {progress.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button onClick={() => handlePlayClick(item.id)}>
                  <Image
                    src={planification}
                    alt="planification"
                    className="max-md:w-[24px] w-[24px] hover:scale-110 duration-200"
                    width={22}
                    height={22}
                  />
                </button>
                <button
                  onClick={() => handlePlayClick(item.id)}
                  aria-label={`Lancer la session d'entraînement pour ${item.name}`}
                  title="Lancer la session"
                >
                  <Image
                    src={playSeasonIcon}
                    alt=""
                    width={22}
                    height={22}
                    className="max-md:w-[24px] w-[24px] hover:scale-110 duration-200"
                  />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {showTrainingPopup && (
        <TrainingSeason
          setPopup={setShowTrainingPopup}
          courseId={selectedCourseId}
        />
      )}
    </div>
  );
};

export default Questions;
