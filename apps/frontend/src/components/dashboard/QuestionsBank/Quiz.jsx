"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import solver from "../../../../public/Quiz/solver.svg";
import { Input } from "@/components/ui/input";
import QuizExplanation from "./QuizExplanation";
import { useFormik } from "formik";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { IoCloseCircleOutline } from "react-icons/io5";
import SkipQuestionPopup from "./SkipQuestionPopup";
import think1 from "../../../../public/Question_Bank/think1.svg";
import toast from "react-hot-toast";
import FeedbackPopup from "./feedback/FeedbackPopup";
import { useFeedbackSurvey } from "@/hooks/useFeedbackSurvey";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import SegmentedTimerMyQCM from "./SegmentedTimerMyQCM";

const Quiz = ({
  questionData,
  Progress,
  isSubmitting,
  answer,
  setAnswer,
  setData,
  isFinalQuestion,
  fetchNextMcq,
  isLoadingNextMcq,
  handleSessionCompletion,
  totalQuestions,
  currentQuestionNumber,
}) => {
  const [checkAnswer, setCheckAnswer] = useState(true);
  const [seeExplanation, setSeeExplanation] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [initialTime, setInitialTime] = useState(
    questionData?.estimated_time || 0
  );
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [showSkipPopup, setShowSkipPopup] = useState(false);
  const [skipInitiatedByTimeout, setSkipInitiatedByTimeout] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [thinkAnimating, setThinkAnimating] = useState(false);
  const timerRef = useRef(null);
  const isMounted = useRef(true);

  const { data: subscriptionData } = useUserSubscription();

  const remainingQrocs = subscriptionData
    ? Math.max(
        0,
        (subscriptionData?.plan?.qrocs ?? 0) -
          (subscriptionData?.used_qrocs ?? 0)
      )
    : 0;

  const { activeSurvey, closeSurvey, resetSurveys } =
    useFeedbackSurvey(remainingQrocs);

  // Debug effect
  useEffect(() => {
    console.log("Quiz component - activeSurvey changed:", activeSurvey);
  }, [activeSurvey]);

  useEffect(() => {
    console.log("Quiz component - remainingQrocs changed:", remainingQrocs);
  }, [remainingQrocs]);

  useEffect(() => {
    isMounted.current = true;
    setCheckAnswer(true);
    setSeeExplanation(false);
    setSelectedOptions([]);
    setAnswer(null);
    const newInitialTime = questionData?.estimated_time || 0;
    setInitialTime(newInitialTime);
    setTimeRemaining(newInitialTime);
    setShowSkipPopup(false);
    setSkipInitiatedByTimeout(false);

    formik.resetForm({
      values: {
        mcq: questionData?.id,
        response_options: [],
        response: "",
        time_spent: 0,
      },
    });

    clearInterval(timerRef.current);
    timerRef.current = null;

    return () => {
      isMounted.current = false;
      clearInterval(timerRef.current);
    };
  }, [questionData, setAnswer]);

  useEffect(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;

    if (isMounted.current && checkAnswer && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        if (isMounted.current) {
          setTimeRemaining((prevTime) => {
            if (prevTime <= 1) {
              clearInterval(timerRef.current);
              timerRef.current = null;
              if (isMounted.current) {
                setSkipInitiatedByTimeout(true);
                setShowSkipPopup(true);
              }
              return 0;
            }
            return prevTime - 1;
          });
        } else {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }, 1000);
    } else if (!checkAnswer) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [checkAnswer, timeRemaining]);

  const handleOptionClick = (option) => {
    if (!checkAnswer) return;

    setSelectedOptions((prevSelected) => {
      if (questionData?.type === "qcs") {
        return [{ option: option.id }];
      } else {
        const isAlreadySelected = prevSelected.some(
          (selectedOption) => selectedOption.option === option.id
        );
        if (isAlreadySelected) {
          return prevSelected.filter(
            (selectedOption) => selectedOption.option !== option.id
          );
        } else {
          return [...prevSelected, { option: option.id }];
        }
      }
    });
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      mcq: questionData?.id || "",
      response_options: [],
      response: "",
      time_spent: 0,
    },
    onSubmit: async (values) => {
      if (!checkAnswer || isSubmitting) return;
      clearInterval(timerRef.current);
      timerRef.current = null;

      if (questionData?.type === "qroc" && isMounted.current) {
        setThinkAnimating(true);
      }

      const calculatedTimeSpent = initialTime - timeRemaining;
      const timeSpent = Math.max(0, calculatedTimeSpent);

      try {
        const payload = {
          mcq: questionData.id,
          time_spent: timeSpent,
          questionType: questionData.type,
        };

        if (questionData.type === "qcm" || questionData.type === "qcs") {
          payload.response_options = selectedOptions;
          payload.response = null;
        } else {
          payload.response_options = null;
          payload.response = values.response.trim();
        }

        await Progress(payload);

        if (isMounted.current) {
          setCheckAnswer(false);
          setThinkAnimating(false);
        }
      } catch (error) {
        toast.error("Submission failed. Please try again.");
        if (isMounted.current) {
          setThinkAnimating(false);
        }
      }
    },
  });

  useEffect(() => {
    if (questionData?.type === "qcm" || questionData?.type === "qcs") {
      formik.setFieldValue("response_options", selectedOptions);
    }
  }, [selectedOptions, questionData?.type]);

  const getBackgroundColor = (ratio) => {
    if (answer != null && ratio !== undefined && ratio !== null) {
      const res = ratio * 100;
      if (res >= 0 && res < 30) return "border-red-600 text-red-600";
      if (res >= 30 && res < 70) return "border-[#ECD14E] text-[#CDA70C]";
      return "border-green-600 text-green-600";
    } else {
      return "border-[#EFEEFC] text-[#49465F]";
    }
  };

  const triggerSkipPopup = () => {
    if (!checkAnswer || isSubmitting || isLoadingNextMcq) return;
    setSkipInitiatedByTimeout(false);
    setShowSkipPopup(true);
  };

  const handleConfirmSkip = async () => {
    if (!isMounted.current) return;
    clearInterval(timerRef.current);
    timerRef.current = null;
    setShowSkipPopup(false);

    if (isFinalQuestion) {
      handleSessionCompletion();
      return;
    }

    try {
      setIsSkipping(true);

      setData((prevData) => ({
        ...prevData,
        mcqs_skipped: (prevData.mcqs_skipped || 0) + 1,
      }));

      const skipPayload = {
        mcq: questionData.id,
        time_spent: 0,
        is_skipped: true,
      };

      // When skipping, we don't need to send response options or response
      // as the backend handles this specially for skipped questions
      await Progress(skipPayload);

      fetchNextMcq();
    } catch (error) {
      console.error("Skip error:", error);
      toast.error("Failed to skip question. Please try again.");

      setData((prevData) => ({
        ...prevData,
        mcqs_skipped: Math.max(0, (prevData.mcqs_skipped || 0) - 1),
      }));
    } finally {
      setIsSkipping(false);
    }
  };

  const handleCancelSkip = () => {
    if (skipInitiatedByTimeout) {
      handleConfirmSkip();
    } else {
      setShowSkipPopup(false);
    }
  };

  const handleSeeExplanationOrNext = () => {
    const canSeeExplanation = ["qcm", "qcs", "qroc"].includes(
      questionData?.type
    );
    if (canSeeExplanation) {
      setSeeExplanation(true);
    } else {
      if (!isFinalQuestion) {
        fetchNextMcq();
      } else {
        handleSessionCompletion();
      }
    }
  };

  const handleNextFromExplanation = () => {
    setSeeExplanation(false);
    if (!isFinalQuestion) {
      fetchNextMcq();
    } else {
      handleSessionCompletion();
    }
  };

  const getOptionStyling = (optionId) => {
    let classes = "border-[#EFEEFC] text-[#191919] bg-white";
    const isSelectedByUser = selectedOptions.some(
      (selected) => selected.option == optionId
    );

    if (!checkAnswer && answer) {
      const selectedOptionData = answer.selected_options?.find(
        (o) => o.id == optionId
      );
      const isCorrect = answer.correct_options?.some(
        (co) => co.id === optionId
      );

      if (selectedOptionData) {
        classes = selectedOptionData.is_correct
          ? "border-[#47B881] text-[#47B881]"
          : "border-[#F64C4C] text-[#F64C4C]";
      } else {
        if (isCorrect) {
          classes = "border-[#EFEEFC] text-[#191919] bg-white";
        } else {
          classes += " pointer-events-none opacity-70";
        }
      }
      classes += " bg-white";
    } else {
      if (isSelectedByUser) {
        classes = "bg-[#FFF5FA] text-[#F8589F] border-[#F8589F]";
      } else {
        classes += " hover:bg-gray-50";
      }
      classes += " cursor-pointer";
    }
    return classes;
  };

  const getOptionIcon = (optionId) => {
    if (checkAnswer || !answer) return null;

    const selectedOptionData = answer.selected_options?.find(
      (o) => o.id == optionId
    );

    if (selectedOptionData) {
      return selectedOptionData.is_correct ? (
        <IoIosCheckmarkCircle className="w-[20px] h-[20px] text-[#47B881]" />
      ) : (
        <IoCloseCircleOutline className="w-[20px] h-[20px] text-[#F64C4C]" />
      );
    } else {
      const isCorrectUnselected = answer.correct_options?.some(
        (co) => co.id === optionId
      );
      if (isCorrectUnselected) {
      }
    }
    return null;
  };

  const isSubmitDisabled =
    isSubmitting ||
    isLoadingNextMcq ||
    (questionData?.type === "qcm" || questionData?.type === "qcs"
      ? selectedOptions.length === 0
      : !formik.values.response?.trim());

  return (
    <div className="relative bg-[#FFFFFF] w-full max-w-[820px] rounded-[20px] mx-auto p-[24px] flex flex-col gap-6 max-md:max-w-none max-md:p-[16px] z-[50] overflow-y-auto shadow-lg">
      {/* Header with badges and timer */}
      <div className="flex items-center justify-between flex-wrap gap-y-3 max-md:gap-y-2">
        <div className="flex items-center gap-3 flex-wrap max-md:gap-2">
          {/* Question type badge */}
          <div className="bg-gradient-to-r from-[#FF6EAF] to-[#FF8EC7] flex items-center gap-2 rounded-[10px] px-[16px] py-[8px] shadow-sm max-md:px-[12px] max-md:py-[6px]">
            <Image
              src={solver}
              alt="solver"
              className="w-[16px] max-md:w-[14px]"
            />
            <span className="text-[12px] text-[#FFFFFF] font-medium tracking-wide max-md:text-[10px]">
              TYPE:{" "}
              <span className="uppercase font-semibold">
                {questionData?.type}
              </span>
            </span>
          </div>

          {/* Progress bar - hidden on mobile */}
          <div className="relative w-[180px] h-[8px] bg-[#F0F0F0] rounded-[20px] overflow-hidden max-md:hidden shadow-inner">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FF6EAF] to-[#FF8EC7] rounded-[20px] transition-all duration-500 ease-out"
              style={{
                width: `${
                  totalQuestions > 0
                    ? (currentQuestionNumber / totalQuestions) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>

          {/* Difficulty badge - hidden on mobile */}
          <span
            className={`px-[18px] py-[7px] rounded-[10px] text-[#FFFFFF] text-[12px] font-medium max-md:hidden shadow-sm ${
              questionData?.difficulty === "easy"
                ? "bg-gradient-to-r from-[#47B881] to-[#5AC99A]"
                : questionData?.difficulty === "medium"
                ? "bg-gradient-to-r from-[#FFAA60] to-[#FFB87A]"
                : "bg-gradient-to-r from-[#F64C4C] to-[#FF6B6B]"
            }`}
          >
            {questionData?.difficulty?.charAt(0).toUpperCase() +
              questionData?.difficulty?.slice(1)}
          </span>

          {/* Thinking animation */}
          <div className="flex items-center max-md:ml-1">
            <Image
              src={think1}
              alt="think"
              className={`w-[32px] h-[32px] max-md:w-[28px] max-md:h-[28px] ${
                thinkAnimating ? "animate-pulse-scale" : ""
              }`}
            />
          </div>
        </div>

        {initialTime > 0 && (
          <SegmentedTimerMyQCM
            total={initialTime}
            remaining={timeRemaining}
            running={checkAnswer && timeRemaining > 0}
            segments={4}
            warnFrom={0.25}
            barWidth={120}
            barHeight={8}
          />
        )}
      </div>

      {/* Question content */}
      <div className="flex gap-8 justify-between flex-col lg:flex-row">
        <div className="flex-1">
          <div className="mb-4 max-md:hidden">
            <span className="inline-block bg-[#F8F9FA] px-[12px] py-[6px] rounded-[8px] font-Poppins text-[#666666] text-[11px] font-semibold mb-3 tracking-wide">
              QUESTION{" "}
              <span className="text-[#F8589F]">
                {currentQuestionNumber}/{totalQuestions || "?"}
              </span>
            </span>
          </div>
          <div
            className="font-Poppins text-[#2C3E50] font-medium prose max-w-none text-[15px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: questionData?.question || "" }}
          />
        </div>

        {/* Attachment image */}
        {questionData?.attachment && (
          <div className="lg:w-[240px] flex-shrink-0 max-md:flex max-md:items-center max-md:justify-center max-md:mt-4">
            <div className="relative overflow-hidden rounded-[16px]">
              <Image
                src={questionData.attachment}
                alt="Quiz attachment"
                className="w-[280px] h-auto object-contain> max-md:w-[240px]"
                width={360}
                height={240}
                priority={currentQuestionNumber < 3}
              />
            </div>
          </div>
        )}
      </div>

      {/* Answer form */}
      <form className="flex flex-col gap-5 mt-2" onSubmit={formik.handleSubmit}>
        {/* Multiple choice options */}
        {(questionData?.type === "qcm" || questionData?.type === "qcs") && (
          <ul className="flex flex-col gap-4">
            {questionData?.options?.map((item) => {
              if (!item.content || item.content.trim() === ".") {
                return null;
              }

              const styling = getOptionStyling(item.id);
              const icon = getOptionIcon(item.id);

              return (
                <li
                  key={item.id}
                  className={`text-[14px] flex items-center justify-between gap-3 font-Poppins font-medium border-2 rounded-[18px] px-[24px] py-[14px] transition-all duration-200 hover:shadow-md ${styling} ${
                    !checkAnswer ? "cursor-default" : "cursor-pointer"
                  }`}
                  onClick={
                    checkAnswer ? () => handleOptionClick(item) : undefined
                  }
                >
                  <span
                    className="flex-1 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: item.content || "" }}
                  />
                  {icon}
                </li>
              );
            })}
          </ul>
        )}

        {/* Text input for QROC */}
        {questionData?.type !== "qcm" && questionData?.type !== "qcs" && (
          <div className="relative">
            <Input
              name="response"
              className={`font-Poppins font-medium placeholder:text-[13px] text-[14px] px-[20px] py-[20px] rounded-[16px] border-2 bg-white transition-all duration-200 focus:shadow-lg ${
                !checkAnswer
                  ? getBackgroundColor(answer?.success_ratio)
                  : "border-[#E9ECEF] text-[#2C3E50] focus:border-[#FF6EAF] focus:ring-0"
              }`}
              placeholder="Écrivez votre réponse ici..."
              value={formik.values.response}
              onChange={formik.handleChange}
              disabled={!checkAnswer || isSubmitting}
            />
            {!checkAnswer && answer && answer.success_ratio !== undefined && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                {answer.success_ratio === 1 ? (
                  <IoIosCheckmarkCircle className="w-[24px] h-[24px] text-green-600" />
                ) : (
                  <IoCloseCircleOutline className="w-[24px] h-[24px] text-red-600" />
                )}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-4 mt-0 max-md:flex-col max-md:gap-3 justify-end">
          {/* Skip button */}
          <button
            type="button"
            onClick={triggerSkipPopup}
            className="text-[#F8589F] font-medium text-[13px] hover:text-[#E74C8C] transition-colors disabled:text-gray-400 disabled:cursor-not-allowed max-md:order-2"
            disabled={
              !checkAnswer || isSubmitting || isLoadingNextMcq || isSkipping
            }
          >
            {isSkipping ? "Passage en cours..." : "Passer la question"}
          </button>

          {/* Main action button */}
          {checkAnswer ? (
            <button
              type="submit"
              className="bg-gradient-to-r from-[#F8589F] to-[#E74C8C] text-[#FFFFFF] font-semibold text-[13px] px-[24px] py-[11px] rounded-[28px] hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none max-md:order-1 max-md:w-full"
              disabled={isSubmitDisabled}
            >
              {isSubmitting ? "Vérification..." : "Vérifier la réponse"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSeeExplanationOrNext}
              className="bg-gradient-to-r from-[#F8589F] to-[#E74C8C] text-[#FFFFFF] font-semibold text-[13px] px-[28px] py-[12px] rounded-[28px] hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none max-md:order-1 max-md:w-full"
              disabled={isLoadingNextMcq}
            >
              {isLoadingNextMcq
                ? "Chargement..."
                : ["qcm", "qcs", "qroc"].includes(questionData?.type)
                ? "Voir l'explication"
                : isFinalQuestion
                ? "Terminer la session"
                : "Question suivante"}
            </button>
          )}
        </div>
      </form>
      {showSkipPopup && (
        <SkipQuestionPopup
          onConfirmSkip={handleConfirmSkip}
          onCancelSkip={handleCancelSkip}
          isTimeout={skipInitiatedByTimeout}
        />
      )}

      {seeExplanation && !checkAnswer && answer && (
        <QuizExplanation
          QuizData={answer}
          setSeeExplanation={setSeeExplanation}
          handleNextQuestion={handleNextFromExplanation}
          type={questionData?.type}
        />
      )}

      {activeSurvey && (
        <FeedbackPopup surveyType={activeSurvey} onClose={closeSurvey} />
      )}
    </div>
  );
};

export default Quiz;
