import Image from "next/image";
import logo from "../../../../../../../../public/whiteLogo.svg";
import { QuizImage } from "@/data/data";
import Quiz from "@/components/dashboard/QuestionsBank/Quiz";

const page = () => {
  return (
    <div className="absolute min-h-[100vh] w-[100%] z-50 top-0 left-0 bg-[#FF6FAF] px-[80px] py-[30px] pb-[100px] flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <Image src={logo} alt="logo" className="w-[140px]" />
        <button className="font-Inter font-medium text-[13px] text-[#FFFFFF] rounded-[12px] px-[12px] py-[6px] border-[2px] border-[#FFFFFF]">
          End Season
        </button>
      </div>
      <Quiz />
      {QuizImage.map((item, index) => {
        return (
          <Image
            key={index}
            src={item.img}
            alt={item.alt}
            className={item.className}
          />
        );
      })}
    </div>
  );
};

export default page;