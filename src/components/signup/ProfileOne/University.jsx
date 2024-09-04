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

const universities = [
  "University of Algiers 1",
  "University of Blida 1",
  "University of Batna 2",
  "University of Constantine 3",
  "University of Oran 1",
  "University of Tlemcen",
  "University of Mostaganem",
  "Ferhat Abbas Setif University 1",
  "University of Annaba",
  "University of Sidi Bel Abbes",
  "University of Bejaia",
  "University of Tizi Ouzou",
];

const University = ({ name, value, setFieldValue }) => {
  return (
    <div className="w-[48%] flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-[#6C7275C4] font-Inter text-[19px] font-semibold"
      >
        Institution/University ?
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
          <SelectGroup>
            {universities.map((univer, index) => (
              <SelectItem
                key={index}
                value={univer}
                className="!bg-[#FFE7F2] text-[#FFFFFF] font-Inter font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
              >
                {univer}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};


export default University;