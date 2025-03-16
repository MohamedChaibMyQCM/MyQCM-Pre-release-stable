"use client";

import Questions from "@/components/dashboard/QuestionsBank/Questions";
import { useParams } from "next/navigation";
import { useQuery } from "react-query";
import BaseUrl from "@/components/BaseUrl";
import Loading from "@/components/Loading";

const Page = () => {
  const { category: subjectId } = useParams();
  
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
    <div className="pt-[22px] pb-[40px] flex flex-col gap-8 px-[24px] overflow-hidden max-md:px-[20px]">
      <Questions data={data2} isLoading={isLoading} error={error} />
    </div>
  );
};

export default Page;
