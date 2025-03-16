import Image from "next/image";
import clock_notif from "../../../public/Home/clock_notif.svg";
import { X } from "lucide-react";

const Notification = ({ onClose }) => {
  return (
    <div className="absolute bg-[#FFF] rounded-[8px] p-4 h-[240px] w-[400px] top-[56px] right-[11%] z-[50] box">
      <X
        size={20}
        className="text-[#B5BEC6] absolute top-2 right-3 cursor-pointer"
        onClick={onClose} 
      />
      <span className="text-[13px] text-[#F8589F] mt-2 block">Today 21:00</span>
      <div className="flex flex-col justify-center items-center gap-2">
        <Image src={clock_notif} alt="clock notification" />
        <span className="text-[#191919] text-[15px] font-[500]">
          Your subscription is gonna end soon
        </span>
        <span className="text-[#F8589F] text-[14px]">
          5 January to 5 February
        </span>
        <span className="text-[13px] text-[#B5BEC6]">
          Renew now to continue enjoying uninterrupted access!
        </span>
      </div>
    </div>
  );
};

export default Notification;