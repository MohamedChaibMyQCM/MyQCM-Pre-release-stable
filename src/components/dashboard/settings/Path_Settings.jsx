"use client";

import Image from "next/image";
import path from "../../../../public/settings/path.svg";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const Path_Settings = ({
  modes,
  selectedMode,
  onModeChange,
  isLoading,
  hasPremiumPlan,
  premiumTooltip,
}) => {
  const [hoveredMode, setHoveredMode] = useState(null);

  const learningModes = [
    {
      id: "1afb7737-c9c2-4411-9e61-5ceb02ce5e47",
      title: "Mode Intelligent",
      subtitle: "Propulsé par Synergy",
      description:
        "En Mode Intelligent, Synergy - notre moteur d'apprentissage avancé - personnalise votre expérience. C'est comme avoir un tuteur dédié qui comprend vos forces, vos faiblesses et votre style d'apprentissage. Synergy s'adapte en temps réel, se concentrant sur ce que vous devez maîtriser, rendant chaque session d'étude incroyablement efficace. C'est le moyen le plus rapide pour gagner en confiance et atteindre une véritable compréhension.",
      requiresPremium: true,
    },
    {
      id: "9fcd084a-a8a6-4004-ba9a-c8d1243d1d69",
      title: "Mode Guidé",
      subtitle: "Votre Focus, Notre IA",
      description:
        "En Mode Guidé, vous contrôlez la direction, tout en bénéficiant de la sélection intelligente des questions de Synergy. Parfait pour lorsque vous souhaitez vous concentrer sur des domaines spécifiques, comme la préparation à un examen à venir ou le renforcement de vos connaissances sur un module particulier. Nous vous aiderons à maximiser chaque minute.",
      requiresPremium: false,
    },
    {
      id: "6ecb99f5-6687-47f8-a218-b30fbc5d85ee",
      title: "Mode Personnalisé",
      subtitle: "Créez Votre Défi",
      description:
        "Le Mode Personnalisé est votre terrain de jeu pour un entraînement ciblé. Parfait pour simuler des conditions d'examen, tester vos connaissances sur des sujets spécifiques ou vous défier avec exactement les questions que vous souhaitez.",
      requiresPremium: false,
    },
  ];

  // Map the API modes to our predefined modes
  const getModeType = (modeId) => {
    if (!modeId) return null;

    // First check if the modeId matches any of our predefined learningModes
    const predefinedMode = learningModes.find((mode) => mode.id === modeId);
    if (predefinedMode) return modeId;

    // If not found in predefined modes, check the API modes
    const mode = modes?.find((m) => m.id === modeId);
    if (!mode) return null;

    if (mode.name.includes("Intelligent"))
      return "1afb7737-c9c2-4411-9e61-5ceb02ce5e47";
    if (mode.name.includes("Guidé"))
      return "9fcd084a-a8a6-4004-ba9a-c8d1243d1d69";
    if (mode.name.includes("Personnalisé") || mode.name.includes("Custom"))
      return "6ecb99f5-6687-47f8-a218-b30fbc5d85ee";

    return null;
  };

  const displayedSelectedModeId = getModeType(selectedMode);

  if (isLoading) {
    return (
      <div className="mt-4 rounded-[16px]">
        <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
          Choisissez votre parcours vers la maîtrise
        </h3>
        <div className="bg-[#FFFFFF] p-6 rounded-[16px] box">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-[16px]">
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        Choisissez votre parcours vers la maîtrise
      </h3>
      <div className="bg-[#FFFFFF] pl-6 pr-12 py-6 flex items-center justify-between rounded-[16px] box max-md:flex-col max-md:pr-6">
        <form className="w-full">
          {learningModes.map((mode) => {
            const isLocked = mode.requiresPremium && !hasPremiumPlan;
            const isDisabled = isLocked;

            return (
              <div
                key={mode.id}
                className={`relative flex flex-col p-4 rounded-[8px] w-[90%] border max-md:w-full ${
                  displayedSelectedModeId === mode.id && !isLocked
                    ? "bg-[#FFF5FA] border-[#F8589F]"
                    : "border-[#E4E4E4]"
                } ${
                  mode.id !== "8770d57c-ad5f-4096-8f26-7cf8a1b67f79" ? "mb-4" : ""
                } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                onMouseEnter={() => isLocked && setHoveredMode(mode.id)}
                onMouseLeave={() => setHoveredMode(null)}
              >
                {isLocked && (
                  <div className="absolute top-2 right-2 bg-[#F8589F] text-white text-xs px-2 py-1 rounded-full">
                    Premium
                  </div>
                )}

                {/* Tooltip */}
                {isLocked && hoveredMode === mode.id && (
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-[#191919] text-white text-xs rounded-md px-3 py-2 whitespace-nowrap z-10 shadow-lg">
                    {premiumTooltip}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#191919]"></div>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (isDisabled) return;

                      let modeToSelect = mode.id;
                      if (modes) {
                        const apiMode = modes.find((m) => {
                          if (mode.id === "1afb7737-c9c2-4411-9e61-5ceb02ce5e47")
                            return m.name.includes("Intelligent");
                          if (mode.id === "9fcd084a-a8a6-4004-ba9a-c8d1243d1d69")
                            return m.name.includes("Guidé");
                          if (mode.id === "6ecb99f5-6687-47f8-a218-b30fbc5d85ee")
                            return (
                              m.name.includes("Personnalisé") ||
                              m.name.includes("Custom")
                            );
                          return false;
                        });
                        if (apiMode) modeToSelect = apiMode.id;
                      }
                      onModeChange(modeToSelect);
                    }}
                    disabled={isDisabled}
                    className={`w-5 h-5 rounded-full border-2 border-[#FF6EAF] transition-colors ${
                      displayedSelectedModeId === mode.id && !isLocked
                        ? "bg-[#FF6EAF] border-[#FF6EAF]"
                        : "bg-transparent"
                    } ${
                      isDisabled
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }`}
                  />
                  <Label
                    htmlFor={mode.id}
                    className={`text-[#191919] font-[500] text-[15px] ${
                      isDisabled ? "cursor-not-allowed" : ""
                    }`}
                  >
                    {mode.title} {"("}
                    <span className="text-[#F8589F]">{mode.subtitle}</span>
                    {")"}
                  </Label>
                </div>
                <p
                  className={`text-[12px] pl-[34px] text-[#666666] ${
                    isDisabled ? "opacity-70" : ""
                  }`}
                >
                  {mode.description}
                </p>
              </div>
            );
          })}
        </form>
        <Image src={path} alt="parcours" className="max-md:w-[240px]" />
      </div>
    </div>
  );
};

export default Path_Settings;
