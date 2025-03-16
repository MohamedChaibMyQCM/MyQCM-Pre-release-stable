"use client";

import Image from "next/image";
import rigth_arrow from "../../../../public/Home/rigth_arrow.svg";
import left_arrow from "../../../../public/Home/left_arrow.svg";
import play from "../../../../public/Home/pink_play.svg";
import module1 from "../../../../public/Home/module1.svg";
import module2 from "../../../../public/Home/module2.svg";
import module3 from "../../../../public/Home/module3.svg";
import module4 from "../../../../public/Home/module4.svg";
import { useState, useRef, useEffect } from "react";

const Modules = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);
  const carouselRef = useRef(null);
  const containerRef = useRef(null);

  const ITEM_WIDTH = 240; // Card width in pixels
  const GAP = 16; // Gap between cards in pixels

  const modulesData = [
    {
      id: 1,
      image: module1,
      title: "Semiology",
      unit: "Unite : Cardio",
      progress: 56,
      views: "+100 vues",
    },
    {
      id: 2,
      image: module2,
      title: "Pharmacology",
      unit: "Unite : Neuro",
      progress: 75,
      views: "+150 vues",
    },
    {
      id: 3,
      image: module3,
      title: "Anatomy",
      unit: "Unite : Musculo",
      progress: 40,
      views: "+80 vues",
    },
    {
      id: 4,
      image: module4,
      title: "Physiology",
      unit: "Unite : Respiratory",
      progress: 90,
      views: "+200 vues",
    },
    {
      id: 5,
      image: module4,
      title: "Physiology",
      unit: "Unite : Respiratory",
      progress: 90,
      views: "+200 vues",
    },
  ];

  // Calculate items per view based on container width
  const updateItemsPerView = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const totalItemWidth = ITEM_WIDTH + GAP;
      const calculatedItems = Math.floor(containerWidth / totalItemWidth);
      // Ensure at least 1 item and not more than total items
      const newItemsPerView = Math.max(
        1,
        Math.min(calculatedItems, modulesData.length)
      );
      setItemsPerView(newItemsPerView);
    }
  };

  // Handle resize and initial calculation
  useEffect(() => {
    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, [modulesData.length]);

  const nextSlide = () => {
    if (currentIndex < modulesData.length - itemsPerView) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="mt-8" ref={containerRef}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-[500] text-[17px] text-[#191919]">
          Continue Learning
        </h3>
        <div className="flex items-center gap-3">
          <Image
            src={left_arrow}
            alt="arrow"
            className={`cursor-pointer ${
              currentIndex === 0 ? "opacity-50" : ""
            }`}
            onClick={prevSlide}
          />
          <Image
            src={rigth_arrow}
            alt="arrow"
            className={`cursor-pointer ${
              currentIndex >= modulesData.length - itemsPerView
                ? "opacity-50"
                : ""
            }`}
            onClick={nextSlide}
          />
        </div>
      </div>
      <div className="overflow-hidden">
        <ul
          ref={carouselRef}
          className="flex gap-4 transition-transform duration-500 ease-in-out pb-4"
          style={{
            transform: `translateX(-${currentIndex * (ITEM_WIDTH + GAP)}px)`,
          }}
        >
          {modulesData.map((module) => (
            <li
              key={module.id}
              className="p-4 bg-[#FFFFFF] rounded-[16px] w-[240px] box flex-shrink-0" 
            >
              <Image src={module.image} alt="vector" />
              <span className="text-[#FD2E8A] text-[13px] my-3 font-[500] block bg-[#FFF5FA] rounded-[8px] px-2 py-1 w-fit">
                {module.title}
              </span>
              <div className="my-3">
                <span className="text-[13px] text-[11142D] font-[500]">
                  {module.unit}
                </span>
                <div className="relative flex items-center w-[100%] justify-between mt-[2px]">
                  <div className="w-[80%] h-[8px] bg-[#F5F5F5] rounded-[20px] relative">
                    <div
                      className="absolute h-[8px] bg-[#FD2E8A] rounded-[20px]"
                      style={{ width: `${module.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-[13px] font-[500]">
                    {module.progress}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#F8589F] font-[500]">
                  {module.views}
                </span>
                <Image
                  src={play}
                  alt="play"
                  className="w-[20px] cursor-pointer"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Modules;
