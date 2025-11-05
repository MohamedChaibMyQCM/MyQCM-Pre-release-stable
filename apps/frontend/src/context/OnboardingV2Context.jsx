"use client";

import { createContext, useContext, useReducer, useEffect, useCallback } from "react";

// ===== TYPES & CONSTANTS =====
const ONBOARDING_PERSONAS = {
  BEGINNER: {
    id: "beginner",
    name: "Nouvel Étudiant",
    icon: "🎓",
    description: "Je débute et je veux tout découvrir",
    duration: "5-7 min",
    stepCount: 10,
  },
  INTERMEDIATE: {
    id: "intermediate",
    name: "Étudiant Expérimenté",
    icon: "📚",
    description: "Je connais les bases, montrez-moi l'essentiel",
    duration: "2-3 min",
    stepCount: 5,
  },
  ADVANCED: {
    id: "advanced",
    name: "Expert Rapide",
    icon: "⚡",
    description: "Juste les nouveautés importantes",
    duration: "1 min",
    stepCount: 3,
  },
};

const STORAGE_KEYS = {
  ONBOARDING_STATE: "onboardingV2_state",
  PERSONA: "onboardingV2_persona",
  PROGRESS: "onboardingV2_progress",
  WHATS_NEW: "onboardingV2_whatsNew",
  ACHIEVEMENTS: "onboardingV2_achievements",
};

// ===== ACTION TYPES =====
const ActionTypes = {
  // Onboarding flow
  SET_PERSONA: "SET_PERSONA",
  START_ONBOARDING: "START_ONBOARDING",
  COMPLETE_STEP: "COMPLETE_STEP",
  SKIP_STEP: "SKIP_STEP",
  PAUSE_TOUR: "PAUSE_TOUR",
  RESUME_TOUR: "RESUME_TOUR",
  FINISH_ONBOARDING: "FINISH_ONBOARDING",
  RESET_ONBOARDING: "RESET_ONBOARDING",

  // What's New
  SET_UNSEEN_FEATURES: "SET_UNSEEN_FEATURES",
  MARK_FEATURE_SEEN: "MARK_FEATURE_SEEN",
  MARK_FEATURE_TRIED: "MARK_FEATURE_TRIED",
  DISMISS_FEATURE: "DISMISS_FEATURE",
  UPDATE_WHATS_NEW_PREFERENCES: "UPDATE_WHATS_NEW_PREFERENCES",

  // Gamification
  UNLOCK_ACHIEVEMENT: "UNLOCK_ACHIEVEMENT",
  ADD_XP: "ADD_XP",

  // UI State
  SET_CURRENT_VIEW: "SET_CURRENT_VIEW",
  RECORD_INTERACTION: "RECORD_INTERACTION",
};

// ===== INITIAL STATE =====
const initialState = {
  // User preferences
  persona: null,

  // Progress tracking
  progress: {
    currentStep: 0,
    totalSteps: 0,
    completedSteps: [],
    skippedSteps: [],
    timeSpent: 0,
    startedAt: null,
    completedAt: null,
  },

  // Feature announcements (What's New)
  whatsNew: {
    unseenFeatures: [],
    seenFeatureIds: [],
    triedFeatureIds: [],
    dismissedFeatureIds: [],
    lastChecked: null,
    preferences: {
      showOnLogin: true,
      frequency: "weekly", // weekly | monthly | major_only | never
    },
  },

  // Gamification
  achievements: [],
  xpEarned: 0,

  // Analytics
  interactions: [],

  // UI state
  isActive: false,
  isPaused: false,
  currentView: null, // null | 'intro' | 'persona' | 'tour' | 'whatsnew' | 'complete'
  showWhatsNewModal: false,
};

// ===== REDUCER =====
function onboardingReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_PERSONA:
      return {
        ...state,
        persona: action.payload,
        progress: {
          ...state.progress,
          totalSteps: ONBOARDING_PERSONAS[action.payload.toUpperCase()]?.stepCount || 10,
        },
      };

    case ActionTypes.START_ONBOARDING:
      return {
        ...state,
        isActive: true,
        isPaused: false,
        currentView: action.payload.view || "intro",
        progress: {
          ...state.progress,
          startedAt: new Date().toISOString(),
          currentStep: 0,
        },
      };

    case ActionTypes.COMPLETE_STEP:
      const newCompletedSteps = [...state.progress.completedSteps, action.payload.stepId];
      return {
        ...state,
        progress: {
          ...state.progress,
          completedSteps: newCompletedSteps,
          currentStep: state.progress.currentStep + 1,
        },
        xpEarned: state.xpEarned + (action.payload.xp || 10),
      };

    case ActionTypes.SKIP_STEP:
      return {
        ...state,
        progress: {
          ...state.progress,
          skippedSteps: [...state.progress.skippedSteps, action.payload.stepId],
          currentStep: state.progress.currentStep + 1,
        },
      };

    case ActionTypes.PAUSE_TOUR:
      return {
        ...state,
        isPaused: true,
      };

    case ActionTypes.RESUME_TOUR:
      return {
        ...state,
        isPaused: false,
      };

    case ActionTypes.FINISH_ONBOARDING:
      return {
        ...state,
        isActive: false,
        currentView: "complete",
        progress: {
          ...state.progress,
          completedAt: new Date().toISOString(),
        },
      };

    case ActionTypes.RESET_ONBOARDING:
      return {
        ...initialState,
        whatsNew: state.whatsNew, // Preserve What's New data
      };

    case ActionTypes.SET_UNSEEN_FEATURES:
      return {
        ...state,
        whatsNew: {
          ...state.whatsNew,
          unseenFeatures: action.payload,
          lastChecked: new Date().toISOString(),
        },
      };

    case ActionTypes.MARK_FEATURE_SEEN:
      return {
        ...state,
        whatsNew: {
          ...state.whatsNew,
          seenFeatureIds: [...state.whatsNew.seenFeatureIds, action.payload.featureId],
          unseenFeatures: state.whatsNew.unseenFeatures.filter(
            (f) => f.id !== action.payload.featureId
          ),
        },
      };

    case ActionTypes.MARK_FEATURE_TRIED:
      return {
        ...state,
        whatsNew: {
          ...state.whatsNew,
          triedFeatureIds: [...state.whatsNew.triedFeatureIds, action.payload.featureId],
        },
        xpEarned: state.xpEarned + (action.payload.xp || 25),
      };

    case ActionTypes.DISMISS_FEATURE:
      return {
        ...state,
        whatsNew: {
          ...state.whatsNew,
          dismissedFeatureIds: [...state.whatsNew.dismissedFeatureIds, action.payload.featureId],
          unseenFeatures: state.whatsNew.unseenFeatures.filter(
            (f) => f.id !== action.payload.featureId
          ),
        },
      };

    case ActionTypes.UPDATE_WHATS_NEW_PREFERENCES:
      return {
        ...state,
        whatsNew: {
          ...state.whatsNew,
          preferences: {
            ...state.whatsNew.preferences,
            ...action.payload,
          },
        },
      };

    case ActionTypes.UNLOCK_ACHIEVEMENT:
      if (state.achievements.find((a) => a.id === action.payload.id)) {
        return state; // Already unlocked
      }
      return {
        ...state,
        achievements: [
          ...state.achievements,
          {
            ...action.payload,
            unlockedAt: new Date().toISOString(),
          },
        ],
        xpEarned: state.xpEarned + (action.payload.xp || 50),
      };

    case ActionTypes.ADD_XP:
      return {
        ...state,
        xpEarned: state.xpEarned + action.payload.amount,
      };

    case ActionTypes.SET_CURRENT_VIEW:
      return {
        ...state,
        currentView: action.payload,
      };

    case ActionTypes.RECORD_INTERACTION:
      return {
        ...state,
        interactions: [
          ...state.interactions,
          {
            ...action.payload,
            timestamp: new Date().toISOString(),
          },
        ],
      };

    default:
      return state;
  }
}

// ===== CONTEXT =====
const OnboardingV2Context = createContext(null);

// ===== PROVIDER =====
export function OnboardingV2Provider({ children }) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState, (initial) => {
    // Initialize from localStorage if available
    if (typeof window === "undefined") return initial;

    try {
      const savedState = localStorage.getItem(STORAGE_KEYS.ONBOARDING_STATE);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        return { ...initial, ...parsed };
      }
    } catch (error) {
      console.error("Failed to load onboarding state:", error);
    }
    return initial;
  });

  // Persist state to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_STATE, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save onboarding state:", error);
    }
  }, [state]);

  // Track time spent
  useEffect(() => {
    if (!state.isActive || state.isPaused) return;

    const interval = setInterval(() => {
      dispatch({
        type: ActionTypes.COMPLETE_STEP,
        payload: { stepId: "time-tracking", xp: 0 },
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isActive, state.isPaused]);

  // ===== ACTIONS =====
  const setPersona = useCallback((persona) => {
    dispatch({ type: ActionTypes.SET_PERSONA, payload: persona });
  }, []);

  const startOnboarding = useCallback((view = "intro") => {
    dispatch({ type: ActionTypes.START_ONBOARDING, payload: { view } });
    recordInteraction({ action: "start_onboarding", view });
  }, []);

  const completeStep = useCallback((stepId, xp = 10) => {
    dispatch({ type: ActionTypes.COMPLETE_STEP, payload: { stepId, xp } });
    recordInteraction({ action: "complete_step", stepId });

    // Check for milestone achievements
    const newStepCount = state.progress.completedSteps.length + 1;
    if (newStepCount === 1) {
      unlockAchievement({
        id: "first-step",
        name: "Premier Pas",
        description: "Compléter la première étape",
        icon: "🎯",
        xp: 25,
      });
    } else if (newStepCount === 5) {
      unlockAchievement({
        id: "halfway-hero",
        name: "À Mi-Chemin",
        description: "Atteindre 50% du parcours",
        icon: "⭐",
        xp: 50,
      });
    }
  }, [state.progress.completedSteps.length]);

  const skipStep = useCallback((stepId) => {
    dispatch({ type: ActionTypes.SKIP_STEP, payload: { stepId } });
    recordInteraction({ action: "skip_step", stepId });
  }, []);

  const pauseTour = useCallback(() => {
    dispatch({ type: ActionTypes.PAUSE_TOUR });
    recordInteraction({ action: "pause_tour" });
  }, []);

  const resumeTour = useCallback(() => {
    dispatch({ type: ActionTypes.RESUME_TOUR });
    recordInteraction({ action: "resume_tour" });
  }, []);

  const finishOnboarding = useCallback(() => {
    dispatch({ type: ActionTypes.FINISH_ONBOARDING });
    recordInteraction({ action: "finish_onboarding" });

    // Completion achievement
    unlockAchievement({
      id: "onboarding-complete",
      name: "Parcours Terminé",
      description: "Compléter tout le parcours d'onboarding",
      icon: "🏆",
      xp: 100,
    });
  }, []);

  const resetOnboarding = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_ONBOARDING });
  }, []);

  const setUnseenFeatures = useCallback((features) => {
    dispatch({ type: ActionTypes.SET_UNSEEN_FEATURES, payload: features });
  }, []);

  const markFeatureAsSeen = useCallback((featureId) => {
    dispatch({ type: ActionTypes.MARK_FEATURE_SEEN, payload: { featureId } });
    recordInteraction({ action: "feature_seen", featureId });
  }, []);

  const markFeatureAsTried = useCallback((featureId, xp = 25) => {
    dispatch({ type: ActionTypes.MARK_FEATURE_TRIED, payload: { featureId, xp } });
    recordInteraction({ action: "feature_tried", featureId });
  }, []);

  const dismissFeature = useCallback((featureId) => {
    dispatch({ type: ActionTypes.DISMISS_FEATURE, payload: { featureId } });
    recordInteraction({ action: "feature_dismissed", featureId });
  }, []);

  const updateWhatsNewPreferences = useCallback((preferences) => {
    dispatch({ type: ActionTypes.UPDATE_WHATS_NEW_PREFERENCES, payload: preferences });
  }, []);

  const unlockAchievement = useCallback((achievement) => {
    dispatch({ type: ActionTypes.UNLOCK_ACHIEVEMENT, payload: achievement });
    recordInteraction({ action: "achievement_unlocked", achievementId: achievement.id });
  }, []);

  const addXP = useCallback((amount) => {
    dispatch({ type: ActionTypes.ADD_XP, payload: { amount } });
  }, []);

  const setCurrentView = useCallback((view) => {
    dispatch({ type: ActionTypes.SET_CURRENT_VIEW, payload: view });
  }, []);

  const recordInteraction = useCallback((interaction) => {
    dispatch({ type: ActionTypes.RECORD_INTERACTION, payload: interaction });
  }, []);

  // ===== COMPUTED VALUES =====
  const completionPercentage =
    state.progress.totalSteps > 0
      ? Math.round((state.progress.completedSteps.length / state.progress.totalSteps) * 100)
      : 0;

  const hasUnseenFeatures = state.whatsNew.unseenFeatures.length > 0;

  const shouldShowWhatsNew =
    hasUnseenFeatures &&
    state.whatsNew.preferences.showOnLogin &&
    !state.isActive;

  const contextValue = {
    // State
    ...state,
    personas: ONBOARDING_PERSONAS,
    completionPercentage,
    hasUnseenFeatures,
    shouldShowWhatsNew,

    // Actions
    setPersona,
    startOnboarding,
    completeStep,
    skipStep,
    pauseTour,
    resumeTour,
    finishOnboarding,
    resetOnboarding,
    setUnseenFeatures,
    markFeatureAsSeen,
    markFeatureAsTried,
    dismissFeature,
    updateWhatsNewPreferences,
    unlockAchievement,
    addXP,
    setCurrentView,
    recordInteraction,
  };

  return (
    <OnboardingV2Context.Provider value={contextValue}>
      {children}
    </OnboardingV2Context.Provider>
  );
}

// ===== HOOK =====
export function useOnboardingV2() {
  const context = useContext(OnboardingV2Context);
  if (context === null) {
    throw new Error("useOnboardingV2 must be used within OnboardingV2Provider");
  }
  return context;
}

// ===== EXPORT CONSTANTS =====
export { ONBOARDING_PERSONAS, STORAGE_KEYS };
