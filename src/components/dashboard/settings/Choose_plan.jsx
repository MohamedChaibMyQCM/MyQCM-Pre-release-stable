"use client";

import { useState } from "react";
import activation_card from "../../../../public/settings/activation_card.svg";
import dahabia from "../../../../public/settings/dahabia.svg";
import { useRouter } from "next/navigation";
import PlanCard from "./PlanCard";
import PaymentMethodCard from "./PaymentMethodCard";

const Choose_plan = () => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("basic");
  const [selectedDuration, setSelectedDuration] = useState("6 mois");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("dahabia");
  const [showPopup, setShowPopup] = useState(false);

  const plans = [
    {
      id: "basic",
      title: "Forfait Basique",
      price: "3000DZ/Mois",
      features: [
        { text: "Fonctionnalités de base", included: true },
        { text: "Tous les cours et tests inclus", included: true },
        { text: "Assistant IA", included: false },
        { text: "Tentatives de test illimitées", included: false },
      ],
      recommended: false,
    },
    {
      id: "ai",
      title: "Forfait IA",
      price: "4500DZ/Mois",
      features: [
        { text: "Fonctionnalités de base", included: true },
        { text: "Tous les cours et tests inclus", included: true },
        { text: "Assistant IA", included: true },
        { text: "Tentatives de test illimitées", included: true },
      ],
      recommended: true,
    },
  ];

  const paymentMethods = [
    {
      id: "dahabia",
      icon: dahabia,
      title: "El Dhahabia",
      description: "Payer avec El Dhahabia",
    },
    {
      id: "activation_card",
      icon: activation_card,
      title: "Carte d'activation",
      description: "Payer avec une carte d'activation",
    },
  ];

  const handlePaymentMethodSelect = (methodId) => {
    setSelectedPaymentMethod(methodId);
  };

  const handleNext = () => {
    if (selectedPaymentMethod === "activation_card") {
      router.push("/dashboard/settings/upgrade-account/activation-card");
    } else {
      setShowPopup(true);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const isActivationCardSelected = selectedPaymentMethod === "activation_card";

  return (
    <div>
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[16px] p-6 max-w-md w-full mx-4">
            <h3 className="text-[#191919] text-[20px] font-[500] mb-4">
              Bientôt disponible !
            </h3>
            <p className="text-[#4F4D55] text-[14px] mb-6">
              La fonctionnalité de paiement par El Dhahabia sera disponible dans
              la prochaine mise à jour. Veuillez vérifier ultérieurement ou
              utiliser l&apos;option Carte d&apos;activation pour le moment.
            </p>
            <div className="flex justify-end">
              <button
                onClick={closePopup}
                className="bg-[#F8589F] text-[#FFFFFF] px-[20px] py-[6px] rounded-[20px] text-[14px] font-[500] hover:bg-[#FD2E8A] transition-all"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mt-8">
        <h3 className="text-[#191919] text-[17px] font-[500]">
          Choisissez un moyen de paiement
        </h3>
        <div className="flex items-center mt-4 gap-6 max-md:flex-col">
          {paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              isSelected={selectedPaymentMethod === method.id}
              onClick={() => handlePaymentMethodSelect(method.id)}
            />
          ))}
        </div>
      </div>
      <div
        className={`mt-8 transition-opacity duration-300 ${
          isActivationCardSelected
            ? "opacity-50 pointer-events-none"
            : "opacity-100"
        }`}
      >
        <h3 className="text-[#191919] text-[17px] font-[500]">
          Choisissez votre offre
        </h3>
        <div className="flex items-center my-4 gap-6 max-md:flex-col">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan === plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              isDisabled={isActivationCardSelected}
            />
          ))}
        </div>
        <span className="text-[#B5BEC6] text-[13px]">
          Votre nouveau forfait commencera{" "}
          {/* <span className="text-[#F8589F]">2 février</span>, */}
          juste après la fin de votre forfait actuel. Préparez-vous pour une
          expérience améliorée !
        </span>
      </div>
      <div
        className={`mt-8 transition-opacity duration-300 ${
          isActivationCardSelected
            ? "opacity-50 pointer-events-none"
            : "opacity-100"
        }`}
      >
        <h3 className="text-[#191919] text-[17px] font-[500]">Durée</h3>
        <div className="flex items-center gap-4 mt-3">
          {["6 mois", "1 an"].map((duration) => (
            <button
              key={duration}
              className={`box transition-colors ${
                selectedDuration === duration
                  ? "bg-[#FFF5FA] text-[#F8589F] border border-[#F8589F]"
                  : "bg-white text-[#191919] border border-transparent hover:border-gray-300"
              } px-4 py-1 text-[14px] rounded-[16px]`}
              onClick={() => setSelectedDuration(duration)}
              disabled={isActivationCardSelected}
            >
              {duration}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end mt-8">
        <button
          onClick={handleNext}
          className="bg-[#F8589F] text-[#FFFFFF] px-[30px] py-[6px] rounded-[20px] text-[14px] font-[500] hover:bg-[#FD2E8A] transition-all"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default Choose_plan;
