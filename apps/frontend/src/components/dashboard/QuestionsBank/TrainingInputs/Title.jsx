"use client";

import React from "react";
import titre from "../../../../../public/Question_Bank/titre.svg"; 
import Image from "next/image";

const Title = ({ name, value, setFieldValue }) => {
  const handleChange = (event) => {
    setFieldValue(name, event.target.value);
  };

  return (
    <div className="flex items-center gap-3 w-full py-2 px-[12px] bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 rounded-[14px]">
      <Image src={titre} alt="Titre icon" className="opacity-60 dark:brightness-0 dark:invert" />
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
