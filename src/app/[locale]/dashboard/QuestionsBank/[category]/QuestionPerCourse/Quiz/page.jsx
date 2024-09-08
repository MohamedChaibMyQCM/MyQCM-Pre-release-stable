"use client";

import Image from "next/image";
import logo from "../../../../../../../../public/whiteLogo.svg";
import { QuizImage } from "@/data/data";
import Quiz from "@/components/dashboard/QuestionsBank/Quiz";
import BaseUrl from "@/components/BaseUrl";
import { useMutation, useQuery } from "react-query";
import { useSearchParams } from "next/navigation";
import Loading from "@/components/Loading";

const Page = () => {
  const searchParams = useSearchParams()
  const courseId = searchParams.get('courseId')
  
  const { data, isLoading, error } = useQuery({
    queryFn: async () => {
      const response = await BaseUrl.get(`/course/next-mcq/${courseId}`);
      return response.data.data;
    },
  });

  const { mutateAsync: Progress } = useMutation({
    mutationFn: (data) => BaseUrl.post(`/progress`, data),
    onSuccess: () => {},
    onError: (error) => {
      handleError(error); 
    },
  });

  if (isLoading) return <Loading />;
  if (error) return <p>Error: {error.message}</p>; 

  return (
    <div className="absolute min-h-[100vh] w-[100%] z-50 top-0 left-0 bg-[#FF6FAF] px-[80px] py-[30px] pb-[100px] flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <Image src={logo} alt="logo" className="w-[140px]" />
        <button className="font-Inter font-medium text-[13px] text-[#FFFFFF] rounded-[12px] px-[12px] py-[6px] border-[2px] border-[#FFFFFF]">
          End Season
        </button>
      </div>
      <Quiz data={data} Progress={Progress} />
      {QuizImage.map((item, index) => (
        <Image
          key={index}
          src={item.img}
          alt={item.alt}
          className={item.className}
        />
      ))}
    </div>
  );
};

export default Page;