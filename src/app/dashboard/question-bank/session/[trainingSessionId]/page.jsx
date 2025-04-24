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
      return response.data.data;
    },
    enabled: !!trainingSessionId,
  });

  const {
    data: quiz,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["mcqs", trainingSessionId],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get(
        `/training-session/${trainingSessionId}/mcq`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("MCQ response:", response.data);
      return response.data?.data;
    },
    enabled: !!trainingSessionId,
    staleTime: Infinity,
  });

  const { mutateAsync: Progress } = useMutation({
    mutationFn: async (submittedData) => {
      const token = secureLocalStorage.getItem("token");

      const mcqId = submittedData?.mcq;
      if (!mcqId || !trainingSessionId) {
        toast.error(
          "Missing mcqId or sessionId in Progress mutation:",
          mcqId,
          trainingSessionId,
          submittedData
        );
      }

      const response_options =
        submittedData.response_options &&
        submittedData.response_options.length > 0
          ? submittedData.response_options
          : null;

      const submitResponse = await BaseUrl.post(
        `/mcq/submit/${mcqId}`,
        {
          response_options: response_options,
          response: submittedData.response || "",
          time_spent: submittedData.time_spent || 0,
          session: trainingSessionId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return submitResponse.data.data;
    },
    onSuccess: (responseData) => {
      setAnswer(responseData);
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
    if (isCompletingSession) return;
    setIsCompletingSession(true);

    try {
      const response = await completeTrainingSessionInternal(trainingSessionId);

      const completionData = response.data || response;

      setData((prev) => ({
        ...prev,
        ...(completionData || {}),
        total_mcqs: SeasonDetails?.number_of_questions || 0,
      }));
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
  }, [trainingSessionId, isCompletingSession, queryClient, SeasonDetails]);

  useEffect(() => {
    if (SeasonDetails) {
      setData((prev) => ({
        ...prev,
        total_mcqs: SeasonDetails.number_of_questions || prev.total_mcqs,
      }));
    }
  }, [SeasonDetails]);

  const processQuizData = useCallback(() => {
    if (!quiz) return [];

    if (Array.isArray(quiz)) return quiz;

    if (Array.isArray(quiz.data)) return quiz.data;

    if (quiz.questions && Array.isArray(quiz.questions)) return quiz.questions;

    if (typeof quiz === "object" && quiz !== null) {
      const possibleArrays = Object.values(quiz).filter(Array.isArray);
      if (possibleArrays.length > 0) return possibleArrays[0];

      if (quiz.id && (quiz.question || quiz.content)) return [quiz];
    }

    console.error("Unable to process quiz data into array format:", quiz);
    return [];
  }, [quiz]);

  const questionsArray = processQuizData();

  useEffect(() => {
    if (questionsArray && questionsArray.length > 0) {
      setData((prev) => ({
        ...prev,
        total_mcqs: questionsArray.length || prev.total_mcqs,
      }));
    }
  }, [questionsArray]);

  const handleEndSessionClick = () => {
    if (result || isCompletingSession) return;
    setShowConfirmationPopup(true);
  };

  const confirmEndSession = async () => {
    setShowConfirmationPopup(false);
    await handleSessionCompletion();
  };

  const cancelEndSession = () => {
    setShowConfirmationPopup(false);
  };

  if (isLoading || loadingDetails) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#FF6FAF]">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#FF6FAF] text-white p-10">
        <h2 className="text-2xl font-bold mb-4">Error Loading Quiz</h2>
        <p className="text-center mb-4">
          {error.message ||
            "Could not fetch quiz questions. Please try again later."}
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

  const totalQuestions =
    SeasonDetails?.number_of_questions || questionsArray.length || 0;

  if (!isLoading && (!questionsArray || questionsArray.length === 0)) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#FF6FAF] text-white p-10">
        <h2 className="text-2xl font-bold mb-4">No Questions Found</h2>
        <p className="text-center mb-4">
          There are no questions available for this training session.
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

  return (
    <div className="absolute inset-0 z-50 bg-[#FF6FAF] px-[80px] py-[30px] pb-[96px] flex flex-col gap-10 max-md:px-[20px] overflow-hidden">
      <div className="flex items-center justify-between">
        <Image src={logo} alt="logo" className="w-[140px] max-md:w-[120px]" />
        {!result && (
          <button
            onClick={handleEndSessionClick}
            className={`font-medium text-[13px] text-[#FFFFFF] rounded-[20px] px-[26px] py-[6px] border-[2px] border-[#FFFFFF] hover:bg-white hover:text-[#FF6FAF] transition-colors ${
              isCompletingSession ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isCompletingSession || result}
          >
            {isCompletingSession ? "Ending..." : "End Season"}
          </button>
        )}
      </div>

      {questionsArray.length > 0 && !result && (
        <Quiz
          data={questionsArray}
          Progress={Progress}
          answer={answer}
          data1={{ ...data, total_mcqs: totalQuestions }}
          setData={setData}
          setResult={setResult}
          setAnswer={setAnswer}
          trainingSessionId={trainingSessionId}
          handleSessionCompletion={handleSessionCompletion}
          totalQuestions={totalQuestions}
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