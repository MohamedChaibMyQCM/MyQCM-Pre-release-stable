"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage"; // For token
import toast from "react-hot-toast";
import BaseUrl from "../../components/BaseUrl";
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
      toast.error("Authentication token not found. Please login again.", {
        id: "auth-error",
      });
      router.push("/login");
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
      toast.error(
        error.response?.data?.message || "Failed to save onboarding status.",
        { id: "onboarding-patch-error" }
      );
      return false;
    }
  };

  const handleFinishAppOnboarding = async () => {
    if (isSubmitting) return;
    // setIsSubmitting is handled within markIntroductionComplete now

    toast.loading("Finishing onboarding...", { id: "onboarding-save" });
    const success = await markIntroductionComplete();

    // Always set localStorage flags on client side
    if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_TOUR_STORAGE_KEY, "true");
    }

    if (success) {
      if (typeof window !== "undefined") {
        localStorage.setItem("onboarding_complete", "true");
      }
      toast.success("Onboarding complete! Redirecting...", {
        id: "onboarding-save",
      });
      router.push("/dashboard");
    } else {
      // toast.error is handled in markIntroductionComplete
      // No need for additional error toast here unless it's a different condition
    }
    // setIsSubmitting is reset in markIntroductionComplete
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
      return;
    }
    const currentStep = ONBOARDING_TOUR_STEPS[currentTourStepIndex];
    setHighlightedElementInfo({
      id: currentStep.id !== "finish-onboarding-tour" ? currentStep.id : null,
      padding: currentStep.highlightPadding || 0,
    });
    setIsTooltipPositioned(false);

    if (currentStep.id !== "finish-onboarding-tour") {
      const targetElement = document.getElementById(currentStep.id);
      if (targetElement && currentStep.scrollToElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [isTourActive, currentTourStepIndex]);

  const calculateAndSetTooltipPosition = useCallback(() => {
    // ... (This function itself doesn't use localStorage, so it's fine) ...
    // The complete calculateAndSetTooltipPosition from Response #13 remains unchanged here.
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
    requestAnimationFrame(() => {
      if (!tooltipRef.current || !isTourActive) return;
      if (currentStep.placement === "center" || !targetElement) {
        setTooltipStyle({
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) scale(1)",
          visibility: "visible",
          opacity: 1,
        });
        setIsTooltipPositioned(true);
        return;
      }
      const targetRect = targetElement.getBoundingClientRect();
      const tooltipEl = tooltipRef.current;
      const tooltipHeight = tooltipEl.offsetHeight;
      const tooltipWidth = tooltipEl.offsetWidth;
      const gap = 20;
      if (
        (tooltipHeight === 0 || tooltipWidth === 0) &&
        currentStep.id !== "finish-onboarding-tour"
      ) {
        if (tooltipEl.style.visibility !== "visible") {
          tooltipEl.style.visibility = "visible";
          tooltipEl.style.opacity = "0";
        }
        return;
      }
      let newPos = {};
      switch (currentStep.placement) {
        case "bottom-start":
          newPos = { top: targetRect.bottom + gap, left: targetRect.left };
          break;
        case "bottom":
          newPos = {
            top: targetRect.bottom + gap,
            left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
          };
          break;
        case "bottom-end":
          newPos = {
            top: targetRect.bottom + gap,
            left: targetRect.right - tooltipWidth,
          };
          break;
        case "top-start":
          newPos = {
            top: targetRect.top - tooltipHeight - gap,
            left: targetRect.left,
          };
          break;
        case "top":
          newPos = {
            top: targetRect.top - tooltipHeight - gap,
            left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
          };
          break;
        case "top-end":
          newPos = {
            top: targetRect.top - tooltipHeight - gap,
            left: targetRect.right - tooltipWidth,
          };
          break;
        default:
          newPos = {
            top: targetRect.bottom + gap,
            left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
          };
      }
      let finalLeft = Math.max(gap, newPos.left);
      if (finalLeft + tooltipWidth + gap > window.innerWidth)
        finalLeft = window.innerWidth - tooltipWidth - gap;
      let finalTop = Math.max(gap, newPos.top);
      if (finalTop + tooltipHeight + gap > window.innerHeight) {
        if (currentStep.placement.startsWith("bottom"))
          finalTop = Math.max(gap, targetRect.top - tooltipHeight - gap);
        else finalTop = Math.max(gap, window.innerHeight - tooltipHeight - gap);
      }
      if (finalTop < gap && !currentStep.placement.startsWith("bottom")) {
        if (currentStep.placement.startsWith("top"))
          finalTop = Math.min(
            window.innerHeight - tooltipHeight - gap,
            targetRect.bottom + gap
          );
        else finalTop = gap;
      }
      if (finalTop < gap) finalTop = gap;
      setTooltipStyle({
        top: `${finalTop}px`,
        left: `${finalLeft}px`,
        transform: "translateY(0px) scale(1)",
        visibility: "visible",
        opacity: 1,
      });
      setIsTooltipPositioned(true);
    });
  }, [isTourActive, currentTourStepIndex, highlightedElementInfo.id]);

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

  const handleFinishTourAndSubmit = async () => {
    if (isSubmitting) return;
    // setIsSubmitting(true); // Handled in markIntroductionComplete

    toast.loading("Finalizing onboarding...", { id: "onboarding-save" });
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
      toast.success("Onboarding complete! Redirecting...", {
        id: "onboarding-save",
      });
      router.push("/dashboard");
    } else {
      // Error toast is handled within markIntroductionComplete
    }
    // setIsSubmitting handled in markIntroductionComplete
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
    <div className="onboarding-page-container" style={{ position: "relative" }}>
      {isTourActive && (
        <>
          <div
            className="manual-tour-overlay"
            onClick={handleFinishTourOnlyUI}
          ></div>
          <div
            ref={tooltipRef}
            className="manual-tour-tooltip"
            style={tooltipStyle}
          >
            {ONBOARDING_TOUR_STEPS[currentTourStepIndex] ? (
              <>
                <p>{ONBOARDING_TOUR_STEPS[currentTourStepIndex].content}</p>
                <div className="manual-tour-tooltip-buttons">
                  <div>
                    {" "}
                    {currentTourStepIndex > 0 &&
                      !ONBOARDING_TOUR_STEPS[currentTourStepIndex]
                        .isFinalStep && (
                        <button
                          onClick={handlePrevStep}
                          className="prev-button"
                          disabled={isSubmitting}
                        >
                          Previous
                        </button>
                      )}{" "}
                  </div>
                  <div className="flex items-center gap-3">
                    {" "}
                    {!ONBOARDING_TOUR_STEPS[currentTourStepIndex]
                      .isFinalStep && (
                      <button
                        onClick={handleFinishTourOnlyUI}
                        className="skip-button"
                        disabled={isSubmitting}
                      >
                        Skip Tour
                      </button>
                    )}{" "}
                    <button
                      onClick={handleNextStep}
                      className="next-button"
                      disabled={isSubmitting}
                    >
                      {currentTourStepIndex === ONBOARDING_TOUR_STEPS.length - 1
                        ? isSubmitting
                          ? "Finishing..."
                          : "Finish"
                        : "Next"}
                    </button>{" "}
                  </div>
                </div>
              </>
            ) : (
              <p>Loading step...</p>
            )}
          </div>
        </>
      )}

      <div className={`bg-[#F7F8FA] pb-10 min-h-screen`}>
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
        <div className="flex justify-center py-8 px-5">
          <button
            onClick={handleFinishAppOnboarding}
            className={`px-8 py-3 bg-[#F8589F] text-white font-semibold rounded-lg shadow-md hover:bg-[#e0488a] focus:outline-none focus:ring-2 focus:ring-[#F8589F] focus:ring-opacity-50 transition-all duration-150 ease-in-out w-full sm:w-auto text-center ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Processing..."
              : canGoToDashboardDirectly
              ? "Go to Dashboard"
              : "Complete Onboarding & Go to Dashboard"}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .manual-tour-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(30, 30, 30, 0.7);
          z-index: 10000;
          opacity: ${isTourActive ? 1 : 0};
          transition: opacity 0.3s ease-in-out;
          pointer-events: ${isTourActive ? "auto" : "none"};
        }

        .tour-highlight-active {
          position: relative !important;
          z-index: 10001 !important;
          background-color: white !important; /* Ensure element's own background overrides overlay for spotlight */
          outline: 3px solid rgba(248, 88, 159, 0.9);
          outline-offset: var(--dynamic-outline-offset, 3px);
          box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.1),
            0 0 20px 5px rgba(248, 88, 159, 0.35);
          border-radius: var(--dynamic-border-radius, 10px);
          transition: outline 0.3s ease, box-shadow 0.3s ease, padding 0.2s ease,
            margin 0.2s ease, border-radius 0.2s ease,
            background-color 0.1s step-start;
          background-clip: padding-box;
        }

        .manual-tour-tooltip {
          position: fixed;
          background-color: #ffffff;
          border-radius: 10px;
          padding: 20px 24px;
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.22),
            0 0 0 1px rgba(0, 0, 0, 0.08);
          z-index: 10002;
          max-width: 360px;
          width: calc(100% - 40px);
          margin: 20px;
          font-size: 15px;
          line-height: 1.65;
          pointer-events: auto;
          color: #2d3748;
          transition: opacity 0.2s ease-out, transform 0.2s ease-out,
            visibility 0s linear 0.2s;
        }
        .manual-tour-tooltip[style*="opacity: 1"] {
          transition-delay: 0s, 0s, 0s !important;
        }
        .manual-tour-tooltip[style*="visibility: hidden"] {
          transition-delay: 0s, 0s, 0.25s !important;
        }

        .manual-tour-tooltip p {
          margin: 0 0 20px 0;
        }
        .manual-tour-tooltip-buttons {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 15px;
          gap: 12px;
        }
        .manual-tour-tooltip-buttons button {
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: background-color 0.2s ease, color 0.2s ease,
            transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
        }
        .manual-tour-tooltip-buttons button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .manual-tour-tooltip-buttons button:active {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
        }
        .manual-tour-tooltip-buttons .next-button {
          background-color: #f8589f;
          color: white;
        }
        .manual-tour-tooltip-buttons .next-button:hover {
          background-color: #e0488a;
        }
        .manual-tour-tooltip-buttons .prev-button,
        .manual-tour-tooltip-buttons .skip-button {
          background-color: #edf2f7;
          color: #4a5568;
        }
        .manual-tour-tooltip-buttons .prev-button:hover,
        .manual-tour-tooltip-buttons .skip-button:hover {
          background-color: #e2e8f0;
          color: #2d3748;
        }
      `}</style>
    </div>
  );
}
