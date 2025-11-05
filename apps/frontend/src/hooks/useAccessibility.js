"use client";

import { useEffect, useCallback, useRef } from "react";

/**
 * Hook for managing keyboard navigation in onboarding flows
 * Provides consistent keyboard controls across all components
 */
export function useKeyboardNavigation({
  onNext,
  onPrevious,
  onEscape,
  onEnter,
  enabled = true,
}) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      // Don't intercept if user is typing in an input
      if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA" ||
        event.target.isContentEditable
      ) {
        return;
      }

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          if (onNext) {
            event.preventDefault();
            onNext();
          }
          break;

        case "ArrowLeft":
        case "ArrowUp":
          if (onPrevious) {
            event.preventDefault();
            onPrevious();
          }
          break;

        case "Escape":
          if (onEscape) {
            event.preventDefault();
            onEscape();
          }
          break;

        case "Enter":
        case " ": // Space bar
          if (onEnter && event.target.tagName !== "BUTTON") {
            event.preventDefault();
            onEnter();
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNext, onPrevious, onEscape, onEnter, enabled]);
}

/**
 * Hook for managing focus trap in modals and overlays
 * Ensures keyboard users stay within the component
 */
export function useFocusTrap(containerRef, isActive = true) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element on mount
    firstElement.focus();

    const handleTabKey = (event) => {
      if (event.key !== "Tab") return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener("keydown", handleTabKey);
    return () => container.removeEventListener("keydown", handleTabKey);
  }, [containerRef, isActive]);
}

/**
 * Hook for managing skip links for screen reader users
 */
export function useSkipLinks(links = []) {
  useEffect(() => {
    const handleSkipLink = (event) => {
      if (event.key === "Enter" && event.target.classList.contains("skip-link")) {
        event.preventDefault();
        const targetId = event.target.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          targetElement.focus();
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };

    window.addEventListener("keydown", handleSkipLink);
    return () => window.removeEventListener("keydown", handleSkipLink);
  }, [links]);
}

/**
 * Hook for announcing messages to screen readers
 */
export function useScreenReaderAnnouncement() {
  const announcementRef = useRef(null);

  useEffect(() => {
    // Create announcement element if it doesn't exist
    if (typeof window === "undefined") return;

    let announcement = document.getElementById("sr-announcement");
    if (!announcement) {
      announcement = document.createElement("div");
      announcement.id = "sr-announcement";
      announcement.setAttribute("role", "status");
      announcement.setAttribute("aria-live", "polite");
      announcement.setAttribute("aria-atomic", "true");
      announcement.style.position = "absolute";
      announcement.style.left = "-10000px";
      announcement.style.width = "1px";
      announcement.style.height = "1px";
      announcement.style.overflow = "hidden";
      document.body.appendChild(announcement);
    }

    announcementRef.current = announcement;

    return () => {
      // Clean up on unmount
      const elem = document.getElementById("sr-announcement");
      if (elem && !document.querySelector("[data-sr-announcement-user]")) {
        elem.remove();
      }
    };
  }, []);

  const announce = useCallback((message, priority = "polite") => {
    if (announcementRef.current) {
      announcementRef.current.setAttribute("aria-live", priority);
      announcementRef.current.textContent = message;

      // Clear after announcement
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = "";
        }
      }, 1000);
    }
  }, []);

  return { announce };
}

/**
 * Hook for detecting user's motion preferences
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook for managing focus restoration
 * Useful for modals that need to return focus to trigger element
 */
export function useFocusRestore() {
  const previousFocusRef = useRef(null);

  const saveFocus = useCallback(() => {
    if (typeof document !== "undefined") {
      previousFocusRef.current = document.activeElement;
    }
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, []);

  return { saveFocus, restoreFocus };
}

/**
 * Hook for creating unique IDs for accessibility
 * Ensures consistent IDs across SSR and client
 */
let idCounter = 0;
export function useId(prefix = "id") {
  const idRef = useRef(null);

  if (idRef.current === null) {
    idRef.current = `${prefix}-${++idCounter}`;
  }

  return idRef.current;
}

import { useState } from "react";
