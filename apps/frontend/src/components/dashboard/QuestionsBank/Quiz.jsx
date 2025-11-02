"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import { useQuizSounds } from "@/hooks/useQuizSounds";

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
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef(null);
  const isMounted = useRef(true);

  // Premium animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const questionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const optionVariants = {
    hidden: { opacity: 0, x: -20, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const confettiVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      scale: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

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

  // Sound effects hook
  const sounds = useQuizSounds();

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

    // Play transition sound for new question
    sounds.playTransition();

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

  // Track if warning sound has been played for each threshold
  const warningPlayedRef = useRef({ threshold25: false, threshold15: false });

  useEffect(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;

    // Reset warning flags when question changes
    warningPlayedRef.current = { threshold25: false, threshold15: false };

    if (isMounted.current && checkAnswer && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        if (isMounted.current) {
          setTimeRemaining((prevTime) => {
            // Play warning sound at 25% and 15% time remaining
            const warningThreshold1 = Math.floor(initialTime * 0.25);
            const warningThreshold2 = Math.floor(initialTime * 0.15);

            // Play warning at 25% if not already played
            if (prevTime === warningThreshold1 && !warningPlayedRef.current.threshold25) {
              sounds.playTimerWarning();
              warningPlayedRef.current.threshold25 = true;
              console.log("Playing 25% warning at", prevTime, "seconds");
            }

            // Play warning at 15% if not already played
            if (prevTime === warningThreshold2 && !warningPlayedRef.current.threshold15) {
              sounds.playTimerWarning();
              warningPlayedRef.current.threshold15 = true;
              console.log("Playing 15% warning at", prevTime, "seconds");
            }

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
  }, [checkAnswer, timeRemaining, initialTime, sounds, questionData]);

  const handleOptionClick = (option) => {
    if (!checkAnswer) return;

    // Play select sound
    console.log("Playing select sound");
    sounds.playSelect();

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

    // Play skip sound
    console.log("Playing skip sound");
    sounds.playSkip();

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

    // Play transition sound
    sounds.playTransition();

    if (!isFinalQuestion) {
      fetchNextMcq();
    } else {
      handleSessionCompletion();
    }
  };

  const multiChoiceQuestion = questionData?.type === "qcm";
  const correctOptionIds = useMemo(() => {
    if (!questionData?.options?.length) {
      return new Set();
    }
    return new Set(
      questionData.options
        .filter((option) => option?.is_correct)
        .map((option) => option.id),
    );
  }, [questionData]);

  const getOptionStyling = (optionId) => {
    let classes = "border-border text-foreground bg-card";
    const isSelectedByUser = selectedOptions.some(
      (selected) => selected.option == optionId
    );

    if (!checkAnswer && answer) {
      const selectedOptionData = answer.selected_options?.find(
        (o) => o.id == optionId
      );
      const isCorrect = correctOptionIds.has(optionId);

      if (selectedOptionData) {
        classes = selectedOptionData.is_correct
          ? "border-[#47B881] text-[#47B881] bg-[#47B881]/10"
          : "border-[#F64C4C] text-[#F64C4C] bg-[#F64C4C]/10";
      } else {
        if (isCorrect) {
          if (multiChoiceQuestion) {
            classes =
              "border-[#FEC84B] bg-[#FEC84B]/20 text-[#FEC84B] shadow-sm";
          } else {
            classes = "border-[#47B881] text-[#47B881] bg-[#47B881]/10";
          }
        } else {
          classes += " pointer-events-none opacity-70";
        }
      }
      classes += " pointer-events-none";
    } else {
      if (isSelectedByUser) {
        classes = "bg-accent text-primary border-primary";
      } else {
        classes += " hover:bg-muted";
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
      const isCorrectUnselected = correctOptionIds.has(optionId);
      if (isCorrectUnselected) {
        if (multiChoiceQuestion) {
          return (
            <span className="flex items-center justify-center w-[20px] h-[20px] text-[12px] font-semibold text-[#A45A00] bg-[#FEC84B] rounded-full">
              !
            </span>
          );
        }
        return (
          <IoIosCheckmarkCircle className="w-[20px] h-[20px] text-[#47B881]" />
        );
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

  // Letter badges for options
  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ignore if typing in an input
      if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA" ||
        showSkipPopup ||
        seeExplanation
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      // Handle option selection (A-E for MCQ/QCS)
      if (
        checkAnswer &&
        (questionData?.type === "qcm" || questionData?.type === "qcs")
      ) {
        const optionIndex = optionLetters.indexOf(key.toUpperCase());
        if (optionIndex !== -1 && questionData?.options?.[optionIndex]) {
          event.preventDefault();
          const option = questionData.options[optionIndex];
          if (option.content && option.content.trim() !== ".") {
            handleOptionClick(option);
          }
        }
      }

      // Handle Enter key
      if (key === "enter") {
        event.preventDefault();
        if (checkAnswer && !isSubmitDisabled) {
          formik.handleSubmit();
        } else if (!checkAnswer) {
          handleSeeExplanationOrNext();
        }
      }

      // Handle S key for skip
      if (key === "s" && checkAnswer && !isSubmitting && !isLoadingNextMcq) {
        event.preventDefault();
        triggerSkipPopup();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [
    checkAnswer,
    questionData,
    selectedOptions,
    isSubmitDisabled,
    isSubmitting,
    isLoadingNextMcq,
    showSkipPopup,
    seeExplanation,
  ]);

  return (
    <motion.div
      className="relative bg-card border border-border w-full rounded-[20px] p-[24px] flex flex-col gap-6 max-md:p-[16px] max-sm:p-[14px] z-[50] overflow-y-auto shadow-lg"
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      key={questionData?.id}
    >
      {/* Header with badges and timer */}
      <motion.div
        className="flex items-start justify-between gap-3 max-md:gap-2.5"
        variants={headerVariants}
      >
        <div className="flex items-center gap-2.5 flex-wrap max-md:gap-2 flex-1 min-w-0">
          {/* Question type badge */}
          <div className="bg-gradient-to-r from-[#FF6EAF] to-[#FF8EC7] flex items-center gap-2 rounded-[10px] px-[14px] py-[7px] shadow-sm max-md:px-[10px] max-md:py-[5px] shrink-0">
            <Image
              src={solver}
              alt="solver"
              className="w-[15px] max-md:w-[13px]"
            />
            <span className="text-[11px] text-[#FFFFFF] font-medium tracking-wide max-md:text-[10px] whitespace-nowrap">
              TYPE:{" "}
              <span className="uppercase font-semibold">
                {questionData?.type}
              </span>
            </span>
          </div>

          {/* Difficulty badge */}
          <span
            className={`px-[14px] py-[6px] rounded-[10px] text-[#FFFFFF] text-[11px] font-medium shadow-sm max-md:px-[10px] max-md:py-[5px] max-md:text-[10px] shrink-0 ${
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

          {/* Progress bar - hidden on mobile */}
          <div className="relative w-[140px] h-[8px] bg-muted rounded-[20px] overflow-hidden max-md:hidden shadow-inner shrink-0">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary/80 rounded-[20px]"
              initial={{ width: 0 }}
              animate={{
                width: `${
                  totalQuestions > 0
                    ? (currentQuestionNumber / totalQuestions) * 100
                    : 0
                }%`,
              }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
            ></motion.div>
          </div>
        </div>

        {/* Timer */}
        {initialTime > 0 && (
          <motion.div
            className="shrink-0"
            animate={
              timeRemaining > 0 && timeRemaining <= initialTime * 0.25
                ? {
                    scale: [1, 1.05, 1],
                  }
                : {}
            }
            transition={{
              duration: 0.8,
              repeat: timeRemaining <= initialTime * 0.25 ? Infinity : 0,
              repeatType: "reverse",
            }}
          >
            <SegmentedTimerMyQCM
              total={initialTime}
              remaining={timeRemaining}
              running={checkAnswer && timeRemaining > 0}
              segments={4}
              warnFrom={0.25}
              barWidth={120}
              barHeight={8}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Question content */}
      <motion.div
        className="flex gap-6 justify-between flex-col lg:flex-row max-md:gap-4"
        variants={questionVariants}
      >
        <div className="flex-1 min-w-0">
          <motion.div className="mb-4 max-lg:mb-3" variants={questionVariants}>
            <span className="inline-block bg-muted px-[12px] py-[6px] rounded-[8px] font-Poppins text-muted-foreground text-[11px] font-semibold tracking-wide max-md:text-[10px] max-md:px-[10px] max-md:py-[5px]">
              QUESTION{" "}
              <span className="text-primary">
                {currentQuestionNumber}/{totalQuestions || "?"}
              </span>
            </span>
          </motion.div>
          <motion.div
            className="font-Poppins text-foreground font-medium prose prose-invert max-w-none text-[15px] leading-relaxed max-md:text-[14px]"
            dangerouslySetInnerHTML={{ __html: questionData?.question || "" }}
            variants={questionVariants}
          />
        </div>

        {/* Attachment image */}
        {questionData?.attachment && (
          <motion.div
            className="lg:w-[220px] flex-shrink-0 flex items-start justify-center max-lg:mt-2"
            variants={questionVariants}
          >
            <div className="relative overflow-hidden rounded-[16px] max-lg:max-w-[300px]">
              <Image
                src={questionData.attachment}
                alt="Quiz attachment"
                className="w-full h-auto object-contain"
                width={360}
                height={240}
                priority={currentQuestionNumber < 3}
              />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Answer form */}
      <form className="flex flex-col gap-5 mt-2" onSubmit={formik.handleSubmit}>
        {/* Multiple choice options */}
        {(questionData?.type === "qcm" || questionData?.type === "qcs") && (
          <motion.ul
            className="flex flex-col gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.3,
                },
              },
            }}
          >
            {questionData?.options?.map((item, index) => {
              if (!item.content || item.content.trim() === ".") {
                return null;
              }

              const styling = getOptionStyling(item.id);
              const icon = getOptionIcon(item.id);

              return (
                <motion.li
                  key={item.id}
                  className={`text-[14px] flex items-center gap-3 font-Poppins font-medium border-2 rounded-[18px] px-[24px] py-[14px] transition-all duration-200 ${styling} ${
                    !checkAnswer ? "cursor-default" : "cursor-pointer"
                  } max-md:text-[13px] max-md:px-[18px] max-md:py-[12px] max-md:rounded-[14px]`}
                  variants={optionVariants}
                  whileHover={
                    checkAnswer
                      ? {
                          y: -2,
                          scale: 1.02,
                          boxShadow: "0 8px 20px rgba(248, 88, 159, 0.15)",
                          transition: {
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          },
                        }
                      : {}
                  }
                  whileTap={checkAnswer ? { scale: 0.98 } : {}}
                  onClick={
                    checkAnswer ? () => handleOptionClick(item) : undefined
                  }
                >
                  {/* Letter badge */}
                  <div className="flex items-center justify-center w-[28px] h-[28px] rounded-full bg-gradient-to-br from-[#F8589F] to-[#E74C8C] text-white font-semibold text-[12px] shrink-0 max-md:w-[24px] max-md:h-[24px] max-md:text-[11px]">
                    {optionLetters[index]}
                  </div>
                  <span
                    className="flex-1 leading-relaxed max-md:leading-snug"
                    dangerouslySetInnerHTML={{ __html: item.content || "" }}
                  />
                  {icon}
                </motion.li>
              );
            })}
          </motion.ul>
        )}

        {/* Text input for QROC */}
        {questionData?.type !== "qcm" && questionData?.type !== "qcs" && (
          <motion.div
            className="relative"
            initial="hidden"
            animate="visible"
            variants={optionVariants}
          >
            <Input
              name="response"
              className={`font-Poppins font-medium placeholder:text-[13px] text-[14px] px-[20px] py-[20px] rounded-[16px] border-2 bg-card transition-all duration-200 focus:shadow-lg ${
                !checkAnswer
                  ? getBackgroundColor(answer?.success_ratio)
                  : "border-border text-foreground focus:border-primary focus:ring-0"
              }`}
              placeholder="Écrivez votre réponse ici..."
              value={formik.values.response}
              onChange={formik.handleChange}
              disabled={!checkAnswer || isSubmitting}
            />
            {!checkAnswer && answer && answer.success_ratio !== undefined && (
              <motion.div
                className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
              >
                {answer.success_ratio === 1 ? (
                  <IoIosCheckmarkCircle className="w-[24px] h-[24px] text-green-600" />
                ) : (
                  <IoCloseCircleOutline className="w-[24px] h-[24px] text-red-600" />
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          className="flex items-center gap-4 mt-0 max-md:flex-col max-md:gap-3 justify-end max-sm:mt-2"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.4,
              },
            },
          }}
        >
          {/* Skip button */}
          <motion.button
            type="button"
            onClick={triggerSkipPopup}
            className="text-primary font-medium text-[13px] hover:opacity-80 transition-opacity disabled:text-muted-foreground disabled:cursor-not-allowed max-md:order-2 max-md:text-[12px]"
            disabled={
              !checkAnswer || isSubmitting || isLoadingNextMcq || isSkipping
            }
            variants={buttonVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSkipping ? "Passage en cours..." : "Passer la question"}
          </motion.button>

          {/* Main action button */}
          {checkAnswer ? (
            <motion.button
              type="submit"
              className="bg-gradient-to-r from-primary to-primary/80 text-white font-semibold text-[13px] px-[24px] py-[11px] rounded-[28px] disabled:opacity-50 disabled:cursor-not-allowed max-md:order-1 max-md:w-full max-md:text-[12px] max-md:px-[20px] max-md:py-[10px]"
              disabled={isSubmitDisabled}
              variants={buttonVariants}
              whileHover={
                !isSubmitDisabled
                  ? {
                      scale: 1.05,
                      boxShadow: "0 10px 25px rgba(248, 88, 159, 0.3)",
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 15,
                      },
                    }
                  : {}
              }
              whileTap={!isSubmitDisabled ? { scale: 0.95 } : {}}
            >
              {isSubmitting ? "Vérification..." : "Vérifier la réponse"}
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={handleSeeExplanationOrNext}
              className="bg-gradient-to-r from-primary to-primary/80 text-white font-semibold text-[13px] px-[28px] py-[12px] rounded-[28px] disabled:opacity-50 disabled:cursor-not-allowed max-md:order-1 max-md:w-full max-md:text-[12px] max-md:px-[20px] max-md:py-[10px]"
              disabled={isLoadingNextMcq}
              variants={buttonVariants}
              whileHover={
                !isLoadingNextMcq
                  ? {
                      scale: 1.05,
                      boxShadow: "0 10px 25px rgba(248, 88, 159, 0.3)",
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 15,
                      },
                    }
                  : {}
              }
              whileTap={!isLoadingNextMcq ? { scale: 0.95 } : {}}
            >
              {isLoadingNextMcq
                ? "Chargement..."
                : ["qcm", "qcs", "qroc"].includes(questionData?.type)
                ? "Voir l'explication"
                : isFinalQuestion
                ? "Terminer la session"
                : "Question suivante"}
            </motion.button>
          )}
        </motion.div>
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

      {/* Success celebration effect */}
      <AnimatePresence>
        {!checkAnswer && answer && answer.success_ratio === 1 && (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
          >
            <div className="text-[80px] animate-bounce">🎉</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Quiz;
