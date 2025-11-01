"use client";

import Image from "next/image";
import profile_arrow from "../../../../public/settings/profile_arrow.svg";
import gift from "../../../../public/settings/gift.svg";
import vector from "../../../../public/settings/Vector.svg";
import { X } from "lucide-react";
import { useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { useQuery } from "@tanstack/react-query";
import BaseUrl from "@/components/BaseUrl";
import Loading from "@/components/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const Reward = () => {
  const router = useRouter();
  const {
    data: xpData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["userXp"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get("/user/xp/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    },
  });

  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;
  if (isLoading) return <Loading />;
  if (isError) return null;

  return (
    <motion.div
      className="relative mx-5 mt-10 bg-[#FFFFFF] p-6 text-center rounded-[16px] overflow-hidden box max-md:mt-4"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <motion.h2
        className="text-[#191919] text-[20px] font-[500]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Vous avez <motion.span
          className="text-[#F8589F]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.4,
            type: "spring",
            stiffness: 200,
            damping: 10,
          }}
        >
          {xpData?.xp}
        </motion.span> XP
      </motion.h2>

      <motion.p
        className="my-4 text-[#191919] text-[14px] px-20 max-md:px-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Découvrez toutes les récompenses passionnantes que vous pouvez obtenir
        avec vos points ! Des réductions exclusives, des offres spéciales, des
        produits premium et bien plus encore. Vos points ouvrent les portes à un
        monde de possibilités. Explorez dès maintenant et profitez au maximum de
        vos récompenses !
      </motion.p>

      <motion.div
        className="relative inline-block"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
      >
        <motion.button
          className="bg-[#F8589F] text-[#FFFFFF] px-5 py-2 rounded-[16px] text-[13px] font-[500] hover:bg-[#e04d8a] transition-colors shadow-md"
          onClick={() => router.push('/dashboard/settings/rewards-center')}
          whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(248, 88, 159, 0.3)" }}
          whileTap={{ scale: 0.95 }}
        >
          Voir toutes les récompenses
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20, rotate: -10 }}
        animate={{ opacity: 1, x: 0, rotate: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          type: "spring",
          stiffness: 100,
        }}
      >
        <Image
          src={gift}
          alt="cadeau"
          className="absolute md:top-0 md:left-[24%] w-[90px] max-md:right-[-30px] max-md:top-[26%]"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <Image
          src={profile_arrow}
          alt="flèche profil"
          className="absolute bottom-0 right-0 max-md:hidden"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <Image
          src={vector}
          alt="vector"
          className="absolute left-0 md:top-[50%] translate-y-[-50%] max-md:bottom-[10px] max-md:translate-y-0"
        />
      </motion.div>
    </motion.div>
  );
};

export default Reward;