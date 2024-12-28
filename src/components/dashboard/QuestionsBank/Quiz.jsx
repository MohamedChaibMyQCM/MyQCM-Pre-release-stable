import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import quiz from "../../../../public/Quiz/quiz.png";
import timer from "../../../../public/Quiz/Timer.svg";
import solver from "../../../../public/Aside/wsolver.svg";
import mind from "../../../../public/Quiz/mind.svg";
import { Input } from "@/components/ui/input";
import QuizExplanation from "./QuizExplanation";
import { useFormik } from "formik";
import { IoIosCheckmarkCircle } from "react-icons/io";
import QuizResult from "./QuizResult";

const Quiz = ({
  data,
  Progress,
  answer,
  data1,
  setData,
  setResult,
  setAnswer,
}) => {
  const [checkAnswer, setCheckAnswer] = useState(true);
  const [seeExplanation, setSeeExplanation] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(
    data[0]?.estimated_time || 0
  );
  const [submittedAnswer, setSubmittedAnswer] = useState(null);
  const [processedAnswers] = useState(new Set()); // Track processed answers
  const timerRef = useRef(null);

  console.log(answer);

  const handleOptionClick = (option) => {
    setSelectedOptions((prevSelected) => {
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
  const bgColor = answer ? getBackgroundColor(answer.success_ratio) : "";

  const formik = useFormik({
    initialValues: {
      mcq: data[selectedQuiz]?.id,
      response_options: selectedOptions,
      response: "",
      time_spent: data[selectedQuiz]?.estimated_time,
    },
    onSubmit: async (values) => {
      if (processedAnswers.has(data[selectedQuiz]?.id)) {
        return;
      }

      clearInterval(timerRef.current);
      let quizData = data[selectedQuiz];
      if (!quizData) {
        return;
      }

      let submissionData = {};
      if (quizData.type === "qcm" || quizData.type === "qcs") {
        submissionData = {
          mcq: values.mcq,
          response_options: values.response_options,
          time_spent: quizData.estimated_time - timeRemaining,
        };
      } else {
        submissionData = {
          mcq: values.mcq,
          response: values.response,
          time_spent: quizData.estimated_time - timeRemaining,
        };
      }

      try {
        const result = await Progress(submissionData);
        setSubmittedAnswer(result);
        setCheckAnswer(false);

        if (!processedAnswers.has(quizData.id)) {
          if (result.data.data.success_ratio === 1) {
            setData((prevData) => ({
              ...prevData,
              mcqs_success: prevData.mcqs_success + 1,
            }));
          } else if (result.data.data.success_ratio < 1) {
            setData((prevData) => ({
              ...prevData,
              mcqs_failed: prevData.mcqs_failed + 1,
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
    formik.setFieldValue("mcq", data[selectedQuiz]?.id);
  }, [selectedOptions, data[selectedQuiz]?.id]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          handleSkipQuestion();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [selectedQuiz]);

  useEffect(() => {
    setTimeRemaining(data[selectedQuiz]?.estimated_time || 0);
  }, [selectedQuiz]);

  const handleSkipQuestion = () => {
    if (selectedQuiz >= data.length) {
      return;
    }
    setSelectedQuiz((prevQuiz) => prevQuiz + 1);
    setSelectedOptions([]);
    setSubmittedAnswer(null);
    setData((prevData) => ({
      ...prevData,
      mcqs_skipped: prevData.mcqs_skipped + 1,
    }));
    formik.resetForm();
  };

  if (selectedQuiz >= data.length) {
    return <QuizResult data={data1} setResult={setResult} />;
  }

  const getOptionBackgroundColor = (optionId) => {
    if (!submittedAnswer) return "";
    const selectedOption = submittedAnswer.data.data.selected_options.find(
      (option) => option.id == optionId
    );
    if (selectedOption) {
      return selectedOption.is_correct
        ? "!bg-[#37FFB6] !text-[#FFF]"
        : "!bg-[#FF3737] !text-[#FFF]";
    }
    return "";
  };

  const handleNextQuestion = () => {
    setSelectedQuiz((prevQuiz) => prevQuiz + 1);
    setSelectedOptions([]);
    setSubmittedAnswer(null);
    setSeeExplanation(false);
    setCheckAnswer(true);
    setAnswer(null);
    formik.resetForm();
  };

  return (
    <div className="relative bg-[#FFFFFF] w-[70%] rounded-[16px] mx-auto my-auto p-[20px] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#FF6EAF] flex items-center gap-3 rounded-[12px] px-[16px] py-[8px]">
            <Image src={solver} alt="solver" />
            <span className="text-[13px] text-[#FFFFFF] font-Poppins font-medium">
              Type: {data[selectedQuiz].type}
            </span>
          </div>
          <span className="block relative w-[160px] h-[8px] bg-[#dedede] rounded-[20px] after:w-[40px] after:h-[8px] after:rounded-[20px] after:bg-[#FF6EAF] after:absolute after:left-0"></span>
          <span
            className={`px-[18px] py-[10px] rounded-[10px] text-[#FFFFFF] font-Poppins text-[14px] font-medium ${
              data[selectedQuiz].difficulty == "easy"
                ? "bg-[#39FF64]"
                : data[selectedQuiz].difficulty == "medium"
                ? "bg-[#ECD14E]"
                : "bg-red-600"
            }`}
          >
            {data[selectedQuiz].difficulty}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[14px] text-[#858494] font-Poppins font-light ">
            Time Remaining{" "}
            <span className="text-[#FF6EAF] font-semibold">
              ({timeRemaining}s)
            </span>
          </span>
          <Image src={timer} alt="timer" className="w-[24px]" />
        </div>
      </div>
      <div className="flex gap-8 justify-between">
        <div>
          <span className="block font-Poppins text-[#858494] text-[13px] font-medium mb-2">
            QUESTION {selectedQuiz + 1} OF {data.length}
          </span>
          <p className="font-Poppins text-[#0C092A] font-semibold">
            {data[selectedQuiz].question}
          </p>
        </div>
        {data[selectedQuiz].attachment && (
          <Image
            src={data[selectedQuiz].attachment}
            alt="quiz image"
            className="w-[360px]"
            width={360}
            height={240}
          />
        )}
      </div>
      <form className="flex flex-col gap-4" onSubmit={formik.handleSubmit}>
        <ul className="flex flex-col gap-4">
          {data[selectedQuiz].type === "qcm" ||
          data[selectedQuiz].type === "qcs" ? (
            data[selectedQuiz].options.map((item, index) => {
              const isSelected = selectedOptions.some(
                (selectedOption) => selectedOption.option == item.id
              );
              const optionBgColor = getOptionBackgroundColor(item.id);
              return (
                <li
                  key={index}
                  className={`text-[14px] flex items-center gap-2 font-Poppins font-semibold text-[#0C092A] border border-[#EFEEFC] rounded-[16px] px-[20px] py-[8px] cursor-pointer ${
                    isSelected ? "bg-[#FFF5FA] text-[#0C092A]" : ""
                  } ${optionBgColor}`}
                  onClick={() => handleOptionClick(item)}
                >
                  {isSelected && <IoIosCheckmarkCircle className="w-[20px]" />}
                  <span className="text-[14px]">{item.content}</span>
                </li>
              );
            })
          ) : (
            <Input
              name="response"
              className={`font-Poppins font-medium placeholder:text-[13px] text-[13px] px-[16px] py-[19px] rounded-[14px] ${
                bgColor
                  ? `${bgColor} text-[#FFFFFF]`
                  : "text-[#49465F] border-[1.6px] border-[#EFEEFC]"
              }`}
              placeholder="Write Your Answer"
              value={formik.values.response}
              onChange={formik.handleChange}
            />
          )}
        </ul>

        <div className="self-end flex items-center gap-4">
          <button
            type="button"
            onClick={handleSkipQuestion}
            className="bg-[#FFF5FA] text-[#0C092A] font-Poppins font-medium text-[13px] px-[16px] py-[10px] rounded-[14px]"
            disabled={!checkAnswer}
          >
            Skip Question
          </button>
          {checkAnswer ? (
            <button
              type="submit"
              className="bg-[#FF6EAF] text-[#FFFFFF] font-Poppins font-medium text-[13px] px-[16px] py-[10px] rounded-[14px]"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={() => {
                setSeeExplanation(true);
                setCheckAnswer(true);
              }}
              className="bg-[#FF6EAF] text-[#FFFFFF] font-Poppins font-medium text-[13px] px-[16px] py-[10px] rounded-[14px]"
            >
              {data[selectedQuiz].type == "qcm" ||
              data[selectedQuiz].type == "qcs"
                ? "See Explanation"
                : "See Analyse"}
            </button>
          )}
        </div>
      </form>
      <Image
        src={mind}
        alt="mind"
        className="absolute right-[-67px] top-12 w-[120px] z-[-1]"
      />
      {seeExplanation && (
        <QuizExplanation
          selectedQuiz={selectedQuiz}
          setSelectedQuiz={setSelectedQuiz}
          QuizData={answer || []}
          setSeeExplanation={setSeeExplanation}
          type={data[selectedQuiz].type}
          length={data.length}
          setCheckAnswer={setCheckAnswer}
          setSelectedOptions={setSelectedOptions}
          setAnswer={setAnswer}
          formik={formik}
        />
      )}
    </div>
  );
};

export default Quiz;
