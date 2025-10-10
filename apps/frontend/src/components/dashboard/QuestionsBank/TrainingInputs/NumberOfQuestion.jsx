"use client";

import Image from "next/image";
import qcm_number from "../../../../../public/Question_Bank/question_number.svg"; 

const NumberOfQuestion = ({ name, value, setFieldValue }) => {
  return (
    <div className="flex items-center w-full rounded-[14px] w-fit px-[12px] py-[8px] border border-gray-300 flex items-center justify-between gap-3 max-md:w-full">
      <Image src={qcm_number} alt="qcm_number" />
      <input
        type="number"
        required
        className="w-[100%] outline-none text-[13px] text-[#191919] placeholder:text-[#191919] font-medium "
        placeholder="Combien de questions souhaitez-vous ?"
        value={value}
        onChange={(e) => setFieldValue(name, e.target.value)}
      />
    </div>
  );
};

export default NumberOfQuestion;
