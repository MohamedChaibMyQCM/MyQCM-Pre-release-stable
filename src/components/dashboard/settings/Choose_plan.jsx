"use client";

import { useState } from "react";
import activation_card from "../../../../public/settings/activation_card.svg"; // Verify path
import dahabia from "../../../../public/settings/dahabia.svg"; // Verify path
import { useRouter } from "next/navigation";
import PlanCard from "./PlanCard"; // Assuming this component exists
import PaymentMethodCard from "./PaymentMethodCard"; // Assuming this component exists

const Choose_plan = () => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("basic"); // Default to Basic plan
  const [selectedDuration, setSelectedDuration] = useState("6 mois"); // Keep 6 mois as default duration
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("dahabia");
  const [showPopup, setShowPopup] = useState(false);

  // --- Updated Plans ---
  const plans = [
    {
      id: "free", // Added Free plan
      title: "Forfait Gratuit",
      price: "Gratuit",
      features: [
        { text: "Accès limité aux cours", included: true },
        { text: "Tests limités", included: true },
        { text: "Assistant IA", included: false },
        { text: "Tentatives de test limitées", included: false },
      ],
      recommended: false,
    },
    {
      id: "basic", // Kept original Basic ID, potentially updated features
      title: "Forfait Basique",
      price: "3000 DZ/Mois",
      features: [
        { text: "Accès à tous les cours", included: true },
        { text: "Tous les tests inclus", included: true },
        { text: "Assistant IA", included: false },
        { text: "Tentatives de test limitées", included: false }, // Changed from unlimited maybe
      ],
      recommended: false, // Basic is usually not the recommended one
    },
    {
      id: "premium", // Changed ID from 'ai', this is the top tier
      title: "Forfait Premium",
      price: "4500 DZ/Mois",
      features: [
        { text: "Accès illimité (Cours/Tests)", included: true },
        { text: "Statistiques détaillées", included: true }, // Added example feature
        { text: "Assistant IA avancé", included: true }, // Clarified feature maybe
        { text: "Tentatives de test illimitées", included: true },
      ],
      recommended: true, // Premium is recommended
    },
  ];

  // --- Payment Methods (Unchanged) ---
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

  // --- Handlers (Unchanged, but note logic based on 'activation_card') ---
  const handlePaymentMethodSelect = (methodId) => {
    setSelectedPaymentMethod(methodId);
    // Reset plan/duration if switching TO activation card, as they are disabled
    if (methodId === "activation_card") {
      setSelectedPlan("free"); // Or some default that makes sense
      setSelectedDuration("N/A"); // Duration not applicable maybe?
    } else if (selectedPlan === "free" && methodId !== "activation_card") {
      // If switching away from activation card and free was selected, maybe default back to basic?
      setSelectedPlan("basic");
      setSelectedDuration("6 mois");
    }
  };

  const handleNext = () => {
    // Ensure a valid plan is selected if not using activation card
    if (
      selectedPaymentMethod !== "activation_card" &&
      selectedPlan === "free"
    ) {
      toast.error(
        "Veuillez sélectionner un forfait payant (Basique ou Premium) pour continuer avec ce mode de paiement."
      );
      return;
    }

    if (selectedPaymentMethod === "activation_card") {
      router.push("/dashboard/settings/upgrade-account/activation-card");
    } else {
      setShowPopup(true); // Show 'Coming Soon' for Dahabia
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  // --- State calculation (Unchanged) ---
  const isActivationCardSelected = selectedPaymentMethod === "activation_card";
  // Determine if plan/duration selection should be disabled
  const disablePlanSelection = isActivationCardSelected; // || selectedPlan === 'free'; // Should Free plan also disable duration? Maybe not.
  const disableDurationSelection =
    isActivationCardSelected || selectedPlan === "free"; // Free plan usually has no duration choice

  return (
    <div>
      {/* Popup for Dahabia (Unchanged) */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[16px] p-6 max-w-md w-full mx-auto shadow-lg">
            <h3 className="text-[#191919] text-lg md:text-xl font-medium mb-4">
              Paiement Bientôt Disponible !
            </h3>
            <p className="text-[#4F4D55] text-sm md:text-[14px] mb-6">
              La fonctionnalité de paiement par El Dhahabia arrive très
              prochainement. En attendant, vous pouvez utiliser l&apos;option
              Carte d&apos;activation si vous en possédez une.
            </p>
            <div className="flex justify-end">
              <button
                onClick={closePopup}
                className="bg-[#F8589F] text-[#FFFFFF] px-5 py-1.5 rounded-full text-sm font-medium hover:bg-[#FD2E8A] transition-colors duration-200"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Section (Unchanged Structure) */}
      <div className="mt-8">
        <h3 className="text-[#191919] text-[17px] font-[500]">
          1. Choisissez un moyen de paiement
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4 md:gap-6">
          {" "}
          {/* Use grid for better spacing */}
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

      {/* Plan Selection Section */}
      {/* --- Conditionally disabled based on payment method --- */}
      <div
        className={`mt-8 transition-opacity duration-300 ${
          disablePlanSelection
            ? "opacity-50 pointer-events-none"
            : "opacity-100"
        }`}
      >
        <h3 className="text-[#191919] text-[17px] font-[500]">
          {disablePlanSelection
            ? "Forfait (Activé par Carte)"
            : "2. Choisissez votre offre"}{" "}
          {/* Dynamic title */}
        </h3>
        {/* Use Grid for Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 my-4 gap-4 md:gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan === plan.id}
              onClick={() => !disablePlanSelection && setSelectedPlan(plan.id)} // Prevent click if disabled
              isDisabled={disablePlanSelection} // Pass disabled state to card visually
            />
          ))}
        </div>
        {/* Informational text (conditionally shown/relevant) */}
        {!disablePlanSelection && (
          <span className="text-[#B5BEC6] text-[13px] block">
            Votre nouveau forfait payant commencera immédiatement ou après la
            fin de votre période actuelle si applicable.
          </span>
        )}
      </div>

      {/* Duration Selection Section */}
      {/* --- Conditionally disabled based on payment method AND plan --- */}
      <div
        className={`mt-8 transition-opacity duration-300 ${
          disableDurationSelection
            ? "opacity-50 pointer-events-none"
            : "opacity-100"
        }`}
      >
        <h3 className="text-[#191919] text-[17px] font-[500]">
          {disableDurationSelection
            ? "Durée (Non Applicable)"
            : "3. Choisissez la durée"}{" "}
          {/* Dynamic title */}
        </h3>
        <div className="flex items-center flex-wrap gap-4 mt-3">
          {" "}
          {/* Added flex-wrap */}
          {/* --- Added "3 mois" --- */}
          {["3 mois", "6 mois", "1 an"].map((duration) => (
            <button
              key={duration}
              className={`box transition-colors duration-200 ease-in-out ${
                selectedDuration === duration
                  ? "bg-[#FFF5FA] text-[#F8589F] border border-[#F8589F]"
                  : "bg-white text-[#191919] border border-gray-300 hover:border-gray-400"
              } px-4 py-1.5 text-[14px] rounded-[12px]`} // Adjusted styles slightly
              onClick={() =>
                !disableDurationSelection && setSelectedDuration(duration)
              }
              disabled={disableDurationSelection} // Disable button directly
            >
              {duration}
            </button>
          ))}
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end mt-10">
        <button
          onClick={handleNext}
          // Disable button if Dahabia is chosen but the plan is Free
          disabled={
            selectedPaymentMethod === "dahabia" && selectedPlan === "free"
          }
          className="bg-[#F8589F] text-[#FFFFFF] px-8 py-2 rounded-full text-sm md:text-[14px] font-medium hover:bg-[#FD2E8A] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" // Added disabled style
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default Choose_plan;
