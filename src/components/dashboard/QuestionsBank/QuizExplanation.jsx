import Image from "next/image";
import exit from "../../../../public/Icons/exit.svg";
import accuracyPic from "../../../../public/Quiz/accuracyPic.svg";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { IoCloseCircleOutline } from "react-icons/io5";

const QuizExplanation = ({
  QuizData,
  setSeeExplanation,
  type,
  handleNextQuestion,
}) => {
  const resultData = QuizData?.data ? QuizData.data : QuizData;

  // Helper function to format text with proper line breaks
  const formatText = (text) => {
    if (!text) return "";
    return text.replace(/\\n/g, "<br />");
  };

  const getBackgroundColor = (ratio) => {
    const safeRatio = typeof ratio === "number" && !isNaN(ratio) ? ratio : 0;
    const res = safeRatio * 100;
    if (res >= 0 && res < 30) return "bg-red-600";
    if (res >= 30 && res < 70) return "bg-[#ECD14E]";
    return "bg-[#53DF83]";
  };

  const successRatio = resultData?.success_ratio ?? 0;
  const responseOptions = resultData?.selected_options ?? [];
  const allMcqOptions = resultData?.options ?? [];
  const explanationText = resultData?.explanation;
  const qroFeedback = resultData?.feedback;
  const userAnswer = resultData?.response;
  const expertAnswer = resultData?.answer;

  const correctOptionsData =
    type === "qcm" || type === "qcs"
      ? allMcqOptions.filter((opt) => opt.is_correct)
      : [];

  const userResponsesWithContent = responseOptions.map((resp) => {
    const originalOption = allMcqOptions.find((opt) => opt.id === resp.id) || {
      content: "Contenu de l'option manquant",
      is_correct: false,
      id: resp.id,
    };
    return {
      ...resp,
      content: originalOption.content,
      is_correct: originalOption.is_correct,
      id: originalOption.id,
    };
  });

  const bgColor = getBackgroundColor(successRatio);
  const isMCQ = type === "qcm" || type === "qcs";

  return (
    <div className="fixed z-[50] h-screen w-screen left-0 top-0 flex items-center justify-center bg-[#0000004D] p-4">
      <div className="bg-[#FFFFFF] flex flex-col gap-4 w-[70%] max-h-[90vh] p-[26px] rounded-[16px] overflow-y-auto scrollbar-hide max-md:w-[96%]">
        <div className="flex items-center justify-between top-0 bg-white pb-2">
          <span className="text-[19px] font-semibold text-[#191919]">
            {isMCQ ? "Explication" : "Analyse des réponses"}
          </span>
          <Image
            src={exit}
            alt="fermer"
            className="cursor-pointer"
            onClick={() => setSeeExplanation(false)}
            width={24}
            height={24}
          />
        </div>

        <div className="flex flex-col gap-4">
          {isMCQ ? (
            <>
              {userResponsesWithContent.filter((item) => !item.is_correct)
                .length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="block text-[#191919] text-[15px] font-[500]">
                    Vos réponses incorrectes
                  </span>
                  <ul className="flex flex-col gap-3 w-[100%]">
                    {userResponsesWithContent
                      .filter((item) => !item.is_correct)
                      .map((item) => (
                        <li
                          key={`user-false-${item.id}`}
                          className="border-[#F64C4C] px-[16px] py-[8px] rounded-[12px] border-[2px] text-[#F64C4C] text-[14px] flex items-center justify-between"
                        >
                          <span
                            dangerouslySetInnerHTML={{
                              __html: formatText(item.content),
                            }}
                          ></span>
                          <IoCloseCircleOutline className="w-[20px] h-[20px] text-[#F64C4C]" />
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col gap-2 mt-2">
                <span className="block text-[#191919] text-[15px] font-[500]">
                  Réponses correctes
                </span>
                <ul className="flex flex-col gap-3 w-[100%]">
                  {correctOptionsData.length > 0 ? (
                    correctOptionsData.map((item) => (
                      <li
                        key={`correct-${item.id}`}
                        className="border-[#47B881] px-[16px] py-[8px] rounded-[12px] border-[2px] text-[#47B881] text-[14px] flex items-center justify-between"
                      >
                        <span
                          dangerouslySetInnerHTML={{
                            __html: formatText(item.content),
                          }}
                        ></span>
                        <IoIosCheckmarkCircle className="w-[20px] h-[20px] text-[#47B881]" />
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 text-[14px]">
                      Détails de la réponse correcte non disponibles.
                    </li>
                  )}
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <span className="block text-[#191919] text-[15px] font-[500]">
                  Précision de votre réponse
                </span>
                <div
                  className={`relative flex items-center gap-3 rounded-[14px] px-[20px] py-[14px] ${bgColor}`}
                >
                  <div className="bg-[#FFFFFF] w-[50px] h-[50px] rounded-full flex items-center justify-center flex-shrink-0">
                    <span
                      className={`flex items-center justify-center font-Poppins font-medium text-[#FFFFFF] text-[13px] w-[42px] h-[42px] rounded-full ${bgColor}`}
                    >
                      {Math.round(successRatio * 100)}%
                    </span>
                  </div>
                  <span className="block text-[#FFFFFF] text-[15px] font-[500]">
                    Pourcentage de précision de votre réponse :{" "}
                    {Math.round(successRatio * 100)}%
                  </span>
                  <Image
                    src={accuracyPic}
                    alt="image de précision"
                    className="absolute top-[-8px] left-[-60px] w-[80px] hidden sm:block"
                    width={80}
                    height={80}
                  />
                </div>
              </div>
            </>
          )}

          {expertAnswer && !isMCQ && (
            <div className="flex flex-col gap-2 mt-2">
              <span className="block text-[#191919] text-[15px] font-[500]">
                Réponse des experts MyQCM
              </span>
              <div
                className="min-h-[100px] max-h-[200px] rounded-[10px] border-[2px] border-[#47B881] bg-[#F0F9F5] px-[16px] py-[10px] overflow-y-auto scrollbar-hide text-[#191919] text-[14px]"
                dangerouslySetInnerHTML={{ __html: formatText(expertAnswer) }}
              />
            </div>
          )}

          {explanationText && (
            <div className="flex flex-col gap-2 mt-2">
              <span className="block text-[#191919] text-[15px] font-[500]">
                {isMCQ ? "Explication" : "Explication des experts MyQCM"}
              </span>
              <div
                className="min-h-[100px] max-h-[200px] rounded-[10px] border-[2px] border-[#F8589F] bg-[#FFF5FA] px-[16px] py-[10px] overflow-y-auto scrollbar-hide text-[#191919] text-[14px]"
                dangerouslySetInnerHTML={{
                  __html: formatText(explanationText),
                }}
              />
            </div>
          )}

          {!isMCQ && qroFeedback && (
            <div className="flex flex-col gap-2 mt-2">
              <span className="block text-[#191919] text-[15px] font-[500]">
                Analyse de l&apos;assistant IA MyQCM
              </span>
              <div
                className="min-h-[100px] max-h-[200px] rounded-[14px] border-[1px] border-[#F8589F] bg-[#FFF5FA] px-[20px] py-[14px] overflow-y-auto scrollbar-hide font-Poppins font-medium text-[#0C092A] text-[14px]"
                dangerouslySetInnerHTML={{ __html: formatText(qroFeedback) }}
              />
            </div>
          )}

          <div
            className={`flex flex-col sm:flex-row items-center justify-between gap-4 bottom-0 bg-white pt-4 ${
              !isMCQ ? "" : "sm:self-end"
            }`}
          >
            {!isMCQ && (
              <span
                className={`text-center sm:text-left font-medium text-[11px] text-[#191919] flex-1`}
              >
                Cette réponse a été examinée et confirmée correcte par les
                experts MyQCM avec l&apos;assistance de l&apos;IA. Bien
                qu&apos;aucune erreur n&apos;ait été trouvée, veuillez noter que
                les modèles d&apos;IA peuvent parfois faire des erreurs.
              </span>
            )}
            <button
              className="bg-[#F8589F] text-[#FFFFFF] font-medium text-[13px] px-[16px] py-[8px] rounded-[24px] hover:opacity-90 transition-opacity"
              onClick={handleNextQuestion}
            >
              Question suivante
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizExplanation;
