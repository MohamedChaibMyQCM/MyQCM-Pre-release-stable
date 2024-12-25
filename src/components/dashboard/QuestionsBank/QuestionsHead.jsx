"use client";

import infinite from "../../../../public/Icons/infinite.svg";
import visit from "../../../../public/Icons/visit.svg";
import question from "../../../../public/Icons/question.svg";
import list from "../../../../public/Icons/list.svg";
import Image from "next/image";
import { useQuery } from "react-query";
import BaseUrl from "@/components/BaseUrl";

const QuestionsHead = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const response = await BaseUrl.get("user/plan");
      return response.data.data;
    },
  });

  return (
    <header className="flex items-center justify-between border-b border-[#E4E4E4] px-[40px] py-[10px]">
      <div>
        <h2 className="text-[#565656] font-Poppins font-semibold text-[26px]">
          Banque De Questions
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[#565656] font-Poppins font-medium">
          Vos crédits :
        </span>
        <div className="flex items-center gap-[2px]">
          <span className="text-[#181818] font-Poppins font-semibold">
            {data && data.mcqs == null ? (
              <Image src={infinite} alt="infinite" className="w-[28px]" />
            ) : (
              data?.mcqs
            )}
          </span>
        </div>
        <Image src={list} alt="list" className="w-[22px]" />
        <span className="text-[#181818] font-Poppins font-semibold">
          {data && data.qrocs == null ? (
            <Image src={infinite} alt="infinite" className="w-[28px]" />
          ) : (
            data?.qrocs
          )}
        </span>
        <Image src={question} alt="question" className="w-[24px]" />
        {/* <div className="flex items-center gap-[2px]">
          <Image src={infinite} alt="infinite" className="w-[28px]" />
          <span className="text-[#181818] font-Poppins font-semibold">
            /200
          </span>
        </div>
        <Image src={visit} alt="visit" className="w-[30px]" /> */}
      </div>
    </header>
  );
};

export default QuestionsHead;
