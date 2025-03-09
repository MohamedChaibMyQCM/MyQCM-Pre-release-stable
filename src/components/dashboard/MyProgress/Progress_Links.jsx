import Link from "next/link";
import calender from "../../../../public/Icons/calender.svg";
import Image from "next/image";

const Progress_Links = () => {
  return (
    <div className="flex items-center justify-between mt-6  px-5 ">
      <ul className="flex items-center gap-4">
        <li>
          <Link
            href={`/dashboard/MyProgress`}
            className="bg-[#F8589F] text-[#FFFFFF] px-4 py-2 rounded-[20px] text-[13px] font-[500]"
          >
            Summary
          </Link>
        </li>
        <li>
          <Link
            href={`/dashboard/MyProgress/progress`}
            className="bg-[#F8589F] text-[#FFFFFF] px-4 py-2 rounded-[20px] text-[13px] font-[500]"
          >
            Progress
          </Link>
        </li>
      </ul>
      <div className="flex items-center gap-3 cursor-pointer">
        <div className="bg-[#FFFFFF] px-4 py-2 rounded-[20px]">
          <Image src={calender} alt="calender" />
        </div>
        <span className="font-[500] bg-[#FFFFFF] px-4 py-2 text-[14px] rounded-[20px]">
          All modules
        </span>
      </div>
    </div>
  );
};

export default Progress_Links;
