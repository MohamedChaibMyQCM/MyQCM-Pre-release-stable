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
import { useQuery } from "@tanstack/react-query";
import Loading from "../../components/Loading";

const ONBOARDING_TOUR_STEPS = [
  {
    id: "tour-notification-icon",
    content: "Les notifications apparaissent ici. Consultez les mises à jour !",
    placement: "bottom-start",
    highlightPadding: 8,
  },
  {
    id: "tour-qcm-display",
    content: "Votre nombre de QCM (Questions à Choix Multiples).",
    placement: "bottom",
    highlightPadding: 8,
  },
  {
    id: "tour-qroc-display",
    content: "Votre nombre de QROC (Questions à Réponse Ouverte Courte).",
    placement: "bottom",
    highlightPadding: 8,
  },
  {
    id: "tour-streak-display",
    content: "Votre série d'apprentissage actuelle. Continuez comme ça !",
    placement: "bottom",
    highlightPadding: 8,
  },
  {
    id: "tour-xp-display",
    content: "Vos points d'expérience (XP) gagnés.",
    placement: "bottom-end",
    highlightPadding: 8,
  },
  {
    id: "tour-units-section",
    content:
      "Les unités d'apprentissage s'affichent ici. Explorez différents sujets.",
    placement: "bottom",
    scrollToElement: true,
    highlightPadding: 6,
  },
  {
    id: "tour-modules-section",
    content:
      "Les modules sont des leçons spécifiques au sein de chaque unité. Défilez pour en voir plus.",
    placement: "top",
    scrollToElement: true,
    highlightPadding: 6,
  },
  {
    id: "tour-calendar-section",
    content: "Planifiez vos sessions d'étude à l'aide de ce calendrier.",
    placement: "top",
    scrollToElement: true,
    highlightPadding: 6,
  },
  {
    id: "tour-studytime-section",
    content: "Suivez votre temps d'étude et visualisez vos progrès.",
    placement: "top",
    scrollToElement: true,
    highlightPadding: 6,
  },
  {
    id: "finish-onboarding-tour",
    content:
      "Vous avez terminé la visite ! Vous pouvez maintenant explorer librement.",
    placement: "center",
    isFinalStep: true,
    highlightPadding: 0,
  },
];
const ONBOARDING_TOUR_STORAGE_KEY =
  "fullOnboardingManualTourCompleted_v6.4_localstorage_fix"; // Incremented

// API fetch function
const fetchUserData = async () => {
  try {
    const token = secureLocalStorage.getItem("token");
    if (!token) return null;

    const response = await BaseUrl.get("/user/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching user data:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export default function OnboardingPage() {
  const router = useRouter();
  const { isMobileView, setCurrentTourStep } = useOnboarding();

  // Query to fetch user data
  const {
    data: userData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["userMeAuthCheck"],
    queryFn: fetchUserData,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });

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

  // Check if user has completed introduction and redirect if needed
  useEffect(() => {
    if (userData?.data?.completed_introduction) {
      router.replace("/dashboard");
    } else if (
      userData &&
      !isLoading &&
      !userData?.data?.completed_introduction
    ) {
      // If we have user data and they haven't completed intro, start tour after a delay
      const timer = setTimeout(() => {
        setIsTourActive(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [userData, isLoading, router]);

  const markIntroductionComplete = async () => {
    // Ensure token exists on client side only
    if (typeof window === "undefined") return false;
    const token = secureLocalStorage.getItem("token");
    if (!token) return false;

    try {
      setIsSubmitting(true);
      await BaseUrl.patch(
        "/user",
        { completed_introduction: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsSubmitting(false);
      return true;
    } catch (error) {
      setIsSubmitting(false);
      console.error(
        "Error marking introduction as complete:",
        error.response?.data || error.message
      );
      return false;
    }
  };

  const handleFinishTourAndSubmit = async () => {
    if (isSubmitting) return;

    setTooltipStyle((prev) => ({
      ...prev,
      opacity: 0,
      transform: "translateY(10px) scale(0.98)",
    }));
    setTimeout(() => setIsTourActive(false), 250);

    const success = await markIntroductionComplete();

    if (success) {
      router.push("/dashboard");
    }
  };

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
    // User clicked outside the tooltip to skip
    setTooltipStyle((prev) => ({
      ...prev,
      opacity: 0,
      transform: "translateY(10px) scale(0.98)",
    }));
    setTimeout(() => {
      setIsTourActive(false);
    }, 300);
  };

  // Show loading state while fetching user data
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
        <Loading />
      </div>
    );
  }

  // If error occurred or redirecting, show minimal loading
  if (isError || userData?.data?.completed_introduction) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
        Redirection...
      </div>
    );
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
                    Étape {currentTourStepIndex + 1}/
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
                        <span>←</span> Précédent
                      </button>
                    )}

                  {!ONBOARDING_TOUR_STEPS[currentTourStepIndex].isFinalStep && (
                    <button
                      onClick={handleFinishTourOnlyUI}
                      className="skip-button"
                      disabled={isSubmitting}
                    >
                      Passer
                    </button>
                  )}

                  <button
                    onClick={handleNextStep}
                    className="next-button"
                    disabled={isSubmitting}
                  >
                    {currentTourStepIndex === ONBOARDING_TOUR_STEPS.length - 1
                      ? isSubmitting
                        ? "Finalisation..."
                        : "Terminer ✓"
                      : "Suivant →"}
                  </button>
                </div>
              </>
            ) : (
              <p>Chargement de l'étape...</p>
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
        /* Refined overlay with perfect blur */
        .manual-tour-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: ${isMobileView
            ? "transparent"
            : "rgba(20, 20, 35, 0.48)"};
          backdrop-filter: ${isMobileView ? "none" : "blur(8px)"};
          z-index: 100 !important;
          opacity: ${isTourActive ? 1 : 0};
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: ${isTourActive ? "auto" : "none"};
        }

        /* Luxurious and larger tooltip */
        .manual-tour-tooltip {
          position: fixed !important;
          background: linear-gradient(145deg, #ffffff, #f8faff);
          border-radius: 20px;
          padding: 24px 28px; /* Increased padding */
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.92) inset,
            0 -8px 20px rgba(248, 88, 159, 0.08) inset,
            0 2px 6px rgba(255, 255, 255, 0.95) inset;
          z-index: 20000 !important;
          max-width: 380px; /* Significantly larger width */
          width: calc(100% - 32px);
          margin: 16px;
          font-size: 15px; /* Larger font */
          line-height: 1.6;
          pointer-events: auto !important;
          color: #2d3748;
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          border: 1px solid rgba(255, 255, 255, 0.9);
          transform-origin: center bottom;
        }

        /* Premium header styling */
        .tooltip-header {
          margin-bottom: 12px;
          position: relative;
        }

        .tooltip-header:after {
          content: "";
          position: absolute;
          left: -28px;
          right: -28px;
          bottom: -6px;
          height: 1px;
          background: linear-gradient(
            to right,
            rgba(248, 88, 159, 0),
            rgba(248, 88, 159, 0.18),
            rgba(248, 88, 159, 0)
          );
        }

        /* Sophisticated step indicator */
        .step-indicator {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          background: linear-gradient(90deg, #f8589f, #ff3d88);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          background-color: rgba(248, 88, 159, 0.08);
          box-shadow: 0 0 0 1px rgba(248, 88, 159, 0.12) inset;
        }

        /* Larger, more readable content text */
        .tooltip-content {
          margin: 0 0 16px 0;
          color: #1a202c;
          font-weight: 500;
          font-size: 16px; /* Increased font size */
          line-height: 1.6;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
          letter-spacing: 0.01em;
        }

        /* Enhanced progress bar */
        .progress-bar {
          height: 5px;
          background: linear-gradient(
            to right,
            rgba(226, 232, 240, 0.5),
            rgba(226, 232, 240, 0.7)
          );
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 18px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) inset;
          position: relative;
        }

        .progress-bar:after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.3),
            rgba(255, 255, 255, 0)
          );
          border-radius: 5px 5px 0 0;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(to right, #f8589f, #ff3d88);
          border-radius: 5px;
          transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: 0 0 12px rgba(248, 88, 159, 0.4);
          position: relative;
          overflow: hidden;
        }

        /* Shimmer effect on progress bar */
        .progress-fill:after {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0),
            rgba(255, 255, 255, 0.4),
            rgba(255, 255, 255, 0)
          );
          transform: skewX(-25deg);
          animation: shimmer-progress 2.5s infinite;
        }

        @keyframes shimmer-progress {
          0% {
            left: -100%;
          }
          100% {
            left: 200%;
          }
        }

        /* Polished single-line button container */
        .tour-buttons-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 18px;
          gap: 10px;
          flex-wrap: nowrap; /* Keep single line */
          width: 100%;
        }

        /* Premium button styling */
        .tour-buttons-container button {
          flex: 0 0 auto;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 14px;
          white-space: nowrap;
          min-width: 0;
          border: none;
          font-weight: 600;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          letter-spacing: 0.02em;
          height: 34px; /* Taller buttons */
          display: flex;
          align-items: center;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .tour-buttons-container button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }

        .tour-buttons-container .next-button {
          background: linear-gradient(135deg, #f8589f, #ff3d88);
          color: white;
          margin-left: auto; /* Keep to right */
          padding: 8px 18px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(248, 88, 159, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.15) inset;
        }

        /* Elegant shimmer animation */
        .tour-buttons-container .next-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: 0.6s;
        }

        .tour-buttons-container .next-button:hover::before {
          left: 100%;
        }

        .tour-buttons-container .prev-button,
        .tour-buttons-container .skip-button {
          background: white;
          color: #4a5568;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05),
            0 1px 0 rgba(255, 255, 255, 1) inset,
            0 -2px 10px rgba(248, 88, 159, 0.03) inset;
        }

        /* Mobile optimizations with better style */
        @media (max-width: 767px) {
          .manual-tour-tooltip {
            max-width: 340px; /* Larger for mobile too */
            padding: 20px 24px; /* More padding */
            border-radius: 16px;
          }

          .tooltip-content {
            font-size: 15px; /* Larger text on mobile */
            margin-bottom: 14px;
          }

          .tour-buttons-container {
            margin-top: 16px;
          }

          .tour-buttons-container button {
            height: 32px;
            padding: 6px 12px;
          }
        }

        /* Spectacular highlight effect */
        .tour-highlight-active {
          z-index: 1000 !important;
          position: relative !important;
          background-color: white !important;
          outline: 2px solid rgba(248, 88, 159, 0.9);
          outline-offset: 8px;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.8),
            0 0 30px rgba(248, 88, 159, 0.5), 0 0 60px rgba(248, 88, 159, 0.2);
          border-radius: 10px;
          transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
          animation: pulse-highlight 3s infinite cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes pulse-highlight {
          0% {
            box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.8),
              0 0 30px rgba(248, 88, 159, 0.5), 0 0 60px rgba(248, 88, 159, 0.2);
          }
          50% {
            box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.9),
              0 0 40px rgba(248, 88, 159, 0.6),
              0 0 80px rgba(248, 88, 159, 0.25);
          }
          100% {
            box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.8),
              0 0 30px rgba(248, 88, 159, 0.5), 0 0 60px rgba(248, 88, 159, 0.2);
          }
        }

        /* Refined arrow styling */
        .manual-tour-tooltip::before {
          content: "";
          position: absolute;
          width: 16px;
          height: 16px;
          background: linear-gradient(135deg, #ffffff, #f8faff);
          transform: rotate(45deg);
          z-index: 1009;
          box-shadow: -1px -1px 0 rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        /* Arrow positions */
        .manual-tour-tooltip.top-arrow::before {
          top: -8px;
          left: calc(50% - 8px);
        }

        .manual-tour-tooltip.bottom-arrow::before {
          bottom: -8px;
          left: calc(50% - 8px);
          box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.05);
        }

        .manual-tour-tooltip.top-left-arrow::before {
          top: -8px;
          left: 24px;
        }

        .manual-tour-tooltip.top-right-arrow::before {
          top: -8px;
          right: 24px;
        }

        .manual-tour-tooltip.bottom-left-arrow::before {
          bottom: -8px;
          left: 24px;
          box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.05);
        }

        .manual-tour-tooltip.bottom-right-arrow::before {
          bottom: -8px;
          right: 24px;
          box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.05);
        }

        .manual-tour-tooltip.none-arrow::before {
          display: none;
        }

        /* Beautiful decorative elements */
        .manual-tour-tooltip::after {
          content: "";
          position: absolute;
          top: -30%;
          right: -30%;
          width: 80%;
          height: 80%;
          background: radial-gradient(
            circle at center,
            rgba(248, 88, 159, 0.03) 0%,
            transparent 70%
          );
          border-radius: 50%;
          opacity: 0.6;
          z-index: -1;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
