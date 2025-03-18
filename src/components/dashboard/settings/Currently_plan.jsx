import Image from "next/image";
import card from "../../../../public/settings/card.svg";

const Currently_plan = () => {
  return (
    <div className="relative px-6 py-5 rounded-[24px] bg-gradient-to-r from-[#FD2E8A] to-[#F8589F] flex justify-between items-center">
      <div>
        <h2 className="text-[#FFFFFF] text-[20px]">
          You are currently <br className="md:hidden" /> on Basic plan
        </h2>
        <p className="text-[#FFFFFF] text-[13px] font-[400] mt-2 mb-6">
          Unlock the full potential of your experience by upgrading to a higher
          plan today. Gain access to premium features, <br className="max-md:hidden" /> enhanced
          performance, and exclusive benefits tailored to elevate your journey.
        </p>
        <span className="bg-[#FFFFFF] text-[#F8589F] px-[20px] py-[4px] rounded-[16px] text-[13px] font-[500]">
          Ends February, 2nd
        </span>
      </div>
      <Image
        src={card}
        alt="card"
        className="absolute right-6 top-[-8px] w-[240px] max-md:w-[130px] max-md:right-4"
      />
    </div>
  );
};

export default Currently_plan;
