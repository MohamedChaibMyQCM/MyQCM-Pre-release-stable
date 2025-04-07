"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import BaseUrl from "@/components/BaseUrl";
import toast from "react-hot-toast";
import secureLocalStorage from "react-secure-storage";

const ActivationCardPage = () => {
  const [code, setCode] = useState("");

  const { mutate: activateCard, isLoading } = useMutation({
    mutationFn: async (activationCode) => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.post(
        "/activation-card/consume",
        {
          code: activationCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(
        data?.message ||
          "Activation réussie ! Les fonctionnalités premium sont désormais disponibles."
      );
    },
    onError: (error) => {
      console.error("Erreur d’activation :", error);
      const errorMessage =
        error.response?.data?.message ||
        "Échec de l’activation de la carte. Veuillez vérifier le code et réessayer.";
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      toast.error("Veuillez entrer un code d’activation");
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

  return (
    <div className="px-4 py-8 space-y-8">
      <div className="flex flex-col bg-white rounded-[16px] p-6 box">
        <h3 className="text-[18px] font-semibold text-[#191919] mb-1">
          Code de la carte d'activation
        </h3>
        <p className="text-[#666666] mb-6 text-[13px]">
          Entrez votre code d'activation pour débloquer les fonctionnalités
          premium. Assurez-vous que le code est valide et non utilisé. En cas de
          problème, contactez le support.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
          <div>
            <label
              htmlFor="activationCode"
              className="block text-[15px] text-[#FD2E8A] mb-[6px]"
            >
              Code de la carte d'activation
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
            {isLoading ? "Vérification..." : "Vérifier"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-[16px] p-6 box">
        <h3 className="text-[18px] font-semibold text-[#191919] mb-1">
          Achat de cartes d'activation
        </h3>
        <p className="text-[#666666] mb-6 text-[13px]">
          Vous n'avez pas encore de carte d'activation ? Vous pouvez acheter des
          cartes premium auprès de l'un de nos partenaires agréés MyQCM
          Copyfacs.
        </p>

        <span className="text-[#F8589F]">
          CopyFac : Student Service Copymed Pavillon 29
        </span>
      </div>
    </div>
  );
};

export default ActivationCardPage;
