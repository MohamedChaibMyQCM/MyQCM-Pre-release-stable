"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import timer from "../../../../public/Quiz/Timer.svg"; // Ensure path is correct
import solver from "../../../../public/Quiz/solver.svg"; // Ensure path is correct
import { Input } from "@/components/ui/input"; // Ensure path is correct
import QuizExplanation from "./QuizExplanation";
import { useFormik } from "formik";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { IoCloseCircleOutline } from "react-icons/io5";
import SkipQuestionPopup from "./SkipQuestionPopup"; // Ensure path is correct
import think1 from "../../../../public/Question_Bank/think1.svg"; // Ensure path is correct
// import think2 from "../../../../public/Question_Bank/think2.svg"; // Removed as unused in original
import toast from "react-hot-toast"; // Keep import if used elsewhere, though not in this snippet

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
  const [selectedOptions, setSelectedOptions] = useState([]); // { option: id } format
  const [timeRemaining, setTimeRemaining] = useState(
    questionData?.estimated_time || 0
  );
  const [showSkipPopup, setShowSkipPopup] = useState(false);
  const [skipInitiatedByTimeout, setSkipInitiatedByTimeout] = useState(false);
  const timerRef = useRef(null);
  const isMounted = useRef(true);

  // Effect to reset state and timer on question change
  useEffect(() => {
    isMounted.current = true;
    setCheckAnswer(true);
    setSeeExplanation(false);
    setSelectedOptions([]);
    setAnswer(null); // Clear previous answer result
    const initialTime = questionData?.estimated_time || 0; // Default to 0 if undefined
    setTimeRemaining(initialTime);
    setShowSkipPopup(false);
    setSkipInitiatedByTimeout(false);

    formik.resetForm({
      values: {
        mcq: questionData?.id,
        response_options: [],
        response: "",
        time_spent: 0, // Reset time_spent, calculate on submit
      },
    });

    // Clear any existing timer
    clearInterval(timerRef.current);
    timerRef.current = null;

    return () => {
      // Cleanup on unmount or before next run
      isMounted.current = false;
      clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionData, setAnswer]); // Add setAnswer dependency

  // Effect for countdown timer
  useEffect(() => {
    clearInterval(timerRef.current); // Clear previous timer instance
    timerRef.current = null;

    // Start timer only if answering, time > 0, and mounted
    if (isMounted.current && checkAnswer && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        if (isMounted.current) {
          // Check mount status inside interval
          setTimeRemaining((prevTime) => {
            if (prevTime <= 1) {
              clearInterval(timerRef.current);
              timerRef.current = null;
              if (isMounted.current) {
                // Check again before state update
                setSkipInitiatedByTimeout(true);
                setShowSkipPopup(true);
              }
              return 0;
            }
            return prevTime - 1;
          });
        } else {
          clearInterval(timerRef.current); // Cleanup if unmounted during interval
          timerRef.current = null;
        }
      }, 1000);
    } else if (!checkAnswer) {
      // Ensure timer is stopped if answer is checked
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Cleanup function for this effect
    return () => {
      clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [checkAnswer, timeRemaining]); // Dependencies: run when checkAnswer or timeRemaining changes

  // Handle MCQ option selection
  const handleOptionClick = (option) => {
    if (!checkAnswer) return; // Ignore clicks after checking

    setSelectedOptions((prevSelected) => {
      if (questionData?.type === "qcs") {
        // Single choice: Replace selection
        return [{ option: option.id }];
      } else {
        // Multiple choice: Toggle selection
        const isAlreadySelected = prevSelected.some(
          (selectedOption) => selectedOption.option === option.id
        );
        if (isAlreadySelected) {
          // Deselect: filter out the clicked option
          return prevSelected.filter(
            (selectedOption) => selectedOption.option !== option.id
          );
        } else {
          // Select: add the new option
          return [...prevSelected, { option: option.id }];
        }
      }
    });
  };

  // Formik configuration for submission
  const formik = useFormik({
    enableReinitialize: true, // Allows form reset when questionData changes
    initialValues: {
      mcq: questionData?.id || "",
      response_options: [], // Will be populated from selectedOptions state for MCQ
      response: "", // For text input questions
      time_spent: 0, // Calculated during onSubmit
    },
    onSubmit: async (values) => {
      if (!checkAnswer || isSubmitting) return; // Prevent double submit
      clearInterval(timerRef.current); // Stop timer on submit
      timerRef.current = null;

      const initialTime = questionData?.estimated_time || 0;
      const calculatedTimeSpent = initialTime - timeRemaining;
      const timeSpent = Math.max(0, calculatedTimeSpent); // Ensure non-negative time

      try {
        // Construct the payload to send to the Progress function
        const payload = {
          mcq: questionData.id,
          time_spent: timeSpent,
        };

        if (questionData.type === "qcm" || questionData.type === "qcs") {
          payload.response_options = selectedOptions; // Use state for selected IDs
          payload.response = null; // Explicitly null for MCQ
        } else {
          payload.response_options = null; // Explicitly null for text types
          payload.response = values.response.trim(); // Send trimmed text
        }

        await Progress(payload); // Call the submission handler prop

        if (isMounted.current) {
          setCheckAnswer(false); // Update state to show results/next button
        }
      } catch (error) {
        console.error("Error submitting answer via Progress:", error);
        toast.error("Submission failed. Please try again."); // Optional error feedback
        // Consider re-enabling the checkAnswer state or timer if needed on error
        // if (isMounted.current) setCheckAnswer(true);
      }
    },
  });

  // Optional: Keep formik's value in sync, though payload uses state directly
  useEffect(() => {
    if (questionData?.type === "qcm" || questionData?.type === "qcs") {
      formik.setFieldValue("response_options", selectedOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOptions, questionData?.type]);

  // Helper for text input background color after check (original logic)
  const getBackgroundColor = (ratio) => {
    // Check explicitly for null as well as undefined
    if (answer != null && ratio !== undefined && ratio !== null) {
      const res = ratio * 100;
      if (res >= 0 && res < 30) return "border-red-600 text-red-600";
      if (res >= 30 && res < 70) return "border-[#ECD14E] text-[#CDA70C]";
      return "border-green-600 text-green-600";
    } else {
      // Default style before check or if ratio missing
      return "border-[#EFEEFC] text-[#49465F]";
    }
  };

  // Show skip confirmation popup
  const triggerSkipPopup = () => {
    if (!checkAnswer || isSubmitting || isLoadingNextMcq) return; // Prevent when not allowed
    setSkipInitiatedByTimeout(false); // Mark as manual trigger
    setShowSkipPopup(true);
  };

  // Confirm skip action
  const handleConfirmSkip = () => {
    if (!isMounted.current) return;
    clearInterval(timerRef.current);
    timerRef.current = null;
    setShowSkipPopup(false);

    // Update skip count in parent via setData prop
    setData((prevData) => ({
      ...prevData,
      mcqs_skipped: (prevData.mcqs_skipped || 0) + 1,
    }));

    // Navigate
    if (!isFinalQuestion) {
      fetchNextMcq();
    } else {
      handleSessionCompletion();
    }
  };

  // Cancel skip action (or confirm if timeout-triggered)
  const handleCancelSkip = () => {
    if (skipInitiatedByTimeout) {
      handleConfirmSkip(); // Timeout popup cancel = confirm skip
    } else {
      setShowSkipPopup(false); // Manual popup cancel = just close
    }
  };

  // Handle click on "See Explanation" or "Next Question" button
  const handleSeeExplanationOrNext = () => {
    const canSeeExplanation = ["qcm", "qcs", "qroc"].includes(
      questionData?.type
    );
    if (canSeeExplanation) {
      setSeeExplanation(true); // Show modal
    } else {
      // Navigate directly for types without explanation
      if (!isFinalQuestion) {
        fetchNextMcq();
      } else {
        handleSessionCompletion();
      }
    }
  };

  // Handle "Next Question" click *from within* explanation modal
  const handleNextFromExplanation = () => {
    setSeeExplanation(false); // Close modal
    // Navigate
    if (!isFinalQuestion) {
      fetchNextMcq();
    } else {
      handleSessionCompletion();
    }
  };

  // Get styling for MCQ options (logic from original snippet)
  const getOptionStyling = (optionId) => {
    let classes = "border-[#EFEEFC] text-[#191919] bg-white"; // Default before check, unselected
    const isSelectedByUser = selectedOptions.some(
      (selected) => selected.option == optionId
    );

    if (!checkAnswer && answer) {
      // After checking answer
      const selectedOptionData = answer.selected_options?.find(
        (o) => o.id == optionId
      );
      const isCorrect = answer.correct_options?.some(
        (co) => co.id === optionId
      );

      if (selectedOptionData) {
        // Option was selected by user
        classes = selectedOptionData.is_correct
          ? "border-[#47B881] text-[#47B881]"
          : "border-[#F64C4C] text-[#F64C4C]";
      } else {
        // Option was not selected by user
        if (isCorrect) {
          // If it was the correct answer they missed, keep it visible (or add a specific style if desired)
          // classes = "border-[#47B881] text-[#47B881] bg-green-50"; // Example: Highlight missed correct answer
          classes = "border-[#EFEEFC] text-[#191919] bg-white"; // Keep neutral or style as needed
        } else {
          // Unselected and incorrect: fade out
          classes += " pointer-events-none opacity-70";
        }
      }
      classes += " bg-white"; // Ensure background remains white after check as per original styles shown
    } else {
      // Before checking answer
      if (isSelectedByUser) {
        // Selected style from original snippet
        classes = "bg-[#FFF5FA] text-[#F8589F] border-[#F8589F]";
      } else {
        // Add hover effect for unselected options
        classes += " hover:bg-gray-50";
      }
      classes += " cursor-pointer"; // Make clickable
    }
    return classes;
  };

  // Get check/cross icon for MCQ options after checking (logic from original snippet)
  const getOptionIcon = (optionId) => {
    if (checkAnswer || !answer) return null; // No icon before check/no answer data

    const selectedOptionData = answer.selected_options?.find(
      (o) => o.id == optionId
    );

    if (selectedOptionData) {
      // Icon based on correctness of user's selection
      return selectedOptionData.is_correct ? (
        <IoIosCheckmarkCircle className="w-[20px] h-[20px] text-[#47B881]" />
      ) : (
        <IoCloseCircleOutline className="w-[20px] h-[20px] text-[#F64C4C]" />
      );
    } else {
      // Optionally show icon for correct answers user missed
      const isCorrectUnselected = answer.correct_options?.some(
        (co) => co.id === optionId
      );
      if (isCorrectUnselected) {
        // return <IoIosCheckmarkCircle className="w-[20px] h-[20px] text-[#47B881] opacity-50" />; // Example
      }
    }
    return null; // Default no icon
  };

  // Determine if submit/check button should be disabled
  const isSubmitDisabled =
    isSubmitting ||
    isLoadingNextMcq ||
    (questionData?.type === "qcm" || questionData?.type === "qcs" // For MCQ types
      ? selectedOptions.length === 0 // Disable if no options selected
      : !formik.values.response?.trim()); // For non-MCQ types, disable if response is empty/whitespace

  // --- JSX Structure and Styling from your original snippet ---
  return (
    <div className="relative bg-[#FFFFFF] w-[70%] rounded-[16px] mx-auto my-auto p-[20px] flex flex-col gap-6 max-md:w-[100%] z-[50] overflow-y-auto scrollbar-hide max-xl:w-[90%]">
      {" "}
      {/* Original container style */}
      {/* Header section */}
      <div className="flex items-center justify-between flex-wrap gap-y-2 ">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Type Badge */}
          <div className="bg-[#FF6EAF] flex items-center gap-2 rounded-[8px] px-[16px] py-[7px]">
            <Image src={solver} alt="solver" className="w-[20px]" />
            <span className="text-[13px] text-[#FFFFFF]">
              Type: <span className="uppercase">{questionData?.type}</span>
            </span>
          </div>
          {/* Progress Bar */}
          <div className="relative w-[160px] h-[7px] bg-[#85849436] rounded-[20px] overflow-hidden max-md:hidden">
            <div
              className="absolute top-0 left-0 h-full bg-[#FF6EAF] rounded-[20px] transition-all duration-300 ease-in-out"
              style={{
                width: `${
                  totalQuestions > 0
                    ? // Use current number (adjust if 0-based needed)
                      (currentQuestionNumber / totalQuestions) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>
          {/* Difficulty Badge */}
          <span
            className={`px-[18px] py-[7px] rounded-[8px] text-[#FFFFFF] text-[14px] max-md:hidden ${
              questionData?.difficulty === "easy"
                ? "bg-[#47B881]"
                : questionData?.difficulty === "medium"
                ? "bg-[#FFAA60]"
                : "bg-[#F64C4C]"
            }`}
          >
            {/* Capitalize first letter */}
            {questionData?.difficulty?.charAt(0).toUpperCase() +
              questionData?.difficulty?.slice(1)}
          </span>
          <Image src={think1} alt="think" className="ml-0 max-md:w-[30px]" />
        </div>
        {/* Timer */}
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-[#B5BEC6]">
            Time Remaining{" "}
            <span className="text-[#FF6EAF] font-semibold">
              ({timeRemaining}s) {/* Display seconds */}
            </span>
          </span>
          <Image src={timer} alt="timer" className="w-[24px] max-md:hidden" />
        </div>
      </div>
      {/* Question body section */}
      <div className="flex gap-8 justify-between flex-col lg:flex-row">
        {/* Question Text */}
        <div className="flex-1">
          <span className="block font-Poppins text-[#666666] text-[13px] font-medium mb-2">
            QUESTION{" "}
            <span className="text-[#F8589F]">
              {currentQuestionNumber}/{totalQuestions || "?"}
            </span>
          </span>
          <div
            className="font-Poppins text-[#191919] font-medium prose max-w-none" // Kept prose class as it was in original
            dangerouslySetInnerHTML={{ __html: questionData?.question || "" }}
          />
        </div>
        {/* Attachment Image */}
        {questionData?.attachment && (
          <div className="lg:w-[360px] flex-shrink-0">
            <Image
              src={questionData.attachment}
              alt="Quiz attachment"
              className="w-full h-auto object-contain rounded" // Original classes
              width={360}
              height={240} // Provide aspect ratio hint
              priority={currentQuestionNumber < 3} // Prioritize early images
            />
          </div>
        )}
      </div>
      {/* Form for answers */}
      <form className="flex flex-col gap-4" onSubmit={formik.handleSubmit}>
        {/* MCQ Options List */}
        {(questionData?.type === "qcm" || questionData?.type === "qcs") && (
          <ul className="flex flex-col gap-4">
            {questionData?.options?.map((item) => {
              // *** ADDED CHECK: Skip rendering if content is just '.' ***
              if (!item.content || item.content.trim() === ".") {
                return null; // Don't render this list item
              }

              const styling = getOptionStyling(item.id);
              const icon = getOptionIcon(item.id);

              return (
                <li
                  key={item.id}
                  // Original styling structure, dynamically updated by getOptionStyling
                  className={`text-[14px] flex items-center justify-between gap-2 font-Poppins font-medium border rounded-[16px] px-[20px] py-[8px] transition-colors duration-150 ${styling} ${
                    !checkAnswer ? "cursor-default" : "" // Remove cursor pointer after check
                  }`}
                  onClick={
                    checkAnswer ? () => handleOptionClick(item) : undefined // Only allow click before check
                  }
                >
                  <span
                    className={`flex-1`} // Original span style
                    dangerouslySetInnerHTML={{ __html: item.content || "" }}
                  />
                  {icon} {/* Render icon if available */}
                </li>
              );
            })}
          </ul>
        )}

        {/* Text Input Field (Non-MCQ) */}
        {questionData?.type !== "qcm" && questionData?.type !== "qcs" && (
          <div className="relative">
            <Input
              name="response"
              // Original input styling structure
              className={`font-Poppins font-medium placeholder:text-[13px] text-[13px] px-[16px] py-[19px] rounded-[14px] border-[1.6px] bg-white ${
                !checkAnswer // Apply result color only after check
                  ? getBackgroundColor(answer?.success_ratio) // Use original getBackgroundColor
                  : "border-[#EFEEFC] text-[#49465F]" // Default style before check
              }`}
              placeholder="Write Your Answer"
              value={formik.values.response}
              onChange={formik.handleChange}
              disabled={!checkAnswer || isSubmitting} // Disable after check or during submit
            />
            {/* Icon indicator inside input (Original logic) */}
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

        {/* Action Buttons */}
        <div className="self-end flex items-center gap-4 mt-3">
          {" "}
          {/* Original container style */}
          {/* Skip Button */}
          <button
            type="button"
            onClick={triggerSkipPopup}
            // Original styling
            className="text-[#F8589F] font-[500] text-[13px] disabled:text-gray-400 disabled:cursor-not-allowed"
            disabled={!checkAnswer || isSubmitting || isLoadingNextMcq} // Disable when not appropriate
          >
            Skip Question
          </button>
          {/* Check Answer / See Explanation / Next Button */}
          {checkAnswer ? (
            // Check Answer Button
            <button
              type="submit"
              // Original styling
              className="bg-[#F8589F] text-[#FFFFFF] font-medium text-[13px] px-[16px] py-[8px] rounded-[24px] hover:opacity-90 transition-opacity disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={isSubmitDisabled} // Use calculated disabled state
            >
              {isSubmitting ? "Checking..." : "Check Answer"}
            </button>
          ) : (
            // See Explanation / Next / Finish Button
            <button
              type="button"
              onClick={handleSeeExplanationOrNext}
              // Original styling
              className="bg-[#F8589F] text-[#FFFFFF] font-medium text-[13px] px-[16px] py-[8px] rounded-[24px] hover:opacity-90 transition-opacity disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={isLoadingNextMcq} // Disable only when loading next
            >
              {isLoadingNextMcq // Loading state text
                ? "Loading Next..."
                : // Button text logic from original snippet
                ["qcm", "qcs", "qroc"].includes(questionData?.type)
                ? "See Explanation"
                : isFinalQuestion
                ? "Finish Session"
                : "Next Question"}
            </button>
          )}
        </div>
      </form>
      {/* Conditional Modals */}
      {showSkipPopup && (
        <SkipQuestionPopup
          onConfirmSkip={handleConfirmSkip}
          onCancelSkip={handleCancelSkip}
          isTimeout={skipInitiatedByTimeout}
        />
      )}
      {seeExplanation &&
        !checkAnswer &&
        answer && ( // Show explanation modal when conditions met
          <QuizExplanation
            QuizData={answer}
            setSeeExplanation={setSeeExplanation}
            handleNextQuestion={handleNextFromExplanation} // Pass the correct handler
            type={questionData?.type}
            // Removed length/selectedQuiz props as they weren't used in original explanation logic
            // length={totalQuestions}
            // selectedQuiz={currentQuestionNumber - 1}
            // isLoadingNext={isLoadingNextMcq} // Removed isLoadingNext, handled by main button disable state
          />
        )}
    </div>
  );
};

export default Quiz;
