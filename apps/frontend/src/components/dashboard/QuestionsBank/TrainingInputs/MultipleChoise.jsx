"use client";

import { Switch } from "@/components/ui/switch";

const MultipleChoice = ({ name, value, setFieldValue }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[14px] text-[#191919] font-[500]">
        Question a Choix multiple (QCM)
      </span>

      <Switch
        checked={value}
        onCheckedChange={(checked) => {
          setFieldValue(name, checked);
          // Mirror QCM toggle state to QCS to avoid sending MCQs when disabled.
          setFieldValue("qcs", checked);
        }}
        className={`switch ${value == false ? "!bg-[grey]" : "!bg-[#FD2E8A]"}`}
      />
    </div>
  );
};

export default MultipleChoice; 
