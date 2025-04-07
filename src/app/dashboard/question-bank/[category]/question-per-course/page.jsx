"use client";

import Questions from "@/components/dashboard/QuestionsBank/Questions";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import BaseUrl from "@/components/BaseUrl";
import Loading from "@/components/Loading";
import secureLocalStorage from "react-secure-storage";

const Page = () => {
  const { category: subjectId } = useParams();

  const {
    data: data2,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get(
        `/course/subject/${subjectId}?offset=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data.data.data;
    },
  });

  if (isLoading) return <Loading />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="pt-[22px] pb-[40px] flex flex-col gap-8 px-[24px] overflow-hidden max-md:px-[20px] max-md:pt-[12px]">
      <Questions data={data2} isLoading={isLoading} error={error} />
    </div>
  );
};

export default Page;
