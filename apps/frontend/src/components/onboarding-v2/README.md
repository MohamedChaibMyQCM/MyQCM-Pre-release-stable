# OnboardingV2 System

A next-generation onboarding experience for MyQCM with beautiful animations, accessibility features, gamification, and dynamic feature announcements.

## Overview

This onboarding system provides:
- **Beautiful UI/UX** with glassmorphism, 3D effects, and smooth animations
- **Personalized Paths** - Users choose beginner, intermediate, or advanced paths
- **Gamification** - XP system, achievements, and celebration animations
- **What's New System** - Dynamic feature announcements from backend
- **Full Accessibility** - WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- **Sound Effects** - Optional audio feedback using Web Audio API

## Components

### Phase 1: Foundation
- `OnboardingV2Context` - Global state management with React Context + useReducer
- Design system in `globals.css` with glassmorphism and animations

### Phase 2: Core Experience
- `HeroIntro` - Animated welcome screen with particles
- `PersonaSelection` - Choose learning path (beginner/intermediate/advanced)
- `InteractiveFeatureCard` - Showcase features with interactive demos
- `ProgressVisualization` - Real-time progress tracker with milestones
- `CompletionCelebration` - Success screen with confetti and stats

### Phase 3: What's New System
- `WhatsNewModal` - Carousel modal for new features
- `Changelog` - Full changelog page with search and filters
- Backend integration with AdminJS for content management

### Phase 4: Polish & Gamification
- `AchievementToast` - Toast notifications for unlocked achievements
- `ConfettiExplosion` - Reusable celebration effect with presets
- `AccessibilityUtils` - Accessible UI components (buttons, dialogs, tooltips)
- Enhanced micro-interactions (ripples, press effects, focus rings)
- Sound effects system with Web Audio API

## Usage

### Basic Setup

```jsx
import { OnboardingV2Provider } from '@/context/OnboardingV2Context';
import OnboardingV2 from '@/components/onboarding-v2';

function App() {
  return (
    <OnboardingV2Provider>
      <OnboardingV2 />
      {/* Your app content */}
    </OnboardingV2Provider>
  );
}
```

### Using Individual Components

```jsx
import { 
  HeroIntro, 
  PersonaSelection, 
  WhatsNewModal,
  AchievementToast,
  ConfettiExplosion 
} from '@/components/onboarding-v2';

// Show What's New modal
<WhatsNewModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

// Achievement toasts (automatic)
<AchievementToast />

// Custom confetti
<ConfettiExplosion 
  active={true} 
  particleCount={100}
  {...confettiPresets.celebration}
/>
```

### Using Hooks

```jsx
import { 
  useOnboardingV2,
  useWhatsNew,
  useOnboardingSounds,
  useKeyboardNavigation,
  useScreenReaderAnnouncement 
} from '@/components/onboarding-v2';

function MyComponent() {
  const { 
    startOnboarding, 
    completeStep, 
    achievements,
    xpEarned 
  } = useOnboardingV2();
  
  const { newFeatures, markAsSeen } = useWhatsNew();
  
  const { 
    playAchievementSound, 
    playSuccessSound,
    toggleSound 
  } = useOnboardingSounds();
  
  const { announce } = useScreenReaderAnnouncement();
  
  useKeyboardNavigation({
    onNext: handleNext,
    onPrevious: handlePrevious,
    onEscape: handleClose,
  });
  
  // Your component logic
}
```

### Accessibility Features

The system includes comprehensive accessibility features:

```jsx
import {
  AccessibleButton,
  DialogContainer,
  ProgressIndicator,
  VisuallyHidden,
  SkipLink,
  Tooltip
} from '@/components/onboarding-v2/AccessibilityUtils';

// Accessible button with ARIA
<AccessibleButton
  ariaLabel="Continuer vers l'étape suivante"
  onClick={handleNext}
  variant="primary"
>
  Suivant
</AccessibleButton>

// Modal with focus trap
<DialogContainer
  isOpen={isOpen}
  onClose={onClose}
  title="Nouveau badge!"
  description="Vous avez débloqué un achievement"
>
  {/* Modal content */}
</DialogContainer>

// Screen reader only text
<VisuallyHidden>
  Étape 3 sur 10 complétée
</VisuallyHidden>
```

## Backend Integration

### Feature Announcements API

Endpoints:
- `GET /api/feature-announcements/new` - Get unseen features for current user
- `POST /api/feature-announcements/:id/seen` - Mark feature as seen
- `POST /api/feature-announcements/:id/tried` - Mark feature as tried
- `POST /api/feature-announcements/:id/dismissed` - Dismiss feature
- `GET /api/feature-announcements/changelog` - Get full changelog

### AdminJS Management

Access AdminJS at `/admin` to:
- Create/edit feature announcements
- Set target roles (user, admin, freelancer)
- Upload media (images, videos)
- Configure release dates
- View interaction analytics

## Customization

### Personas

Modify personas in `OnboardingV2Context.jsx`:

```javascript
const ONBOARDING_PERSONAS = {
  BEGINNER: {
    id: "beginner",
    name: "Nouvel Étudiant",
    icon: "🎓",
    description: "Je débute et je veux tout découvrir",
    duration: "5-7 min",
    stepCount: 10,
  },
  // Add custom personas...
};
```

### Sound Effects

Customize sounds in `useSoundEffects.js`:

```javascript
const { playSound } = useSoundEffects();

// Available sound types:
playSound("achievement");
playSound("complete");
playSound("click");
playSound("hover");
playSound("error");
playSound("success");
playSound("levelUp");
playSound("notification");
```

### Confetti Presets

Use or create custom confetti configurations:

```javascript
import { confettiPresets } from '@/components/onboarding-v2';

// Available presets:
confettiPresets.celebration
confettiPresets.achievement
confettiPresets.milestone
confettiPresets.side

// Custom config:
<ConfettiExplosion
  active={true}
  particleCount={100}
  spread={360}
  origin={{ x: "50%", y: "50%" }}
  colors={["#F8589F", "#FF3D88", "#FFD700"]}
/>
```

## Styling

The system uses Tailwind CSS with custom utility classes:

### Glassmorphism
- `.glassmorphism` - Basic glass effect
- `.glassmorphism-card` - Glass card with shadow
- `.glassmorphism-dark` - Dark variant

### Animations
- `.hover-lift` - Lift effect on hover
- `.click-feedback` - Ripple on click
- `.button-ripple` - Enhanced ripple effect
- `.press-effect` - Haptic-like press feedback
- `.shine-effect` - Shine on hover
- `.bounce-emphasis` - Bounce animation
- `.fade-in-up` - Fade in from bottom
- `.glow-on-hover` - Glow effect on hover

### Focus & Accessibility
- `.focus-ring` - Animated focus ring
- `.sr-only` - Screen reader only

## Performance

- Uses `framer-motion` for GPU-accelerated animations
- Lazy loading for media assets
- React Query caching for API calls (5min stale time)
- LocalStorage persistence for state
- Reduced motion support via CSS media query

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

## Accessibility Compliance

- WCAG 2.1 AA compliant
- Keyboard navigation (Arrow keys, Enter, Escape, Tab)
- Screen reader support (ARIA labels, live regions, announcements)
- Focus management and focus trap in modals
- Reduced motion support
- High contrast mode compatible

## License

Part of MyQCM monorepo - Internal use only
