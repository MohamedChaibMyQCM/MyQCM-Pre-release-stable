import React from "react";
import InfiniteCarousel from "./InfiniteCarousel";

const Trust = () => {

  return (
    <section className="bg-[#F7589FCC] w-[100%] h-40 flex gap-4 justify-center items-center flex-col">
      <h2
        className={`text-[#FFF] mx-[auto] text-[17px] font-[600] max-md:text-center px-[20px]`}
      >
        Nous collaborons avec plus de 25 universités et entreprises.
      </h2>
      <InfiniteCarousel />
    </section>
  );
};

export default Trust;
