"use client"

import BaseUrl from "@/components/BaseUrl";
import Questions from "@/components/dashboard/QuestionsBank/Questions";
import { useQuery } from "react-query";

const page = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await BaseUrl.get("/course/subject/{subjectId}");
      return response.data.data;
    },
  });
  return (
    <div className="pt-[22px] pb-[40px] flex flex-col gap-8 px-[40px] overflow-hidden">
      <span className="font-Poppins font-semibold text-[#858494] text-[15px] flex items-center gap-2">
        Question Bank <span className="text-[12px]">/</span>
        <span className="text-[#FF95C4]">Categories</span>
        <span className="text-[12px]">/</span>
        semilogy <span className="text-[12px]">/</span> Q/C per course
      </span>
      <Questions />
    </div>
  );
};

export default page;
