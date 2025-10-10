import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import exit from "../../../../public/Icons/exit.svg";
import arrow from "../../../../public/greyArrow.svg";
import { useQuery } from "react-query";
import BaseUrl from "@/components/BaseUrl";

const SelectUnite = ({ setselectunite }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const response = await BaseUrl.get("/unit/user");
      return response.data.data;
    },
  });

  return (
    <div className="absolute box z-50 right-0 top-[40px] p-[20px] bg-[#FFFFFF] rounded-[16px] w-[220px]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[#0C092A] font-Poppins font-semibold text-[14px]">
          Select Unit
        </span>
        <Image
          src={exit}
          alt="exit"
          className=" cursor-pointer w-[16px]"
          onClick={() => setselectunite(false)}
        />
      </div>
      <div>
        <Select>
          <SelectTrigger className="rounded-[10px] flex bg-[#FFFFFF] border-[#EFEEFC] text-[#6C727580] font-Inter font-medium py-[4px] px-[12px] select select-unite">
            <div className="flex items-center justify-between w-[200px]">
              <SelectValue placeholder="Select Unity" />
              <Image src={arrow} alt="arrow" className="w-[10px]" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-[#E8E8E8] rounded-[8px]">
            <SelectGroup>
              {data?.map((item) => (
                <SelectItem
                  key={item.id}
                  value={item.id}
                  className="!bg-[#E8E8E8] text-[#FFFFFF] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
                >
                  {item.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SelectUnite;
