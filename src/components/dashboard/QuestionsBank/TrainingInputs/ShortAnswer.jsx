"use client";

import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const ShortAnswer = ({ name, value, setFieldValue }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="font-Poppins text-[13px] text-[#0C092A] font-semibold">
        Short Answer (QROCs)
      </span>
      <Switch
        checked={value}
        onCheckedChange={(checked) => setFieldValue(name, checked)}
        className="!bg-[#FF6EAF] switch"
      />
    </div>
  );
};

export default ShortAnswer;
