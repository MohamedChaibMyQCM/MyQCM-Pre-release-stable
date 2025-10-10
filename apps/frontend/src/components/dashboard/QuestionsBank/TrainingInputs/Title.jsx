"use client";

import React from "react";
import titre from "../../../../../public/Question_Bank/titre.svg"; 
import Image from "next/image";

const Title = ({ name, value, setFieldValue }) => {
  const handleChange = (event) => {
    setFieldValue(name, event.target.value);
  };

  return (
    <div className="flex items-center gap-3 w-full py-2 px-[12px] border border-gray-300 rounded-[14px]">
      <Image src={titre} alt="Titre icon" />
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleChange}
        placeholder="Donnez un titre à votre séance"
        className="w-[100%] outline-none text-[13px] text-[#191919] placeholder:text-[#191919] font-medium "
      />
    </div>
  );
};

export default Title;
