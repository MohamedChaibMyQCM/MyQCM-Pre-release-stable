"use client";

import React from "react";
import { TextT } from "phosphor-react";

const Title = ({ name, value, setFieldValue }) => {
  const handleChange = (event) => {
    setFieldValue(name, event.target.value);
  };
  const iconClasses =
    "flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFE7F2] text-[#F8589F] dark:bg-white/10 dark:text-white shrink-0";

  return (
    <div className="flex items-center gap-3 w-full py-2 px-[12px] bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 rounded-[14px]">
      <span className={iconClasses}>
        <TextT size={18} weight="fill" />
      </span>
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleChange}
        placeholder="Donnez un titre à votre séance"
        className="w-[100%] outline-none text-[13px] bg-transparent text-[#191919] dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 font-medium"
      />
    </div>
  );
};

export default Title;
