import Image from "next/image";
import time from "../../../../../public/Question_Bank/temps.svg";

const TimeLimit = ({ name, value, setFieldValue }) => {
  return (
    <div className="w-full flex flex-col max-md:w-full mt-2">
      <span className="text-[15px] font-[600] text-[#191919] mb-[10px] block">
        Temps par question
      </span>
      <div className="flex items-center py-[8px] gap-3 w-[100%] outline-none px-[14px] rounded-[16px] py-[10px] border border-gray-300">
        <Image src={time} alt="time" />
        <input
          type="number"
          required
          className="w-[100%] outline-none text-[13px] text-[#191919] placeholder:text-[#191919] font-medium "
          placeholder="Combien de temps voulez-vous pour chaque question ?"
          value={value}
          onChange={(e) => setFieldValue(name, e.target.value)}
        />
      </div>
    </div>
  );
};

export default TimeLimit;
