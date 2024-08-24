import Courses from "@/components/dashboard/QuestionsBank/Courses";
import Module from "@/components/dashboard/QuestionsBank/Module";
import React from "react";

const page = () => {
  return (
    <div className="pt-[22px] pb-[40px] flex flex-col gap-8">
      <span className="font-Poppins font-semibold text-[#858494] px-[40px] text-[15px]">
        Question Bank / <span className="text-[#FF95C4]">Categories</span> /
        semilogy
      </span>
      <div className="flex justify-between items-start px-[40px]">
        <Module />
        <Courses />
      </div>
    </div>
  );
};

export default page;
