"use client";

import { courses } from "@/data/data";
import Image from "next/image";
import playSeason from "../../../../public/Icons/playSeason.svg";
import inform from "../../../../public/Icons/inform.svg";
import { useState } from "react";
import TrainingSeason from "./TrainingSeason";
import options from "../../../../public/Icons/greyOption.svg";
import SelectUnite from "./SelectUnite";

const Questions = () => {
  const [popup, setPopup] = useState(false);
  const [selectUnite, setSelectUnite] = useState(false);

  return (
    <div className="relative box py-[24px] px-[22px] rounded-[20px]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-center font-Poppins font-semibold text-[22px] text-[#0C092A]">
          Questions per course
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-[#858494] font-Poppins font-semibold text-[13px]">
            Select Unit
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
        {courses.map((item, index) => (
          <li
            className="flex items-center justify-between border border-[#E4E4E4] rounded-[16px] px-[22px] py-[14px]"
            key={index}
          >
            <div className="flex items-center gap-4">
              <Image src={item.img} alt="module" className="w-[40px]" />
              <div className="flex flex-col gap-[2px]">
                <span className="font-Poppins text-[#0C092A] font-semibold text-[14px]">
                  {item.name}
                </span>
                <span className="font-Poppins text-[#858494] text-[12px]">
                  UI1 - Cardiology • {item.question} Question
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[13px] text-[#808191] font-Inter font-medium">
                Your accuracy in the lesson
              </span>
              <div className="flex items-center gap-2 mr-5">
                <span className="relative block w-[200px] h-[16px] bg-[#E8E8E8] rounded-[16px] after:h-[16px] after:w-[100px] after:absolute after:left-0 after:rounded-[16px] after:bg-gradient-to-r after:from-[#FFC1DD] after:via-[#F8589F] after:to-[#EF0870]"></span>
                <span className="text-[#808191] font-Inter font-medium text-[13px]">
                  {item.accuracy}%
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
      {popup && <TrainingSeason />}
    </div>
  );
};

export default Questions;