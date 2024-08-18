"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const SwitchLanguage = () => {
  const currentLocale = useLocale();
  const router = useRouter();
  const [selectedLocale, setSelectedLocale] = useState(currentLocale);

  const changeLanguageHandler = (value) => {
    setSelectedLocale(value);
    router.replace(`/${value}`);
  };

  useEffect(() => {
    setSelectedLocale(currentLocale);
  }, [currentLocale]);

  return (
    <Select
      value={selectedLocale}
      onValueChange={changeLanguageHandler}
      className="outline-none border-[#FFFFFF]"
    >
      <SelectTrigger className="w-[80px] font-Madani outline-none font-[400]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="outline-none">
        <SelectItem value="en" className="font-Madani outline-none">
          ENG
        </SelectItem>
        <SelectItem value="fr" className="font-Madani outline-none">
          FR
        </SelectItem>
        <SelectItem value="ar" className="font-Madani outline-none">
          عربي
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SwitchLanguage;
