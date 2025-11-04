import Image from "next/image";
import React from "react"; 
import heure from "../../../../../public/Question_Bank/heure.svg";

const TrainingHour = ({ name, value, setFieldValue }) => {

  const formatValueForInput = (val) => {
    if (!val) return "";
    const match =
      typeof val === "string" ? val.match(/^(\d{1,2})h(\d{2})$/) : null;
    if (match) {
      const hours = match[1].padStart(2, "0");
      const minutes = match[2].padStart(2, "0");
      return `${hours}:${minutes}`;
    }
    if (typeof val === "string" && /^\d{2}:\d{2}$/.test(val)) {
      return val;
    }
    return val;
  };

  const handleChange = (event) => {
    const timeValue = event.target.value;
    setFieldValue(name, timeValue);
   };

  return (
    <div className="flex-1">
      <label
        htmlFor={name}
        className="font-semibold text-gray-900 dark:text-white text-sm block mb-2"
      >
        L&apos;heure de la séance.
      </label>
      <div className="flex items-center gap-3 w-full rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 py-2 px-3">
        <Image src={heure} alt="Heure" className="opacity-60 dark:brightness-0 dark:invert" />
        <input
          type="time"
          id={name}
          name={name}
          value={formatValueForInput(value)}
          onChange={handleChange}
          className="w-full outline-none text-[13px] text-[#191919] dark:text-white font-medium bg-transparent border-none p-0"
        />
      </div>
    </div>
  );
};

export default TrainingHour;
