// Main Onboarding Component
export { default as OnboardingV2, WhatsNewStandalone, AchievementToast } from "./OnboardingV2";

// Phase 2: Core Experience Components
export { default as HeroIntro } from "./HeroIntro";
export { default as PersonaSelection } from "./PersonaSelection";
export { default as InteractiveFeatureCard, exampleFeatures } from "./InteractiveFeatureCard";
export { default as ProgressVisualization } from "./ProgressVisualization";
export { default as CompletionCelebration } from "./CompletionCelebration";

// Phase 3: What's New System
export { default as WhatsNewModal } from "./WhatsNewModal";
export { default as Changelog } from "./Changelog";

// Phase 4: Polish & Gamification
export { default as ConfettiExplosion, confettiPresets } from "./ConfettiExplosion";
export * from "./AccessibilityUtils";

// Context and Hooks
export { OnboardingV2Provider, useOnboardingV2, ONBOARDING_PERSONAS, STORAGE_KEYS } from "../../context/OnboardingV2Context";
export { useWhatsNew, useChangelog } from "../../hooks/useWhatsNew";
export { useSoundEffects, useOnboardingSounds } from "../../hooks/useSoundEffects";
export * from "../../hooks/useAccessibility";
