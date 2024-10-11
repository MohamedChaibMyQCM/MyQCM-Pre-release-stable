import { logos } from "@/data/data";
import Image from "next/image";
import React from "react";

const InfiniteCarousel = () => {
  return (
    <div className="relative overflow-hidden w-full">
      <div className="flex items-center animate-scroll gap-16">
        {logos.concat(logos).map((item, index) => (
          <div key={index} className="flex-shrink-0 mr-4">
            <Image src={item.src} alt="logo" className="w-[160px]" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfiniteCarousel;