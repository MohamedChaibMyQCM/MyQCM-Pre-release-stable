"use client";
import Image from "next/image";
import logo from "../../../../../../public/whiteLogo.svg";
import { QuizImage } from "@/data/data";
import Quiz from "@/components/dashboard/QuestionsBank/Quiz";
import BaseUrl from "@/components/BaseUrl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import QuizResult from "@/components/dashboard/QuestionsBank/QuizResult";
import toast from "react-hot-toast";
import EndSeasonPopup from "@/components/dashboard/QuestionsBank/EndSeasonPopup";
import { useParams, useRouter } from "next/navigation";
import secureLocalStorage from "react-secure-storage";
import Loading from "@/components/Loading";

const Page = () => {
  const { trainingSessionId } = useParams();
  const queryClient = useQueryClient();
  const router = useRouter();

  const completeTrainingSessionInternal = async (sessionId) => {
    const token = secureLocalStorage.getItem("token");
    const response = await BaseUrl.get(
      `/training-session/${sessionId}/complete`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  };

  const [answer, setAnswer] = useState(null);
  const [result, setResult] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [isCompletingSession, setIsCompletingSession] = useState(false);

  const [data, setData] = useState({
    mcqs_success: 0,
    mcqs_failed: 0,
    mcqs_skipped: 0,
    total_mcqs: 0,
    accuracy: 0,
    xp_earned: 0,
  });

  const {
    data: SeasonDetails,
    isLoading: loadingDetails,
    error: errorDetails,
  } = useQuery({
    queryKey: ["sessionDetails", trainingSessionId],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get(
        `/training-session/${trainingSessionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const details = response.data.data;
      setData((prev) => ({
        ...prev,
        total_mcqs: details?.number_of_questions || 0,
      }));
      return details;
    },
    enabled: !!trainingSessionId,
  });

  const {
    data: quiz,
    isLoading: isLoadingMcq,
    error: errorMcq,
    isFetching: isFetchingMcq,
  } = useQuery({
    queryKey: ["mcqs", trainingSessionId],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get(
        `/training-session/${trainingSessionId}/mcq`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data?.data;
    },
    enabled: !!trainingSessionId && !result,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const { mutate: fetchNextMcq, isLoading: isLoadingNextMcq } = useMutation({
    mutationFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get(
        `/training-session/${trainingSessionId}/mcq`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.data?.data?.data || response.data.data.data.length === 0) {
        return { data: [], is_final: true };
      }
      return response.data.data;
    },
    onSuccess: (nextMcqData) => {
      queryClient.setQueryData(["mcqs", trainingSessionId], nextMcqData);
      setAnswer(null);
    },
    onError: (error) => {
      toast.error("Failed to load the next question.");
    },
  });

  const { mutateAsync: Progress, isLoading: isSubmitting } = useMutation({
    mutationFn: async (submittedData) => {
      const token = secureLocalStorage.getItem("token");
      const mcqId = submittedData?.mcq;
      if (!mcqId) {
        toast.error("ID de question manquant");
        throw new Error("ID de question manquant");
      }
      if (!trainingSessionId) {
        toast.error("ID de session d'entraînement manquant");
        throw new Error("ID de session d'entraînement manquant");
      }

      // Create base payload
      const payload = {
        time_spent: submittedData.time_spent || 0,
        session: trainingSessionId,
        is_skipped: !!submittedData.is_skipped,
      };

      // If not skipped, add response data
      if (!submittedData.is_skipped) {
        payload.response_options =
          submittedData.response_options &&
          submittedData.response_options.length > 0
            ? submittedData.response_options
            : null;
        payload.response = submittedData.response || "";
      }

      const submitResponse = await BaseUrl.post(
        `/mcq/submit/${mcqId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return {
        responseData: submitResponse.data.data,
        isSkipOperation: !!submittedData.is_skipped,
      };
    },
    onSuccess: (result) => {
      const { responseData, isSkipOperation } = result;

      if (isSkipOperation) {
        setAnswer(responseData);
        return;
      }

      setAnswer(responseData);
      setData((prevData) => {
        let { mcqs_success, mcqs_failed } = prevData;
        const successRatio =
          typeof responseData?.success_ratio === "number"
            ? responseData.success_ratio
            : -1;

        if (successRatio === 1) {
          mcqs_success += 1;
        } else if (successRatio >= 0 && successRatio < 1) {
          mcqs_failed += 1;
        }
        return {
          ...prevData,
          mcqs_success,
          mcqs_failed,
        };
      });
    },
    onError: (error) => {
      const message = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message[0]
        : error?.response?.data?.message ||
          error.message ||
          "Échec de la soumission de la réponse";
      toast.error(message);
      setAnswer({ error: true, message: message });
    },
  });

  const handleSessionCompletion = useCallback(async () => {
    if (isCompletingSession || result) return;
    setIsCompletingSession(true);
    try {
      const response = await completeTrainingSessionInternal(trainingSessionId);
      const completionData = response.data || response;

      setData((prev) => {
        const total =
          prev.total_mcqs || SeasonDetails?.number_of_questions || 0;
        const accuracy =
          total > 0
            ? Math.round(
                ((completionData?.mcqs_success ?? prev.mcqs_success) / total) *
                  100
              )
            : 0;
        return {
          ...prev,
          ...(completionData || {}),
          total_mcqs: total,
          accuracy: completionData?.accuracy ?? accuracy,
        };
      });
      setResult(true);
      queryClient.invalidateQueries({
        queryKey: ["sessionDetails", trainingSessionId],
      });
      queryClient.invalidateQueries({ queryKey: ["trainingSessions"] });
    } catch (error) {
      const message = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message[0]
        : error?.response?.data?.message ||
          error.message ||
          "Échec de la finalisation de la session";
      toast.error(message);
    } finally {
      setIsCompletingSession(false);
    }
  }, [
    trainingSessionId,
    isCompletingSession,
    queryClient,
    SeasonDetails,
    result,
  ]);

  const processQuizData = useCallback((quizApiResponse) => {
    if (
      !quizApiResponse ||
      !quizApiResponse.data ||
      quizApiResponse.data.length === 0
    ) {
      return { currentQuestion: null, isFinal: true };
    }
    return {
      currentQuestion: quizApiResponse.data[0],
      isFinal: quizApiResponse.is_final || false,
    };
  }, []);

  const { currentQuestion, isFinal } = processQuizData(quiz);

  const handleEndSessionClick = () => {
    if (result || isCompletingSession || isLoadingNextMcq) return;
    setShowConfirmationPopup(true);
  };

  const confirmEndSession = async () => {
    setShowConfirmationPopup(false);
    await handleSessionCompletion();
  };

  const cancelEndSession = () => {
    setShowConfirmationPopup(false);
  };

  const isLoadingInitial =
    loadingDetails || (isLoadingMcq && !currentQuestion && !result);
  const isLoadingQuestion =
    isLoadingInitial || (isFetchingMcq && !result) || isLoadingNextMcq;
  const combinedError = errorDetails || errorMcq;

  if (isLoadingInitial) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#FF6FAF]">
        <Loading />
      </div>
    );
  }

  if (combinedError && !result) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#FF6FAF] text-white p-10">
        <h2 className="text-2xl font-bold mb-4">Erreur de chargement</h2>
        <p className="text-center mb-4">
          {combinedError.message ||
            "Impossible de récupérer les données de session ou de question. Veuillez réessayer plus tard."}
        </p>
        <button
          onClick={() => router.back()}
          className="font-medium text-[13px] text-[#FFFFFF] rounded-[20px] px-[26px] py-[6px] border-[2px] border-[#FFFFFF] hover:bg-white hover:text-[#FF6FAF] transition-colors"
        >
          Retour
        </button>
      </div>
    );
  }

  if (!isLoadingInitial && !combinedError && !currentQuestion && !result) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#FF6FAF] text-white p-10">
        <h2 className="text-2xl font-bold mb-4">Aucune question trouvée</h2>
        <p className="text-center mb-4">
          Il n&apos;y a pas de questions disponibles pour cette session
          d&apos;entraînement, ou la session a déjà été terminée.
        </p>
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => router.back()}
            className="font-medium text-[13px] text-[#FFFFFF] rounded-[20px] px-[26px] py-[6px] border-[2px] border-[#FFFFFF] hover:bg-white hover:text-[#FF6FAF] transition-colors"
          >
            Retour
          </button>
          {SeasonDetails && SeasonDetails.status !== "COMPLETED" && (
            <button
              onClick={handleSessionCompletion}
              disabled={isCompletingSession}
              className="font-medium text-[13px] text-[#FFFFFF] rounded-[20px] px-[26px] py-[6px] border-[2px] border-[#FFFFFF] hover:bg-white hover:text-[#FF6FAF] transition-colors"
            >
              {isCompletingSession ? "Finalisation..." : "Terminer la session"}
            </button>
          )}
        </div>
      </div>
    );
  }

  const totalQuestions =
    SeasonDetails?.number_of_questions || data.total_mcqs || 0;
  const currentQuestionNumber =
    data.mcqs_success + data.mcqs_failed + data.mcqs_skipped + 1;

  return (
    <div className="absolute inset-0 z-50 bg-[#FF6FAF] px-[80px] py-[30px] pb-[96px] flex flex-col gap-10 max-md:px-[20px] overflow-hidden">
      <div className="flex items-center justify-between">
        <Image src={logo} alt="logo" className="w-[140px] max-md:w-[120px]" />
        {!result && (
          <button
            onClick={handleEndSessionClick}
            className={`font-medium text-[13px] text-[#FFFFFF] rounded-[20px] px-[26px] py-[6px] border-[2px] border-[#FFFFFF] hover:bg-white hover:text-[#FF6FAF] transition-colors ${
              isCompletingSession || isLoadingQuestion
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={isCompletingSession || isLoadingQuestion || result}
          >
            {isCompletingSession
              ? "Finalisation..."
              : isLoadingQuestion
              ? "Chargement..."
              : "Terminer la session"}
          </button>
        )}
      </div>

      {isLoadingQuestion && !result && (
        <div className="flex justify-center items-center flex-grow">
          <Loading color="#FFFFFF" />
        </div>
      )}

      {currentQuestion && !result && !isLoadingQuestion && (
        <Quiz
          key={currentQuestion.id}
          questionData={currentQuestion}
          Progress={Progress}
          isSubmitting={isSubmitting}
          answer={answer}
          setAnswer={setAnswer}
          setData={setData}
          isFinalQuestion={isFinal}
          fetchNextMcq={fetchNextMcq}
          isLoadingNextMcq={isLoadingNextMcq}
          handleSessionCompletion={handleSessionCompletion}
          totalQuestions={totalQuestions}
          currentQuestionNumber={currentQuestionNumber}
        />
      )}

      {QuizImage.map((item, index) => (
        <Image
          key={index}
          src={item.img}
          alt={item.alt}
          className={item.className}
        />
      ))}

      {showConfirmationPopup && (
        <EndSeasonPopup
          onConfirm={confirmEndSession}
          onCancel={cancelEndSession}
        />
      )}

      {result && <QuizResult length={totalQuestions} data={data} />}
    </div>
  );
};

export default Page;
