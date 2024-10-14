import Image from "next/image";
import result from "../../../../public/Quiz/Good Job.svg";
import exit from "../../../../public/Icons/exit.svg";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";

const QuizResult = ({ data, setSkip }) => {
  const locale = useLocale()
  const {category} = useParams()

  console.log(data);

  return (
    <div className="bg-[#0000004D] w fixed top-0 left-0 h-full w-full flex items-center justify-center">
      <div className="bg-[#ffffff] w-[340px] p-[30px] rounded-[16px] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="font-Poppins font-medium">Awesome Muhammad!</span>
          <Image
            src={exit}
            alt="exit"
            onClick={() => setSkip(false)}
            className="cursor-pointer"
          />
        </div>
        <Image src={result} alt="result" className="cursor-pointer" />
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="basis-[40%] flex flex-col">
            <span className="text-[#858494] font-Poppins font-medium text-[12px]">
              COMPLETION
            </span>
            <span className="text-[#0C092A] font-Poppins font-medium text-[12px]">
              {(data.average_accuracy * 100).toFixed(2)}%
            </span>
          </div>
          <div className="basis-[40%] flex flex-col">
            <span className="text-[#858494] font-Poppins font-medium text-[12px]">
              CORRECT ANSWER
            </span>
            <span className="text-[#0C092A] font-Poppins font-medium text-[12px]">
              17 questions
            </span>
          </div>
          <div className="basis-[40%] flex flex-col">
            <span className="text-[#858494] font-Poppins font-medium text-[12px]">
              SKIPPED
            </span>
            <span className="text-[#0C092A] font-Poppins font-medium text-[12px]">
              {data.attempted_mcqs}
            </span>
          </div>
          <div className="basis-[40%] flex flex-col">
            <span className="text-[#858494] font-Poppins font-medium text-[11px]">
              INCORRECT ANSWER
            </span>
            <span className="text-[#0C092A] font-Poppins font-medium text-[12px]">
              1
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button className="basis-[48%] font-Poppins font-medium text-[14px] bg-[#FFF5FA] text-[#FF6EAF] px-[20px] py-[10px] rounded-[16px]">
            Share
          </button>
          <Link
            href={`/${locale}/dashboard/QuestionsBank/${category}/QuestionPerCourse`}
            className="basis-[48%] text-center font-Poppins font-medium text-[14px] bg-[#FF6EAF] text-[#FFF5FA] p-[20px] py-[10px] rounded-[16px]"
          >
            Done
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;