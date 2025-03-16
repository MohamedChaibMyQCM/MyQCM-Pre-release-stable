import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import mode from "../../../../public/settings/intell_mode.svg";
import arrow from "../../../../public/Icons/Profile/ArrowProfile.svg";

const IntelligentMode = ({ name, value, setFieldValue }) => {
  const moduleOptions = [
    { value: "Mathematics", label: "Mathematics" },
    { value: "Science", label: "Science" },
    { value: "History", label: "History" },
    { value: "Literature", label: "Literature" },
    { value: "Programming", label: "Programming" },
  ];

  return (
    <div className="mt-8">
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        Intelligent Mode Settings
      </h3>
      <div className="relative bg-[#FFFFFF] flex items-center justify-between rounded-[16px] pl-6 pr-12 py-6 box">
        <div>
          <div className="mb-6">
            <h4 className="text-[#191919] font-[500] text-[15px] mb-2">
              Your Learning Focus*
            </h4>
            <p className="text-[#666666] text-[13px]">
              Sharing your focus helps Synergy tailor your experience even
              further, but it will always adapt to your performance.
            </p>
            <Select
              required
              value={value}
              onValueChange={(val) => setFieldValue(name, val)}
            >
              <SelectTrigger className="rounded-[16px] items-center border-[#E4E4E4] text-[#191919] font-medium py-5 px-[20px] select mt-4">
                <div className="flex items-center gap-3">
                  <SelectValue placeholder="Select modules" />
                </div>
                <Image src={arrow} alt="arrow" />
              </SelectTrigger>
              <SelectContent className="bg-[#FFE7F2] rounded-[8px] border-none">
                <SelectGroup>
                  {moduleOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="!bg-[#FFE7F2] text-[#6C7275C4] font-medium duration-300 hover:!bg-[#ffffff] rounded-[8px]"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <h4 className="text-[#191919] font-[500] text-[15px] mb-2">
              Preferred Question Types *
            </h4>
            <p className="text-[#666666] text-[13px]">
              Let us know your preferences! Synergy will do its best to
              incorporate them while ensuring a balanced learning <br />{" "}
              experience.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <button className="bg-[#FFF5FA] text-[#F8589F] text-[14px] font-[500] px-[20px] py-[6px] rounded-[16px] border border-[#F8589F]">
                Multiple choise
              </button>
              <button className="bg-[#FFF5FA] text-[#F8589F] text-[14px] font-[500] px-[20px] py-[6px] rounded-[16px] ">
                Short Answer
              </button>
            </div>
          </div>
        </div>
        <span className="text-[12px] text-[#F8589F] absolute top-4 right-4">
          *Required Fields
        </span>
        <Image
          src={mode}
          alt="Intelligent Mode"
          className="w-[200px] mr-[40px]"
        />
      </div>
    </div>
  );
};

export default IntelligentMode;