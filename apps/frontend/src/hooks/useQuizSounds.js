import { useEffect, useRef, useCallback, useMemo } from "react";
import { Howl } from "howler";

/**
 * Custom hook for managing quiz sound effects using Howler.js
 * More reliable than raw Web Audio API
 */
export const useQuizSounds = () => {
  const isMutedRef = useRef(false);
  const soundsRef = useRef(null);

  // Initialize sounds
  useEffect(() => {
    // Check if user has muted sounds in localStorage
    const savedMuteState = localStorage.getItem("quizSoundsMuted");
    isMutedRef.current = savedMuteState === "true";

    // Initialize sounds using Howler with high-quality WAV files
    soundsRef.current = {
      select: new Howl({
        src: ['/sounds/select.wav'],
        volume: 0.4,
        preload: true
      }),
      correct: new Howl({
        src: ['/sounds/correct.wav'],
        volume: 0.5,
        preload: true
      }),
      incorrect: new Howl({
        src: ['/sounds/incorrect.wav'],
        volume: 0.4,
        preload: true
      }),
      skip: new Howl({
        src: ['/sounds/skip.wav'],
        volume: 0.4,
        preload: true
      }),
      warning: new Howl({
        src: ['/sounds/warning.wav'],
        volume: 0.5,
        preload: true
      }),
      transition: new Howl({
        src: ['/sounds/transition.wav'],
        volume: 0.3,
        preload: true
      }),
      complete: new Howl({
        src: ['/sounds/complete.wav'],
        volume: 0.5,
        preload: true
      })
    };

    console.log('✓ Howler sounds initialized');

    return () => {
      // Cleanup
      if (soundsRef.current) {
        Object.values(soundsRef.current).forEach(sound => {
          if (sound && sound.unload) {
            sound.unload();
          }
        });
      }
    };
  }, []);

  // Play sound helper
  const playSound = useCallback((soundName) => {
    if (isMutedRef.current) {
      console.log(`Sound muted, skipping: ${soundName}`);
      return;
    }

    if (!soundsRef.current || !soundsRef.current[soundName]) {
      console.error(`Sound not found: ${soundName}`);
      return;
    }

    try {
      soundsRef.current[soundName].play();
      console.log(`✓ Playing sound: ${soundName}`);
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
    }
  }, []);

  // Individual sound methods
  const playCorrect = useCallback(() => {
    playSound('correct');
  }, [playSound]);

  const playIncorrect = useCallback(() => {
    playSound('incorrect');
  }, [playSound]);

  const playPartialCorrect = useCallback(() => {
    playSound('correct'); // Use same as correct for now
  }, [playSound]);

  const playSelect = useCallback(() => {
    playSound('select');
  }, [playSound]);

  const playSkip = useCallback(() => {
    playSound('skip');
  }, [playSound]);

  const playTimerWarning = useCallback(() => {
    playSound('warning');
  }, [playSound]);

  const playTransition = useCallback(() => {
    playSound('transition');
  }, [playSound]);

  const playComplete = useCallback(() => {
    // Play celebration melody
    playSound('complete');
  }, [playSound]);

  const playClick = useCallback(() => {
    playSound('select');
  }, [playSound]);

  // Toggle mute state
  const toggleMute = useCallback(() => {
    isMutedRef.current = !isMutedRef.current;
    localStorage.setItem("quizSoundsMuted", isMutedRef.current.toString());

    // Unmute all Howler sounds
    if (soundsRef.current) {
      Howler.mute(isMutedRef.current);
    }

    // Play a test sound when unmuting
    if (!isMutedRef.current && soundsRef.current?.select) {
      soundsRef.current.select.play();
    }

    return isMutedRef.current;
  }, []);

  // Get current mute state
  const isMuted = useCallback(() => {
    return isMutedRef.current;
  }, []);

  return useMemo(
    () => ({
      playCorrect,
      playIncorrect,
      playPartialCorrect,
      playClick,
      playSelect,
      playSkip,
      playTimerWarning,
      playTransition,
      playComplete,
      toggleMute,
      isMuted,
    }),
    [
      playCorrect,
      playIncorrect,
      playPartialCorrect,
      playClick,
      playSelect,
      playSkip,
      playTimerWarning,
      playTransition,
      playComplete,
      toggleMute,
      isMuted,
    ],
  );
};
