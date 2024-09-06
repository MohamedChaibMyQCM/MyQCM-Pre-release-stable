"use client"

import { modules } from "@/data/data";
import Image from "next/image";
import arrow from "../../../../public/Icons/small right.svg";
import BaseUrl from "@/components/BaseUrl";
import { useQuery } from "react-query";

const Progress = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const response = await BaseUrl.get("/subject/user");
      return response.data.data;
    },
  });

  return (
    <div className="mb-[40px]">
      <div className="flex items-center justify-between mb-[24px]">
        <h2 className="text-[#11142D] font-Inter text-[16px] font-[600] ">
          Modules In Progress
        </h2>
        <span className="font-Inter text-[12px] text-[#93959F]">See All</span>
      </div>
      <ul className="flex flex-col gap-3">
        {modules.map((item, index) => {
          return (
            <li
              key={index}
              className="flex gap-4 items-center justify-between bg-[#FFFFFF] py-[12px] px-[20px] rounded-[10px]"
            >
              <div className="flex items-center gap-4">
                <div
                  style={{ backgroundColor: item.color }}
                  className={`p-[8px] rounded-[10px]`}
                >
                  <Image
                    src={item.img}
                    alt="icon"
                    className="bg-[#fff] rounded-[30px] p-[2px] w-[30px]"
                  />
                </div>
                <div className="flex flex-col">
                  <h4 className="font-Inter text-[#11142D] text-[14px] font-semibold">
                    {item.module}
                  </h4>
                  <div className="h-[20px] flex items-center gap-2">
                    <span className="font-Inter text-[#808191] text-[12px] font-medium">
                      Your Progress:
                    </span>
                    <div className="relative h-[13px] w-[100px] rounded-[4px] bg-[#D9D9D9]">
                      <div className="absolute left-0 top-0 h-[13px] rounded-[4px]" style={{backgroundColor: item.color, width: item.progress}} ></div>
                    </div>
                    <span className="text-[12px] text-[#808191] font-Inter font-medium">
                      {item.progress}%
                    </span>
                  </div>
                </div>
              </div>
              <Image src={arrow} alt="arrow" />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Progress;