"use client";

import BaseUrl from "@/components/BaseUrl";
import heart from "../../../../public/heart.svg";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "react-query";
import Loading from "@/components/Loading";

const Cards = ({ setUnit }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const response = await BaseUrl.get("/unit/user");
      return response.data.data;
    },
    onSuccess: (data) => {
      setUnit(data[0].id);
    },
  });

  const { data: name } = useQuery({
    queryFn: async () => {
      const response = await BaseUrl.get("/user/fullname");
      return response.data.data;
    },
  });

  if (isLoading) return <Loading />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="max-md:mt-4">
      <h1 className="text-[#11142D] font-Poppins text-[38px] font-[600] mb-[20px] max-md:text-[22px]">
        <span className="text-[20px] font-[500] max-md:text-[18px]">
          Salut {name},
        </span>{" "}
        <br />
        Que vas-tu apprendre aujourd&apos;hui ?
      </h1>
      <div>
        {data.slice(0, 1).map((item) => (
          <div
            className="relative flex items-center bg-[#FD2E8A] rounded-[16px] px-[10px] py-[20px] mb-[60px] after:bg-[#FD2E8A8C] after:w-[96%] after:left-[50%] after:translate-x-[-50%] after:h-[100%] after:rounded-[16px] after:absolute after:bottom-[-10px] after:left-0 after:z-[-1] before:bg-[#FD2E8A5E] before:w-[92%] before:left-[50%] before:translate-x-[-50%] before:h-[100%] before:rounded-[16px] before:absolute before:bottom-[-20px] before:left-0 before:z-[-20] max-md:px-[20px]"
            key={item.id}
          >
            <Image
              src={heart}
              alt="image of the card"
              className="w-[300px] max-md:w-[100px] max-md:hidden"
            />
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
                  className="font-Inter bg-[#FFFFFF] text-[#11142D] rounded-[20px] py-[8px] px-[20px] box text-[12px] font-semibold max-md:text-[10px]"
                >
                  Simulation rapide d&apos;examen
                </Link>
                <Link
                  href={``}
                  className="font-Inter bg-[#FF26A1] text-[#FFFFFF] rounded-[20px] py-[8px] px-[20px] text-[12px] box font-semibold max-md:text-[10px]"
                >
                  Commencer l&apos;unité
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