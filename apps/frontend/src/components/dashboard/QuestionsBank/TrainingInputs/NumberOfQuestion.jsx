"use client";

import Image from "next/image";
import qcm_number from "../../../../../public/Question_Bank/question_number.svg"; 

const NumberOfQuestion = ({ name, value, setFieldValue }) => {
  return (
    <div className="flex items-center w-full rounded-[14px] w-fit px-[12px] py-[8px] bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 flex items-center justify-between gap-3 max-md:w-full">
      <Image src={qcm_number} alt="qcm_number" className="opacity-60 dark:brightness-0 dark:invert" />
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
