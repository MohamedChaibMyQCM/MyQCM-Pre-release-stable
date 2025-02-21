import quiz_attemp from "../../../../public/Icons/quiz_attem.svg";
import accuracy from "../../../../public/Icons/accuracy.svg";
import time_spent from "../../../../public/Icons/time_spent.svg";
import Image from "next/image";

const GeneraleStat = () => {
  return (
    <div>
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        General
      </h3>
      <ul className="flex items-center gap-4">
        <li className="bg-[#FFFFFF] flex items-center justify-between py-3 px-4 rounded-[20px] flex-1 box">
          <div className="flex flex-col gap-1">
            <span className="font-[500] text-[15px]">Quizzes attempted</span>
            <span className="text-[#F8589F] font-[500] text-[14px]">120</span>
          </div>
          <Image src={quiz_attemp} alt="Quizzes attempted" />
        </li>
        <li className="bg-[#FFFFFF] flex items-center justify-between py-3 px-4 rounded-[20px] flex-1 box">
          <div className="flex flex-col gap-1">
            <span className="font-[500] text-[15px]">Accuracy</span>
            <span className="text-[#F8589F] font-[500] text-[14px]">70%</span>
          </div>
          <Image src={accuracy} alt="Accuracy" />
        </li>
        <li className="bg-[#FFFFFF] flex items-center justify-between py-3 px-4 rounded-[20px] flex-1 box">
          <div className="flex flex-col gap-1">
            <span className="font-[500] text-[15px]">Time spent</span>
            <span className="text-[#F8589F] font-[500] text-[14px]">
              20h 21min
            </span>
          </div>
          <Image src={time_spent} alt="Time spent" />
        </li>
      </ul>
    </div>
  );
};

export default GeneraleStat;