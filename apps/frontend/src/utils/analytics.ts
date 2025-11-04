"use client";

export const emitAnalyticsEvent = (
  eventName: string,
  detail: Record<string, unknown>,
) => {
  if (typeof window !== "undefined" && typeof CustomEvent !== "undefined") {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    console.debug(`[analytics] ${eventName}`, detail);
  }
};

