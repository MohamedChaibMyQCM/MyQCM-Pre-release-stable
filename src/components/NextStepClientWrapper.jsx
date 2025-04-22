"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { NextStep } from "nextstepjs"; 
import { CustomOnboardingCard } from "@/components/onboarding/CustomOnboardingCard";

function NextStepClientWrapper({ tours, children }) {
  const router = useRouter();

  const handleTourComplete = (tour) => {
    if (!tour || !tour.tour) return;
    console.log(`Tour completed: ${tour.tour}`);

    if (tour.tour === "dashboardHeaderIntro") {
      console.log("Dashboard intro complete.");
    } else if (tour.tour === "progressSummary") {
      router.push("/my-progress/activity");
    } else if (tour.tour === "progressActivity") {
      router.push("/dashboard");
    }
  };

  return (
    <NextStep
      steps={tours}
      cardComponent={CustomOnboardingCard}
      onTourComplete={handleTourComplete}
    >
      {children}
    </NextStep>
  );
}

export default NextStepClientWrapper;
