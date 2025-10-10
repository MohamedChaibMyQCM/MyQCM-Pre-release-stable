import React from 'react'
import { CheckCircle, XCircle } from "phosphor-react";

const PlanCard = ({ plan, isSelected, onClick, isDisabled }) => {
  const { title, price, features, recommended } = plan;

  return (
    <div
      className={`flex-1 box rounded-[12px] px-4 py-5 border-[2px] max-md:w-full ${
        isSelected ? "border-[#F8589F] bg-[#FFF5FA]" : "border-transparent"
      } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      onClick={!isDisabled ? onClick : undefined}
    >
      <div className="flex items-center gap-6">
        <span className="font-[500] text-[22px]">{price}</span>
        {recommended && (
          <span className="text-[14px] font-[500] border border-[#F8589F] text-[#F8589F] bg-[#FFF5FA] rounded-[16px] px-[20px] py-[2px]">
            Recommended
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 mt-1 mb-4">
        <span className="text-[#101828] text-[14px] font-[500]">{title}</span>
        <span className="text-[#B5BEC6] text-[12px]">
          Billed 6 months/annually
        </span>
      </div>
      <ul className="flex flex-col gap-4">
        {features.map((feature, index) => (
          <li
            key={index}
            className="flex items-center gap-2 text-[14px] text-[#191919]"
          >
            {feature.included ? (
              <CheckCircle size={22} className="text-[#F8589F]" />
            ) : (
              <XCircle size={22} className="text-[#B5BEC6]" />
            )}
            {feature.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlanCard