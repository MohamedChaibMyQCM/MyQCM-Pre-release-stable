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

const annexes = [
  "Annexe Boumerdes",
  "Annexe Tipaza",
  "Annexe Djelfa",
  "Annexe Tiaret",
  "Annexe Biskra",
  "Annexe Chlef",
  "Annexe M’sila",
  "Annexe Skikda",
  "Annexe Oum El Bouaghi",
  "Annexe El Oued",
  "Annexe Saida",
  "Annexe Jijel",
  "Annexe Adrar",
  "Annexe Mascara",
];

const Annexe = ({ name, value, setFieldValue }) => {
  return (
    <div className="w-[48%] flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-[#6C7275C4] font-Inter text-[19px] font-semibold"
      >
        Annexe/Faculte ?
      </label>
      <Select value={value} onValueChange={(val) => setFieldValue(name, val)}>
        <SelectTrigger className="rounded-[8px] items-center bg-[#FFE7F2] border-none text-[#6C727580] font-Inter font-medium py-6 px-[20px] select">
          <div className="flex items-center gap-3">
            <Image src={annexe} alt="annexe" />
            <SelectValue placeholder="Select your Annexe/Faculte" />
          </div>
          <Image src={arrow} alt="arrow" />
        </SelectTrigger>
        <SelectContent className="bg-[#FFE7F2] rounded-[8px]">
          <SelectGroup>
            {annexes.map((annexe, index) => (
              <SelectItem
                key={index}
                value={annexe}
                className="!bg-[#FFE7F2] text-[#FFFFFF] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
              >
                {annexe}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default Annexe;