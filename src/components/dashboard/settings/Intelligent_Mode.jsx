import Image from "next/image";
import intell_mode from "../../../../public/settings/intell_mode.svg";

const Intelligent_Mode = () => {
  return (
    <div className="mt-8">
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        Intelligent Mode Settings
      </h3>
      <div className="bg-[#FFFFFF] flex items-center justify-between rounded-[16px] pl-6 pr-12 py-6 box">
        <div>
          <div className="mb-6">
            <h4 className="text-[#191919] font-[500] text-[15px] mb-2">
              Your Learning Focus
            </h4>
            <p className="text-[#B5BEC6] text-[13px]">
              Sharing your focus helps Synergy tailor your experience even
              further, but it will always adapt to your <br /> performance.
            </p>
          </div>
          <div>
            <h4 className="text-[#191919] font-[500] text-[15px] mb-2">
              Preferred Question Types
            </h4>
            <p className="text-[#B5BEC6] text-[13px]">
              Let us know your preferences! Synergy will do its best to
              incorporate them while ensuring a balanced <br /> learning
              experience.
            </p>
          </div>
        </div>
        <Image src={intell_mode} alt="intell mode" />
      </div>
    </div>
  );
};

export default Intelligent_Mode;
