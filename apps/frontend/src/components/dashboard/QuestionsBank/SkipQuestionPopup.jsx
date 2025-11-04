import React, { useEffect } from "react";
import Image from "next/image";
import skip from "../../../../public/Quiz/skip.svg";

const  SkipQuestionPopup = ({
  onConfirmSkip,
  onCancelSkip,
  isTimeout = false,
}) => {
  // Add keyboard shortcut for Enter to confirm skip
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        onConfirmSkip();
      } else if (event.key === "Escape") {
        event.preventDefault();
        onCancelSkip();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [onConfirmSkip, onCancelSkip]);

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[70] flex items-center justify-center p-4">
      <div className="flex flex-col items-center bg-card border-2 border-border text-center rounded-[16px] w-[400px] pb-4 overflow-hidden shadow-xl">
        <Image src={skip} alt="Illustration de passage" className="mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-3 px-4">
          {isTimeout ? "Temps écoulé !" : "Passer cette question ?"}
        </h3>
        <p className="text-muted-foreground text-[13px] mb-6 leading-relaxed px-4">
          {isTimeout
            ? "Vous avez manqué de temps pour cette question. La question ne sera pas notée et vous passerez à la suivante."
            : "Êtes-vous sûr de vouloir passer ? Cette question ne sera pas notée immédiatement, et vous ne pourrez pas y revenir dans cette session."}
        </p>
        <hr className="border-t border-border w-full mb-6" />
        <div className="flex items-center justify-center gap-4 w-full px-6">
          <button
            type="button"
            onClick={onCancelSkip}
            className="font-medium text-[14px] text-primary px-[20px] py-[8px] rounded-[24px] hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
          >
            {isTimeout ? "Continuer" : "Retour"}
          </button>
          <button
            type="button"
            onClick={onConfirmSkip}
            className="font-medium text-[14px] bg-primary text-white px-[20px] py-[8px] rounded-[24px] hover:opacity-90 transition-opacity"
          >
            Passer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkipQuestionPopup;
