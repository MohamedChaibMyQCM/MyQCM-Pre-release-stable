import Image from "next/image";
import EndSeason from "../../../../public/Quiz/endSeason.svg";

const  EndSeasonPopup = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4">
      <div className="flex flex-col items-center bg-white text-center rounded-[16px] w-[400px] py-4">
        <Image src={EndSeason} alt="End Season Illustration" />{" "}
        <h3 className="text-lg font-semibold text-[#191919] mb-3 mt-2">
          End Current Session?
        </h3>
        <p className="text-[#B5BEC6] text-[13px] mb-6">
          Are you sure you want to end this session? <br /> Your progress will
          be saved, but you won&apos;t <br /> be able to continue from where you
          left off.
        </p>
        <hr className="text-[#E4E4E4] w-full mb-4" />{" "}
        <div className="flex items-center justify-center gap-6 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="font-medium text-[14px] text-[#FD2E8A] px-[20px] py-[8px] rounded-[24px] hover:bg-pink-50 transition-colors" // Added hover effect
          >
            Return
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="font-medium text-[14px] bg-[#FD2E8A] text-[#FFF5FA] px-[20px] py-[8px] rounded-[24px] hover:opacity-90 transition-opacity" // Added hover effect
          >
            End Season
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndSeasonPopup;
