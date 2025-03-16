"use client";

import Image from "next/image";
import profile_arrow from "../../../../public/settings/profile_arrow.svg";
import gift from "../../../../public/settings/gift.svg";
import vector from "../../../../public/settings/Vector.svg";
import { X } from "lucide-react";
import { useState } from "react";

const Reward = () => {
  const [isVisible, setIsVisible] = useState(true); 

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="relative mx-5 mt-12 bg-[#FFFFFF] p-6 text-center rounded-[16px] overflow-hidden box max-md:mt-4">
      <h2 className="text-[#191919] text-[20px] font-[500]">
        You have <span className="text-[#F8589F]">800</span>XP
      </h2>
      <p className="my-4 text-[#191919] text-[14px] px-20 max-md:px-0">
        Discover all the exciting rewards you can redeem your points for! From
        exclusive discounts and special offers to premium products and services,
        your points open the door to a world of possibilities. Start exploring
        now and make the most of your rewards!
      </p>
      <button className="bg-[#F8589F] text-[#FFFFFF] px-5 py-2 rounded-[16px] text-[13px] font-[500]">
        See all rewards
      </button>
      <Image
        src={gift}
        alt="gift"
        className="absolute md:top-0 md:left-[24%] w-[90px] max-md:right-[-30px] max-md:top-[26%]"
      />
      <Image
        src={profile_arrow}
        alt="profile arrow"
        className="absolute bottom-0 right-0 max-md:hidden"
      />
      <Image
        src={vector}
        alt="vector"
        className="absolute left-0 md:top-[50%] translate-y-[-50%] max-md:bottom-[10px] max-md:translate-y-0"
      />
      <X
        size={22}
        className="absolute top-3 right-4 text-[#B5BEC6] cursor-pointer"
        onClick={handleClose} 
      />
    </div>
  );
};

export default Reward;
