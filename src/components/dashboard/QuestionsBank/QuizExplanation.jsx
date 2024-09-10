import Image from "next/image";
import exit from "../../../../public/Icons/exit.svg";
import right from "../../../../public/Quiz/true.svg";
import notRight from "../../../../public/Quiz/false.svg";
import accuracyPic from "../../../../public/Quiz/accuracyPic.svg";
import { data } from "autoprefixer";

const QuizExplanation = ({
  QuizData,
  setSeeExplanation,
  type,
  selectedQuiz,
  length,
  setSelectedQuiz,
  setCheckAnswer,
}) => {
  const handleNext = () => {
    setSeeExplanation(false);
    setCheckAnswer(true);
    setSelectedQuiz((prevQuiz) => prevQuiz + 1);
  };

  const getBackgroundColor = (ratio) => {
    if (ratio >= 0 && ratio < 30) return "bg-red-600";
    if (ratio >= 30 && ratio < 70) return "bg-[#ECD14E]";
    return "bg-[#53DF83]";
  };
  const bgColor = getBackgroundColor(QuizData.success_ratio);

  return (
    <div className="fixed z-[50] h-screen w-screen left-0 top-0 flex items-center justify-center bg-[#0000004D]">
      <div className="bg-[#FFFFFF] flex flex-col gap-4 w-[60%] p-[26px] rounded-[16px]">
        <div className="flex items-center justify-between">
          <span className="font-Poppins font-semibold text-[#0C092A]">
            {type == "qcm" || type == "qcs"
              ? "Answer Explanation"
              : "Answers Analyse"}
          </span>
          <Image
            src={exit}
            alt="exit"
            className="cursor-pointer"
            onClick={() => setSeeExplanation(false)}
          />
        </div>
        <span className="block font-Poppins text-[#858494] text-[13px] font-medium">
          QUESTION {selectedQuiz + 1} OF {length}
        </span>
        {type == "qcm" || type == "qcs" ? (
          <>
            <div className="flex flex-col gap-2">
              <span className="block font-Poppins text-[#858494] text-[13px] font-medium">
                YOUR FALSE ANSWER
              </span>
              <ul className="flex flex-col gap-3 w-[100%]  ">
                {QuizData.selected_options
                  .filter((item) => !item.is_correct)
                  .map((item) => (
                    <li
                      key={item.id}
                      className="border-[#FF6666] px-[16px] py-[8px] rounded-[12px] border text-[#FF6666] font-Poppins font-medium text-[14px] flex items-center justify-between"
                    >
                      <span>{item.content}</span>
                      <Image src={notRight} alt="false response" />
                    </li>
                  ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <span className="block font-Poppins text-[#858494] text-[13px] font-medium">
                CORRECT ANSWER
              </span>
              <ul className=" flex flex-col gap-3 w-[100%] ">
                {QuizData.selected_options
                  .filter((item) => item.is_correct)
                  .map((item) => (
                    <li
                      key={item.id}
                      className="border-[#53DF83] bg-[#53DF83] px-[16px] py-[8px] rounded-[12px] border text-[#FFF] font-Poppins font-medium text-[14px] flex items-center justify-between"
                    >
                      <span>{item.content}</span>
                      <Image src={right} alt="false response" />
                    </li>
                  ))}
              </ul>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <span className="block font-Poppins text-[#858494] text-[13px] font-medium">
              Accuracy of Your Answer
            </span>
            <div
              className={`relative flex items-center gap-3 rounded-[14px] px-[20px] py-[14px] ${bgColor}`}
            >
              <div className="bg-[#FFFFFF] w-[50px] h-[50px] rounded-full flex items-center justify-center">
                <span
                  className={`flex items-center justify-center font-Poppins font-medium text-[#FFFFFF] text-[13px] w-[42px] h-[42px] rounded-full ${bgColor}`}
                >
                  {QuizData.success_ratio}%
                </span>
              </div>
              <span className="font-Poppins font-medium text-[14px] text-[#FFFFFF]">
                Pourcentage of Accuracy of Your Answer: {QuizData.success_ratio}{" "}
                , No Errors
              </span>
              <Image
                src={accuracyPic}
                alt="accuracy img"
                className="absolute top-[-8px] left-[-60px]"
              />
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <span className="block font-Poppins text-[#858494] text-[13px] font-medium">
            {type == "qcm" || type == "qcs"
              ? "EXPLANATION"
              : "Explanation of MyQCM Experts"}
          </span>
          <p className="font-Poppins font-medium text-[#0C092A] text-[14px]">
            {QuizData.explanation}
          </p>
        </div>
        <div
          className={`flex flex-col gap-2 ${
            type == "qcm" || type == "qcs" ? "hidden" : "block"
          }`}
        >
          <span className="block font-Poppins text-[#858494] text-[13px] font-medium">
            Analysis of MyQCM AI assistent
          </span>
          <p className="font-Poppins font-medium text-[#0C092A] text-[14px]">
            {data.analysis}
          </p>
        </div>
        <div
          className={`flex items-center justify-between mt-[20px] ${
            type == "qcm" || type == "qcs" ? "self-end" : ""
          }`}
        >
          <span
            className={`text-center font-Poppins pl-[100px] font-medium text-[11px] text-[#858494] ${
              type == "qcm" || type == "qcs" ? "hidden" : "block"
            }`}
          >
            This answer has been reviewed and confirmed correct by MyQCM Experts
            using AI assistance. <br /> While no mistakes were found, please
            note that AI models can occasionally make errors.
          </span>
          <button
            className="self-end text-[14px] font-Poppins font-medium text-[#FFFFFF] bg-[#FF6EAF] w-fit py-[8px] px-[30px] rounded-[12px]"
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizExplanation;
