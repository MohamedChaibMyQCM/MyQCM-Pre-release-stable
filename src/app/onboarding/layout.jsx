"use client";

import AsideOnboarding from "../../components/onboarding/AsideOnboarding";
import { OnboardingProvider } from "../../context/OnboardingContext";

export default function OnboardingLayout({ children }) {
  const mobileContentMarginTopClass = "max-md:mt-[70px]";

  return (
    <OnboardingProvider>
      <main className="flex min-h-screen bg-white">
        <AsideOnboarding />
        <div
          className={`flex-1 ${mobileContentMarginTopClass} h-screen overflow-y-auto ml-[248px] max-xl:ml-0 transition-all duration-300 ease-in-out relative`}
        >
          {children}
        </div>

        <style jsx global>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .onboarding-page-container {
            animation: fadeIn 0.5s ease-out;
          }

          /* Ensuring proper z-index hierarchy for onboarding */
          .manual-tour-overlay {
            z-index: 1000 !important;
          }

          .manual-tour-tooltip {
            z-index: 1010 !important;
          }

          .tour-highlight-active {
            z-index: 1005 !important; /* Increased to be higher than AsideOnboarding */
          }

          /* Fix for aside z-index in onboarding context */
          .fixed.w-\\[248px\\] {
            z-index: 99 !important; /* Lowered from 100 to ensure highlighted elements appear above */
          }

          /* Ensure the menu button in the mobile view is still accessible */
          .fixed.w-\\[248px\\] .mobile-menu-button {
            z-index: 1011 !important;
          }
        `}</style>
      </main>
    </OnboardingProvider>
  );
}
