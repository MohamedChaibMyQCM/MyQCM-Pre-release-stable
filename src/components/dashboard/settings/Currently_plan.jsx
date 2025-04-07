"use client";

import Image from "next/image";
import card from "../../../../public/settings/card.svg";
import { useQuery } from "@tanstack/react-query";
import BaseUrl from "@/components/BaseUrl";
import toast from "react-hot-toast";
import secureLocalStorage from "react-secure-storage";

const Currently_plan = () => {
  const {
    data: subscriptionData,
    isLoading,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ["currentSubscription"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get("/user/subscription/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data || null;
    },
    onError: () => {
      toast.error(
        "Erreur lors de la récupération des données d'abonnement. Veuillez réessayer."
      );
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return "";
    switch (day % 10) {
      case 1:
        return "er";
      case 2:
        return "";
      case 3:
        return "";
      default:
        return "";
    }
  };

  const formatReadableDateWithOrdinal = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleDateString("fr-FR", { month: "long" });
      const ordinalSuffix = getOrdinalSuffix(day);
      return `${day}${ordinalSuffix} ${month}`;
    } catch (e) {
      console.error("Erreur de formatage de la date:", dateString, e);
      return null;
    }
  };

  const planName = subscriptionData?.plan?.name;
  const endDateFormatted = formatReadableDateWithOrdinal(
    subscriptionData?.end_date
  );

  return (
    <div className="relative px-6 py-5 rounded-[24px] bg-gradient-to-r from-[#FD2E8A] to-[#F8589F] flex justify-between items-center">
      <div>
        <h2 className="text-[#FFFFFF] text-[20px] capitalize">
          Vous êtes actuellement <br className="md:hidden" /> sur le{" "}
          {isLoading
            ? "chargement..."
            : error
            ? "N/A"
            : isSuccess && planName
            ? `forfait ${planName}`
            : "aucun forfait actif"}
        </h2>
        <p className="text-[#FFFFFF] text-[13px] font-[400] mt-2 mb-6">
          Débloquez tout le potentiel de votre expérience en passant à un
          forfait supérieur dès aujourd'hui. Accédez à des fonctionnalités
          premium, <br className="max-md:hidden" /> des performances améliorées
          et des avantages exclusifs conçus pour enrichir votre parcours.
        </p>
        <span className="bg-[#FFFFFF] text-[#F8589F] px-[20px] py-[4px] rounded-[16px] text-[13px] font-[500]">
          {isLoading
            ? "chargement..."
            : error
            ? "Date N/A"
            : isSuccess && endDateFormatted
            ? `Se termine le ${endDateFormatted}`
            : "N/A"}
        </span>
      </div>
      <Image
        src={card}
        alt="carte"
        className="absolute right-6 top-[-8px] w-[240px] max-md:w-[130px] max-md:right-4"
        priority
      />
    </div>
  );
};

export default Currently_plan;
