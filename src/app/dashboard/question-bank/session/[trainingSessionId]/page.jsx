"use client";
import Image from "next/image";
import logo from "../../../../../../public/whiteLogo.svg";
import { QuizImage } from "@/data/data";
import Quiz from "@/components/dashboard/QuestionsBank/Quiz";
import BaseUrl from "@/components/BaseUrl";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import QuizResult from "@/components/dashboard/QuestionsBank/QuizResult";
import toast from "react-hot-toast";
import EndSeasonPopup from "@/components/dashboard/QuestionsBank/EndSeasonPopup";
import { useParams } from "next/navigation";
import secureLocalStorage from "react-secure-storage";
import Loading from "@/components/Loading";
import { completeTrainingSession } from "@/utils/api";

const Page = () => {
  const [answer, setAnswer] = useState();
  const [completionCalled, setCompletionCalled] = useState(false);
  const [result, setResult] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const { trainingSessionId } = useParams();

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
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    },
  });

  const { mutateAsync: Progress } = useMutation({
    mutationFn: async (data) => {
      const token = secureLocalStorage.getItem("token");
      // Ensure response_options is always an array with at least one element
      const response_options =
        data.response_options && data.response_options.length > 0
          ? data.response_options
          : null;
      console.log("Response options:", response_options);
      console.log(data);

      const submitResponse = await BaseUrl.post(
        `/mcq/submit/${data.mcq}`,
        {
          response_options: response_options,
          response: data.response || "",
          time_spent: data.time_spent || 0,
          session: trainingSessionId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return submitResponse.data.data;
    },
    onSuccess: (data) => {
      setAnswer(data);
    },
    onError: (error) => {
      console.error("Submission error:", error);
      const message = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message[0]
        : error?.response?.data?.message || "Failed to submit answer";
      toast.error(message);
    },
  });

  const [data, setData] = useState({
    mcqs_success: 0,
    mcqs_failed: 0,
    mcqs_skipped: 0,
    total_mcqs: 0,
    accuracy: 0,
    xp_earned: 0,
  });

  const handleSessionCompletion = async () => {
    if (completionCalled) return;
    try {
      const response = await completeTrainingSession(trainingSessionId);
      setData((prev) => ({
        ...prev,
        ...response.data,
        total_mcqs: quiz?.data?.length || 0,
      }));
      setCompletionCalled(true);
      console.log(response.data);
      return response.data;
    } catch (error) {
      toast.error("Failed to mark session as complete");
      throw error;
    }
  };

  useEffect(() => {
    if (quiz?.data) {
      setData((prev) => ({
        ...prev,
        total_mcqs: quiz.data.length,
      }));
    }
  }, [quiz]);

  const handleEndSessionClick = () => {
    setShowConfirmationPopup(true);
  };

  const confirmEndSession = async () => {
    try {
      await handleSessionCompletion();
      setResult(true);
    } catch (error) {
      console.error("Error ending session:", error);
    } finally {
      setShowConfirmationPopup(false);
    }
  };

  const cancelEndSession = () => {
    setShowConfirmationPopup(false);
  };

  if (isLoading) {
    return (
      <div className="absolute h-[100vh] w-screen z-50 top-0 left-0 bg-[#FF6FAF] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute h-[100vh] w-screen z-50 top-0 left-0 bg-[#FF6FAF] flex items-center justify-center">
        <p className="text-white">Error loading quiz: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="absolute h-[100vh] w-screen z-50 top-0 left-0 bg-[#FF6FAF] px-[80px] py-[30px] pb-[96px] flex flex-col gap-10 max-md:px-[20px] overflow-hidden">
      <div className="flex items-center justify-between">
        <Image src={logo} alt="logo" className="w-[140px] max-md:w-[120px]" />
        <button
          onClick={handleEndSessionClick}
          className="font-Inter font-medium text-[13px] text-[#FFFFFF] rounded-[20px] px-[26px] py-[6px] border-[2px] border-[#FFFFFF] hover:bg-white hover:text-[#FF6FAF] transition-colors"
          disabled={result}
        >
          End Season
        </button>
      </div>

      {quiz?.data && !result && (
        <Quiz
          data={quiz.data}
          Progress={Progress}
          answer={answer}
          data1={data}
          setData={setData}
          setResult={setResult}
          setAnswer={setAnswer}
          trainingSessionId={trainingSessionId}
          handleSessionCompletion={handleSessionCompletion}
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

      {result && <QuizResult length={quiz?.data?.length} data={data} />}
    </div>
  );
};

export default Page;