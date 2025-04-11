"use client";

import { useParams } from "next/navigation";
import Courses from "@/components/dashboard/QuestionsBank/Courses";
import Module from "@/components/dashboard/QuestionsBank/Module";
import { useQuery } from "@tanstack/react-query";
import BaseUrl from "@/components/BaseUrl";
import Loading from "@/components/Loading";
import secureLocalStorage from "react-secure-storage";

const Page = () => {
  const { category: subjectId } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["subject"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get(`/subject/${subjectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    },
  });

  const { data: data2 } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get(`/course/subject/${subjectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
       return response.data.data.data;
    },
  });

  if (isLoading) return <Loading />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex justify-between items-start p-[24px] pb-[40px] max-md:flex-col max-md:gap-12 max-md:px-[20px]">
      <Module data={data} />
      <Courses courses={data2} subjectId={subjectId} />
    </div>
  );
};

export default Page;
