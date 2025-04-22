"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import BaseUrl from "@/components/BaseUrl";
import toast from "react-hot-toast";
import secureLocalStorage from "react-secure-storage";
import ActivationSuccessPopup from "@/components/dashboard/settings/ActivationSuccessPopup";
import { AnimatePresence } from "framer-motion";
import { CircleNotch as Spinner } from "phosphor-react";

const ActivationCardPage = () => {
  const [code, setCode] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [activatedPlanDetails, setActivatedPlanDetails] = useState(null);

  const { mutate: activateCard, isLoading } = useMutation({
    mutationFn: async (activationCode) => {
      const token = secureLocalStorage.getItem("token");
      if (!token) {
        toast.error("Authentification requise.");
      }
      const response = await BaseUrl.post(
        "/activation-card/consume",
        { code: activationCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response);
      return response.data;
    },
    onSuccess: (data) => {
      console.log(data);
      const planDetails = {
        name: data?.data?.plan?.name || "Plan Premium",
        duration: data?.data?.plan?.duration_label || "Inconnue",
        expiryDate: data?.data?.plan?.ends_at || null,
      };
      setActivatedPlanDetails(planDetails);
      setShowSuccessPopup(true);
      setCode("");
    },
    onError: (error) => {
      console.error("Erreur d’activation :", error);
      const errorMessage =
        error.response?.data?.message ||
        "Échec de l'activation. Vérifiez le code ou réessayez.";
      toast.error(errorMessage);
      setShowSuccessPopup(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      toast.error("Veuillez entrer un code d'activation");
      return;
    }
    if (trimmedCode.length !== 29) {
      toast.error(
        "Format de code invalide. Veuillez entrer le code complet de 24 caractères."
      );
      return;
    }

    console.log("Soumission du code formaté :", trimmedCode);
    activateCard(trimmedCode);
  };

  const handleCodeChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    value = value.substring(0, 24);
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.substring(i, i + 4));
    }
    const formattedValue = parts.join("-").substring(0, 29);
    setCode(formattedValue);
  };

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
    setActivatedPlanDetails(null);
  };

  return (
    <>
      <div className="px-4 py-8 space-y-8 h-[100%]">
        <div className="flex flex-col bg-white rounded-[16px] p-6 box">
          <h3 className="text-[18px] font-semibold text-[#191919] mb-1">
            Code de la carte d&apos;activation
          </h3>
          <p className="text-[#666666] mb-6 text-[13px]">
            Entrez votre code d&apos;activation pour débloquer les
            fonctionnalités premium. Assurez-vous que le code est valide et non
            utilisé. En cas de problème, contactez le support.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
            <div>
              <label
                htmlFor="activationCode"
                className="block text-[15px] text-[#FD2E8A] mb-[6px]"
              >
                Code de la carte d&apos;activation
              </label>
              <input
                id="activationCode"
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="_ _ _ _        _ _ _ _        _ _ _ _        _ _ _ _        _ _ _ _"
                className="w-full max-w-[490px] px-4 sm:px-6 py-2 border-[2px] border-[#FD2E8A] placeholder:text-[#FD2E8A] text-[#FD2E8A] rounded-[10px] outline-none uppercase"
                maxLength={29}
                autoComplete="off"
                spellCheck="false"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 29}
              className={`self-start sm:self-end w-full sm:w-fit py-2 px-6 bg-[#F8589F] text-white font-medium rounded-[24px] transition-colors text-[13px] ${
                isLoading || code.length !== 29
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-[#e7488f]"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Spinner size={16} className="animate-spin mr-1.5" />{" "}
                  Vérification...
                </span>
              ) : (
                "Vérifier"
              )}{" "}
            </button>
          </form>
        </div>
        <div className="bg-white rounded-[16px] p-6 box">
          <h3 className="text-[18px] font-semibold text-[#191919] mb-1">
            Achat de cartes d&apos;activation
          </h3>
          <p className="text-[#666666] mb-6 text-[13px]">
            Vous n&apos;avez pas encore de carte d&apos;activation ? Vous pouvez
            acheter des cartes premium auprès de l&apos;un de nos partenaires
            agréés MyQCM Copyfacs.
          </p>
          <span className="text-[#F8589F]">
            CopyFac : Student Service Copymed Pavillon 29
          </span>
        </div>
      </div>{" "}
      <AnimatePresence>
        {showSuccessPopup && (
          <ActivationSuccessPopup
            isOpen={showSuccessPopup}
            onClose={closeSuccessPopup}
            planDetails={activatedPlanDetails}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ActivationCardPage;
