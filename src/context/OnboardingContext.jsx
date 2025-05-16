"use client";

import { createContext, useState, useContext, useEffect } from "react";

const OnboardingContext = createContext(null);

export function OnboardingProvider({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(null);
  const [previousTourStep, setPreviousTourStep] = useState(null);

  // Detect mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 1280);
    };

    // Initial check
    checkMobileView();

    // Listen for resize events
    window.addEventListener("resize", checkMobileView);
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  // Track step changes to handle menu state
  useEffect(() => {
    if (currentTourStep !== previousTourStep) {
      setPreviousTourStep(currentTourStep);

      if (isMobileView) {
        const mobileMenuSteps = [
          "tour-qcm-display",
          "tour-qroc-display",
          "tour-streak-display",
          "tour-xp-display",
        ];

        // Open menu for stats steps
        if (mobileMenuSteps.includes(currentTourStep)) {
          setIsMenuOpen(true);
        }
        // Close menu when moving from stats to other elements
        else if (
          mobileMenuSteps.includes(previousTourStep) &&
          !mobileMenuSteps.includes(currentTourStep)
        ) {
          setIsMenuOpen(false);
        }
      }
    }
  }, [currentTourStep, previousTourStep, isMobileView]);

  return (
    <OnboardingContext.Provider
      value={{
        isMenuOpen,
        setIsMenuOpen,
        isMobileView,
        currentTourStep,
        setCurrentTourStep,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === null) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
