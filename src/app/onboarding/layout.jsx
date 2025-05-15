"use client";

import AsideOnboarding from "../../components/onboarding/AsideOnboarding"; // Make sure this path is correct

export default function OnboardingLayout({ children }) {
  const mobileContentMarginTopClass = "max-md:mt-[70px]";

  return (
    <main className="flex min-h-screen bg-[#F7F8FA]">
      <AsideOnboarding />
      <div
        className={`flex-1 ${mobileContentMarginTopClass} h-screen overflow-y-auto ml-[248px] max-xl:ml-0`}
      >
        {children}
      </div>
    </main>
  );
}
