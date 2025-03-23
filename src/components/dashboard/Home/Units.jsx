"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import unit1 from "../../../../public/Home/unit1.svg";
import unit2 from "../../../../public/Home/unit2.svg";
import unit3 from "../../../../public/Home/unit3.svg";
import unit4 from "../../../../public/Home/unit4.svg";
import unit5 from "../../../../public/Home/unit5.svg";
import unit6 from "../../../../public/Home/unit6.svg";
import unit7 from "../../../../public/Home/unit7.svg";
import unit8 from "../../../../public/Home/unit8.svg";
import unit9 from "../../../../public/Home/unit9.svg";
import play from "../../../../public/Home/play.svg";
import { motion, AnimatePresence } from "framer-motion";

const Units = () => {
  const [currentUnit, setCurrentUnit] = useState(0);

  const unitsData = [
    {
      title: "Unite 01: Cardio-respiratory and Medical Psychology",
      description:
        "Explore the cardiovascular and respiratory systems' relationship and the psychological aspects of medical care. This unit includes five modules: semiology, physiopathology, radiology, biochemistry, and medical psychology, providing a comprehensive understanding of their impact on patient health and treatment.",
      startColor: "#F43A5D",
      endColor: "#F8589F",
      image: unit1,
      imageWidth: 220,
      position: { right: "2px", bottom: "-40px" },
    },
    {
      title: "Unite 02: Neurology and Cognitive Function",
      description:
        "Explore the nervous system's structure and cognitive processes. This unit includes five modules: neuroanatomy, neurophysiology, cognitive assessment, neuroimaging, and neuropsychology, providing a comprehensive understanding of brain function and cognitive disorders.",
      startColor: "#B1BBB9",
      endColor: "#F8589F",
      image: unit2,
      imageWidth: 160,
      position: { right: "40px", bottom: "-20px" },
    },
    {
      title: "Unite 03: Digestive System and Nutrition",
      description:
        "Examine the digestive system and nutritional science. This unit includes five modules: gastrointestinal anatomy, digestive physiology, nutritional biochemistry, dietary assessment, and clinical nutrition, providing a comprehensive understanding of digestive health.",
      startColor: "#D0795B",
      endColor: "#F8589F",
      image: unit3,
      imageWidth: 90,
      position: { right: "60px", bottom: "-5px" },
    },
    {
      title: "Unite 04: Immunology and Infectious Disease",
      description:
        "Study immune function and infectious pathogens. This unit includes five modules: immunobiology, microbiology, infection control, immunodiagnostics, and immunotherapy, providing a comprehensive understanding of immune responses and infectious disease management.",
      startColor: "#8C5F5F",
      endColor: "#F8589F",
      image: unit4,
      imageWidth: 150,
      position: { right: "40px", bottom: "-15px" },
    },
    {
      title: "Unite 05: Endocrinology and Metabolism",
      description:
        "Investigate hormonal systems and metabolic processes. This unit includes five modules: endocrine physiology, hormone biochemistry, metabolic pathways, endocrine disorders, and therapeutic approaches, providing a comprehensive understanding of hormonal regulation.",
      startColor: "#5494C3",
      endColor: "#F8589F",
      image: unit5,
      imageWidth: 150,
      position: { right: "30px", bottom: "3px" },
    },
    {
      title: "Unite 06: Musculoskeletal System and Rehabilitation",
      description:
        "Learn about skeletal and muscular structures and rehabilitation techniques. This unit includes five modules: musculoskeletal anatomy, biomechanics, injury assessment, therapeutic exercise, and rehabilitation strategies, providing a comprehensive understanding of movement.",
      startColor: "#FEBF05",
      endColor: "#F8589F",
      image: unit6,
      imageWidth: 150,
      position: { right: "40px", bottom: "25px" },
    },
    {
      title: "Unite 07: Renal and Urinary Systems",
      description:
        "Discover kidney function and urinary tract processes. This unit includes five modules: renal anatomy, nephrology, fluid balance, urinalysis, and renal pharmacology, providing a comprehensive understanding of renal physiology and pathology.",
      startColor: "#821911",
      endColor: "#F8589F",
      image: unit7,
      imageWidth: 140,
      position: { right: "50px", bottom: "10px" },
    },
    {
      title: "Unite 08: Reproductive Health and Development",
      description:
        "Explore reproductive systems and human development. This unit includes five modules: reproductive anatomy, fertility science, embryology, prenatal development, and reproductive health, providing a comprehensive understanding of human reproduction.",
      startColor: "#1D864C",
      endColor: "#F8589F",
      image: unit8,
      imageWidth: 110,
      position: { right: "50px", bottom: "20px" },
    },
    {
      title: "Unite 09: Mental Health and Behavioral Medicine",
      description:
        "Understand psychiatric conditions and behavioral health. This unit includes five modules: psychopathology, therapeutic modalities, psychopharmacology, behavioral assessment, and clinical psychology, providing a comprehensive understanding of mental health care.",
      startColor: "#8F56D6",
      endColor: "#F8589F",
      image: unit9,
      imageWidth: 160,
      position: { right: "40px", bottom: "10px" },
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentUnit((prev) => (prev === unitsData.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentUnitData = unitsData[currentUnit];
  const gradientStyle = {
    background: `linear-gradient(to right, ${currentUnitData.startColor}, ${currentUnitData.endColor})`,
  };

  return (
    <div
      className="relative w-full h-[180px] p-6 py-4 rounded-[20px] overflow-hidden transition-all duration-500 max-md:px-4"
      style={gradientStyle}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentUnit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="max-md:text-center max-w-[90%] max-md:max-w-full"
        >
          <h2 className="text-[#FFFFFF] text-[18px] font-[500] mt-1">
            {currentUnitData.title}
          </h2>
          <p className="text-[13px] text-[#FFFFFF] mt-3 mb-8 font-[400] w-[80%]">
            {currentUnitData.description.slice(0, 200)}...
          </p>
          <div className="flex items-center gap-5 max-md:flex-col">
            <button className="flex items-center gap-2 text-[#FFFFFF] bg-[#191919] rounded-[20px] px-5 py-[6px] text-[13px] font-[500]">
              Start Unite <Image src={play} alt="play" />
            </button>
            <button className="text-[13px] text-[#FFFFFF] font-[500] leading-5 tracking-[0.14px] underline">
              Quick Exam Simulation
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center">
        <ul className="flex gap-2 items-center">
          {unitsData.map((_, index) => (
            <li
              key={index}
              className={`h-2 rounded-full bg-white cursor-pointer transition-all duration-300 ${
                currentUnit === index ? "w-6 opacity-100" : "w-2 opacity-50"
              }`}
              onClick={() => setCurrentUnit(index)}
            />
          ))}
        </ul>
      </div>

      <Image
        src={currentUnitData.image}
        alt={`Unit ${currentUnit + 1} icon`}
        className="absolute max-md:hidden transition-all duration-300"
        width={currentUnitData.imageWidth}
        height={currentUnitData.imageWidth}
        style={{
          width: `${currentUnitData.imageWidth}px`,
          right: currentUnitData.position.right,
          bottom: currentUnitData.position.bottom,
          position: "absolute",
        }}
      />
    </div>
  );
};

export default Units;