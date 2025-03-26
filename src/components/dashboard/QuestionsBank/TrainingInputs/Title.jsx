"use client";

import React from "react";

const Title = ({ value, onChange }) => {
  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Enter title"
        className="w-full p-2 px-[20px] placeholder:text-[#191919] text-[15px] border border-gray-300 text-[#191919] outline-none rounded-[24px]"
      />
    </div>
  );
};

export default Title;