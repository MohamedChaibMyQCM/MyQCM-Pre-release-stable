import Image from "next/image";
import React from "react";
import heure from '../../../../../public/Question_Bank/heure.svg'

const TrainingHour = ({ name, value, setFieldValue }) => {
  return (
    <div className="flex-1">
      <label
        htmlFor={name}
        className="font-semibold text-gray-900 text-sm block mb-2"
      >
        L&apos;heure de la séance.
      </label>
      <div className="flex items-center gap-3 w-full rounded-xl bg-white border border-gray-300 py-2 px-3">
        <Image src={heure} alt="heure" />
        <input
          type="text"
          id={name}
          name={name}
          value={value}
          placeholder="09h00 - Soyez prêt à commencer!"
          onChange={(e) => setFieldValue(name, e.target.value)}
          className="w-[100%] outline-none text-[13px] text-[#191919] placeholder:text-[#191919] font-medium "
          pattern="([0-1]?[0-9]|2[0-3])h[0-5][0-9]"
        />
      </div>
    </div>
  );
};

export default TrainingHour;
