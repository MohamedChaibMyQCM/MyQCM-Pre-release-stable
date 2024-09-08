"use client";

import { useParams } from "next/navigation";
import Courses from "@/components/dashboard/QuestionsBank/Courses";
import Module from "@/components/dashboard/QuestionsBank/Module";

const Page = () => {
  const { category: subjectId } = useParams();

  return (
    <div className="pt-[22px] pb-[40px] flex flex-col gap-8">
      <span className="font-Poppins font-semibold text-[#858494] text-[15px] flex items-center gap-2 px-[40px]">
        Question Bank <span className="text-[12px]">/</span>
        <span className="text-[#FF95C4]">Categories</span>
        <span className="text-[12px]">/</span>
        semilogy
      </span>
      <div className="flex justify-between items-start px-[40px]">
        <Module subjectId={subjectId} />
        <Courses subjectId={subjectId} />
      </div>
    </div>
  );
};

export default Page;