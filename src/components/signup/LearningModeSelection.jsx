"use client";

import Image from "next/image";
import bestFor from "../../../public/auth/bestFor.svg";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "phosphor-react";
import { useEffect, useState } from "react";
import BaseUrl from "@/components/BaseUrl";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import secureLocalStorage from "react-secure-storage";

const LearningModeStep = ({
  selectedMode,
  onModeChange,
  onSubmit,
  onReturn,
}) => {
  const {
    data: modes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["learningModes"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get("/mode", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data.data;
    },
    onError: (error) => {
      toast.error("Échec du chargement des modes d'apprentissage");
    },
  });

  const handleSubmit = () => {
    if (!selectedMode) {
      toast.error("Veuillez sélectionner un mode d'apprentissage");
      return;
    }
    onSubmit();
  };

  if (isLoading) {
    return (
      <div className="w-[100%] px-[40px] max-md:px-[20px] mt-8">
        <div className="flex justify-center items-center h-64">
          <p>Chargement des modes d'apprentissage...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-[100%] px-[40px] max-md:px-[20px] mt-8">
        <div className="flex justify-center items-center h-64">
          <p>
            Erreur lors du chargement des modes d'apprentissage. Veuillez
            réessayer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[100%] px-[40px] max-md:px-[20px] mt-8">
      <h2 className="text-[19px] font-[500] text-[#191919] mb-2">
        Choisissez le mode d'apprentissage souhaité
      </h2>
      <p className="text-[#666666] mb-12 text-[13px]">
        Les modes d'apprentissage vous aident à étudier plus intelligemment en
        adaptant vos sessions à vos objectifs, besoins et préférences
        individuels. Que vous prépariez vos examens, révisiez des modules
        difficiles ou pratiquiez des scénarios cliniques, MyQCM propose trois
        modes d'apprentissage distincts, chacun spécialement conçu pour les
        étudiants en médecine.
      </p>

      <div className="mt-12 rounded-[16px] relative">
        <div className="flex gap-6 flex-wrap">
          {modes?.map((mode) => (
            <div
              key={mode.id}
              className={`flex p-4 rounded-[8px] w-full md:w-[calc(33.33%-16px)] border relative overflow-hidden ${
                selectedMode === mode.id
                  ? "bg-[#FFF5FA] border-[#F8589F]"
                  : "border-[#E4E4E4] bg-white"
              }`}
            >
              <div className="flex flex-col w-full">
                <div className="flex gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => onModeChange(mode.id)}
                    className={`w-5 h-5 rounded-full mt-1 border-2 border-[#FF6EAF] cursor-pointer transition-colors ${
                      selectedMode === mode.id
                        ? "bg-[#FD2E8A] border-[#FD2E8A]"
                        : "bg-transparent"
                    }`}
                  />
                  <Label
                    htmlFor={mode.id}
                    className="text-[#191919] font-[500] text-[15px]"
                  >
                    {mode.name} <br />
                    <span className="text-[#FD2E8A]">{mode.subtitle}</span>
                  </Label>
                </div>
                <ul className="ml-8 flex flex-col gap-3 mb-5 mt-2">
                  {[1, 2, 3].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-[#191919] text-[14px]"
                    >
                      <CheckCircle size={18} className="text-[#47B881]" />
                      Apprentissage personnalisé par IA
                    </li>
                  ))}
                </ul>
                <div className="ml-8">
                  <span className="text-[#FD2E8A] font-[500] text-[16px]">
                    Idéal pour{" "}
                  </span>
                  <ul className="flex flex-col gap-4 mt-3">
                    {[1, 2, 3].map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-[9px] text-[#191919] text-[14px]"
                      >
                        <Image
                          src={bestFor}
                          alt="bestFor"
                          className="w-[18px]"
                        />
                        Préparation aux examens
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-10 mt-12 relative z-0">
        <button
          onClick={onReturn}
          className="text-[#F8589F] rounded-[10px] py-[8px] px-[50px] text-[15px] font-medium hover:bg-[#FFF5FA] transition-colors"
        >
          Retour
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedMode}
          className={`bg-gradient-to-t from-[#FD2E8A] to-[#F8589F] rounded-[10px] text-[#FFFFFF] py-[8px] px-[50px] text-[15px] font-medium ${
            !selectedMode ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
          }`}
        >
          Terminer
        </button>
      </div>
    </div>
  );
};

export default LearningModeStep;
