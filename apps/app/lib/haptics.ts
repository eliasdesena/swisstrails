/**
 * Lightweight haptic feedback. Uses the Vibration API, which is supported on
 * Android/Chrome and is a safe no-op on iOS Safari (where it's unavailable),
 * so calls are always guard-free at the call site.
 *
 * Respects prefers-reduced-motion. Keep durations tiny — these are taps, not
 * buzzes: a snap/toggle should feel like a tick, never a rumble.
 */

let reducedMotion = false;
if (typeof window !== "undefined" && window.matchMedia) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  reducedMotion = mq.matches;
  mq.addEventListener?.("change", (e) => {
    reducedMotion = e.matches;
  });
}

function vibrate(pattern: number | number[]) {
  if (reducedMotion) return;
  if (typeof navigator === "undefined") return;
  // Some browsers expose vibrate but throw if called outside a user gesture;
  // swallow any failure — haptics are strictly enhancement.
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* no-op */
  }
}

export const haptics = {
  /** A light tick — taps, toggles, selection changes. */
  tap: () => vibrate(8),
  /** A slightly firmer tick — a sheet snapping into place, drag pickup/drop. */
  snap: () => vibrate(14),
  /** A confirmation double-tick — add to trip, favourite on, success. */
  success: () => vibrate([10, 30, 12]),
  /** A short warning — destructive / blocked action. */
  warn: () => vibrate([18, 40, 18]),
};
