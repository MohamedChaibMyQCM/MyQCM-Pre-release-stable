"use client";

import Image from "next/image";
import Avatar from "../../../../public/Icons/Avatar.svg";
import { ListBullets, Stack } from "phosphor-react";
import { motion } from "framer-motion";

const Module = ({ data = {} }) => {
  const bannerSrc =
    typeof data.banner === "string" && data.banner.trim().length > 0
      ? data.banner
      : "/default-icon.svg";

  const mcqCount = data.mcq_count ?? { qcm: 0, qcs: 0, qroc: 0 };
  const description =
    typeof data.description === "string" && data.description.trim().length > 0
      ? data.description
      : "Ce module n'a pas encore de description detaillee.";

  // Premium animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      className="flex flex-col gap-4 px-[22px] py-[26px] rounded-[16px] bg-[#FFFFFF] basis-[56%] box"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover={{
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
        transition: { duration: 0.3 },
      }}
    >
      <motion.div variants={itemVariants}>
        <Image
          src={bannerSrc}
          width={400}
          height={200}
          alt="Illustration du module"
          className="w-full rounded-[16px] object-cover"
          onError={(event) => {
            event.currentTarget.src = "/default-icon.svg";
            event.currentTarget.srcset = "/default-icon.svg";
          }}
        />
      </motion.div>
      <motion.span
        className="text-[15px] text-[#F8589F] font-medium"
        variants={itemVariants}
      >
        Module
      </motion.span>
      <motion.span
        className="text-[20px] text-[#191919] font-semibold"
        variants={itemVariants}
      >
        {data.name ?? "Module inconnu"}
      </motion.span>
      <motion.div
        className="w-full bg-[#FFF5FA] flex items-center justify-center px-[22px] py-[14px] rounded-[16px] max-md:px-[12px]"
        variants={itemVariants}
        whileHover={{
          scale: 1.02,
          backgroundColor: "#FFE5F3",
          transition: { duration: 0.2 },
        }}
      >
        <div className="flex items-center gap-3 max-md:flex-col">
          <div className="bg-[#F8589F] w-[30px] h-[30px] flex items-center justify-center rounded-[16px]">
            <ListBullets size={18} className="text-[#FFFFFF]" />
          </div>
          <span className="text-[14px] font-[500] text-[#0C092A] max-md:text-[12px]">
            <span className="text-[#F8589F] pr-1">
              {mcqCount.qcm + mcqCount.qcs}
            </span>
            QCM + QCS
          </span>
        </div>
        <span className="w-[1.6px] mx-28 h-[34px] bg-[#CCCCCC80] rounded-full max-md:h-[60px] max-md:mx-12"></span>
        <div className="flex items-center gap-3 max-md:flex-col">
          <div className="bg-[#7996FD] w-[30px] h-[30px] flex items-center justify-center rounded-[16px]">
            <Stack size={18} className="text-[#FFFFFF]" />
          </div>
          <span className="font-[500] text-[14px] text-[#191919] max-md:text-[12px]">
            <span className="text-[#7996FD] pr-1">{mcqCount.qroc}</span> QROC
          </span>
        </div>
      </motion.div>
      <motion.div className="flex flex-col gap-2 my-2" variants={itemVariants}>
        <span className="font-Poppins font-medium text-[14px] text-[#F8589F]">
          DESCRIPTION
        </span>
        <p className="text-[13px] text-[#666666]">{description}</p>
      </motion.div>
      <motion.div
        className="flex items-center gap-3"
        variants={itemVariants}
        whileHover={{
          x: 5,
          transition: { duration: 0.2 },
        }}
      >
        <Image src={Avatar} alt="avatar" />
        <div className="flex flex-col gap-1">
          <span className="text-[#191919] font-semibold text-[14px]">
            Nait Si Mohand Mohammed Saadi
          </span>
          <span className="text-[#666666] text-[12px]">
            Createur du contenu medical de 3eme annee, top 6 en 3eme annee.
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Module;
