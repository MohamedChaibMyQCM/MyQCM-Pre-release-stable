"use client";

import { Label } from "@/components/ui/label";

const ShortAnswer = ({ name, value, setFieldValue }) => {
  const handleToggle = () => {
    setFieldValue(name, !value);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex space-x-2 items-center">
        <button
          type="button"
          onClick={handleToggle}
          className={`w-[14px] h-[14px] rounded-full border-2 border-[#FD2E8A] cursor-pointer transition-colors ${
            value ? "bg-[#FD2E8A] border-[#FD2E8A]" : "bg-transparent"
          }`}
        />
        <div className="flex flex-col gap-2">
          <Label htmlFor="option-one" className="text-[#FD2E8A] font-[500]">
            QROCs
          </Label>
        </div>
      </div>
    </div>
  );
};

export default ShortAnswer;
