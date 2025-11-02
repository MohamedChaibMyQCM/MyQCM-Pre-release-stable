"use client";

import { exams } from "@/data/data";
import { motion } from "framer-motion";
// import Image from "next/image";
// import options from "../../../../public/Icons/options.svg";
// import unit from "../../../../public/Question_Bank/unit.svg";
// import year from "../../../../public/Question_Bank/year.svg";

const Exams = () => {
  // Premium animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const bannerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.3,
        duration: 0.5,
        type: "spring",
        stiffness: 150,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      className="mx-[28px] py-[20px] rounded-[16px]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-[#191919] font-[500] text-[18px] max-md:text-[16px]">
          Anciens examens
        </h3>
        {/* <div className="flex items-center gap-4">
          <div className="flex items-center bg-[#FFFFFF] gap-2 px-4 py-[6px] rounded-[16px] box">
            <button className="text-[14px] font-[500]">Unité</button>
            <Image src={unit} alt="unité" className="w-[13px]" />
          </div>
          <div className="flex items-center bg-[#FFFFFF] gap-2 px-4 py-[6px] rounded-[16px] box">
            <button className="text-[14px] font-[500]">Année</button>
            <Image src={year} alt="année" className="w-[13px]" />
          </div>
        </div> */}
      </div>

      <div className="relative">
        <motion.div
          className="absolute inset-0 bg-white bg-opacity-30 z-10 rounded-[16px] flex items-center justify-center"
          variants={bannerVariants}
        >
          <motion.div
            className="bg-white px-6 py-3 rounded-full shadow-md border-[2px] border-[#F8589F] max-md:w-[90%] max-md:px-4"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 15px 30px rgba(248, 88, 159, 0.2)",
              transition: { duration: 0.2 },
            }}
          >
            <span className="text-[#F8589F] font-medium text-[18px] max-md:text-[15px] block text-center">
              À venir dans la prochaine mise à jour
            </span>
          </motion.div>
        </motion.div>
        <div className="rounded-[16px] box">
          <motion.ul
            className="grid grid-cols-4 gap-5 bg-[#FFF] p-5 rounded-[16px] max-w-full opacity-30 max-xl:grid-cols-3 max-md:grid-cols-1"
            variants={containerVariants}
          >
            {exams.map((item, index) => {
              return (
                <motion.li
                  key={index}
                  className="flex flex-col border border-[#E4E4E4] rounded-[16px] p-[20px] cursor-not-allowed"
                  variants={cardVariants}
                >
                  <span className="text-[#191919] font-semibold font-Poppins text-[15px] mb-3">
                    {item.exam}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-[#F8589F] text-[14px] font-[600] bg-[#FFF5FA] py-[4px] px-2 rounded-[6px]">
                      QCM • {item.question} Questions
                    </span>
                    <span className="text-[#F8589F] text-[13px] font-[500] font-Poppins">
                      2023/2024
                    </span>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      </div>
    </motion.div>
  );
};

export default Exams;
