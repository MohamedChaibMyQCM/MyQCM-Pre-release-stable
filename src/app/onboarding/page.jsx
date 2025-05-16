"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage"; // For token
import BaseUrl from "../../components/BaseUrl";
import { useOnboarding } from "../../context/OnboardingContext";
import Dash_Onboarding from "../../components/onboarding/Dash_Onboarding";
import Units_onboarding from "../../components/onboarding/Units_onboarding";
import Modules_onboarding from "../../components/onboarding/Modules_onboarding";
import Calendar_onboarding from "../../components/onboarding/Calender_onboarding";
import Study_time_onboarding from "../../components/onboarding/Study_time_onboarding";

const ONBOARDING_TOUR_STEPS = [
  {
    id: "tour-notification-icon",
    content: "Notifications appear here. Check for updates!",
    placement: "bottom-start",
    highlightPadding: 8,
  },
  {
    id: "tour-qcm-display",
    content: "Your QCM (Multiple Choice Questions) count.",
    placement: "bottom",
    highlightPadding: 8,
  },
  {
    id: "tour-qroc-display",
    content: "Your QROC (Open-Ended Questions) count.",
    placement: "bottom",
    highlightPadding: 8,
  },
  {
    id: "tour-streak-display",
    content: "Your current learning streak. Keep it going!",
    placement: "bottom",
    highlightPadding: 8,
  },
  {
    id: "tour-xp-display",
    content: "Your experience points (XP) earned.",
    placement: "bottom-end",
    highlightPadding: 8,
  },
  {
    id: "tour-units-section",
    content: "Learning units are displayed here. Explore different subjects.",
    placement: "bottom",
    scrollToElement: true,
    highlightPadding: 6,
  },
  {
    id: "tour-modules-section",
    content:
      "Modules are specific lessons within each unit. Scroll to see more.",
    placement: "top",
    scrollToElement: true,
    highlightPadding: 6,
  },
  {
    id: "tour-calendar-section",
    content: "Plan your study sessions using this calendar.",
    placement: "top",
    scrollToElement: true,
    highlightPadding: 6,
  },
  {
    id: "tour-studytime-section",
    content: "Track your study time and see your progress.",
    placement: "top",
    scrollToElement: true,
    highlightPadding: 6,
  },
  {
    id: "finish-onboarding-tour",
    content: "You've completed the tour! You can now explore freely.",
    placement: "center",
    isFinalStep: true,
    highlightPadding: 0,
  },
];
const ONBOARDING_TOUR_STORAGE_KEY =
  "fullOnboardingManualTourCompleted_v6.4_localstorage_fix"; // Incremented

export default function OnboardingPage() {
  const router = useRouter();
  const { isMobileView, setCurrentTourStep } = useOnboarding();

  const [isTourActive, setIsTourActive] = useState(false);
  const [currentTourStepIndex, setCurrentTourStepIndex] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState({
    visibility: "hidden",
    opacity: 0,
    transform: "translateY(10px) scale(0.98)",
  });
  const [highlightedElementInfo, setHighlightedElementInfo] = useState({
    id: null,
    padding: 0,
  });
  const tooltipRef = useRef(null);
  const [isTooltipPositioned, setIsTooltipPositioned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State to hold the localStorage value, initialized to null or false
  const [tourInitiallyCompleted, setTourInitiallyCompleted] = useState(null);
  const [appOnboardingInitiallyCompleted, setAppOnboardingInitiallyCompleted] =
    useState(null);

  // Safely access localStorage within useEffect
  useEffect(() => {
    if (typeof window !== "undefined") {
      setTourInitiallyCompleted(
        localStorage.getItem(ONBOARDING_TOUR_STORAGE_KEY) === "true"
      );
      setAppOnboardingInitiallyCompleted(
        localStorage.getItem("onboarding_complete") === "true"
      );
    }
  }, []);

  const markIntroductionComplete = async () => {
    // Ensure token exists on client side only
    if (typeof window === "undefined") return false;
    const token = secureLocalStorage.getItem("token");
    if (!token) {
      // Remove toast.error
      return false;
    }
    try {
      setIsSubmitting(true); // Set submitting here
      await BaseUrl.patch(
        "/user",
        { completed_introduction: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsSubmitting(false); // Reset on success
      return true;
    } catch (error) {
      setIsSubmitting(false); // Reset on error
      console.error(
        "Error marking introduction as complete:",
        error.response?.data || error.message
      );
      // Remove toast.error
      return false;
    }
  };

  const handleFinishAppOnboarding = async () => {
    if (isSubmitting) return;
    // setIsSubmitting is handled within markIntroductionComplete now

    // Remove toast notification for starting the process
    // toast.loading("Finishing onboarding...", { id: "onboarding-save" });
    const success = await markIntroductionComplete();

    // Always set localStorage flags on client side
    if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_TOUR_STORAGE_KEY, "true");
    }

    if (success) {
      if (typeof window !== "undefined") {
        localStorage.setItem("onboarding_complete", "true");
      }
      // Remove success toast notification
      // toast.success("Onboarding complete! Redirecting...", {
      //   id: "onboarding-save",
      // });
      router.push("/dashboard");
    } else {
      // Error toast is still handled in markIntroductionComplete
      // No need for additional error toast here
    }
    // setIsSubmitting is reset in markIntroductionComplete
  };

  const handleFinishTourAndSubmit = async () => {
    if (isSubmitting) return;
    // setIsSubmitting(true); // Handled in markIntroductionComplete

    // Remove toast notification
    // toast.loading("Finalizing onboarding...", { id: "onboarding-save" });
    setTooltipStyle((prev) => ({
      ...prev,
      opacity: 0,
      transform: "translateY(10px) scale(0.98)",
    }));
    setTimeout(() => setIsTourActive(false), 250);

    if (typeof window !== "undefined")
      localStorage.setItem(ONBOARDING_TOUR_STORAGE_KEY, "true");
    const success = await markIntroductionComplete();

    if (success) {
      if (typeof window !== "undefined")
        localStorage.setItem("onboarding_complete", "true");
      // Remove success toast notification
      // toast.success("Onboarding complete! Redirecting...", {
      //   id: "onboarding-save",
      // });
      router.push("/dashboard");
    } else {
      // Error toast is handled within markIntroductionComplete
    }
    // setIsSubmitting handled in markIntroductionComplete
  };

  // Initial tour activation effect
  useEffect(() => {
    // Wait until tourInitiallyCompleted state is set (meaning localStorage has been checked)
    if (tourInitiallyCompleted === null) return;

    if (!tourInitiallyCompleted) {
      // If not completed
      const timer = setTimeout(() => {
        setIsTourActive(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [tourInitiallyCompleted]); // Depend on the state variable

  // Effect to update highlighted element details & scroll if needed
  useEffect(() => {
    if (!isTourActive || !ONBOARDING_TOUR_STEPS[currentTourStepIndex]) {
      setHighlightedElementInfo({ id: null, padding: 0 });
      setCurrentTourStep(null);
      return;
    }

    const currentStep = ONBOARDING_TOUR_STEPS[currentTourStepIndex];
    const stepId =
      currentStep.id !== "finish-onboarding-tour" ? currentStep.id : null;

    setHighlightedElementInfo({
      id: stepId,
      padding: currentStep.highlightPadding || 0,
    });

    // Update the shared context with current tour step
    setCurrentTourStep(stepId);

    setIsTooltipPositioned(false);

    // Wait a moment to allow mobile menu to open if needed
    const scrollDelay =
      isMobileView &&
      [
        "tour-qcm-display",
        "tour-qroc-display",
        "tour-streak-display",
        "tour-xp-display",
      ].includes(stepId)
        ? 500
        : 100;

    setTimeout(() => {
      if (stepId !== "finish-onboarding-tour") {
        const targetElement = document.getElementById(stepId);
        if (targetElement && currentStep.scrollToElement) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }, scrollDelay);
  }, [isTourActive, currentTourStepIndex, isMobileView, setCurrentTourStep]);

  const calculateAndSetTooltipPosition = useCallback(() => {
    if (
      !isTourActive ||
      !tooltipRef.current ||
      !ONBOARDING_TOUR_STEPS[currentTourStepIndex]
    ) {
      return;
    }

    const currentStep = ONBOARDING_TOUR_STEPS[currentTourStepIndex];
    const targetId = highlightedElementInfo.id;
    const targetElement =
      targetId && currentStep.id !== "finish-onboarding-tour"
        ? document.getElementById(targetId)
        : null;

    // Add some delay for smooth transition
    requestAnimationFrame(() => {
      if (!tooltipRef.current || !isTourActive) return;

      // Center positioning for final step or when target isn't found
      if (currentStep.placement === "center" || !targetElement) {
        setTooltipStyle({
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) scale(1)",
          visibility: "visible",
          opacity: 1,
          arrowPosition: "none",
        });
        setIsTooltipPositioned(true);
        return;
      }

      const targetRect = targetElement.getBoundingClientRect();
      const tooltipEl = tooltipRef.current;
      const tooltipHeight = tooltipEl.offsetHeight;
      const tooltipWidth = tooltipEl.offsetWidth;

      // Larger gap for better visual separation
      const BASE_GAP = 40;

      // Enhanced logic for first step (notification icon)
      if (currentTourStepIndex === 0) {
        const isDesktop = window.innerWidth >= 1280;

        if (isDesktop) {
          const desktopElement = document.querySelector(
            ".max-xl\\:hidden [id='tour-notification-icon']"
          );
          if (desktopElement) {
            const desktopRect = desktopElement.getBoundingClientRect();
            setTooltipStyle({
              top: `${desktopRect.bottom + BASE_GAP}px`,
              left: `${
                desktopRect.left - tooltipWidth / 2 + desktopRect.width / 2
              }px`,
              transform: "translateY(0) scale(1)",
              visibility: "visible",
              opacity: 1,
              arrowPosition: "top", // For arrow styling
            });
            setIsTooltipPositioned(true);
            return;
          }
        }

        // Mobile position
        setTooltipStyle({
          top: `${targetRect.bottom + BASE_GAP}px`,
          left: `${Math.max(
            20,
            Math.min(window.innerWidth - tooltipWidth - 20, targetRect.left)
          )}px`,
          transform: "translateY(0) scale(1)",
          visibility: "visible",
          opacity: 1,
          arrowPosition: "top",
        });
        setIsTooltipPositioned(true);
        return;
      }

      // Adaptive spacing based on element size
      const gap = Math.max(BASE_GAP, Math.min(window.innerHeight * 0.05, 60));
      let newPos = {};
      let arrowPosition = "top";

      switch (currentStep.placement) {
        case "bottom-start":
          newPos = { top: targetRect.bottom + gap, left: targetRect.left };
          arrowPosition = "top-left";
          break;
        case "bottom":
          newPos = {
            top: targetRect.bottom + gap,
            left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
          };
          arrowPosition = "top";
          break;
        case "bottom-end":
          newPos = {
            top: targetRect.bottom + gap,
            left: targetRect.right - tooltipWidth,
          };
          arrowPosition = "top-right";
          break;
        case "top-start":
          newPos = {
            top: targetRect.top - tooltipHeight - gap,
            left: targetRect.left,
          };
          arrowPosition = "bottom-left";
          break;
        case "top":
          newPos = {
            top: targetRect.top - tooltipHeight - gap,
            left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
          };
          arrowPosition = "bottom";
          break;
        case "top-end":
          newPos = {
            top: targetRect.top - tooltipHeight - gap,
            left: targetRect.right - tooltipWidth,
          };
          arrowPosition = "bottom-right";
          break;
        default:
          newPos = {
            top: targetRect.bottom + gap,
            left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
          };
          arrowPosition = "top";
      }

      // Ensure tooltip stays in viewport with margins
      const margin = 20;
      let finalLeft = Math.max(margin, newPos.left);
      if (finalLeft + tooltipWidth + margin > window.innerWidth) {
        finalLeft = window.innerWidth - tooltipWidth - margin;
      }

      let finalTop = Math.max(margin, newPos.top);

      // Handle vertical overflow
      if (finalTop + tooltipHeight + margin > window.innerHeight) {
        // Try to flip vertical position if we'd go off-screen
        if (currentStep.placement.startsWith("bottom")) {
          finalTop = Math.max(margin, targetRect.top - tooltipHeight - gap);
          arrowPosition = arrowPosition.replace("top", "bottom");
        } else {
          finalTop = Math.max(
            margin,
            window.innerHeight - tooltipHeight - margin
          );
        }
      }

      if (finalTop < margin && !currentStep.placement.startsWith("bottom")) {
        if (currentStep.placement.startsWith("top")) {
          finalTop = Math.min(
            window.innerHeight - tooltipHeight - margin,
            targetRect.bottom + gap
          );
          arrowPosition = arrowPosition.replace("bottom", "top");
        } else {
          finalTop = margin;
        }
      }

      // Final positioning with proper arrow
      setTooltipStyle({
        top: `${finalTop}px`,
        left: `${finalLeft}px`,
        transform: "translateY(0px) scale(1)",
        visibility: "visible",
        opacity: 1,
        arrowPosition: arrowPosition,
      });
      setIsTooltipPositioned(true);
    });
  }, [
    isTourActive,
    currentTourStepIndex,
    highlightedElementInfo.id,
    isMobileView,
  ]);

  useEffect(() => {
    if (
      isTourActive &&
      ONBOARDING_TOUR_STEPS[currentTourStepIndex] &&
      !isTooltipPositioned
    ) {
      const delay = ONBOARDING_TOUR_STEPS[currentTourStepIndex]?.scrollToElement
        ? 550
        : 150;
      const timer = setTimeout(() => {
        if (isTourActive && !isTooltipPositioned)
          calculateAndSetTooltipPosition();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [
    isTourActive,
    currentTourStepIndex,
    isTooltipPositioned,
    calculateAndSetTooltipPosition,
  ]);

  useEffect(() => {
    if (isTourActive) {
      document.body.style.overflow = "hidden";
      const handleResize = () => {
        setIsTooltipPositioned(false);
      };
      window.addEventListener("resize", handleResize);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("resize", handleResize);
      };
    } else {
      document.body.style.overflow = "";
      setTooltipStyle({
        visibility: "hidden",
        opacity: 0,
        transform: "translateY(10px) scale(0.98)",
      });
      setHighlightedElementInfo({ id: null, padding: 0 });
    }
  }, [isTourActive]); // Removed calculateAndSetTooltipPosition from here too.

  const handleStepChange = (newStepIndex) => {
    setTooltipStyle((prev) => ({
      ...prev,
      opacity: 0,
      transform: "translateY(10px) scale(0.98)",
    }));
    setIsTooltipPositioned(false);
    setTimeout(() => {
      setCurrentTourStepIndex(newStepIndex);
    }, 200);
  };

  const handleNextStep = () => {
    if (currentTourStepIndex < ONBOARDING_TOUR_STEPS.length - 1) {
      handleStepChange(currentTourStepIndex + 1);
    } else {
      handleFinishTourAndSubmit();
    }
  };
  const handlePrevStep = () => {
    if (currentTourStepIndex > 0) handleStepChange(currentTourStepIndex - 1);
  };

  const handleFinishTourOnlyUI = () => {
    // Finishes only the UI part of the tour
    setTooltipStyle((prev) => ({
      ...prev,
      opacity: 0,
      transform: "translateY(10px) scale(0.98)",
    }));
    setTimeout(() => {
      setIsTourActive(false);
      if (typeof window !== "undefined") {
        // Safe localStorage write
        localStorage.setItem(ONBOARDING_TOUR_STORAGE_KEY, "true");
      }
    }, 300);
  };

  // Now this variable is derived from state that's safe from SSR issues
  const canGoToDashboardDirectly =
    tourInitiallyCompleted ||
    (!isTourActive &&
      currentTourStepIndex > 0 &&
      ONBOARDING_TOUR_STEPS.length > 1) ||
    appOnboardingInitiallyCompleted;

  // If tourInitiallyCompleted is null, it means we haven't checked localStorage yet, so render a loading or minimal state.
  // This prevents rendering content that depends on localStorage before it's available.
  if (
    tourInitiallyCompleted === null ||
    appOnboardingInitiallyCompleted === null
  ) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
        Loading Onboarding State...
      </div>
    );
    // Or a proper loading spinner component
  }

  return (
    <div className="onboarding-page-container relative">
      {isTourActive && (
        <>
          <div
            className="manual-tour-overlay"
            onClick={handleFinishTourOnlyUI}
          ></div>
          <div
            ref={tooltipRef}
            className={`manual-tour-tooltip ${
              tooltipStyle.arrowPosition || "top"
            }-arrow`}
            style={{
              top: tooltipStyle.top || 0,
              left: tooltipStyle.left || 0,
              visibility: tooltipStyle.visibility || "hidden",
              opacity: tooltipStyle.opacity || 0,
              transform:
                tooltipStyle.transform || "translateY(10px) scale(0.98)",
            }}
          >
            {ONBOARDING_TOUR_STEPS[currentTourStepIndex] ? (
              <>
                <div className="tooltip-header">
                  <span className="step-indicator">
                    Step {currentTourStepIndex + 1}/
                    {ONBOARDING_TOUR_STEPS.length}
                  </span>
                </div>
                <p className="tooltip-content">
                  {ONBOARDING_TOUR_STEPS[currentTourStepIndex].content}
                </p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        ((currentTourStepIndex + 1) /
                          ONBOARDING_TOUR_STEPS.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="tour-buttons-container">
                  {currentTourStepIndex > 0 &&
                    !ONBOARDING_TOUR_STEPS[currentTourStepIndex]
                      .isFinalStep && (
                      <button
                        onClick={handlePrevStep}
                        className="prev-button"
                        disabled={isSubmitting}
                      >
                        <span>←</span> Prev
                      </button>
                    )}

                  {!ONBOARDING_TOUR_STEPS[currentTourStepIndex].isFinalStep && (
                    <button
                      onClick={handleFinishTourOnlyUI}
                      className="skip-button"
                      disabled={isSubmitting}
                    >
                      Skip
                    </button>
                  )}

                  <button
                    onClick={handleNextStep}
                    className="next-button"
                    disabled={isSubmitting}
                  >
                    {currentTourStepIndex === ONBOARDING_TOUR_STEPS.length - 1
                      ? isSubmitting
                        ? "Finishing..."
                        : "Finish ✓"
                      : "Next →"}
                  </button>
                </div>
              </>
            ) : (
              <p>Loading step...</p>
            )}
          </div>
        </>
      )}

      {/* Restore the background class */}
      <div className="bg-gradient-to-br from-[#fbfcff] to-[#f5f7fd] pb-10 min-h-screen w-full">
        <Dash_Onboarding
          highlightedElementInfo={highlightedElementInfo}
          isTourActive={isTourActive}
        />
        <div className="px-5 mt-4 max-md:mt-0 max-xl:mt-8">
          <Units_onboarding
            highlightedElementInfo={highlightedElementInfo}
            isTourActive={isTourActive}
          />
          <Modules_onboarding
            highlightedElementInfo={highlightedElementInfo}
            isTourActive={isTourActive}
          />
          <div className="flex items-start gap-6 mt-10 max-md:flex-col w-full max-md:mt-6">
            <Calendar_onboarding
              highlightedElementInfo={highlightedElementInfo}
              isTourActive={isTourActive}
            />
            <Study_time_onboarding
              highlightedElementInfo={highlightedElementInfo}
              isTourActive={isTourActive}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .manual-tour-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(20, 20, 35, 0.8);
          backdrop-filter: blur(4px);
          z-index: 1000;
          opacity: ${isTourActive ? 1 : 0};
          transition: opacity 0.5s ease-in-out, backdrop-filter 0.5s ease-in-out;
          pointer-events: ${isTourActive ? "auto" : "none"};
        }

        .tour-highlight-active {
          position: relative !important;
          z-index: 1005 !important; /* Keep the higher z-index */
          background-color: white !important;
          outline: 3px solid rgba(248, 88, 159, 0.9);
          outline-offset: 4px;
          box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.2),
            0 0 30px 10px rgba(248, 88, 159, 0.35),
            0 0 60px rgba(248, 88, 159, 0.15);
          border-radius: var(--dynamic-border-radius, 10px);
          transition: all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
          background-clip: padding-box;
          animation: pulse-highlight 3s infinite;
          /* Removed transform: scale(1.03); to prevent sidebar overlap */
        }

        /* More spacing around the highlight pattern */
        .tour-highlight-active::after {
          content: "";
          position: absolute;
          inset: -10px; /* Reverting from -14px to -10px */
          border-radius: calc(var(--dynamic-border-radius, 10px) + 10px);
          background: repeating-linear-gradient(
            -45deg,
            rgba(248, 88, 159, 0.07),
            rgba(248, 88, 159, 0.07) 5px,
            rgba(255, 255, 255, 0) 5px,
            rgba(255, 255, 255, 0) 10px
          );
          z-index: -2;
          animation: shimmer 3s infinite linear;
          pointer-events: none;
        }

        /* Enhanced pulse animation with more visible outlines */
        @keyframes pulse-highlight {
          0% {
            box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.2),
              0 0 30px 10px rgba(248, 88, 159, 0.35),
              0 0 60px rgba(248, 88, 159, 0.15);
            outline-color: rgba(248, 88, 159, 0.9);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(255, 255, 255, 0.3),
              0 0 40px 15px rgba(248, 88, 159, 0.5),
              0 0 80px rgba(248, 88, 159, 0.2);
            outline-color: rgba(248, 88, 159, 1);
          }
          100% {
            box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.2),
              0 0 30px 10px rgba(248, 88, 159, 0.35),
              0 0 60px rgba(248, 88, 159, 0.15);
            outline-color: rgba(248, 88, 159, 0.9);
          }
        }

        /* Enhanced tooltip styling */
        .manual-tour-tooltip {
          position: fixed;
          background: linear-gradient(145deg, #ffffff, #f8f9fd);
          border-radius: 16px;
          padding: 24px 28px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(0, 0, 0, 0.08), 0 10px 20px rgba(248, 88, 159, 0.15);
          z-index: 1010 !important; /* Ensure tooltip is above all other elements */
          max-width: 400px;
          width: calc(100% - 40px);
          margin: 20px;
          font-size: 16px;
          line-height: 1.7;
          pointer-events: auto !important; /* Ensure tooltip can be interacted with */
          color: #2d3748;
          transition: opacity 0.4s cubic-bezier(0.25, 0.1, 0.25, 1.5),
            transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1.5),
            visibility 0s linear 0.4s;
          border: 1px solid rgba(248, 88, 159, 0.1);
        }

        .manual-tour-tooltip[style*="opacity: 1"] {
          transition-delay: 0s, 0s, 0s !important;
        }

        /* Arrow styling for different positions */
        .manual-tour-tooltip::before {
          content: "";
          position: absolute;
          width: 16px;
          height: 16px;
          background: white;
          transform: rotate(45deg);
          z-index: 1009;
          box-shadow: -1px -1px 0 0 rgba(0, 0, 0, 0.08);
        }

        .manual-tour-tooltip.top-arrow::before {
          top: -8px;
          left: calc(50% - 8px);
        }

        .manual-tour-tooltip.top-left-arrow::before {
          top: -8px;
          left: 30px;
        }

        .manual-tour-tooltip.top-right-arrow::before {
          top: -8px;
          right: 30px;
        }

        .manual-tour-tooltip.bottom-arrow::before {
          bottom: -8px;
          left: calc(50% - 8px);
          box-shadow: 2px 2px 0 0 rgba(0, 0, 0, 0.08);
        }

        .manual-tour-tooltip.bottom-left-arrow::before {
          bottom: -8px;
          left: 30px;
          box-shadow: 2px 2px 0 0 rgba(0, 0, 0, 0.08);
        }

        .manual-tour-tooltip.bottom-right-arrow::before {
          bottom: -8px;
          right: 30px;
          box-shadow: 2px 2px 0 0 rgba(0, 0, 0, 0.08);
        }

        .manual-tour-tooltip.none-arrow::before {
          display: none;
        }

        /* Enhanced internal tooltip styling */
        .tooltip-header {
          margin-bottom: 12px;
        }

        .step-indicator {
          font-size: 13px;
          color: #f8589f;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          background: linear-gradient(90deg, #f8589f, #ff3d88);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
        }

        .tooltip-content {
          margin: 0 0 20px 0;
          color: #374151;
          font-weight: 400;
          font-size: 16px;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .progress-bar {
          height: 4px;
          background-color: rgba(226, 232, 240, 0.8);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(to right, #f8589f, #ff3d88);
          border-radius: 10px;
          transition: width 0.5s ease;
        }

        /* Enhanced button styling */
        .tour-buttons-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 15px;
          gap: 10px;
          flex-direction: row;
          flex-wrap: wrap;
        }

        .tour-buttons-container button {
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
          z-index: 1011; /* Reverting from 1016 to 1011 */
        }

        .tour-buttons-container button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
        }

        .tour-buttons-container .next-button {
          background: linear-gradient(135deg, #f8589f, #ff3d88);
          color: white;
          padding: 8px 18px;
        }

        .tour-buttons-container .next-button:hover {
          background: linear-gradient(135deg, #f75ea3, #ff4e96);
          box-shadow: 0 4px 12px rgba(248, 88, 159, 0.3);
        }

        .tour-buttons-container .prev-button,
        .tour-buttons-container .skip-button {
          background-color: #f8f9fd;
          color: #4a5568;
          border: 1px solid #e2e8f0;
        }

        .tour-buttons-container .prev-button:hover,
        .tour-buttons-container .skip-button:hover {
          background-color: #f1f5f9;
          color: #2d3748;
          border-color: #cbd5e1;
        }

        /* Make sure tooltip is always above highlighted elements */
        .manual-tour-tooltip {
          z-index: 1010 !important;
          pointer-events: auto !important; /* Ensure tooltip can be interacted with */
        }

        /* Ensure tooltip arrow stays below tooltip content but above highlighted elements */
        .manual-tour-tooltip::before {
          z-index: 1009;
        }

        /* Make sure all tooltip content stays above arrow */
        .manual-tour-tooltip > * {
          position: relative;
          z-index: 1011;
        }

        /* Better highlight effect */
        .tour-highlight-active::after {
          content: "";
          position: absolute;
          inset: -10px; /* Reverting from -14px to -10px */
          border-radius: calc(var(--dynamic-border-radius, 10px) + 10px);
          background: repeating-linear-gradient(
            -45deg,
            rgba(248, 88, 159, 0.07),
            rgba(248, 88, 159, 0.07) 5px,
            rgba(255, 255, 255, 0) 5px,
            rgba(255, 255, 255, 0) 10px
          );
          z-index: -2;
          animation: shimmer 3s infinite linear;
          pointer-events: none;
        }

        /* Responsive adjustments */
        @media (max-width: 767px) {
          .manual-tour-tooltip {
            max-width: 320px;
            padding: 20px 24px;
            font-size: 15px;
          }

          .tooltip-content {
            font-size: 15px;
            margin-bottom: 16px;
          }

          .tour-buttons-container button {
            padding: 7px 14px;
            font-size: 13px;
          }

          .progress-bar {
            margin-bottom: 16px;
          }
        }
      `}</style>
    </div>
  );
}
