"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook for managing sound effects in the onboarding experience
 * Uses Web Audio API to generate sounds without requiring audio files
 */
export function useSoundEffects() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [volume, setVolume] = useState(0.3);
  const audioContextRef = useRef(null);

  useEffect(() => {
    // Initialize AudioContext on first user interaction (required by browsers)
    if (typeof window !== "undefined" && !audioContextRef.current) {
      const initAudio = () => {
        try {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
          console.warn("Web Audio API not supported:", error);
        }
      };

      // Initialize on first user interaction
      document.addEventListener("click", initAudio, { once: true });
      document.addEventListener("keydown", initAudio, { once: true });

      return () => {
        document.removeEventListener("click", initAudio);
        document.removeEventListener("keydown", initAudio);
      };
    }
  }, []);

  const playSound = useCallback(
    (type) => {
      if (!isEnabled || !audioContextRef.current) return;

      const ctx = audioContextRef.current;
      const now = ctx.currentTime;

      // Create gain node for volume control
      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);
      gainNode.gain.value = volume;

      switch (type) {
        case "achievement": {
          // Achievement: ascending arpeggio
          const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
          frequencies.forEach((freq, i) => {
            const oscillator = ctx.createOscillator();
            oscillator.type = "sine";
            oscillator.frequency.value = freq;
            oscillator.connect(gainNode);
            oscillator.start(now + i * 0.1);
            oscillator.stop(now + i * 0.1 + 0.2);
          });
          break;
        }

        case "complete": {
          // Step completion: pleasant "ding"
          const oscillator = ctx.createOscillator();
          oscillator.type = "sine";
          oscillator.frequency.value = 800;
          oscillator.connect(gainNode);
          gainNode.gain.setValueAtTime(volume, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          oscillator.start(now);
          oscillator.stop(now + 0.3);
          break;
        }

        case "click": {
          // Button click: subtle pop
          const oscillator = ctx.createOscillator();
          oscillator.type = "sine";
          oscillator.frequency.value = 200;
          oscillator.connect(gainNode);
          gainNode.gain.setValueAtTime(volume * 0.5, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
          oscillator.start(now);
          oscillator.stop(now + 0.05);
          break;
        }

        case "hover": {
          // Hover: very subtle tone
          const oscillator = ctx.createOscillator();
          oscillator.type = "sine";
          oscillator.frequency.value = 400;
          oscillator.connect(gainNode);
          gainNode.gain.setValueAtTime(volume * 0.2, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
          oscillator.start(now);
          oscillator.stop(now + 0.03);
          break;
        }

        case "error": {
          // Error: descending tone
          const oscillator = ctx.createOscillator();
          oscillator.type = "sawtooth";
          oscillator.frequency.setValueAtTime(400, now);
          oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.2);
          oscillator.connect(gainNode);
          gainNode.gain.setValueAtTime(volume * 0.4, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          oscillator.start(now);
          oscillator.stop(now + 0.2);
          break;
        }

        case "success": {
          // Success: bright celebratory sound
          const frequencies = [523.25, 659.25, 783.99];
          frequencies.forEach((freq, i) => {
            const oscillator = ctx.createOscillator();
            oscillator.type = "triangle";
            oscillator.frequency.value = freq;
            oscillator.connect(gainNode);
            oscillator.start(now + i * 0.05);
            oscillator.stop(now + i * 0.05 + 0.4);
          });
          break;
        }

        case "levelUp": {
          // Level up: rising sweep with harmonics
          const oscillator1 = ctx.createOscillator();
          const oscillator2 = ctx.createOscillator();
          oscillator1.type = "sine";
          oscillator2.type = "sine";

          oscillator1.frequency.setValueAtTime(200, now);
          oscillator1.frequency.exponentialRampToValueAtTime(800, now + 0.5);
          oscillator2.frequency.setValueAtTime(400, now);
          oscillator2.frequency.exponentialRampToValueAtTime(1600, now + 0.5);

          oscillator1.connect(gainNode);
          oscillator2.connect(gainNode);

          gainNode.gain.setValueAtTime(volume * 0.3, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

          oscillator1.start(now);
          oscillator2.start(now);
          oscillator1.stop(now + 0.5);
          oscillator2.stop(now + 0.5);
          break;
        }

        case "notification": {
          // Notification: two-tone alert
          [600, 800].forEach((freq, i) => {
            const oscillator = ctx.createOscillator();
            oscillator.type = "sine";
            oscillator.frequency.value = freq;
            oscillator.connect(gainNode);
            oscillator.start(now + i * 0.1);
            oscillator.stop(now + i * 0.1 + 0.15);
          });
          break;
        }

        default:
          console.warn(`Unknown sound type: ${type}`);
      }
    },
    [isEnabled, volume]
  );

  const toggle = useCallback(() => {
    setIsEnabled((prev) => !prev);
  }, []);

  const setVolumeLevel = useCallback((newVolume) => {
    setVolume(Math.max(0, Math.min(1, newVolume)));
  }, []);

  return {
    playSound,
    isEnabled,
    toggle,
    setVolume: setVolumeLevel,
    volume,
  };
}

// Convenience hook for onboarding-specific sounds
export function useOnboardingSounds() {
  const { playSound, isEnabled, toggle, volume, setVolume } = useSoundEffects();

  return {
    // Sound effects
    playAchievementSound: useCallback(() => playSound("achievement"), [playSound]),
    playCompleteSound: useCallback(() => playSound("complete"), [playSound]),
    playClickSound: useCallback(() => playSound("click"), [playSound]),
    playHoverSound: useCallback(() => playSound("hover"), [playSound]),
    playErrorSound: useCallback(() => playSound("error"), [playSound]),
    playSuccessSound: useCallback(() => playSound("success"), [playSound]),
    playLevelUpSound: useCallback(() => playSound("levelUp"), [playSound]),
    playNotificationSound: useCallback(() => playSound("notification"), [playSound]),

    // Controls
    isEnabled,
    toggleSound: toggle,
    volume,
    setVolume,
  };
}
