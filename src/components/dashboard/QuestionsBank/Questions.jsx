"use client";

import coursePerModule from "../../../../public/Icons/coursePerModule.svg";
import Image from "next/image";
import playSeason from "../../../../public/Icons/playSeason.svg";
import inform from "../../../../public/Icons/inform.svg";
import { useState } from "react";
import TrainingSeason from "./TrainingSeason";
import options from "../../../../public/Icons/greyOption.svg";
import SelectUnite from "./SelectUnite";
import Loading from "@/components/Loading";

const Questions = ({ data, isLoading, error }) => {
  const [popup, setPopup] = useState(false);
  const [selectUnite, setSelectUnite] = useState(false);
  const [courseId, setCourseId] = useState("");

  if (isLoading) return <Loading />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="relative box py-[24px] px-[22px] rounded-[20px]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-center font-Poppins font-semibold text-[22px] text-[#0C092A]">
          Questions par cours
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-[#858494] font-Poppins font-semibold text-[13px]">
            Sélectionner l'unité
          </span>
          <Image
            src={options}
            alt="options"
            className=" cursor-pointer"
            onClick={() => setSelectUnite(true)}
          />
        </div>
        {selectUnite && <SelectUnite setselectunite={setSelectUnite} />}
      </div>
      <ul className="flex flex-col gap-4">
        {data.map((item) => (
          <li
            className="flex items-center justify-between border border-[#E4E4E4] rounded-[16px] px-[22px] py-[14px]"
            key={item.id}
            onClick={() => setCourseId(item.id)}
          >
            <div className="flex items-center gap-4">
              <Image src={coursePerModule} alt="module" className="w-[40px]" />
              <div className="flex flex-col gap-[2px]">
                <span className="font-Poppins text-[#0C092A] font-semibold text-[14px]">
                  {item.name}
                </span>
                <span className="font-Poppins text-[#858494] text-[12px]">
                  UI1 - Cardiology • {item.total_mcqs} Question
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[13px] text-[#808191] font-Inter font-medium">
                Your accuracy in the lesson
              </span>
              <div className="flex items-center gap-2 mr-5">
                <span className="relative block w-[200px] h-[16px] bg-[#E8E8E8] rounded-[16px]">
                  <span
                    className="absolute left-0 h-[16px] rounded-[16px] bg-gradient-to-r from-[#FFC1DD] via-[#F8589F] to-[#EF0870]"
                    style={{ width: `${item.average_accuracy * 100}%` }}
                  ></span>
                </span>
                <span className="text-[#808191] font-Inter font-medium text-[13px]">
                  {(item.average_accuracy * 100).toFixed(1)}%
                </span>
              </div>
              <button>
                <Image src={inform} alt="inform" className="w-[22px]" />
              </button>
              <button onClick={() => setPopup(true)}>
                <Image
                  src={playSeason}
                  alt="play Season"
                  className="w-[22px]"
                />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {popup && <TrainingSeason setPopup={setPopup} courseId={courseId} />}
    </div>
  );
};

export default Questions;
