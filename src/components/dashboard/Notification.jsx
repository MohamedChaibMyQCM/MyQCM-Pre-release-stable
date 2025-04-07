import Image from "next/image";
import clock_notif from "../../../public/Home/clock_notif.svg";
import { X } from "lucide-react";

const Notification = ({ onClose, notifications }) => {
  return (
    <div className="absolute bg-[#FFF] rounded-[8px] p-4 h-[240px] w-[400px] top-[56px] right-[11%] z-[50] box">
      <X
        size={20}
        className="text-[#B5BEC6] absolute top-2 right-3 cursor-pointer"
        onClick={onClose}
      />
      <div className="overflow-auto h-full">
        {notifications && notifications.length > 0 ? (
          notifications.map((notif, index) => (
            <div key={notif.id || index} className="mb-3 border-b pb-2">
              <span className="text-[13px] text-[#F8589F] block">
                {new Date(notif.timestamp).toLocaleTimeString()}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Image
                  src={clock_notif}
                  alt="clock notification"
                  width={20}
                  height={20}
                />
                <span className="text-[#191919] text-[15px] font-[500]">
                  {notif.message}
                </span>
              </div>
            </div>
          ))
        ) : (
          <span className="text-[#191919] text-[15px]">No notifications</span>
        )}
      </div>
    </div>
  );
};

export default Notification;
