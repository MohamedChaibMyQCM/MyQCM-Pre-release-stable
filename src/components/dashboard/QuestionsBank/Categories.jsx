"use client"

import BaseUrl from '@/components/BaseUrl';
import { categories } from '@/data/data';
import Image from 'next/image';
import React from 'react'
import { useQuery } from 'react-query';

const Categories = () => {

  const { data, isLoading, error } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const response = await BaseUrl.get("/subject/user");
      return response.data.data;
    },
  });

  return (
    <div className='px-[30px] mb-[40px]'>
      <h3 className="text-[#565656] font-Poppins font-semibold text-[19px] mb-6">Categories ( Module )</h3>
      <ul className='flex items-center flex-wrap gap-4'>
        {categories.map((item, index) => {
          return (
            <li className="flex items-center gap-4 basis-[24%] bg-[#FF95C4] px-[20px] py-[20px] rounded-[20px] cursor-pointer" key={index}>
              <Image src={item.img} alt='module logo' />
              <div className="flex flex-col gap-1">
                <span className="text-[#FFFFFF] font-Poppins font-semibold text-[15px]">{item.name}</span>
                <span className="text-[#FFFFFF] font-Poppins font-extralight text-[12px]">
                  {item.questions} Question
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Categories