import React, { useEffect, useState } from "react";
import Image from "next/image";
import quiz from "../../../../public/Quiz/quiz.png";
import timer from "../../../../public/Quiz/Timer.svg";
import solver from "../../../../public/Aside/wsolver.svg";
import mind from "../../../../public/Quiz/mind.svg";
import { Input } from "@/components/ui/input";
import QuizExplanation from "./QuizExplanation";
import trueQuiz from "../../../../public/Quiz/true.svg";
import { useFormik } from "formik";
import QuizResult from "./QuizResult";

const Quiz = ({ data, Progress, answer, data1, setResult, setAnswer }) => {
  const [checkAnswer, setCheckAnswer] = useState(true);
  const [seeExplanation, setSeeExplanation] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(
    data[0]?.estimated_time || 0
  );
  const [submittedAnswer, setSubmittedAnswer] = useState(null);

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
    const res = ratio * 100;
    if (res >= 0 && res < 30) return "bg-red-600";
    if (res >= 30 && res < 70) return "bg-[#ECD14E]";
    return "bg-[#53DF83]";
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
      let quizData = data[selectedQuiz];
      if (!quizData) {
        console.error("Selected quiz data is undefined");
        return;
      }

      let submissionData = {};
      if (quizData.type == "qcm" || quizData.type == "qcs") {
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
      console.log(submissionData);
      const result = await Progress(submissionData);
      setSubmittedAnswer(result);
      setCheckAnswer(false);
    },
  });

  useEffect(() => {
    formik.setFieldValue("response_options", selectedOptions);
    formik.setFieldValue("mcq", data[selectedQuiz]?.id);
  }, [selectedOptions, data[selectedQuiz]?.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSkipQuestion();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedQuiz]);

  useEffect(() => {
    setTimeRemaining(data[selectedQuiz]?.estimated_time || 0);
  }, [selectedQuiz]);

  const handleSkipQuestion = () => {
    setSelectedQuiz(selectedQuiz + 1);
    setSelectedOptions([]);
    setSubmittedAnswer(null);
    formik.resetForm();
  };

  if (selectedQuiz >= data.length) {
    return <QuizResult data={data1} setResult={setResult} />;
  }

  const getOptionBackgroundColor = (optionId) => {
    if (!submittedAnswer) return "";
    console.log(submittedAnswer.data.data);
    console.log(submittedAnswer.data.data.selected_options);
    const selectedOption = submittedAnswer.data.data.selected_options.find(
      (option) => option.id == optionId
    );
    if (selectedOption) {
      return selectedOption.is_correct
        ? "bg-[#37FFB6] text-[#FFF]"
        : "bg-[#FF3737] text-[#FFF]";
    }
    return "";
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
        <Image src={quiz} alt="quiz image" className="w-[360px]" />
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
                  {isSelected && (
                    <Image
                      src={trueQuiz}
                      alt="trueQuiz"
                      className="bg-[#FF6EAF] w-[12px] h-[12px] rounded-full flex items-center justify-center"
                    />
                  )}
                  <span className="text-[14px]">{item.content}</span>
                </li>
              );
            })
          ) : (
            <Input
              name="response"
              className={`border-[1.6px] font-Poppins font-medium placeholder:text-[13px] text-[13px] px-[16px] py-[19px] rounded-[14px] ${
                bgColor
                  ? `${bgColor} text-[#FFFFFF] border-[${bgColor}]`
                  : "text-[#49465F] border-[#EFEEFC]"
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