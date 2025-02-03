"use client";

import Questions from "@/components/dashboard/QuestionsBank/Questions";
import { useParams } from "next/navigation";
import { useQuery } from "react-query";
import BaseUrl from "@/components/BaseUrl";
import Loading from "@/components/Loading";

const Page = () => {
  const { category: subjectId } = useParams();

  const { data: data1 } = useQuery({
    queryKey: ["subject"],
    queryFn: async () => {
      const response = await BaseUrl.get(`/subject/${subjectId}`);
      return response.data.data;
    },
  });

  const {
    data: data2,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await BaseUrl.get(`/course/subject/${subjectId}`);
      return response.data.data;
    },
  });

  if (isLoading) return <Loading />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="pt-[22px] pb-[40px] flex flex-col gap-8 px-[40px] overflow-hidden max-md:px-[20px]">
      <span className="font-Poppins font-semibold text-[#858494] text-[15px] flex items-center gap-2 max-md:text-[12px]">
        Question Bank <span className="text-[12px]">/</span>
        <span className="text-[#FF95C4]">Categories</span>
        <span className="text-[12px]">/</span>
        {data1 && data1.name} <span className="text-[12px]">/</span> Q/C per
        course
      </span>
      <Questions data={data2} isLoading={isLoading} error={error} />
    </div>
  );
};

export default Page;
