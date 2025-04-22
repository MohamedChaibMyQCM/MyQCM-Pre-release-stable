"use client";

import BaseUrl from "@/components/BaseUrl";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query"; 
import secureLocalStorage from "react-secure-storage";
import {
  CheckCircle,
  Info,
  CircleNotch as Spinner,
  Check,
} from "phosphor-react";

const modeDetailsConfig = {
  "1afb7737-c9c2-4411-9e61-5ceb02ce5e47": {
    subtitle: "Powered by Synergy",
    features: [
      "AI-Personalized Learning",
      "Customizable Focus",
      "Continuous Improvement",
    ],
    bestFor: [
      "Long-term preparation",
      "Adaptive learning",
      "Maximizing retention",
    ],
    isRecommended: true,
  },
  "9fcd084a-a8a6-4004-ba9a-c8d1243d1d69": {
    subtitle: "Your Focus, Our AI",
    features: [
      "Targeted Practice",
      "Flexible Question Selection",
      "Adaptive Challenge Levels",
    ],
    bestFor: [
      "Focused study on weak spots",
      "Exam preparation",
      "Clinical rotations",
    ],
    isRecommended: false,
  },
  "6ecb99f5-6687-47f8-a218-b30fbc5d85ee": {
    subtitle: "Craft Your Challenge",
    features: ["Full Customization", "Exam Simulation", "Precision Revision"],
    bestFor: [
      "Realistic exam prep",
      "Clinical case practice",
      "Controlled study sessions",
    ],
    isRecommended: false,
  },
};

const BADGE_HEIGHT_CLASS = "h-7";

const LearningModeStep = ({
  selectedMode,
  onModeChange,
  onSubmit,
  onReturn,
}) => {
  const {
    data: modes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["learningModes"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      try {
        const response = await BaseUrl.get("/mode", {
          headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        });
        return response.data?.data?.data || [];
      } catch (err) {
        console.error("Failed to load learning modes:", err);
        throw err;
      }
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Échec du chargement des modes";
      toast.error(message);
    },
    staleTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
  });

  const handleSubmit = () => {
    if (!selectedMode) {
      toast.error("Veuillez sélectionner un mode d'apprentissage");
      return;
    }
    if (onSubmit) {
      onSubmit();
    } else {
      console.error("onSubmit handler prop is missing from LearningModeStep");
      toast.error("Erreur interne : impossible de soumettre.");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full px-4 md:px-[40px] flex items-center justify-center py-20 min-h-[400px]">
        <Spinner size={48} className="text-[#F8589F] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-4 md:px-[40px] mt-8">
        <div className="flex flex-col items-center justify-center text-center h-64 bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
          <p className="font-medium mb-2">Erreur de chargement</p>
          <p className="text-sm">
            Impossible de charger les modes. Veuillez{" "}
            <button
              onClick={() => window.location.reload()}
              className="underline font-medium"
            >
              réessayer
            </button>
            .
          </p>
          <p className="text-xs mt-3 text-red-500">({error.message})</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-[40px] pt-4">
      <h2 className="text-[19px] font-[500] text-[#191919] mb-2">
        Choisissez le mode d&apos;apprentissage souhaité
      </h2>
      <p className="text-[#666666] mb-10 text-[13px] max-w-3xl">
        Les modes d&apos;apprentissage vous aident à étudier plus intelligemment
        en adaptant vos sessions à vos objectifs, besoins et préférences
        individuels. Que vous prépariez vos examens, révisiez des modules
        difficiles ou pratiquiez des scénarios cliniques, MyQCM propose trois
        modes d&apos;apprentissage distincts, chacun spécialement conçu pour les
        étudiants en médecine.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
        {(modes || []).map((mode) => {
          const details = modeDetailsConfig[mode.id] || {
            subtitle: "",
            features: [],
            bestFor: [],
            isRecommended: false,
          };
          const isSelected = selectedMode === mode.id;
          const hasBadge = details.isRecommended;

          return (
            <div key={mode.id} className="flex flex-col">
              <div className={`w-full ${BADGE_HEIGHT_CLASS} mb-[-2px]`}>
                {hasBadge && (
                  <div className="w-full h-full py-1 bg-gradient-to-r from-[#F8589F] to-[#FD2E8A] text-white text-xs font-semibold flex items-center justify-center rounded-t-xl shadow-sm">
                    Recommended
                  </div>
                )}
              </div>

              <div
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => onModeChange(mode.id)}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && onModeChange(mode.id)
                }
                className={`flex flex-col flex-grow p-5 bg-white cursor-pointer transition-all duration-200 ease-in-out h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#F8589F] border
                  ${hasBadge ? "rounded-b-xl border-t-0" : "rounded-xl"}
                  ${
                    isSelected
                      ? `${
                          hasBadge ? "border-x-2 border-b-2" : "border-2"
                        } border-[#FD2E8A] shadow-lg`
                      : `${
                          hasBadge
                            ? "border-gray-200 border-t-0"
                            : "border-gray-200"
                        } hover:border-gray-300`
                  }`}
              >
                <div className={`flex items-center justify-between mb-4 pt-1`}>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected
                          ? "border-[#FD2E8A] bg-[#FD2E8A]"
                          : "border-gray-300 bg-white"
                      }`}
                      aria-hidden="true"
                    >
                      {isSelected && (
                        <Check size={12} weight="bold" className="text-white" />
                      )}
                    </div>
                    <div>
                      <span className="block text-gray-800 font-semibold text-base leading-tight">
                        {mode.name || "Mode inconnu"}
                      </span>
                      <span className="block text-[#FD2E8A] text-sm leading-tight">
                        {details.subtitle}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast("Fonctionnalité d'information à venir.", {
                        icon: "💡",
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600 ml-2 shrink-0 p-1"
                    aria-label={`Informations sur ${mode.name || "ce mode"}`}
                  >
                    <Info size={20} />
                  </button>
                </div>

                <ul className="flex flex-col gap-2 mb-5 text-sm">
                  {(details.features.length > 0
                    ? details.features
                    : ["Caractéristique 1", "Caractéristique 2"]
                  ).map((feature, index) => (
                    <li
                      key={`feat-${index}`}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <CheckCircle
                        size={18}
                        weight="fill"
                        className="text-[#47B881] shrink-0"
                      />
                      {feature}
                    </li>
                  ))}
                  {details.features.length === 0 && (
                    <li className="text-gray-400 text-xs">
                      (Aucune fonctionnalité listée)
                    </li>
                  )}
                </ul>

                <div className="mt-auto pt-4 border-t border-gray-100">
                  <span className="text-[#FD2E8A] font-semibold text-sm mb-2 block">
                    Best For
                  </span>
                  <ul className="flex flex-col gap-2 text-sm">
                    {(details.bestFor.length > 0
                      ? details.bestFor
                      : ["Usage général"]
                    ).map((item, index) => (
                      <li
                        key={`best-${index}`}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <span className="w-2 h-2 bg-[#FD2E8A] rounded-full shrink-0"></span>
                        {item}
                      </li>
                    ))}
                    {details.bestFor.length === 0 && (
                      <li className="text-gray-400 text-xs">
                        (Aucun usage idéal spécifié)
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-10 mt-12 relative z-0">
        <button
          type="button"
          onClick={onReturn}
          className="text-[#F8589F] py-[8px] px-[50px] text-[15px] font-medium hover:bg-[#FFF5FA] rounded-[10px] transition-colors"
        >
          Retour
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedMode}
          className={`self-end bg-gradient-to-t from-[#FD2E8A] to-[#F8589F] rounded-[10px] text-[#FFFFFF] py-[8px] px-[50px] text-[15px] font-medium transition-opacity duration-150 ${
            !selectedMode ? "opacity-50 cursor-not-allowed" : "hover:opacity-95"
          }`}
        >
          Terminer
        </button>
      </div>
    </div>
  );
};

export default LearningModeStep;
