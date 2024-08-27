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
import Image from "next/image";
import arrow from '../../../public/arrow.svg'

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
      className="outline-none"
    >
      <SelectTrigger className="w-[80px] font-Madani outline-none font-[400] switch-Language flex items-center gap-1">
        <SelectValue />
        <Image src={arrow} alt="arrow" className="w-[18px]" />
      </SelectTrigger>
      <SelectContent className="outline-none bg-[#FFFFFF]">
        <SelectItem
          value="en"
          className="font-Madani outline-none hover:!bg-[grey]"
        >
          ENG
        </SelectItem>
        <SelectItem
          value="fr"
          className="font-Madani outline-none hover:!bg-[grey]"
        >
          FR
        </SelectItem>
        <SelectItem
          value="ar"
          className="font-Madani outline-none hover:!bg-[grey]"
        >
          عربي
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SwitchLanguage;
