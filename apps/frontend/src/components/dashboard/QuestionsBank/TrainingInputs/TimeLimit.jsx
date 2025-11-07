import { Timer } from "phosphor-react";

const TimeLimit = ({ name, value, setFieldValue }) => {
  return (
    <div className="w-full flex flex-col max-md:w-full mt-2">
      <span className="text-[15px] font-[600] text-[#191919] dark:text-white mb-[10px] block">
        Temps par question
      </span>
      <div className="flex items-center py-[8px] gap-3 w-[100%] outline-none px-[14px] rounded-[16px] py-[10px] bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFE7F2] text-[#F8589F] dark:bg-white/10 dark:text-white shrink-0">
          <Timer size={18} weight="bold" />
        </span>
        <input
          type="number"
          required
          className="w-[100%] outline-none text-[13px] bg-transparent text-[#191919] dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 font-medium"
          placeholder="Combien de temps voulez-vous pour chaque question ?"
          value={value}
          onChange={(e) => setFieldValue(name, e.target.value)}
        />
      </div>
    </div>
  );
};

export default TimeLimit;
