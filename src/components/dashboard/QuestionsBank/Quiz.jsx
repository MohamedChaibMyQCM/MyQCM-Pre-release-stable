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

const Quiz = ({
  data,
  Progress,
  answer,
  data1,
  setData,
  setResult,
  setAnswer,
  trainingSessionId,
  handleSessionCompletion,
}) => {
  const [checkAnswer, setCheckAnswer] = useState(true);
  const [seeExplanation, setSeeExplanation] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(
    data[0]?.estimated_time || 0
  );
  const [submittedAnswer, setSubmittedAnswer] = useState(null);
  const [processedAnswers] = useState(new Set());
  const [showSkipPopup, setShowSkipPopup] = useState(false);
  const timerRef = useRef(null);

  const handleOptionClick = (option) => {
    if (submittedAnswer) return;

    setSelectedOptions((prevSelected) => {
      if (data[selectedQuiz]?.type === "qcs") {
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

  const getBackgroundColor = (ratio) => {
    if (submittedAnswer != null) {
      const res = ratio * 100;
      if (res >= 0 && res < 30) return "bg-red-600";
      if (res >= 30 && res < 70) return "bg-[#ECD14E]";
      return "bg-[#53DF83]";
    } else {
      return "bg-[#FFFFFF]";
    }
  };

  const formik = useFormik({
    initialValues: {
      mcq: data[selectedQuiz]?.id,
      response_options: selectedOptions,
      response: "",
      time_spent: data[selectedQuiz]?.estimated_time,
    },
    onSubmit: async (values) => {
      if (processedAnswers.has(data[selectedQuiz]?.id) || submittedAnswer) {
        return;
      }

      clearInterval(timerRef.current);
      let quizData = data[selectedQuiz];
      if (!quizData) {
        return;
      }

      const timeSpent = (quizData.estimated_time || 0) - timeRemaining;

      try {
        const payload = {
          mcq: values.mcq,
          time_spent: timeSpent > 0 ? timeSpent : 0,
        };

        // Handle different question types appropriately
        if (quizData.type === "qcm" || quizData.type === "qcs") {
          payload.response_options = values.response_options;
          payload.response = values.response;
        } else {
          // For QROC, ensure we have at least an empty array for response_options
          payload.response_options = [];
          payload.response = values.response;
        }

        const responseData = await Progress(payload);

        setSubmittedAnswer(responseData);
        setCheckAnswer(false);

        if (!processedAnswers.has(quizData.id)) {
          const successRatio = responseData?.success_ratio;
          if (successRatio === 1) {
            setData((prevData) => ({
              ...prevData,
              mcqs_success: (prevData.mcqs_success || 0) + 1,
            }));
          } else if (successRatio === 0) {
            setData((prevData) => ({
              ...prevData,
              mcqs_failed: (prevData.mcqs_failed || 0) + 1,
            }));
          }
          processedAnswers.add(quizData.id);
        }
      } catch (error) {
        console.error("Error submitting answer:", error);
      }
    },
  });

  useEffect(() => {
    formik.setFieldValue("response_options", selectedOptions);
  }, [selectedOptions]);

  useEffect(() => {
    formik.setFieldValue("mcq", data[selectedQuiz]?.id);
    formik.setFieldValue("response", "");
    formik.setFieldValue("time_spent", data[selectedQuiz]?.estimated_time || 0);
  }, [data, selectedQuiz]);

  useEffect(() => {
    clearInterval(timerRef.current);
    const currentQuestionTime = data[selectedQuiz]?.estimated_time || 0;
    setTimeRemaining(currentQuestionTime);

    if (!submittedAnswer && !processedAnswers.has(data[selectedQuiz]?.id)) {
      if (currentQuestionTime > 0) {
        timerRef.current = setInterval(() => {
          setTimeRemaining((prevTime) => {
            if (prevTime <= 1) {
              clearInterval(timerRef.current);
              handleConfirmSkip(true);
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
      } else {
        setTimeRemaining(0);
      }
    } else {
      if (submittedAnswer) {
        // Timer stops
      } else {
        setTimeRemaining(0); // Skipped
      }
    }

    return () => clearInterval(timerRef.current);
  }, [selectedQuiz, data, submittedAnswer]);

  const triggerSkipPopup = () => {
    if (!checkAnswer) return;
    setShowSkipPopup(true);
  };

  const handleConfirmSkip = async (isTimeout = false) => {
    clearInterval(timerRef.current);
    if (
      selectedQuiz >= data.length ||
      processedAnswers.has(data[selectedQuiz]?.id)
    ) {
      setShowSkipPopup(false);
      return;
    }

    if (!processedAnswers.has(data[selectedQuiz]?.id)) {
      setData((prevData) => ({
        ...prevData,
        mcqs_skipped: (prevData.mcqs_skipped || 0) + 1,
      }));
      processedAnswers.add(data[selectedQuiz]?.id);
    }

    setShowSkipPopup(false);

    if (selectedQuiz < data.length - 1) {
      setSelectedQuiz((prevQuiz) => prevQuiz + 1);
      resetQuestionState();
    } else {
      await handleSessionCompletion();
      setResult(true);
    }
  };

  const handleCancelSkip = () => {
    setShowSkipPopup(false);
  };

  const resetQuestionState = () => {
    setSelectedOptions([]);
    setSubmittedAnswer(null);
    setSeeExplanation(false);
    setCheckAnswer(true);
    setAnswer(null);
    formik.setFieldValue("response_options", []);
    formik.setFieldValue("response", "");
  };

  const handleNextQuestion = async () => {
    if (selectedQuiz < data.length - 1) {
      setSelectedQuiz((prev) => prev + 1);
      resetQuestionState();
    } else {
      try {
        await handleSessionCompletion();
        setResult(true);
      } catch (error) {
        console.error("Error completing session:", error);
      }
      setSeeExplanation(false);
    }
  };

  if (selectedQuiz >= data.length) {
    return null;
  }

  const qroBgColorClass =
    submittedAnswer && answer
      ? getBackgroundColor(answer?.success_ratio)
      : "bg-[#FFFFFF]";
  const qroTextColorClass =
    submittedAnswer && answer ? "text-[#FFFFFF]" : "text-[#49465F]";

  const getOptionStyling = (optionId) => {
    let classes = "";
    const isSelectedByUser = selectedOptions.some(
      (selected) => selected.option == optionId
    );

    if (submittedAnswer && answer) {
      const selectedOptionData = answer.selected_options?.find(
        (o) => o.id == optionId
      );

      if (selectedOptionData) {
        if (selectedOptionData.is_correct) {
          classes = "border-[#47B881] text-[#47B881]";
        } else {
          classes = "border-[#F64C4C] text-[#F64C4C]";
        }
        classes += " bg-white";
      } else {
        classes =
          "border-[#EFEEFC] text-[#191919] bg-white pointer-events-none opacity-70";
      }
    } else {
      if (isSelectedByUser) {
        classes = "bg-[#FFF5FA] text-[#F8589F] border-[#F8589F]";
      } else {
        classes = "border-[#EFEEFC] text-[#191919] bg-white hover:bg-gray-50";
      }
      classes += " cursor-pointer";
    }
    return classes;
  };

  const getOptionIcon = (optionId) => {
    if (!submittedAnswer || !answer) return null;

    const selectedOptionData = answer.selected_options?.find(
      (o) => o.id == optionId
    );

    if (selectedOptionData) {
      if (selectedOptionData.is_correct) {
        return (
          <IoIosCheckmarkCircle className="w-[20px] h-[20px] text-[#47B881]" />
        );
      } else {
        return (
          <IoCloseCircleOutline className="w-[20px] h-[20px] text-[#F64C4C]" />
        );
      }
    }
    return null;
  };

  if (!data || selectedQuiz >= data.length) {
    return <div>Loading question...</div>;
  }

  return (
    <div className="relative bg-[#FFFFFF] w-[70%] rounded-[16px] mx-auto my-auto p-[20px] flex flex-col gap-6 max-md:w-[100%] z-[50] overflow-y-auto scrollbar-hide">
      <div className="flex items-center justify-between flex-wrap gap-y-2 ">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-[#FF6EAF] flex items-center gap-2 rounded-[8px] px-[16px] py-[7px]">
            <Image src={solver} alt="solver" className="w-[20px]" />
            <span className="text-[13px] text-[#FFFFFF]">
              Type:{" "}
              <span className="uppercase">{data[selectedQuiz]?.type}</span>
            </span>
          </div>
          <div className="relative w-[160px] h-[7px] bg-[#85849436] rounded-[20px] overflow-hidden max-md:hidden">
            <div
              className="absolute top-0 left-0 h-full bg-[#FF6EAF] rounded-[20px] transition-all duration-500 ease-in-out"
              style={{
                width: `${((selectedQuiz + 1) / (data.length || 1)) * 100}%`,
              }}
            ></div>
          </div>
          <span
            className={`px-[18px] py-[7px] rounded-[8px] text-[#FFFFFF] text-[14px] max-md:hidden ${
              data[selectedQuiz]?.difficulty === "easy"
                ? "bg-[#47B881]"
                : data[selectedQuiz]?.difficulty === "medium"
                ? "bg-[#FFAA60]"
                : "bg-[#F64C4C]"
            }`}
          >
            {data[selectedQuiz]?.difficulty}
          </span>
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
              {selectedQuiz + 1}/{data.length || 1}{" "}
            </span>
          </span>
          <div
            className="font-Poppins text-[#191919] font-medium prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: data[selectedQuiz]?.question || "",
            }}
          />
        </div>
        {data[selectedQuiz]?.attachment && (
          <div className="lg:w-[360px] flex-shrink-0">
            <Image
              src={data[selectedQuiz]?.attachment}
              alt="Quiz attachment"
              className="w-full h-auto object-contain rounded"
              width={360}
              height={240}
              priority={selectedQuiz < 2}
            />
          </div>
        )}
      </div>

      <form className="flex flex-col gap-4" onSubmit={formik.handleSubmit}>
        {data[selectedQuiz]?.type === "qcm" ||
        data[selectedQuiz]?.type === "qcs" ? (
          <ul className="flex flex-col gap-4">
            {data[selectedQuiz]?.options.map((item) => {
              const styling = getOptionStyling(item.id);
              const icon = getOptionIcon(item.id);

              return (
                <li
                  key={item.id}
                  className={`text-[14px] flex items-center justify-between gap-2 font-Poppins font-medium border rounded-[16px] px-[20px] py-[8px] transition-colors duration-150 ${styling}`}
                  onClick={() => handleOptionClick(item)}
                >
                  <span
                    className={`text-[14px] flex-1`}
                    dangerouslySetInnerHTML={{ __html: item.content || "" }}
                  />
                  {icon}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="relative">
            <Input
              name="response"
              className={`font-Poppins font-medium placeholder:text-[13px] text-[13px] px-[16px] py-[19px] rounded-[14px] border-[1.6px] ${
                submittedAnswer && answer
                  ? answer.success_ratio === 1
                    ? "border-green-600 text-green-600"
                    : "border-red-600 text-red-600"
                  : "border-[#EFEEFC] text-[#49465F]"
              } bg-white`}
              placeholder="Write Your Answer"
              value={formik.values.response}
              onChange={formik.handleChange}
              disabled={!!submittedAnswer}
            />
            {submittedAnswer && answer && (
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
            className=" text-[#F8589F] font-[500] text-[13px] disabled:text-gray-400 disabled:cursor-not-allowed"
            disabled={!checkAnswer}
          >
            Skip Question
          </button>
          {checkAnswer ? (
            <button
              type="submit"
              className="bg-[#F8589F] text-[#FFFFFF] font-medium text-[13px] px-[16px] py-[8px] rounded-[24px] hover:opacity-90 transition-opacity disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={
                (data[selectedQuiz]?.type === "qcm" ||
                  data[selectedQuiz]?.type === "qcs") &&
                selectedOptions.length === 0
                  ? true
                  : data[selectedQuiz]?.type !== "qcm" &&
                    data[selectedQuiz]?.type !== "qcs" &&
                    !formik.values.response?.trim()
                  ? true
                  : false
              }
            >
              Check Answer
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSeeExplanation(true)}
              className="bg-[#F8589F] text-[#FFFFFF] font-medium text-[13px] px-[16px] py-[8px] rounded-[24px] hover:opacity-90 transition-opacity"
            >
              {data[selectedQuiz]?.type === "qcm" ||
              data[selectedQuiz]?.type === "qcs"
                ? "See Explanation"
                : "See Analyse"}
            </button>
          )}
        </div>
      </form>

      {showSkipPopup && (
        <SkipQuestionPopup
          onConfirmSkip={handleConfirmSkip}
          onCancelSkip={handleCancelSkip}
        />
      )}

      {seeExplanation && submittedAnswer && answer && (
        <QuizExplanation
          QuizData={submittedAnswer}
          setSeeExplanation={setSeeExplanation}
          handleNextQuestion={handleNextQuestion}
          type={data[selectedQuiz]?.type}
          selectedQuiz={selectedQuiz}
          length={data.length}
        />
      )}
    </div>
  );
};

export default Quiz;
