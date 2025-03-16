import React from "react";

const My_Shedule = () => {
  const quizData = [
    {
      id: 1,
      title: "Chapter 1 quiz",
      score: "50%",
      status: "Fair",
      statusColor: "#FFAD0D",
      statusBg: "#FFF7E1",
      date: "Mon, 29 at 18:52",
    },
    {
      id: 2,
      title: "Chapter 2 quiz",
      score: "70%",
      status: "Good",
      statusColor: "#47B881",
      statusBg: "#E5F5EC",
      date: "Tue, 30 at 14:30",
    },
    {
      id: 3,
      title: "Chapter 3 quiz",
      score: "90%",
      status: "Excellent",
      statusColor: "#F8589F",
      statusBg: "#FFE5F0",
      date: "Wed, 31 at 10:15",
    },
    {
      id: 4,
      title: "Chapter 4 quiz",
      score: "80%",
      status: "Good",
      statusColor: "#47B881",
      statusBg: "#E5F5EC",
      date: "Wed, 31 at 10:15",
    },
  ];

  return (
    <div className="flex-1">
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        My schedule
      </h3>
      <div className="bg-[#FFFFFF] rounded-[16px] px-6 py-4 box h-[320px] overflow-y-auto scrollbar-hide flex flex-col">
        <button className="text-[14px] text-[#F8589F] font-[500] self-end">
          add +
        </button>{" "}
        <ul className="flex flex-col gap-4 flex-grow mt-3">
          {quizData.map((quiz) => (
            <li
              key={quiz.id}
              className="border border-[#E4E4E4] p-4 rounded-[12px]"
            >
              <span className="pl-[14px] relative text-[14px] text-[#191919] font-[500] block after:absolute after:w-[6px] after:h-[6px] after:bg-[#F8589F] after:rounded-full after:left-0 after:top-[50%] after:translate-y-[-50%]">
                {quiz.title}
              </span>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-[#F8589F] font-[500] text-[20px]">
                    {quiz.score}
                  </span>
                  <span
                    className="text-[13px] rounded-[12px] px-[10px] py-[2px] font-[500]"
                    style={{
                      color: quiz.statusColor,
                      backgroundColor: quiz.statusBg,
                    }}
                  >
                    {quiz.status}
                  </span>
                </div>
                <span className="text-[13px] text-[#B5BEC6]">{quiz.date}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default My_Shedule;
