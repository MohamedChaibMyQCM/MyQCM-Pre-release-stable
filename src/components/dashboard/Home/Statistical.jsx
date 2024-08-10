import React from "react";
import TimeLearning from "./TimeLearning";
import Progress from "./Progress";
import search from "../../../../public/Aside/Search.svg";
import notification from "../../../../public/Aside/bell.svg";
import Image from "next/image";

const Statistical = () => {
  return (
    <div className="bg-[#FFF5FA] h-screen pt-[30px] px-[20px] flex-1">
      <div className="flex items-center justify-between mb-[80px] pr-[60px]">
        <form className="flex items-center gap-4">
          <Image src={search} alt="search" className="w-[20px]" />
          <input
            type="search"
            placeholder="Search"
            className="bg-transparent font-Inter text-[#808191] text-[13px] font-Inter outline-none"
          />
        </form>
        <div className="bg-[#FFFFFF] w-[36px] h-[36px] rounded-full relative flex items-center justify-center cursor-pointer">
          <Image src={notification} alt="notification" className="w-[16px]" />
          <span className=" absolute bg-[#FF754C] text-[#FFFFFF] flex items-center justify-center font-Inter w-[16px] h-[16px] rounded-full text-[9.6px] right-[-6px] top-[-2px]">
            2
          </span>
        </div>
      </div>
      <Progress />
      <TimeLearning />
    </div>
  );
};

export default Statistical;