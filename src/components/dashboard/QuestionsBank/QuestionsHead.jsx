import infinite from "../../../../public/Icons/infinite.svg";
import visit from "../../../../public/Icons/visit.svg";
import question from "../../../../public/Icons/question.svg";
import list from "../../../../public/Icons/list.svg";
import Image from "next/image";

const QuestionsHead = () => {
  return (
    <header className="flex items-center justify-between border-b border-[#E4E4E4] px-[40px] py-[10px]">
      <div>
        <h2 className="text-[#565656] font-Poppins font-semibold text-[26px]">
          Questions Bank
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[#565656] font-Poppins font-medium">
          Your Credits:
        </span>
        <div className="flex items-center gap-[2px]">
          <span className="text-[#181818] font-Poppins font-semibold">+</span>
          <Image src={infinite} alt="infinite" className="w-[28px]" />
        </div>
        <Image src={list} alt="list" className="w-[22px]" />
        <span className="text-[#181818] font-Poppins font-semibold">1000</span>
        <Image src={question} alt="question" className="w-[24px]" />
        <div className="flex items-center gap-[2px]">
          <Image src={infinite} alt="infinite" className="w-[28px]" />
          <span className="text-[#181818] font-Poppins font-semibold">
            /200
          </span>
        </div>
        <Image src={visit} alt="visit" className="w-[30px]" />
      </div>
    </header>
  );
};

export default QuestionsHead;
