// ./Notification.jsx (or adjust path)
import Image from "next/image";
import clock_notif from "../../../public/Home/clock_notif.svg"; // Ensure this path is correct relative to this file
import { X } from "lucide-react";

const Notification = ({ onClose, notifications }) => {
  return (
    // KEEPING YOUR ORIGINAL STYLING EXACTLY
    <div className="absolute bg-[#FFF] rounded-[8px] p-4 h-[240px] w-[400px] top-[56px] right-[11%] z-[60] box shadow-lg border border-gray-100">
      {" "}
      {/* Added higher z-index, explicit shadow/border if 'box' doesn't provide it */}
      <X
        size={20}
        className="text-[#B5BEC6] absolute top-2 right-3 cursor-pointer"
        onClick={onClose} // Uses the passed onClose function
      />
      {/* Added a title for clarity */}
      <h3 className="text-md font-semibold text-[#191919] mb-2 pr-6">
        Notifications
      </h3>
      {/* Adjust internal height calculation */}
      <div className="overflow-auto h-[calc(100%-40px)]">
        {notifications && notifications.length > 0 ? (
          notifications.map((notif, index) => (
            <div
              key={notif.id || index}
              className="mb-3 border-b border-gray-100 pb-2 last:border-b-0"
            >
              {/* Use consistent field for timestamp */}
              <span className="text-[12px] text-gray-400 block">
                {/* Basic Time Formatting */}
                {new Date(
                  notif.created_at || notif.timestamp || Date.now()
                ).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Image
                  src={clock_notif}
                  alt="" // Alt "" is okay if info is textual
                  width={18} // Slightly adjusted size
                  height={18}
                />
                <span className="text-[#191919] text-[14px] font-[500]">
                  {" "}
                  {/* Adjusted font size slightly */}
                  {notif.message || "Message non disponible"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center h-full text-sm text-gray-500">
            <span>Aucune notification</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;
