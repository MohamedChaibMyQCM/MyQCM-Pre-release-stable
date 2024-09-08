"use client";
import BaseUrl from "@/components/BaseUrl";
import heart from "../../../../public/heart.svg";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "react-query";
import Loading from "@/components/Loading";

const Cards = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const response = await BaseUrl.get("/unit");
      return response.data.data;
    },
  });

  if (isLoading) return <Loading />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1 className="text-[#11142D] font-Poppins text-[40px] font-[600] mb-[20px]">
        <span className="text-[20px] font-[500]">Hi Mohammed,</span> <br />
        What will you learn today?
      </h1>
      <div>
        {data.map((item) => (
          <div
            className="flex items-center bg-[#FD2E8A] rounded-[16px] px-[10px] py-[20px] mb-[60px]"
            key={item.id}
          >
            <Image src={heart} alt="image of the card" className="w-[300px]" />
            <div className="flex flex-col gap-2 flex-1">
              <h3 className="font-Poppins text-[#FFFFFF] font-semibold text-[20px]">
                {item.name}
              </h3>
              <p className="font-Inter text-[#FFFFFF] leading-[26px] font-light text-[12px]">
                {item.description}
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href={``}
                  className="font-Inter bg-[#FFFFFF] text-[#11142D] rounded-[20px] py-[8px] px-[22px] box text-[13px] font-semibold"
                >
                  Quick Exam Simulation
                </Link>
                <Link
                  href={``}
                  className="font-Inter bg-[#FF26A1] text-[#FFFFFF] rounded-[20px] py-[8px] px-[22px] text-[13px] box font-semibold"
                >
                  Start Unit
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cards;