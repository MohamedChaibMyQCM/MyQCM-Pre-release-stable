"use client";

import React from "react"; 

export const CustomOnboardingCard = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour, 
}) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (

    <div className="relative rounded-[10px] bg-white w-[400px] shadow-xl p-5">

      <div className="flex items-center mb-3">
        {step.icon && <span className="mr-2 text-xl">{step.icon}</span>}
        {step.title && (
          <h3 className="font-semibold text-lg text-[#191919]">{step.title}</h3>
        )}
      </div>

      {step.content && (
        <div className="text-sm text-gray-700 mb-4">
          {" "}
          {step.content}
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <span className="text-[13px] text-[#B5BEC6]">
          Étape {currentStep + 1} sur {totalSteps}
        </span>

        <div className="flex items-center gap-2">
          {step.showSkip !== false && (
            <button
              onClick={skipTour}
              className="text-[13px] text-[#B5BEC6] hover:text-[#191919] px-2 py-1 rounded transition-colors"
              aria-label="Passer le tour"
            >
              Passer
            </button>
          )}

          {!isFirstStep && step.showControls !== false && (
            <button
              onClick={prevStep}
              className="px-3 py-1.5 text-sm bg-gray-200 text-[#191919] rounded-[10px] hover:bg-gray-300 transition-colors"
              aria-label="Étape précédente"
            >
              Précédent
            </button>
          )}

          {step.showControls !== false && (
            <button
              onClick={nextStep}
              className="px-3 py-1.5 text-sm bg-[#F8589F] text-white rounded-[10px] hover:bg-pink-600 transition-colors" // Using your accent pink
              aria-label={isLastStep ? "Terminer le tour" : "Étape suivante"}
            >
              {isLastStep ? "Terminer" : "Suivant"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};