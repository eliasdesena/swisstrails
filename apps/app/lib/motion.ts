/**
 * Shared motion config — the single source of truth for framer-motion easings,
 * durations, springs, and reusable variants across the app.
 *
 * framer-motion can't read CSS custom properties, so the easing curve used to be
 * hand-copied (`[0.16, 1, 0.3, 1]`) in ~17 places and durations were invented
 * per-component. Import from here instead. The curve mirrors `--ease-out-expo`
 * in globals.css; keep the two in sync.
 */
import type { Transition, Variants } from "framer-motion";

/** Mirrors --ease-out-expo. The app's default "settle" curve. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
/** Mirrors --ease-in-out. For symmetric in/out moves. */
export const EASE_IN_OUT = [0.4, 0, 0.2, 1] as const;

/** Durations (seconds) — framer takes seconds, CSS tokens are the ms mirror. */
export const DUR = {
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
} as const;

/** Spring presets. `snappy` for UI chrome, `soft` for larger surfaces/sheets,
 *  `gentle` for layout reflow. */
export const SPRING = {
  snappy: { type: "spring", stiffness: 520, damping: 40, mass: 0.9 },
  soft: { type: "spring", stiffness: 380, damping: 34 },
  gentle: { type: "spring", stiffness: 300, damping: 30 },
} as const satisfies Record<string, Transition>;

/** Standard fade-up entrance (e.g. page sections, cards). */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE_OUT } },
};

/** Plain fade — for backdrops and cross-fades. */
export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.base, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: DUR.fast, ease: EASE_OUT } },
};

/** Scale-in pop — for chips, badges, icons toggling on. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: SPRING.snappy },
};

/** Canonical tab/route transition (used by the (app) PageTransition wrapper). */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.18, ease: EASE_OUT } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.12, ease: EASE_OUT } },
};

/** Container that staggers its children's entrance. Pair with `fadeUp` items. */
export const staggerContainer = (stagger = 0.04, delayChildren = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});
