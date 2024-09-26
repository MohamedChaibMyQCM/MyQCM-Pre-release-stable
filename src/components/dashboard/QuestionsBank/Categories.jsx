"use client";

import BaseUrl from "@/components/BaseUrl";
import Loading from "@/components/Loading";
import category from "../../../../public/Icons/categories.svg";
import Image from "next/image";
import React from "react";
import { useQuery } from "react-query";
import { useLocale } from "next-intl";
import Link from "next/link";

const Categories = () => {
  const locale = useLocale();

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
    <div className="px-[30px] mb-[40px]">
      <h3 className="text-[#565656] font-Poppins font-semibold text-[19px] mb-6">
        Categories (Module)
      </h3>
      <ul className="flex items-center flex-wrap gap-4">
        {subjects.length == 0 ? (
          <div>No categories available.</div>
        ) : (
          subjects.map((item) => (
            <li
              key={item.id}
              className="basis-[24%] max-md:basis-[100%] max-xl:basis-[48%]"
            >
              <Link
                href={`/${locale}/dashboard/QuestionsBank/${item.id}`}
                className="flex items-center h-[90px] gap-4 bg-[#FF95C4] px-[20px] rounded-[20px] cursor-pointer"
              >
                <Image src={category} alt="module logo" />
                <div className="flex flex-col gap-1">
                  <span className="text-[#FFFFFF] font-Poppins font-semibold text-[14px]">
                    {item.name}
                  </span>
                  <span className="text-[#FFFFFF] font-Poppins font-extralight text-[12px]">
                    {item.mcqs} Question
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