import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import exam from "../../../../public/Icons/Profile/CertOrExam.svg";
import arrow from "../../../../public/Icons/Profile/ArrowProfile.svg";
import Image from "next/image";

const CertOrExam = ({ name, value, setFieldValue }) => {
  return (
    <div className="w-[48%] flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-[#6C7275C4]  text-[19px] font-semibold"
      >
        Any Certifications or Exams?
      </label>
      <Select
        required
        value={value}
        onValueChange={(val) => setFieldValue(name, val)}
      >
        <SelectTrigger className="rounded-[8px] items-center bg-[#FFE7F2] border-none text-[#6C7275C4]  font-medium py-6 px-[20px] select">
          <div className="flex items-center gap-3">
            <Image src={exam} alt="exam" />
            <SelectValue placeholder="Select any type of exam you prepare for" />
          </div>
          <Image src={arrow} alt="arrow" />
        </SelectTrigger>
        <SelectContent className="bg-[#FFE7F2] rounded-[8px]">
          <SelectGroup>
            <SelectItem
              value="Unite Exam"
              className="!bg-[#FFE7F2] text-[#ffffff]  font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Unite Exam
            </SelectItem>
            <SelectItem
              value="Module Exam"
              className="!bg-[#FFE7F2] text-[#ffffff]  font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Module Exam
            </SelectItem>
            <SelectItem
              value="Residency Exam"
              className="!bg-[#FFE7F2] text-[#ffffff]  font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              Residency Exam
            </SelectItem>
            <SelectItem
              value="TP (Travaux Pratiques) Evaluation"
              className="!bg-[#FFE7F2] text-[#ffffff]  font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              TP (Travaux Pratiques) Evaluation
            </SelectItem>
            <SelectItem
              value="ECOS (Examen Clinique Objectif Structuré)"
              className="!bg-[#FFE7F2] text-[#ffffff]  font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
            >
              ECOS (Examen Clinique Objectif Structuré)
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CertOrExam;
