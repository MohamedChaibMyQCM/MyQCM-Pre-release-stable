import { courses } from "@/data/data";
import Image from "next/image";
import play from "../../../../public/Icons/play.svg";

const Courses = () => {
  return (
    <div className="relative px-[22px] py-[28px] rounded-[16px] bg-[#FFFFFF] basis-[40%] box after:w-full after:h-[120px] after:bg-gradient-to-t after:from-white after:to-transparent after:absolute after:left-0 after:bottom-0 after:rounded-br-[16px] after:rounded-bl-[16px]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="#0C092A font-Poppins font-semibold text-[18px]">
          Q/C per course
        </h3>
        <span className="text-[13px] font-Poppins font-medium text-[#FF95C4] cursor-pointer">
          See All
        </span>
      </div>
      <ul className="flex flex-col gap-4 ">
        {courses.map((item, index) => {
          return (
            <li
              className="flex items-center justify-between border border-[#E4E4E4] rounded-[16px] px-[22px] py-[14px]"
              key={index}
            >
              <div className="flex items-center gap-4">
                <Image src={item.img} alt="module" className="w-[40px]" />
                <div className="flex flex-col gap-1">
                  <span className="font-Poppins text-[#0C092A] font-semibold text-[14px]">
                    {item.name}
                  </span>
                  <span className="font-Poppins text-[#858494] text-[12px]">
                    UI1 - Cardiology • {item.question} Question
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
