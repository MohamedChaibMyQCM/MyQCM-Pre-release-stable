import Image from "next/image";
import EndSeason from "../../../../public/Quiz/endSeason.svg";

const EndSeasonPopup = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[60] flex items-center justify-center p-4">
      <div className="flex flex-col items-center bg-card border-2 border-border text-center rounded-[16px] w-[400px] py-4 shadow-xl">
        <Image src={EndSeason} alt="Illustration de fin de session" />
        <h3 className="text-lg font-semibold text-foreground mb-3 mt-2">
          Terminer la session actuelle ?
        </h3>
        <p className="text-muted-foreground text-[13px] mb-6 px-4">
          Êtes-vous sûr de vouloir terminer cette session ? <br /> Vos progrès
          seront sauvegardés, mais vous ne pourrez <br /> pas continuer là où
          vous vous êtes arrêté.
        </p>
        <hr className="border-t border-border w-full mb-4" />
        <div className="flex items-center justify-center gap-6 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="font-medium text-[14px] text-primary px-[20px] py-[8px] rounded-[24px] hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
          >
            Retour
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="font-medium text-[14px] bg-primary text-white px-[20px] py-[8px] rounded-[24px] hover:opacity-90 transition-opacity"
          >
            Terminer la session
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndSeasonPopup;
