import Image from "next/image";
import QCM from "../../../../public/AI/QCM.svg";
import Answer from "../../../../public/AI/QROC.svg";
import QROC from "../../../../public/AI/Answer.svg";
import Arrow from "../../../../public/AI/arrow.svg";
import ArrowUp from "../../../../public/AI/arrow-up.svg";
import add from "../../../../public/AI/add.svg";

const AiSolver = () => {
  return (
    <div className="pt-[50px] py-[20px] px-[30px] w-[60%] flex flex-col bg-[#F7F8FA]">
      <div className="mb-[100px]">
        <h1 className="font-Poppins text-center text-[#11142D] font-semibold text-[30px]">
          Unclock the power of Medical AI
        </h1>
        <p className="font-Poppins text-center text-[#808191AB] font-medium text-[14px]">
          Find an answer for All your Medical Questions with the smartest
          MedicalAI
        </p>
      </div>
      <div className="flex flex-col gap-6">
        <button className="flex items-center justify-between border w-[60%] mx-auto border-[#A3A3A5] px-[20px] py-[10px] rounded-[10px]">
          <div className="flex items-center gap-3">
            <Image src={QCM} alt="qcm" className="w-[44px]" />
            <span className="font-Poppins text-[#616161] font-semibold">
              Solve for Me an MCQ
            </span>
          </div>
          <Image src={Arrow} alt="arrow" className="w-[34px]" />
        </button>
        <button className="flex items-center justify-between border w-[60%] mx-auto border-[#A3A3A5] px-[20px] py-[10px] rounded-[10px]">
          <div className="flex items-center gap-3">
            <Image src={QROC} alt="qroc" className="w-[44px]" />
            <span className="font-Poppins text-[#616161] font-semibold">
              Solve for Me a QROC
            </span>
          </div>
          <Image src={Arrow} alt="arrow" className="w-[34px]" />
        </button>
        <button className="flex items-center justify-between border w-[60%] mx-auto border-[#A3A3A5] px-[20px] py-[10px] rounded-[10px]">
          <div className="flex items-center gap-3">
            <Image src={Answer} alt="answer" className="w-[44px]" />
            <span className="font-Poppins text-[#616161] font-semibold">
              Answer Me for this
            </span>
          </div>
          <Image src={Arrow} alt="arrow" className="w-[34px]" />
        </button>
      </div>
      <form className="flex items-center gap-3 border border-[#A3A3A5] mt-auto px-[20px] py-[8px] rounded-[12px]">
        <Image src={add} alt="add" className="w-[16px]" />
        <input
          type="text"
          placeholder="Type an MCQ with options or Qroc or any question you want to ask"
          className="font-Poppins w-[80%] text-[#80819161] text-[14px] font-medium outline-none"
        />
        <button type="submit">
          <Image src={ArrowUp} alt="send" />
        </button>
      </form>
    </div>
  );
};

export default AiSolver;