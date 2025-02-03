"use client";

import module from "../../../../public/Icons/module (4).svg";
import Image from "next/image";
import arrow from "../../../../public/Icons/small right.svg";
import BaseUrl from "@/components/BaseUrl";
import { useQuery } from "react-query";
import Loading from "@/components/Loading";
import Link from "next/link";
import { useLocale } from "next-intl";

const Progress = () => {
  const locale = useLocale();

  const { data, isLoading, error } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const response = await BaseUrl.get(`/subject/user`);
      return response.data.data;
    },
  });
  
  if (isLoading) return <Loading />;
  if (error) return <div>Error: {error.message}</div>;

  const subjects = Array.isArray(data) ? data : [];
  const bgColors = ["#ECD14E", "#B2A4E4", "#ABCC57", "#25D9D7"];

  return (
    <div className="mb-[40px]">
      <div className="flex items-center justify-between mb-[24px]">
        <h2 className="text-[#11142D] font-Inter text-[17px] font-[700]">
          Modules en cours
        </h2>
        <Link
          href={`/${locale}/dashboard/QuestionsBank`}
          className="font-Inter text-[12px] text-[#93959F] cursor-pointer"
        >
          Voir tout
        </Link>
      </div>
      <ul className="flex flex-col gap-3">
        {subjects.slice(0, 4).map((item, index) => (
          <Link
            href={`/${locale}/dashboard/QuestionsBank/${item.id}`}
            key={item.id}
          >
            <li className="flex gap-4 items-center justify-between bg-[#FFFFFF] py-[12px] px-[20px] rounded-[10px]">
              <div className="flex items-center gap-4">
                <div
                  className={`p-[8px] rounded-[10px]`}
                  style={{ backgroundColor: bgColors[index] || "#FFFFFF" }}
                >
                  <Image
                    src={module}
                    alt="icon"
                    className="bg-[#fff] rounded-[30px] p-[2px] w-[30px]"
                  />
                </div>
                <div className="flex flex-col">
                  <h4 className="font-Inter text-[#11142D] text-[14px] font-semibold">
                    {item.name}
                  </h4>
                  <div className="h-[20px] flex items-center gap-2">
                    <span className="font-Inter text-[#808191] text-[12px] font-medium max-md:text-[10px]">
                      Your Progress:
                    </span>
                    <div className="relative h-[13px] w-[100px] rounded-[4px] bg-[#D9D9D9]">
                      <div
                        className="absolute left-0 top-0 h-[13px] rounded-[4px] w-[50px]"
                        style={{
                          backgroundColor: bgColors[index] || "#FFFFFF",
                        }}
                      ></div>
                    </div>
                    <span className="text-[12px] text-[#808191] font-Inter font-medium">
                      67%
                    </span>
                  </div>
                </div>
              </div>
              <Image src={arrow} alt="arrow" />
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default Progress;
