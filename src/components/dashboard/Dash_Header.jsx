import Image from "next/image";
import search from "../../../public/Icons/search.svg";
import streak from "../../../public/Icons/streak.svg";
import notification from "../../../public/Icons/notification.svg";

const Dash_Header = ({path, sub_path}) => {
  return (
    <div className="flex items-center justify-between py-5 px-6">
      <span className="text-[#B5BEC6] font-[500]">
        {path}
        <span className="text-[#F8589F] font-[500]">{sub_path}</span>
      </span>
      <div className="flex items-center gap-6">
        <Image src={search} alt="search" className="w-[16px] cursor-pointer" />
        <Image
          src={notification}
          alt="notification"
          className="w-[15px] cursor-pointer"
        />
        <div className="flex items-center gap-[2px]">
          <span className="text-[#191919] font-[500]">3</span>
          <Image src={streak} alt="streak" className="w-[12px]" />
        </div>
        <span className="text-[#191919] font-[500]">
          200<span className="text-[#F8589F]">XP</span>
        </span>
      </div>
    </div>
  );
};

export default Dash_Header;
