import React from "react";
import Image from "next/image"; 
import skip from "../../../../public/Quiz/skip.svg"; 

const SkipQuestionPopup = ({ onConfirmSkip, onCancelSkip }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex items-center justify-center p-4">
      <div className="flex flex-col items-center bg-white text-center rounded-[16px] w-[400px] pb-4 overflow-hidden">
        <Image src={skip} alt="Skip Illustration" className="mb-4" />{" "}
        <h3 className="text-lg font-semibold text-[#191919] mb-3 px-4">
          Skip This Question?
        </h3>
        <p className="text-[#B5BEC6] text-[13px] mb-6 leading-relaxed">
          Are you sure you want to skip? This question <br /> won&apos;t be
          graded immediately, and you cannot <br /> return to it in this
          session.
        </p>
        <hr className="border-t border-[#E4E4E4] w-full mb-6" />
        <div className="flex items-center justify-center gap-4 w-full px-6">
          <button
            type="button"
            onClick={onCancelSkip}
            className="font-medium text-[14px] text-[#FD2E8A] px-[20px] py-[8px] rounded-[24px] hover:bg-pink-50 transition-colors"
          >
            Return
          </button>
          <button
            type="button"
            onClick={onConfirmSkip}
            className="font-medium text-[14px] bg-[#FD2E8A] text-white px-[20px] py-[8px] rounded-[24px] hover:opacity-90 transition-opacity"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkipQuestionPopup;
