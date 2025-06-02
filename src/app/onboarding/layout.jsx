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

          .manual-tour-overlay {
            z-index: 100 !important;
          }

          .manual-tour-tooltip {
            z-index: 20000 !important;
          }

          .tour-highlight-active {
            z-index: 1000 !important;
          }

          .fixed.w-\\[248px\\] {
            z-index: 500 !important;
          }

          aside.fixed svg,
          aside.fixed img,
          aside.fixed span,
          .aside-content * {
            position: relative;
            z-index: 501 !important;
          }

          @media (max-width: 1279px) {
            .max-xl\\:fixed,
            .menu-toggle-btn,
            .max-xl\\:translate-x-0 {
              z-index: 1001 !important;
            }

            .max-xl\\:translate-x-0 * {
              z-index: 1002 !important;
              position: relative !important;
            }
          }
        `}</style>
      </main>
    </OnboardingProvider>
  );
}
