"use client"

import Image from "next/image";
// import search from "../../../public/Icons/search.svg";
import streak from "../../../public/Icons/streak.svg";
import notification from "../../../public/Icons/notification.svg";
import Notification from "./Notification";
import { useState } from "react";

const Dash_Header = ({ path, sub_path }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  return (
    <div className="relative flex items-center justify-between py-5 px-6">
      {/* <span className="text-[#B5BEC6] font-[500]">
        {path}
        <span className="text-[#F8589F] font-[500]">{sub_path}</span>
      </span> */}
      <span className="text-[#191919] font-[600] text-[18px]">
        Welcome Back <span className="text-[#F8589F]">Raouf!</span>
      </span>
      <div className="flex items-center gap-6 max-md:hidden">
        {/* <Image src={search} alt="search" className="w-[17px] cursor-pointer" /> */}
        <Image
          src={notification}
          alt="notification"
          className="w-[16px] cursor-pointer"
          onClick={toggleNotification}
        />
        <div className="flex items-center gap-[2px]">
          <span className="text-[#191919] font-[500] text-[17px]">3</span>
          <Image src={streak} alt="streak" className="w-[13px]" />
        </div>
        <span className="text-[#191919] font-[500] text-[17px]">
          200<span className="text-[#F8589F]">XP</span>
        </span>
      </div>
      {isNotificationOpen && <Notification onClose={toggleNotification} />}
    </div>
  );
};

export default Dash_Header;