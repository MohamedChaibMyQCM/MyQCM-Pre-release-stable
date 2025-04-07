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

const Reward = () => {
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
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;
  if (isLoading) return <Loading />;
  if (isError) return null;

  return (
    <div className="relative mx-5 mt-12 bg-[#FFFFFF] p-6 text-center rounded-[16px] overflow-hidden box max-md:mt-4">
      <h2 className="text-[#191919] text-[20px] font-[500]">
        Vous avez <span className="text-[#F8589F]">{xpData?.xp}</span> XP
      </h2>
      <p className="my-4 text-[#191919] text-[14px] px-20 max-md:px-0">
        Découvrez toutes les récompenses passionnantes que vous pouvez obtenir
        avec vos points ! Des réductions exclusives, des offres spéciales, des
        produits premium et bien plus encore. Vos points ouvrent les portes à un
        monde de possibilités. Explorez dès maintenant et profitez au maximum de
        vos récompenses !
      </p>

      <div className="relative inline-block">
        <button
          className="bg-[#F8589F] text-[#FFFFFF] px-5 py-2 rounded-[16px] text-[13px] font-[500] hover:bg-[#e04d8a] transition-colors"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          Voir toutes les récompenses
        </button>

        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#333] text-white text-xs rounded-md whitespace-nowrap shadow-lg z-10">
            <div className="relative">
              <span>
                Fonctionnalité à venir dans une prochaine mise à jour !
              </span>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#333]"></div>
            </div>
          </div>
        )}
      </div>

      <Image
        src={gift}
        alt="cadeau"
        className="absolute md:top-0 md:left-[24%] w-[90px] max-md:right-[-30px] max-md:top-[26%]"
      />
      <Image
        src={profile_arrow}
        alt="flèche profil"
        className="absolute bottom-0 right-0 max-md:hidden"
      />
      <Image
        src={vector}
        alt="vector"
        className="absolute left-0 md:top-[50%] translate-y-[-50%] max-md:bottom-[10px] max-md:translate-y-0"
      />
    </div>
  );
};

export default Reward;
