"use client";

import BaseUrl from "@/components/BaseUrl";
import Courses from "@/components/dashboard/QuestionsBank/Courses";
import Module from "@/components/dashboard/QuestionsBank/Module";
import { useQuery } from "react-query";

const page = () => {
  const { data: data1, isLoading: isLoading1, error: error1 } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const response = await BaseUrl.get("/subject/{subjectId}");
      return response.data.data;
    },
  });

  const { data: data2, isLoading: isLoading2, error: error2 } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await BaseUrl.get("/course/subject/{subjectId}");
      return response.data.data;
    },
  });

  return (
    <div className="pt-[22px] pb-[40px] flex flex-col gap-8">
      <span className="font-Poppins font-semibold text-[#858494] text-[15px] flex items-center gap-2 px-[40px]">
        Question Bank <span className="text-[12px]">/</span>
        <span className="text-[#FF95C4]">Categories</span>
        <span className="text-[12px]">/</span>
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
