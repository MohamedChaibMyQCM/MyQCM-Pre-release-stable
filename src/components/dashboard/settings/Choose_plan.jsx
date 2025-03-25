"use client";

import { useState } from "react";
import Image from "next/image";
import activation_card from "../../../../public/settings/activation_card.svg";
import dahabia from "../../../../public/settings/dahabia.svg";
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

const PaymentMethodCard = ({ method, isSelected, onClick }) => {
  const { icon, title, description } = method;

  return (
    <div
      className={`flex-1 box rounded-[12px] px-4 py-5 border-[2px] max-md:w-full ${
        isSelected ? "border-[#F8589F] bg-[#FFF5FA]" : "border-transparent"
      } cursor-pointer`}
      onClick={onClick}
    >
      <Image src={icon} alt={title} />
      <span className="text-[#191919] block text-[15px] font-[500] mt-2 mb-1">
        {title}
      </span>
      <span className="text-[#4F4D55] block text-[13px]">{description}</span>
    </div>
  );
};

const Choose_plan = () => {
  const [selectedPlan, setSelectedPlan] = useState("basic");
  const [selectedDuration, setSelectedDuration] = useState("6 months");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("dahabia");

  const plans = [
    {
      id: "basic",
      title: "Basic plan",
      price: "3000DZ/Month",
      features: [
        { text: "Basic features", included: true },
        { text: "All courses and tests included", included: true },
        { text: "AI assistant", included: false },
        { text: "Unlimited test attempts", included: false },
      ],
      recommended: false,
    },
    {
      id: "ai",
      title: "AI plan",
      price: "4500DZ/Month",
      features: [
        { text: "Basic features", included: true },
        { text: "All courses and tests included", included: true },
        { text: "AI assistant", included: true },
        { text: "Unlimited test attempts", included: true },
      ],
      recommended: true,
    },
  ];

  const paymentMethods = [
    {
      id: "dahabia",
      icon: dahabia,
      title: "El Dhahabia",
      description: "Continue payment with El Dhahabia",
    },
    {
      id: "activation_card",
      icon: activation_card,
      title: "Activation Card",
      description: "Continue payment with Activation Card",
    },
  ];

  const handleNext = () => {
    // Add your logic for the "Next" button here
    console.log("Selected Plan:", selectedPlan);
    console.log("Selected Duration:", selectedDuration);
    console.log("Selected Payment Method:", selectedPaymentMethod);
    alert("Proceeding to the next step!");
  };

  // Check if Activation Card is selected
  const isActivationCardSelected = selectedPaymentMethod === "activation_card";

  return (
    <div>
      <div className="mt-8">
        <h3 className="text-[#191919] text-[17px] font-[500]">
          Choose payment method
        </h3>
        <div className="flex items-center mt-4 gap-6 max-md:flex-col">
          {paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              isSelected={selectedPaymentMethod === method.id}
              onClick={() => setSelectedPaymentMethod(method.id)}
            />
          ))}
        </div>
      </div>

      {/* Disable "Choose your next offer" section if Activation Card is selected */}
      <div
        className={`mt-8 ${
          isActivationCardSelected ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <h3 className="text-[#191919] text-[17px] font-[500]">
          Choose your next offer
        </h3>
        <div className="flex items-center my-4 gap-6 max-md:flex-col">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan === plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              isDisabled={isActivationCardSelected}
            />
          ))}
        </div>
        <span className="text-[#B5BEC6] text-[13px]">
          Your new plan is set to start on{" "}
          <span className="text-[#F8589F]">February 2</span>, right after your
          current one ends. Get ready for an upgraded experience!
        </span>
      </div>

      {/* Disable "Duration" section if Activation Card is selected */}
      <div
        className={`mt-8 ${
          isActivationCardSelected ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <h3 className="text-[#191919] text-[17px] font-[500]">Duration</h3>
        <div className="flex items-center gap-4 mt-3">
          {["6 months", "1 year"].map((duration) => (
            <button
              key={duration}
              className={`box ${
                selectedDuration === duration
                  ? "bg-[#FFF5FA] text-[#F8589F] border border-[#F8589F]"
                  : ""
              } px-4 py-1 text-[#191919] text-[14px] rounded-[16px]`}
              onClick={() => setSelectedDuration(duration)}
              disabled={isActivationCardSelected}
            >
              {duration}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleNext}
          className="bg-[#F8589F] text-[#FFFFFF] px-[30px] py-[6px] rounded-[20px] text-[14px] font-[500] hover:bg-[#FD2E8A] transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Choose_plan;
