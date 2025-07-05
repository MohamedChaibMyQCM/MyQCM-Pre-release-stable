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
  checkAndTriggerSurvey,
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

  const handleNextQuestionClick = () => {
    handleNextQuestion();
    // Don't trigger survey here - let the Quiz component handle it after navigation
  };

  return (
    <div className="fixed z-[60] h-screen w-screen left-0 top-0 flex items-center justify-center bg-[#00000080] p-4">
      <div className="bg-[#FFFFFF] flex flex-col gap-5 w-[75%] max-h-[92vh] p-[32px] rounded-[24px] overflow-y-auto scrollbar-hide max-md:w-[95%] max-md:p-[20px] shadow-xl border border-[#E9ECEF]">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 bg-white pb-4 border-b border-[#F1F3F4]">
          <h2 className="text-[20px] font-bold text-[#2C3E50] flex items-center gap-3">
            <div className="w-[6px] h-[6px] bg-[#F8589F] rounded-full"></div>
            {isMCQ ? "Explication détaillée" : "Analyse de votre réponse"}
          </h2>
          <button
            onClick={() => setSeeExplanation(false)}
            className="w-[36px] h-[36px] flex items-center justify-center rounded-[12px] hover:bg-[#F8F9FA] transition-colors"
          >
            <Image
              src={exit}
              alt="fermer"
              width={20}
              height={20}
              className="opacity-60"
            />
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {isMCQ ? (
            <>
              {/* Incorrect answers */}
              {userResponsesWithContent.filter((item) => !item.is_correct)
                .length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-[#2C3E50] text-[16px] font-semibold flex items-center gap-2">
                    <IoCloseCircleOutline className="w-[20px] h-[20px] text-[#F64C4C]" />
                    Vos réponses incorrectes
                  </h3>
                  <ul className="flex flex-col gap-3">
                    {userResponsesWithContent
                      .filter((item) => !item.is_correct)
                      .map((item) => (
                        <li
                          key={`user-false-${item.id}`}
                          className="border-2 border-[#F64C4C] bg-[#FFF5F5] px-[20px] py-[14px] rounded-[16px] text-[#F64C4C] text-[14px] flex items-center justify-between shadow-sm"
                        >
                          <span
                            className="flex-1 font-medium"
                            dangerouslySetInnerHTML={{
                              __html: formatText(item.content),
                            }}
                          />
                          <IoCloseCircleOutline className="w-[24px] h-[24px] text-[#F64C4C] ml-3" />
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Correct answers */}
              <div className="flex flex-col gap-3">
                <h3 className="text-[#2C3E50] text-[16px] font-semibold flex items-center gap-2">
                  <IoIosCheckmarkCircle className="w-[20px] h-[20px] text-[#47B881]" />
                  Réponses correctes
                </h3>
                <ul className="flex flex-col gap-3">
                  {correctOptionsData.length > 0 ? (
                    correctOptionsData.map((item) => (
                      <li
                        key={`correct-${item.id}`}
                        className="border-2 border-[#47B881] bg-[#F0F9F5] px-[20px] py-[14px] rounded-[16px] text-[#47B881] text-[14px] flex items-center justify-between shadow-sm"
                      >
                        <span
                          className="flex-1 font-medium"
                          dangerouslySetInnerHTML={{
                            __html: formatText(item.content),
                          }}
                        />
                        <IoIosCheckmarkCircle className="w-[24px] h-[24px] text-[#47B881] ml-3" />
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 text-[14px] bg-[#F8F9FA] px-[20px] py-[14px] rounded-[16px]">
                      Détails de la réponse correcte non disponibles.
                    </li>
                  )}
                </ul>
              </div>
            </>
          ) : (
            // QROC accuracy display
            <div className="flex flex-col gap-4">
              <h3 className="text-[#2C3E50] text-[16px] font-semibold">
                Précision de votre réponse
              </h3>
              <div
                className={`relative flex items-center gap-4 rounded-[20px] px-[24px] py-[20px] ${bgColor} shadow-lg`}
              >
                <div className="bg-[#FFFFFF] w-[60px] h-[60px] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                  <span
                    className={`flex items-center justify-center font-Poppins font-bold text-[#FFFFFF] text-[16px] w-[52px] h-[52px] rounded-full ${bgColor}`}
                  >
                    {Math.round(successRatio * 100)}%
                  </span>
                </div>
                <div className="flex-1">
                  <span className="block text-[#FFFFFF] text-[16px] font-semibold">
                    Niveau de précision : {Math.round(successRatio * 100)}%
                  </span>
                  <span className="block text-[#FFFFFF] text-[13px] opacity-90 mt-1">
                    Votre réponse a été analysée par notre IA
                  </span>
                </div>
                <Image
                  src={accuracyPic}
                  alt="image de précision"
                  className="absolute top-[-12px] right-[-20px] w-[90px] hidden lg:block opacity-80"
                  width={90}
                  height={90}
                />
              </div>
            </div>
          )}

          {/* Expert answer for QROC */}
          {expertAnswer && !isMCQ && (
            <div className="flex flex-col gap-3">
              <h3 className="text-[#2C3E50] text-[16px] font-semibold flex items-center gap-2">
                <div className="w-[20px] h-[20px] bg-[#47B881] rounded-full flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">✓</span>
                </div>
                Réponse des experts MyQCM
              </h3>
              <div
                className="min-h-[120px] max-h-[250px] rounded-[16px] border-2 border-[#47B881] bg-[#F0F9F5] px-[20px] py-[16px] overflow-y-auto scrollbar-hide text-[#2C3E50] text-[14px] leading-relaxed shadow-sm"
                dangerouslySetInnerHTML={{ __html: formatText(expertAnswer) }}
              />
            </div>
          )}

          {/* Explanation */}
          {explanationText && (
            <div className="flex flex-col gap-3">
              <h3 className="text-[#2C3E50] text-[16px] font-semibold flex items-center gap-2">
                <div className="w-[20px] h-[20px] bg-[#F8589F] rounded-full flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">!</span>
                </div>
                {isMCQ ? "Explication détaillée" : "Explication des experts"}
              </h3>
              <div
                className="min-h-[120px] max-h-[250px] rounded-[16px] border-2 border-[#F8589F] bg-[#FFF5FA] px-[20px] py-[16px] overflow-y-auto scrollbar-hide text-[#2C3E50] text-[14px] leading-relaxed shadow-sm"
                dangerouslySetInnerHTML={{
                  __html: formatText(explanationText),
                }}
              />
            </div>
          )}

          {/* AI Feedback for QROC */}
          {!isMCQ && qroFeedback && (
            <div className="flex flex-col gap-3">
              <h3 className="text-[#2C3E50] text-[16px] font-semibold flex items-center gap-2">
                <div className="w-[20px] h-[20px] bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">AI</span>
                </div>
                Analyse de l&apos;assistant IA
              </h3>
              <div
                className="min-h-[120px] max-h-[250px] rounded-[16px] border-2 border-[#667eea] bg-gradient-to-r from-[#f7fafc] to-[#edf2f7] px-[20px] py-[16px] overflow-y-auto scrollbar-hide font-Poppins font-medium text-[#2C3E50] text-[14px] leading-relaxed shadow-sm"
                dangerouslySetInnerHTML={{ __html: formatText(qroFeedback) }}
              />
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 bg-white pt-6 border-t border-[#F1F3F4] mt-4">
            {!isMCQ && (
              <p className="text-center sm:text-left text-[11px] text-[#6C757D] flex-1 leading-relaxed">
                Cette réponse a été analysée par nos experts et notre IA. Bien
                que nous nous efforcions d&apos;être précis, les modèles
                d&apos;IA peuvent parfois commettre des erreurs.
              </p>
            )}
            <button
              className="bg-gradient-to-r from-[#F8589F] to-[#E74C8C] text-[#FFFFFF] font-semibold text-[13px] px-[32px] py-[12px] rounded-[28px] hover:shadow-lg hover:scale-105 transition-all duration-200 max-md:w-full"
              onClick={handleNextQuestionClick}
            >
              Question suivante →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizExplanation;
