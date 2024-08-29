import Image from "next/image";
import exit from "../../../../public/Icons/exit.svg";
import right from "../../../../public/Quiz/true.svg";
import notRight from "../../../../public/Quiz/false.svg";

const QuizExplanation = ({ setSeeExplanation }) => {
  return (
    <div className="fixed z-[50] h-screen w-screen left-0 top-0 flex items-center justify-center bg-[#0000004D]">
      <div className="bg-[#FFFFFF] flex flex-col gap-4 w-[60%] p-[26px] rounded-[16px]">
        <div className="flex items-center justify-between">
          <span className="font-Poppins font-semibold text-[#0C092A]">
            Answer Explanation
          </span>
          <Image
            src={exit}
            alt="exit"
            className="cursor-pointer"
            onClick={() => setSeeExplanation(false)}
          />
        </div>
        <span className="block font-Poppins text-[#858494] text-[13px] font-medium">
          QUESTION 7 OF 68
        </span>
        <div className="flex flex-col gap-2">
          <span className="block font-Poppins text-[#858494] text-[13px] font-medium">
            YOUR FALSE ANSWER
          </span>
          <div className="flex items-center justify-between w-[100%] px-[16px] py-[8px] rounded-[12px] border border-[#FF6666]">
            <span className="text-[#FF6666] font-Poppins font-medium text-[14px]">
              E{")"} Curve 3 corresponds to conditions where the enzyme&apos;s
              affinity for the substrate is the highest.
            </span>
            <Image src={notRight} alt="false response" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="block font-Poppins text-[#858494] text-[13px] font-medium">
            CORRECT ANSWER
          </span>
          <div className="bg-[#53DF83] flex items-center justify-between w-[100%] px-[16px] py-[8px] rounded-[12px]">
            <span className="text-[#FFFFFF] font-Poppins font-medium text-[14px]">
              D{")"} Curve 4 corresponds to conditions where the enzyme&apos;s
              affinity for the substrate is the highest.
            </span>
            <Image src={right} alt="true response" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="block font-Poppins text-[#858494] text-[13px] font-medium">
            EXPLANATION
          </span>
          <p className="font-Poppins font-medium text-[#0C092A] text-[14px]">
            A{")"} The line 1 intersects the x-axis at the point 1/Km and the
            y-axis at the point 1/Vmax. <br /> 1/Km = 1 / Km = 1 µmol/L / 1/Vmax
            = 0.4 / Vmax = 2.5 mol/s <br /> <br /> C{")"} Curve 2 indicates the
            presence of a non-competitive inhibitor (Vmax decreases, Km remains
            unchanged). Curve 3 indicates the presence of a competitive
            inhibitor (Vmax remains unchanged, Km increases). Curve 4 indicates
            the presence of an uncompetitive inhibitor (both Vmax and Km
            decrease). <br /> <br /> D{")"} Curve 4 (in the presence of an
            uncompetitive inhibitor) corresponds to conditions where the
            enzyme&apos;s affinity for the substrate is the highest because Km
            in this case is the lowest. <br /> <br /> The other answers are
            incorrect.
          </p>
        </div>
        <button className="self-end text-[14px] font-Poppins font-medium text-[#FFFFFF] bg-[#FF6EAF] w-fit py-[8px] px-[30px] rounded-[12px] ">
          Next
        </button>
      </div>
    </div>
  );
};

export default QuizExplanation;