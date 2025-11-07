"use client";

import { ListNumbers } from "phosphor-react";

const NumberOfQuestion = ({ name, value, setFieldValue }) => {
  const iconClasses =
    "flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFE7F2] text-[#F8589F] dark:bg-white/10 dark:text-white shrink-0";

  return (
    <div className="flex w-full rounded-[14px] w-fit px-[12px] py-[8px] bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 items-center justify-between gap-3 max-md:w-full">
      <span className={iconClasses}>
        <ListNumbers size={18} weight="bold" />
      </span>
      <input
        type="number"
        required
        className="w-[100%] outline-none text-[13px] bg-transparent text-[#191919] dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 font-medium"
        placeholder="Combien de questions souhaitez-vous ?"
        value={value}
        onChange={(e) => setFieldValue(name, e.target.value)}
      />
    </div>
  );
};

export default NumberOfQuestion;
