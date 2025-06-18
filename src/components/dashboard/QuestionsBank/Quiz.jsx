"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import timer from "../../../../public/Quiz/Timer.svg";
import solver from "../../../../public/Quiz/solver.svg";
import { Input } from "@/components/ui/input";
import QuizExplanation from "./QuizExplanation";
import { useFormik } from "formik";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { IoCloseCircleOutline } from "react-icons/io5";
import SkipQuestionPopup from "./SkipQuestionPopup";
import think1 from "../../../../public/Question_Bank/think1.svg";
import toast from "react-hot-toast";

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
  const [timeRemaining, setTimeRemaining] = useState(
    questionData?.estimated_time || 0
  );
  const [showSkipPopup, setShowSkipPopup] = useState(false);
  const [skipInitiatedByTimeout, setSkipInitiatedByTimeout] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [thinkAnimating, setThinkAnimating] = useState(false);
  const timerRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    setCheckAnswer(true);
    setSeeExplanation(false);
    setSelectedOptions([]);
    setAnswer(null);
    const initialTime = questionData?.estimated_time || 0;
    setTimeRemaining(initialTime);
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

      const initialTime = questionData?.estimated_time || 0;
      const calculatedTimeSpent = initialTime - timeRemaining;
      const timeSpent = Math.max(0, calculatedTimeSpent);

      try {
        const payload = {
          mcq: questionData.id,
          time_spent: timeSpent,
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
    <div className="relative bg-[#FFFFFF] w-[70%] rounded-[16px] mx-auto my-auto p-[20px] flex flex-col gap-6 max-md:w-[100%] z-[50] overflow-y-auto scrollbar-hide max-xl:w-[90%]">
      <div className="flex items-center justify-between flex-wrap gap-y-2 ">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-[#FF6EAF] flex items-center gap-2 rounded-[8px] px-[16px] py-[7px]">
            <Image src={solver} alt="solver" className="w-[20px]" />
            <span className="text-[13px] text-[#FFFFFF]">
              Type: <span className="uppercase">{questionData?.type}</span>
            </span>
          </div>
          <div className="relative w-[160px] h-[7px] bg-[#85849436] rounded-[20px] overflow-hidden max-md:hidden">
            <div
              className="absolute top-0 left-0 h-full bg-[#FF6EAF] rounded-[20px] transition-all duration-300 ease-in-out"
              style={{
                width: `${
                  totalQuestions > 0
                    ? (currentQuestionNumber / totalQuestions) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>
          <span
            className={`px-[18px] py-[7px] rounded-[8px] text-[#FFFFFF] text-[14px] max-md:hidden ${
              questionData?.difficulty === "easy"
                ? "bg-[#47B881]"
                : questionData?.difficulty === "medium"
                ? "bg-[#FFAA60]"
                : "bg-[#F64C4C]"
            }`}
          >
            {questionData?.difficulty?.charAt(0).toUpperCase() +
              questionData?.difficulty?.slice(1)}
          </span>
          <Image
            src={think1}
            alt="think"
            className={`ml-2 max-md:w-[30px] ${
              thinkAnimating ? "animate-pulse-scale" : ""
            }`}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-[#B5BEC6]">
            Time Remaining{" "}
            <span className="text-[#FF6EAF] font-semibold">
              ({timeRemaining}s)
            </span>
          </span>
          <Image src={timer} alt="timer" className="w-[24px] max-md:hidden" />
        </div>
      </div>
      <div className="flex gap-8 justify-between flex-col lg:flex-row">
        <div className="flex-1">
          <span className="block font-Poppins text-[#666666] text-[13px] font-medium mb-2">
            QUESTION{" "}
            <span className="text-[#F8589F]">
              {currentQuestionNumber}/{totalQuestions || "?"}
            </span>
          </span>
          <div
            className="font-Poppins text-[#191919] font-medium prose max-w-none"
            dangerouslySetInnerHTML={{ __html: questionData?.question || "" }}
          />
        </div>
        {questionData?.attachment && (
          <div className="lg:w-[360px] flex-shrink-0">
            <Image
              src={questionData.attachment}
              alt="Quiz attachment"
              className="w-[260px] h-auto object-contain rounded"
              width={360}
              height={240}
              priority={currentQuestionNumber < 3}
            />
          </div>
        )}
      </div>
      <form className="flex flex-col gap-4" onSubmit={formik.handleSubmit}>
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
                  className={`text-[14px] flex items-center justify-between gap-2 font-Poppins font-medium border rounded-[16px] px-[20px] py-[8px] transition-colors duration-150 ${styling} ${
                    !checkAnswer ? "cursor-default" : ""
                  }`}
                  onClick={
                    checkAnswer ? () => handleOptionClick(item) : undefined
                  }
                >
                  <span
                    className={`flex-1`}
                    dangerouslySetInnerHTML={{ __html: item.content || "" }}
                  />
                  {icon}
                </li>
              );
            })}
          </ul>
        )}

        {questionData?.type !== "qcm" && questionData?.type !== "qcs" && (
          <div className="relative">
            <Input
              name="response"
              className={`font-Poppins font-medium placeholder:text-[13px] text-[13px] px-[16px] py-[19px] rounded-[14px] border-[1.6px] bg-white ${
                !checkAnswer
                  ? getBackgroundColor(answer?.success_ratio)
                  : "border-[#EFEEFC] text-[#49465F]"
              }`}
              placeholder="Write Your Answer"
              value={formik.values.response}
              onChange={formik.handleChange}
              disabled={!checkAnswer || isSubmitting}
            />
            {!checkAnswer && answer && answer.success_ratio !== undefined && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {answer.success_ratio === 1 ? (
                  <IoIosCheckmarkCircle className="w-[20px] h-[20px] text-green-600" />
                ) : (
                  <IoCloseCircleOutline className="w-[20px] h-[20px] text-red-600" />
                )}
              </div>
            )}
          </div>
        )}

        <div className="self-end flex items-center gap-4 mt-3">
          <button
            type="button"
            onClick={triggerSkipPopup}
            className="text-[#F8589F] font-[500] text-[13px] disabled:text-gray-400 disabled:cursor-not-allowed"
            disabled={
              !checkAnswer || isSubmitting || isLoadingNextMcq || isSkipping
            }
          >
            {isSkipping ? "Skipping..." : "Skip Question"}
          </button>
          {checkAnswer ? (
            <button
              type="submit"
              className="bg-[#F8589F] text-[#FFFFFF] font-medium text-[13px] px-[16px] py-[8px] rounded-[24px] hover:opacity-90 transition-opacity disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={isSubmitDisabled}
            >
              {isSubmitting ? "Checking..." : "Check Answer"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSeeExplanationOrNext}
              className="bg-[#F8589F] text-[#FFFFFF] font-medium text-[13px] px-[16px] py-[8px] rounded-[24px] hover:opacity-90 transition-opacity disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={isLoadingNextMcq}
            >
              {isLoadingNextMcq
                ? "Loading Next..."
                : ["qcm", "qcs", "qroc"].includes(questionData?.type)
                ? "See Explanation"
                : isFinalQuestion
                ? "Finish Session"
                : "Next Question"}
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
      {seeExplanation &&
        !checkAnswer &&
        answer && (
          <QuizExplanation
            QuizData={answer}
            setSeeExplanation={setSeeExplanation}
            handleNextQuestion={handleNextFromExplanation}
            type={questionData?.type}
          />
        )}
    </div>
  );
};

export default Quiz;