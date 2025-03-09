import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import annexe from "../../../../public/Icons/Profile/university.svg";
import arrow from "../../../../public/Icons/Profile/ArrowProfile.svg";
import Image from "next/image";
import { useQuery } from "react-query";
import BaseUrl from "@/components/BaseUrl";

const Annexe = ({ name, value, uniValue, setFieldValue }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["faculties", uniValue],
    queryFn: async () => {
      const response = await BaseUrl.get(`/faculty?universityId=${uniValue}`);
      return response.data.data;
    },
  });

  return (
    <div className="w-[48%] flex flex-col gap-2 max-md:w-full">
      <label
        htmlFor={name}
        className="text-[#6C7275C4] text-[19px] font-semibold"
      >
        Annexe/Faculte ?
      </label>
      <Select
        required
        value={value}
        onValueChange={(val) => setFieldValue(name, val)}
      >
        <SelectTrigger className="rounded-[8px] items-center bg-[#FFE7F2] border-none text-[#6C727580] font-medium py-6 px-[20px] select">
          <div className="flex items-center gap-3">
            <Image src={annexe} alt="annexe" />
            <SelectValue placeholder="Select your Annexe/Faculte" />
          </div>
          <Image src={arrow} alt="arrow" />
        </SelectTrigger>
        <SelectContent className="bg-[#FFE7F2] rounded-[8px] border-none">
          {isLoading ? (
            <p className="p-4 text-gray-600">Loading Annexe...</p>
          ) : error ? (
            <p className="p-4 text-red-600">Error loading Annexe</p>
          ) : (
            <SelectGroup>
              {data.map((annexe) => (
                <SelectItem
                  key={annexe.id}
                  value={annexe.id}
                  className="!bg-[#FFE7F2] text-[#fafafa] font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
                >
                  {annexe.name}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default Annexe;
