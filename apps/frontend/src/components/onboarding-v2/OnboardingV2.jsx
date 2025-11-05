"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useOnboardingV2 } from "../../context/OnboardingV2Context";
import { useOnboardingSounds } from "../../hooks/useSoundEffects";
import { useKeyboardNavigation, useFocusTrap, useScreenReaderAnnouncement } from "../../hooks/useAccessibility";

// Phase 2 Components
import HeroIntro from "./HeroIntro";
import PersonaSelection from "./PersonaSelection";
import CompletionCelebration from "./CompletionCelebration";

// Phase 3 Components
import WhatsNewModal from "./WhatsNewModal";

// Phase 4 Components
import AchievementToast from "./AchievementToast";
import ConfettiExplosion, { confettiPresets } from "./ConfettiExplosion";

/**
 * Master OnboardingV2 Component
 * Orchestrates the entire onboarding experience with all phases integrated
 */
export default function OnboardingV2() {
  const {
    currentView,
    isActive,
    progress,
    shouldShowWhatsNew,
    achievements,
    setCurrentView,
    finishOnboarding,
  } = useOnboardingV2();

  const {
    playAchievementSound,
    playSuccessSound,
    playCompleteSound,
    isEnabled: soundEnabled,
  } = useOnboardingSounds();

  const { announce } = useScreenReaderAnnouncement();
  const containerRef = useRef(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiConfig, setConfettiConfig] = useState(confettiPresets.celebration);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const previousAchievementsRef = useRef([]);

  // Keyboard navigation
  useKeyboardNavigation({
    onEscape: () => {
      if (currentView === "complete" || currentView === "intro") {
        finishOnboarding();
      }
    },
    enabled: isActive,
  });

  // Focus trap for modal views
  useFocusTrap(containerRef, isActive && currentView !== null);

  // Monitor for new achievements and trigger celebrations
  useEffect(() => {
    if (achievements.length > previousAchievementsRef.current.length) {
      const newAchievements = achievements.slice(previousAchievementsRef.current.length);

      newAchievements.forEach((achievement) => {
        // Play sound
        if (soundEnabled) {
          playAchievementSound();
        }

        // Show confetti
        setConfettiConfig(confettiPresets.achievement);
        setShowConfetti(true);

        // Announce to screen readers
        announce(`Badge débloqué: ${achievement.name}. ${achievement.description}`, "assertive");

        // Hide confetti after duration
        setTimeout(() => setShowConfetti(false), 3000);
      });
    }

    previousAchievementsRef.current = achievements;
  }, [achievements, soundEnabled, playAchievementSound, announce]);

  // Monitor step completion and provide feedback
  useEffect(() => {
    if (progress.completedSteps.length > 0 && soundEnabled) {
      playCompleteSound();
    }
  }, [progress.completedSteps.length, soundEnabled, playCompleteSound]);

  // Show What's New modal after onboarding completes
  useEffect(() => {
    if (currentView === "complete" && shouldShowWhatsNew) {
      // Delay showing What's New until after completion celebration
      const timer = setTimeout(() => {
        setShowWhatsNew(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [currentView, shouldShowWhatsNew]);

  // Handle completion celebration
  useEffect(() => {
    if (currentView === "complete") {
      // Play success sound
      if (soundEnabled) {
        playSuccessSound();
      }

      // Trigger celebration confetti
      setConfettiConfig(confettiPresets.celebration);
      setShowConfetti(true);

      // Announce completion
      announce(
        `Félicitations! Vous avez terminé le parcours d'introduction. ${progress.completedSteps.length} étapes complétées sur ${progress.totalSteps}.`,
        "assertive"
      );

      // Hide confetti after duration
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [currentView, soundEnabled, playSuccessSound, announce, progress]);

  // Don't render if onboarding is not active
  if (!isActive && currentView === null) {
    return (
      <>
        {/* Achievement toasts are always visible */}
        <AchievementToast />

        {/* What's New modal (can appear outside onboarding) */}
        <WhatsNewModal isOpen={showWhatsNew} onClose={() => setShowWhatsNew(false)} />
      </>
    );
  }

  return (
    <>
      {/* Main onboarding container */}
      <div ref={containerRef} className="onboarding-v2-container">
        <AnimatePresence mode="wait">
          {currentView === "intro" && <HeroIntro key="intro" />}

          {currentView === "persona" && <PersonaSelection key="persona" />}

          {currentView === "complete" && <CompletionCelebration key="complete" />}
        </AnimatePresence>
      </div>

      {/* Global Phase 4 components */}
      <AchievementToast />

      <ConfettiExplosion
        active={showConfetti}
        {...confettiConfig}
        onComplete={() => setShowConfetti(false)}
      />

      {/* What's New Modal */}
      <WhatsNewModal isOpen={showWhatsNew} onClose={() => setShowWhatsNew(false)} />

      {/* Accessibility announcements container */}
      <div
        id="sr-announcements"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: "absolute",
          left: "-10000px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      />
    </>
  );
}

/**
 * Lightweight wrapper for showing What's New outside of onboarding
 */
export function WhatsNewStandalone() {
  const [isOpen, setIsOpen] = useState(true);

  return <WhatsNewModal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}

/**
 * Achievement Toast standalone (for use anywhere in the app)
 */
export { AchievementToast };
