"use client";

import coursePerModule from "../../../../public/Icons/coursePerModule.svg";
import Image from "next/image";
import play from "../../../../public/Icons/play.svg";
import Link from "next/link";
import { useLocale } from "next-intl";

const Courses = ({ courses, subjectId }) => {
  const locale = useLocale();

  return (
    <div className="relative px-[22px] py-[28px] rounded-[16px] bg-[#FFFFFF] basis-[40%] box after:w-full after:h-[120px] after:bg-gradient-to-t after:from-white after:to-transparent after:absolute after:left-0 after:bottom-0 after:rounded-br-[16px] after:rounded-bl-[16px]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="#0C092A font-Poppins font-semibold text-[18px]">
          Q/C per course
        </h3>
        <Link
          href={`/${locale}/dashboard/QuestionsBank/${subjectId}/QuestionPerCourse`}
          className="text-[13px] font-Poppins font-medium text-[#FF95C4] cursor-pointer"
        >
          See All
        </Link>
      </div>
      <ul className="flex flex-col gap-4 ">
        {courses == "" || courses == undefined ? "" : courses.slice(0, 6).map((item) => {
          return (
            <li
              className="flex items-center justify-between border border-[#E4E4E4] rounded-[16px] px-[22px] py-[14px]"
              key={item.id}
            >
              <div className="flex items-center gap-4">
                <Image
                  src={coursePerModule}
                  alt="module"
                  className="w-[40px]"
                />
                <div className="flex flex-col gap-[2px]">
                  <span className="font-Poppins text-[#0C092A] font-semibold text-[14px]">
                    {item.name}
                  </span>
                  <span className="font-Poppins text-[#858494] text-[12px]">
                    {item.description} • {item.question} Question
                  </span>
                </div>
              </div>
              <button>
                <Image src={play} alt="play" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Courses;
