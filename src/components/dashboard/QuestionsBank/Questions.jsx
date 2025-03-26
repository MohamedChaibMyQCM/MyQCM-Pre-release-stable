"use client";

import coursePerModule from "../../../../public/Icons/coursePerModule.svg";
import Image from "next/image";
import playSeason from "../../../../public/Icons/play.svg";
// import inform from "../../../../public/Icons/inform.svg";
import { useState } from "react";
import TrainingSeason from "./TrainingSeason";
import Loading from "@/components/Loading";

const Questions = ({ data, isLoading, error }) => {
  const [popup, setPopup] = useState(false);
  const [courseId, setCourseId] = useState("");

  if (isLoading) return <Loading />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="relative  rounded-[20px]">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-center font-Poppins font-[500] text-[22px] text-[#191919]">
          Questions par cours
        </h1>
      </div>
      <ul className="flex flex-col gap-4 box bg-[#FFFFFF] p-5 rounded-[16px]">
        {data &&
          data.map((item) => (
            <li
              className="flex items-center justify-between border border-[#E4E4E4] rounded-[16px] px-[22px] py-[14px] max-md:px-[16px]"
              key={item.id}
              onClick={() => setCourseId(item.id)}
            >
              <div className="basis-[34%] flex items-center gap-4 max-md:gap-3 max-md:basis-[80%]">
                <Image
                  src={coursePerModule}
                  alt="module"
                  className="w-[40px] max-md:w-[34px]"
                />
                <div className="flex flex-col gap-[2px]">
                  <span className="font-Poppins text-[#191919] font-[500] text-[14px]">
                    {item.name.length > 36
                      ? `${item.name.slice(0, 36)}...`
                      : item.name}
                  </span>
                  <span className="font-Poppins text-[#666666] text-[12px]">
                    UI1 - Cardiology •{" "}
                    <span className="text-[#F8589F]">
                      {item.total_mcqs} Question
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-8 mr-5 max-md:hidden">
                <span className="text-[14px] text-[#F8589F] font-Inter font-medium">
                  Accuracy
                </span>
                <div className="flex items-center gap-3 mr-5">
                  <span className="relative block w-[200px] h-[12px] bg-[#F5F5F5] rounded-[16px]">
                    <span
                      className="absolute left-0 h-[12px] rounded-[16px] bg-gradient-to-r from-[#F8589F] to-[#FD2E8A]"
                      style={{ width: `${item.average_accuracy * 100}%` }}
                    ></span>
                  </span>
                  <span className="text-[#191919] font-Inter font-medium text-[13px]">
                    {(item.average_accuracy * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button>
                  {/* <Image
                    src={inform}
                    alt="inform"
                    className="w-[22px] max-md:w-[18px]"
                  /> */}
                </button>
                <button onClick={() => setPopup(true)}>
                  <Image
                    src={playSeason}
                    alt="play Season"
                    className="w-[22px] max-md:w-[18px]"
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
