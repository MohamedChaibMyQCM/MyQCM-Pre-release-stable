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
    console.log("Complete session response:", response.data);
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
      console.log("Session details response:", response.data.data);
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
      console.log("Initial/Current MCQ fetch response:", response.data);
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
      console.log("Next MCQ fetch response:", response.data);
      if (!response.data?.data?.data || response.data.data.data.length === 0) {
        console.log("No more questions data received from next fetch.");
        return { data: [], is_final: true };
      }
      return response.data.data;
    },
    onSuccess: (nextMcqData) => {
      console.log("Setting query data for mcqs:", nextMcqData);
      queryClient.setQueryData(["mcqs", trainingSessionId], nextMcqData);
      setAnswer(null);
    },
    onError: (error) => {
      console.error("Error fetching next MCQ:", error);
      toast.error("Failed to load the next question.");
    },
  });

  const { mutateAsync: Progress, isLoading: isSubmitting } = useMutation({
    mutationFn: async (submittedData) => {
      const token = secureLocalStorage.getItem("token");
      const mcqId = submittedData?.mcq;
      if (!mcqId) {
        toast.error("Missing mcqId");
        throw new Error("Missing mcqId");
      }
      if (!trainingSessionId) {
        toast.error("Missing trainingSessionId");
        throw new Error("Missing trainingSessionId");
      }

      const response_options =
        submittedData.response_options &&
        submittedData.response_options.length > 0
          ? submittedData.response_options
          : null;

      const payload = {
        response_options: response_options,
        response: submittedData.response || "",
        time_spent: submittedData.time_spent || 0,
        session: trainingSessionId,
      };

      const submitResponse = await BaseUrl.post(
        `/mcq/submit/${mcqId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Submission Response Data:", submitResponse.data.data);
      return submitResponse.data.data;
    },
    onSuccess: (responseData) => {
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
      console.error("Submission error:", error);
      const message = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message[0]
        : error?.response?.data?.message ||
          error.message ||
          "Failed to submit answer";
      toast.error(message);
      setAnswer({ error: true, message: message });
    },
  });

  const handleSessionCompletion = useCallback(async () => {
    if (isCompletingSession || result) return;
    setIsCompletingSession(true);
    console.log("Handling session completion");
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
      console.error("Error completing session:", error);
      const message = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message[0]
        : error?.response?.data?.message ||
          error.message ||
          "Failed to mark session as complete";
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
      console.log("processQuizData: No data found in response structure.");
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
        <h2 className="text-2xl font-bold mb-4">Error Loading</h2>
        <p className="text-center mb-4">
          {combinedError.message ||
            "Could not fetch session or question data. Please try again later."}
        </p>
        <button
          onClick={() => router.back()}
          className="font-medium text-[13px] text-[#FFFFFF] rounded-[20px] px-[26px] py-[6px] border-[2px] border-[#FFFFFF] hover:bg-white hover:text-[#FF6FAF] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!isLoadingInitial && !combinedError && !currentQuestion && !result) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#FF6FAF] text-white p-10">
        <h2 className="text-2xl font-bold mb-4">No Questions Found</h2>
        <p className="text-center mb-4">
          There are no questions available for this training session, or the
          session has already been completed.
        </p>
        <button
          onClick={() => router.back()}
          className="font-medium text-[13px] text-[#FFFFFF] rounded-[20px] px-[26px] py-[6px] border-[2px] border-[#FFFFFF] hover:bg-white hover:text-[#FF6FAF] transition-colors mr-4"
        >
          Go Back
        </button>
        {SeasonDetails && SeasonDetails.status !== "COMPLETED" && (
          <button
            onClick={handleSessionCompletion}
            disabled={isCompletingSession}
            className="font-medium text-[13px] text-[#FFFFFF] rounded-[20px] px-[26px] py-[6px] border-[2px] border-[#FFFFFF] hover:bg-white hover:text-[#FF6FAF] transition-colors"
          >
            {isCompletingSession ? "Completing..." : "Complete Session"}
          </button>
        )}
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
              ? "Ending..."
              : isLoadingQuestion
              ? "Loading..."
              : "End Season"}
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
