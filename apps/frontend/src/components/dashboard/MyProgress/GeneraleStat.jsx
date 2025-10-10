import quiz_attemp from "../../../../public/Icons/quiz_attem.svg";
import accuracy from "../../../../public/Icons/accuracy.svg";
import time_spent from "../../../../public/Icons/time_spent.svg";
import Image from "next/image";

const GeneraleStat = ({ overall_summary }) => {
  return (
    <div id="tour-general-stats">
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">Général</h3>
      <ul className="flex items-center gap-4">
        <li
          id="tour-question-tentées"
          className="bg-[#FFFFFF] flex items-center justify-between py-3 px-4 rounded-[20px] flex-1 box max-md:flex-col max-md:gap-2 max-md:h-[154px]"
        >
          <div className="flex flex-col gap-1 max-md:text-center">
            <span className="font-[500] text-[15px]">Questions tentées</span>
            <span className="text-[#F8589F] font-[500] text-[14px]">
              {overall_summary?.total_mcqs_attempted}
            </span>
          </div>
          <Image src={quiz_attemp} alt="Quiz tentés" />
        </li>
        <li
          id="tour-précision"
          className="bg-[#FFFFFF] flex items-center justify-between py-3 px-4 rounded-[20px] flex-1 box max-md:flex-col max-md:gap-[32px] max-md:h-[154px]"
        >
          <div className="flex flex-col gap-1 max-md:text-center">
            <span className="font-[500] text-[15px]">Précision</span>
            <span className="text-[#F8589F] font-[500] text-[14px]">
              {overall_summary?.overall_accuracy?.percentage}%
            </span>
          </div>
          <Image src={accuracy} alt="Précision" />
        </li>
        <li
          id="tour-temps-passé"
          className="bg-[#FFFFFF] flex items-center justify-between py-3 px-4 rounded-[20px] flex-1 box max-md:flex-col max-md:gap-2 max-md:h-[154px]"
        >
          <div className="flex flex-col gap-1 max-md:text-center">
            <span className="font-[500] text-[15px]">Temps passé</span>
            <span className="text-[#F8589F] font-[500] text-[14px]">
              {overall_summary?.total_time_spent}s
            </span>
          </div>
          <Image src={time_spent} alt="Temps passé" />
        </li>
      </ul>
    </div>
  );
};

export default GeneraleStat;
