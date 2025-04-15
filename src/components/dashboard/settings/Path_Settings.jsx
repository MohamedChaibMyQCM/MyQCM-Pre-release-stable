"use client";

import Image from "next/image";
import path from "../../../../public/settings/path.svg";
import { Label } from "@/components/ui/label";

const Path_Settings = ({ modes, selectedMode, onModeChange, isLoading }) => {
  const learningModes = [
    {
      id: "3fbd3d2f-3033-4dee-90d5-368c758c5291",
      title: "Mode Intelligent",
      subtitle: "Propulsé par Synergy",
      description:
        "En Mode Intelligent, Synergy - notre moteur d'apprentissage avancé - personnalise votre expérience. C'est comme avoir un tuteur dédié qui comprend vos forces, vos faiblesses et votre style d'apprentissage. Synergy s'adapte en temps réel, se concentrant sur ce que vous devez maîtriser, rendant chaque session d'étude incroyablement efficace. C'est le moyen le plus rapide pour gagner en confiance et atteindre une véritable compréhension.",
    },
    {
      id: "d2997e7d-8a8e-4153-8550-889fd697ae90",
      title: "Mode Guidé",
      subtitle: "Votre Focus, Notre IA",
      description:
        "En Mode Guidé, vous contrôlez la direction, tout en bénéficiant de la sélection intelligente des questions de Synergy. Parfait pour lorsque vous souhaitez vous concentrer sur des domaines spécifiques, comme la préparation à un examen à venir ou le renforcement de vos connaissances sur un module particulier. Nous vous aiderons à maximiser chaque minute.",
    },
    {
      id: "8770d57c-ad5f-4096-8f26-7cf8a1b67f79",
      title: "Mode Personnalisé",
      subtitle: "Créez Votre Défi",
      description:
        "Le Mode Personnalisé est votre terrain de jeu pour un entraînement ciblé. Parfait pour simuler des conditions d'examen, tester vos connaissances sur des sujets spécifiques ou vous défier avec exactement les questions que vous souhaitez.",
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
      return "3fbd3d2f-3033-4dee-90d5-368c758c5291";
    if (mode.name.includes("Guidé"))
      return "d2997e7d-8a8e-4153-8550-889fd697ae90";
    if (mode.name.includes("Personnalisé") || mode.name.includes("Custom"))
      return "8770d57c-ad5f-4096-8f26-7cf8a1b67f79";

    return null;
  };

  // Get the corresponding learning mode ID
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
          {learningModes.map((mode) => (
            <div
              key={mode.id}
              className={`flex flex-col p-4 rounded-[8px] w-[90%] border max-md:w-full ${
                displayedSelectedModeId === mode.id
                  ? "bg-[#FFF5FA] border-[#F8589F]"
                  : "border-[#E4E4E4]"
              } ${
                mode.id !== "8770d57c-ad5f-4096-8f26-7cf8a1b67f79" ? "mb-4" : ""
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    // Find the corresponding API mode if available
                    let modeToSelect = mode.id;
                    if (modes) {
                      const apiMode = modes.find((m) => {
                        if (mode.id === "3fbd3d2f-3033-4dee-90d5-368c758c5291")
                          return m.name.includes("Intelligent");
                        if (mode.id === "d2997e7d-8a8e-4153-8550-889fd697ae90")
                          return m.name.includes("Guidé");
                        if (mode.id === "8770d57c-ad5f-4096-8f26-7cf8a1b67f79")
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
                  className={`w-5 h-5 rounded-full border-2 border-[#FF6EAF] cursor-pointer transition-colors ${
                    displayedSelectedModeId === mode.id
                      ? "bg-[#FF6EAF] border-[#FF6EAF]"
                      : "bg-transparent"
                  }`}
                />
                <Label
                  htmlFor={mode.id}
                  className="text-[#191919] font-[500] text-[15px]"
                >
                  {mode.title} {"("}
                  <span className="text-[#F8589F]">{mode.subtitle}</span>
                  {")"}
                </Label>
              </div>
              <p className={`text-[12px] pl-[34px] text-[#666666]`}>
                {mode.description}
              </p>
            </div>
          ))}
        </form>
        <Image src={path} alt="parcours" className="max-md:w-[240px]" />
      </div>
    </div>
  );
};

export default Path_Settings;
