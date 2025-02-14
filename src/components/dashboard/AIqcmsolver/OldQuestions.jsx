import React from "react";

const Question = [
  {
    type: "QCM",
    text: "The Role of Echocardiography in Evaluating Valvular Heart",
  },
  {
    type: "QROC",
    text: "Clinical Assessment of Dyspnea: Integrating Sem",
  },
  {
    type: "QCM",
    text: "Advanced Imaging Techniques in Diagnosing",
  },
  {
    type: "QCM",
    text: "Pathophysiology of Acute Myocardial Infarction",
  },
  {
    type: "OPEN",
    text: "Semiological Signs of Congestive Heart Failure",
  },
  {
    type: "QROC",
    text: "Radiologic Interpretation of Chest X-rays: Identif",
  },
  {
    type: "QROC",
    text: "Physiopathological Mechanisms of Pulmonary",
  },
  {
    type: "QCM",
    text: "Cardiac Murmurs: Types and Diagnostic Approac",
  },
];

const OldQuestions = () => {
  return (
    <div className="bg-[#FFF5FA] py-[30px] px-[20px] flex-1">
      <div className="flex flex-col gap-4">
        <h2 className="font-Poppins font-semibold text-[20px] text-[#121212] mb-[12px]">
          My Old Questions
        </h2>
        <ul className="flex flex-col gap-4 border-b-[2px] border-b-[#B6ADADE0] pb-[12px]">
          {Question.map((item, index) => {
            return (
              <li
                key={index}
                className="flex items-center gap-2 bg-[#FFFFFF] py-[6px] px-[12px] rounded-[10px]"
              >
                <span
                  className={`w-[16px] h-[16px] rounded-full ${
                    item.type == "QCM"
                      ? "bg-[#F8589F]"
                      : item.type == "QROC"
                      ? "bg-[#4EB5EC]"
                      : "bg-[#4EECBD]"
                  }`}
                ></span>
                <span className="text-[#161616B0] font-Poppins font-semibold text-[13px]">
                  {item.text}
                </span>
              </li>
            );
          })}
        </ul>
        <ul className="bg-[#FFFFFF] rounded-[10px] flex flex-col gap-4 py-[12px]">
          <li className="flex items-center gap-2 px-[12px]">
            <span className="bg-[#F8589F] w-[16px] h-[16px] rounded-full"></span>
            <span className="text-[#161616B0] font-Poppins font-semibold text-[13px]">
              Type of your question : MCQ
            </span>
          </li>
          <li className="flex items-center gap-2 px-[12px]">
            <span className="bg-[#4EB5EC] w-[16px] h-[16px] rounded-full"></span>
            <span className="text-[#161616B0] font-Poppins font-semibold text-[13px]">
              Type of your question : QROC
            </span>
          </li>
          <li className="flex items-center gap-2 px-[12px]">
            <span className="bg-[#4EECBD] w-[16px] h-[16px] rounded-full"></span>
            <span className="text-[#161616B0] font-Poppins font-semibold text-[13px]">
              Type of your question : Open Question
            </span>
          </li>
        </ul>
        <button className="py-[8px] rounded-[10px] font-Poppins font-semibold text-[14px] text-[#FFFFFF] bg-[#F8589F]">
          + New Question
        </button>
      </div>
    </div>
  );
};

export default OldQuestions;
