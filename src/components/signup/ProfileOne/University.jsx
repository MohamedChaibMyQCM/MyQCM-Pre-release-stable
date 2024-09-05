import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import university from "../../../../public/Icons/Profile/university.svg";
import arrow from "../../../../public/Icons/Profile/ArrowProfile.svg";
import Image from "next/image";
import { useQuery } from "react-query";
import BaseUrl from "@/components/BaseUrl";

const University = ({ name, value, setFieldValue }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["university"],
    queryFn: async () => {
      const response = await BaseUrl.get("/university");
      return response.data.data;
    },
  });

  return (
    <div className="w-[48%] flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-[#6C7275C4] font-Inter text-[19px] font-semibold"
      >
        Institution/University?
      </label>
      <Select value={value} onValueChange={(val) => setFieldValue(name, val)}>
        <SelectTrigger className="rounded-[8px] items-center bg-[#FFE7F2] border-none text-[#6C727580] font-Inter font-medium py-6 px-[20px] select">
          <div className="flex items-center gap-3">
            <Image src={university} alt="university" />
            <SelectValue placeholder="Select your Institution/University" />
          </div>
          <Image src={arrow} alt="arrow" />
        </SelectTrigger>
        <SelectContent className="bg-[#FFE7F2] rounded-[8px]">
          {isLoading ? (
            <p className="p-4 text-gray-600">Loading universities...</p>
          ) : error ? (
            <p className="p-4 text-red-600">Error loading universities</p>
          ) : (
            <SelectGroup>
              {data.map((univer) => (
                <SelectItem
                  key={univer.id}
                  value={univer.id}
                  className="!bg-[#FFE7F2] text-[#FFFFFF] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
                >
                  {univer.name}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default University;