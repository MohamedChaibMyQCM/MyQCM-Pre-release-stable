import { useLocale, useTranslations } from "next-intl";
import React from "react";
import InfiniteCarousel from "./InfiniteCarousel";

const Trust = () => {
  const t = useTranslations("home_page.trust");
  const locale = useLocale();
  return (
    <section className="bg-[#F7589FCC] w-[100%] h-40 flex gap-4 justify-center items-center flex-col">
      <h2
        className={`text-[#FFF] mx-[auto] text-[16px] font-semibold ${
          locale == "ar" ? "font-Madani" : "font-TTInterphases"
        }`}
      >
        {t("heading")}
      </h2>
      <InfiniteCarousel />
    </section>
  );
};

export default Trust;
