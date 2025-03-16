"use client";

import BaseUrl from "@/components/BaseUrl";
import Loading from "@/components/Loading";
import module from "../../../../public/Icons/module.svg";
import filter from "../../../../public/Question_Bank/filter.svg";
import Image from "next/image";
import React, { useState } from "react";
import { useQuery } from "react-query";
import Link from "next/link";
import SelectUnite from "@/components/dashboard/QuestionsBank/SelectUnite";

const Categories = () => {
  const [selectUnite, setSelectUnite] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const response = await BaseUrl.get("/subject/user");
      return response.data.data;
    },
  });

  if (isLoading) return <Loading />;
  if (error) return <div>Error: {error.message}</div>;

  const subjects = Array.isArray(data) ? data : [];

  return (
    <div className="px-[24px] mb-[24px] max-md:px-[20px]">
      <div className="relative flex items-center justify-between mb-5">
        <h3 className="text-[#191919] font-[500] text-[18px] max-md:text-[16px]">
          Modules
        </h3>
        <div className="flex items-center bg-[#FFFFFF] gap-2 px-4 py-[6px] rounded-[16px] box">
          <button className="text-[14px] font-[500]">Filter</button>
          <Image src={filter} alt="filter" className="w-[13px]" />
          {selectUnite && <SelectUnite setselectunite={setSelectUnite} />}
        </div>
      </div>
      <ul className="flex items-center flex-wrap gap-4 bg-[#FFF] p-5 rounded-[16px] box">
        {subjects.length == 0 ? (
          <div>No categories available.</div>
        ) : (
          subjects.map((item) => (
            <li
              key={item.id}
              className="basis-[calc(25%-12px)] max-md:basis-[100%] max-xl:basis-[calc(50%-12px)] rounded-[16px] bg-gradient-to-r from-[#F8589F] to-[#FD2E8A]"
            >
              <Link
                href={`/dashboard/QuestionsBank/${item.id}`}
                className="flex items-center h-[84px] gap-4 px-[20px] rounded-[20px] cursor-pointer w-full"
              >
                <Image src={module} alt="module logo" />
                <div className="flex flex-col gap-1">
                  <span className="text-[#FFFFFF] font-Poppins font-semibold text-[14px]">
                    {item.name}
                  </span>
                  <span className="text-[#FFC9E1] font-Poppins font-extralight text-[12px]">
                    {item.question_count} Question
                  </span>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Categories;
