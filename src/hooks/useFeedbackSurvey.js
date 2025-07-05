import { useState, useEffect } from "react";

export const useFeedbackSurvey = (remainingQrocs = 0) => {
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [shownSurveys, setShownSurveys] = useState(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load shown surveys from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("shownFeedbackSurveys");
    if (stored) {
      try {
        const parsedSurveys = JSON.parse(stored);
        setShownSurveys(new Set(parsedSurveys));
        console.log("Loaded shown surveys from localStorage:", parsedSurveys);
      } catch (error) {
        console.error("Error parsing stored surveys:", error);
        localStorage.removeItem("shownFeedbackSurveys");
        setShownSurveys(new Set());
      }
    }
    setIsLoaded(true);
  }, []);

  // Save shown surveys to localStorage
  const markSurveyAsShown = (surveyType) => {
    console.log(`Marking survey as shown: ${surveyType}`);
    const newShownSurveys = new Set([...shownSurveys, surveyType]);
    setShownSurveys(newShownSurveys);
    localStorage.setItem(
      "shownFeedbackSurveys",
      JSON.stringify([...newShownSurveys])
    );
  };

  const triggerSurvey = (surveyType) => {
    console.log(`Attempting to trigger survey: ${surveyType}`);
    console.log(`Active survey: ${activeSurvey}`);
    console.log(`Shown surveys:`, Array.from(shownSurveys));

    // Prevent triggering if a survey is already active
    if (activeSurvey) {
      console.log(
        `Survey ${surveyType} not triggered - another survey is active`
      );
      return;
    }

    if (!shownSurveys.has(surveyType)) {
      console.log(`Setting active survey: ${surveyType}`);
      setActiveSurvey(surveyType);
      markSurveyAsShown(surveyType);
    } else {
      console.log(`Survey ${surveyType} already shown`);
    }
  };

  // Auto-check surveys whenever remainingQrocs changes, but only after localStorage is loaded
  useEffect(() => {
    if (!isLoaded || remainingQrocs <= 0 || activeSurvey) return;

    console.log("Auto survey check - Remaining QROCs:", remainingQrocs);
    console.log("Current shown surveys:", Array.from(shownSurveys));

    // IMG-CLARITY-10: when 35 QROCs remaining
    if (remainingQrocs === 35 && !shownSurveys.has("IMG-CLARITY-10")) {
      console.log("Auto-triggering IMG-CLARITY-10 survey");
      triggerSurvey("IMG-CLARITY-10");
      return;
    }

    // AI-LATENCY-30: when 15 QROCs remaining
    if (remainingQrocs === 15 && !shownSurveys.has("AI-LATENCY-30")) {
      console.log("Auto-triggering AI-LATENCY-30 survey");
      triggerSurvey("AI-LATENCY-30");
      return;
    }

    // LEARN-USEFUL-FIN: when 5 QROCs remaining
    if (remainingQrocs === 5 && !shownSurveys.has("LEARN-USEFUL-FIN")) {
      console.log("Auto-triggering LEARN-USEFUL-FIN survey");
      triggerSurvey("LEARN-USEFUL-FIN");
      return;
    }
  }, [remainingQrocs, shownSurveys, activeSurvey, isLoaded]);

  const checkAndTriggerSurvey = () => {
    // This is now just for manual triggering if needed
    console.log("Manual survey check - Remaining QROCs:", remainingQrocs);

    if (activeSurvey) {
      console.log("Survey check skipped - active survey exists");
      return;
    }

    // The auto-trigger effect will handle this
  };

  const closeSurvey = () => {
    console.log("Closing survey:", activeSurvey);
    setActiveSurvey(null);
  };

  // Function to reset surveys for testing
  const resetSurveys = () => {
    console.log("Resetting all surveys");
    localStorage.removeItem("shownFeedbackSurveys");
    setShownSurveys(new Set());
    setActiveSurvey(null);
  };

  // Debug effect to log state changes
  useEffect(() => {
    console.log("Survey state changed:", {
      activeSurvey,
      remainingQrocs,
      shownSurveys: Array.from(shownSurveys),
      isLoaded,
    });
  }, [activeSurvey, remainingQrocs, shownSurveys, isLoaded]);

  // Expose resetSurveys for debugging in console
  if (typeof window !== "undefined") {
    window.resetFeedbackSurveys = resetSurveys;
  }

  return {
    activeSurvey,
    closeSurvey,
    checkAndTriggerSurvey,
    resetSurveys, // For debugging
  };
};
