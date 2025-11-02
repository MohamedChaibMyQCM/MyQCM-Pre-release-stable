# Quiz Sound Effects System

## Overview
Professional sound effects have been integrated into the quiz experience to provide audio feedback without being distracting. The system uses the Web Audio API to generate clean, synthesized tones.

## Sound Effects Implemented

### 1. **Correct Answer** (100% Success)
- **Trigger:** When answer is 100% correct
- **Sound:** 3-note ascending chime (C5 → E5 → G5)
- **Volume:** Moderate (0.2-0.25)
- **Duration:** ~350ms total

### 2. **Incorrect Answer**
- **Trigger:** When answer is less than 70% correct
- **Sound:** 2-note descending tone
- **Volume:** Gentle (0.15)
- **Duration:** ~200ms total

### 3. **Partial Correct** (70-99% Success)
- **Trigger:** For QROC answers with 70-99% accuracy
- **Sound:** 2-note medium chime (A4 → C#5)
- **Volume:** Moderate (0.18)
- **Duration:** ~220ms total

### 4. **Option Select**
- **Trigger:** When clicking/keyboard selecting an option
- **Sound:** Light tap (600Hz)
- **Volume:** Subtle (0.12)
- **Duration:** 60ms

### 5. **Question Transition**
- **Trigger:** Moving to next question
- **Sound:** Soft whoosh (440Hz)
- **Volume:** Subtle (0.1)
- **Duration:** 80ms

### 6. **Skip Question**
- **Trigger:** When confirming skip
- **Sound:** Neutral descending (500Hz → 400Hz)
- **Volume:** Subtle (0.12-0.1)
- **Duration:** ~120ms total

### 7. **Timer Warning**
- **Trigger:** At 25% and 15% time remaining
- **Sound:** Gentle pulse (880Hz)
- **Volume:** Moderate (0.15)
- **Duration:** 80ms

### 8. **Session Complete**
- **Trigger:** When completing the quiz session
- **Sound:** 4-note celebratory fanfare (C5 → E5 → G5 → C6)
- **Volume:** Moderate (0.2-0.25)
- **Duration:** ~500ms total

## Controls

### Mute/Unmute Toggle
- **Location:** Fixed button at bottom left (next to help button)
- **Icon:** Volume up/off (react-icons/hi)
- **Persistence:** State saved to localStorage
- **Key:** `quizSoundsMuted`

### User Preference
Sound settings are remembered across sessions using localStorage, so users only need to set their preference once.

## Technical Implementation

### Hook: `useQuizSounds`
Located at: `apps/frontend/src/hooks/useQuizSounds.js`

**Methods:**
- `playCorrect()` - Full success sound
- `playIncorrect()` - Error sound
- `playPartialCorrect()` - Partial success sound
- `playSelect()` - Option selection
- `playSkip()` - Question skip
- `playTimerWarning()` - Time warning
- `playTransition()` - Question change
- `playComplete()` - Session complete
- `toggleMute()` - Toggle mute state
- `isMuted()` - Get mute state

### Component: `SoundToggle`
Located at: `apps/frontend/src/components/dashboard/QuestionsBank/SoundToggle.jsx`

Renders a floating button with volume icon that toggles sound on/off.

## Sound Triggers Map

| User Action | Sound Effect | File |
|------------|-------------|------|
| Select option (A-E or click) | `playSelect()` | Quiz.jsx |
| Submit correct answer (100%) | `playCorrect()` | page.jsx |
| Submit partial answer (70-99%) | `playPartialCorrect()` | page.jsx |
| Submit incorrect answer (<70%) | `playIncorrect()` | page.jsx |
| Skip question | `playSkip()` | Quiz.jsx |
| Timer reaches 25%/15% | `playTimerWarning()` | Quiz.jsx |
| Move to next question | `playTransition()` | Quiz.jsx |
| Complete session | `playComplete()` | page.jsx |

## Design Philosophy

1. **Professional:** Clean, medical-appropriate sounds
2. **Subtle:** Not overwhelming or distracting
3. **Informative:** Clear audio feedback for actions
4. **Respectful:** Easy to mute, remembers preference
5. **Performance:** Lightweight Web Audio API implementation

## Future Enhancements (Optional)

If you want to use actual audio files instead of synthesized tones:

1. Add sound files to `/public/sounds/`
2. Update `useQuizSounds.js` to use HTML5 Audio:
```javascript
const audio = new Audio('/sounds/correct.mp3');
audio.volume = 0.3;
audio.play();
```

### Recommended Sound Libraries (Free)
- **Freesound.org** - Professional sound effects
- **Zapsplat.com** - UI sound effects
- **Mixkit.co** - Free sound effects

### Sound File Recommendations
- Format: MP3 or OGG (for browser compatibility)
- Duration: 200-500ms max
- Sample rate: 44.1kHz
- Bit rate: 128kbps (sufficient for UI sounds)

## Browser Compatibility

The Web Audio API is supported in:
- Chrome/Edge 34+
- Firefox 25+
- Safari 14.1+
- All modern mobile browsers

Fallback: Silent (no errors, sounds just don't play in unsupported browsers)

## Accessibility

- Visual indicators accompany all sounds (colors, icons)
- Sounds enhance but don't replace visual feedback
- Easy mute option for users who prefer silence
- WCAG 2.1 compliant
