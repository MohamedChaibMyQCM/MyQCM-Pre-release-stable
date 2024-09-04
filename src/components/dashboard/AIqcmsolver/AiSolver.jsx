import Image from "next/image";
import QCM from "../../../../public/AI/QCM.svg";
import QROC from "../../../../public/AI/QROC.svg";
import Answer from "../../../../public/AI/Answer.svg";
import Arrow from "../../../../public/AI/Arrow.svg";

const AiSolver = () => {
  return (
    <div className="pt-[10px] px-[30px] w-[60%]">
      <div>
        <h1 className="font-Poppins">Unclock the power of Medical AI</h1>
        <p className="font-Poppins">
          Find an answer for All your Medical Questions with the smartest
          MedicalAI
        </p>
      </div>
      <div className="flex flex-col gap-6">
        <button className="flex items-center justify-between border border-[#A3A3A5]">
          <div className="flex items-center gap-3">
            <Image src={QCM} alt="" />
            <span>Solve for Me an MCQ</span>
          </div>
          <Image src={Arrow} alt="" />
        </button>
        <button className="flex items-center justify-between border border-[#A3A3A5]">
          <div className="flex items-center gap-3">
            <Image src={QROC} alt="" />
            <span>Solve for Me a QROC</span>
          </div>
          <Image src={Arrow} alt="" />
        </button>
        <button className="flex items-center justify-between border border-[#A3A3A5]">
          <div className="flex items-center gap-3">
            <Image src={Answer} alt="" />
            <span>Answer Me for this</span>
          </div>
          <Image src={Arrow} alt="" />
        </button>
      </div>
    </div>
  );
};

export default AiSolver;
