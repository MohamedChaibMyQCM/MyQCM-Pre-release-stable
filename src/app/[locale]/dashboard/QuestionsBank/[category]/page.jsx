"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Courses from "@/components/dashboard/QuestionsBank/Courses";
import Module from "@/components/dashboard/QuestionsBank/Module";
import { useQuery } from "react-query";
import BaseUrl from "@/components/BaseUrl";
import Loading from "@/components/Loading";

const Page = () => {
  const { category: subjectId } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["subject"],
    queryFn: async () => {
      const response = await BaseUrl.get(`/subject/${subjectId}`);
      return response.data.data;
    },
  });  

  if (isLoading) return <Loading />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="pt-[22px] pb-[40px] flex flex-col gap-8">
      <span className="font-Poppins font-semibold text-[#858494] text-[15px] flex items-center gap-2 px-[40px]">
        Question Bank <span className="text-[12px]">/</span>
        <span className="text-[#FF95C4]">Categories</span>
        <span className="text-[12px]">/</span>
        {data.name}
      </span>
      <div className="flex justify-between items-start px-[40px]">
        <Module data={data} />
        <Courses courses={data.courses} subjectId={subjectId} />
      </div>
    </div>
  );
};

export default Page;
