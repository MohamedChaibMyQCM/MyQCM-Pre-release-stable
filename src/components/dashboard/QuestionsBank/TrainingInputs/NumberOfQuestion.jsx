"use client";

import { useState } from "react";
import Image from "next/image";
import checkbox from "../../../../../public/Quiz/Checkbox (1).svg";

const NumberOfQuestion = ({ name, value, setFieldValue }) => {
  const [count, setCount] = useState(value || 0);

  const increment = () => {
    const newValue = count + 1;
    setCount(newValue);
    setFieldValue(name, newValue);
  };

  const decrement = () => {
    if (count > 0) {
      const newValue = count - 1;
      setCount(newValue);
      setFieldValue(name, newValue);
    }
  };

  return (
    <div className="rounded-[24px] w-fit px-[12px] py-[6px] border border-[#EFEEFC] flex items-center justify-between gap-3 max-md:w-full">
      <div className="flex items-center">
        <button
          type="button"
          className="flex items-center justify-center w-7 h-7 rounded-full bg-[#F8589F] text-[#FFF] hover:bg-[#F8589F] hover:text-white transition-colors"
          onClick={decrement}
          disabled={count <= 0}
        >
          -
        </button>
        <span className="mx-4 text-[14px] font-[500] min-w-[30px] text-center">
          {count}
        </span>
        <button
          type="button"
          className="flex items-center justify-center w-7 h-7 rounded-full bg-[#F8589F] text-[#FFF] hover:bg-[#F8589F] hover:text-white transition-colors"
          onClick={increment}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default NumberOfQuestion;