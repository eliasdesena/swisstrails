"use client";

import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMapStore } from "@/store/map-store";
import { LocationDetail } from "@/components/app/location-detail";
import { EASE_OUT } from "@/lib/motion";
import { haptics } from "@/lib/haptics";
import { PLACEHOLDER_LOCATIONS } from "@/data/locations";

const PANEL_Z = 1100;
const BACKDROP_Z = 1050;

// Geometry (px). The mobile panel is anchored at `FULL_TOP` from the viewport
// top; its height is set in CSS (clearing the floating nav via --nav-clear) and
// MEASURED at runtime so the snap math can never drift from what's rendered —
// the previous hardcoded NAV_H guess was the root cause of the "sheet won't
// fully expand / nav stuck high" bug. Snap positions are a downward translate
// (`y`) from the FULL_TOP anchor.
const FULL_TOP = 52; // gap above the panel when fully expanded

type Snap = "peek" | "half" | "full";
type Snaps = { full: number; half: number; peek: number; closed: number };

// Velocity-inherited spring for the settle — continuous with the finger so a
// flick whips into place instead of replaying a fixed-duration curve.
const SHEET_SPRING = { type: "spring", stiffness: 520, damping: 44, mass: 0.9, restDelta: 0.5 } as const;

/** A drag must not start on an interactive child (buttons, links, the photo
    strip, collapsibles, …). Those opt out with `data-no-drag`. */
function isInteractiveTarget(el: EventTarget | null): boolean {
  if (!(el instanceof Element)) return false;
  return !!el.closest('button, a, input, select, textarea, [data-no-drag]');
}

export function BottomSheet() {
  const { isBottomSheetOpen, selectedLocationId, closeBottomSheet } =
    useMapStore();

  const [snap, setSnap] = useState<Snap>("peek");
  const snapRef = useRef<Snap>("peek");
  const y = useMotionValue(2000);

  const panelRef = useRef<HTMLDivElement>(null);
  const snapsRef = useRef<Snaps>({ full: 0, half: 0, peek: 0, closed: 2000 });
  const dragging = useRef(false);
  const moved = useRef(false);
  const startSheetY = useRef(0);
  const startPointerY = useRef(0);
  const scrollEl = useRef<HTMLDivElement>(null);
  const captureEl = useRef<HTMLElement | null>(null);
  const capturePid = useRef<number>(0);

  const selectedLocation = selectedLocationId
    ? PLACEHOLDER_LOCATIONS.find((l) => l.id === selectedLocationId)
    : null;

  function vh() {
    if (typeof window === "undefined") return 900;
    return window.visualViewport?.height ?? window.innerHeight;
  }

  // Recompute snap targets from the MEASURED panel height + current viewport.
  // Called on open, on resize/orientation, and at drag start — never per move.
  const recomputeSnaps = useCallback(() => {
    const V = vh();
    const H = panelRef.current?.offsetHeight ?? Math.max(240, V - FULL_TOP - 96);
    snapsRef.current = {
      full: 0,
      half: Math.max(0, Math.min(H - 120, H - (V * 0.5 - FULL_TOP))),
      peek: Math.max(0, H - Math.round(V * 0.15)),
      closed: H + Math.round(V * 0.2) + 80, // fully off-screen below the nav
    };
  }, []);

  function applySnap(target: Snap | "closed", withVelocity = false) {
    const s = snapsRef.current;
    if (target !== "closed") {
      if (snapRef.current !== target) haptics.snap();
      setSnap(target);
      snapRef.current = target;
    }
    void animate(y, s[target], {
      ...SHEET_SPRING,
      velocity: withVelocity ? y.getVelocity() : 0,
    });
  }

  useEffect(() => {
    if (isBottomSheetOpen && selectedLocation) {
      // Panel is mounted by this point; measure it, park off-screen, settle up.
      recomputeSnaps();
      y.set(snapsRef.current.closed);
      requestAnimationFrame(() => {
        recomputeSnaps();
        applySnap("peek");
      });
    } else if (panelRef.current) {
      void animate(y, snapsRef.current.closed, { duration: 0.22, ease: EASE_OUT });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBottomSheetOpen, selectedLocationId]);

  // Keep geometry correct across viewport changes (iOS chrome, rotation).
  useEffect(() => {
    const onResize = () => {
      recomputeSnaps();
      if (isBottomSheetOpen) applySnap(snapRef.current);
    };
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBottomSheetOpen]);

  function beginDrag(e: React.PointerEvent) {
    recomputeSnaps();
    dragging.current = true;
    moved.current = false;
    startSheetY.current = y.get();
    startPointerY.current = e.clientY;
    captureEl.current = e.currentTarget as HTMLElement;
    capturePid.current = e.pointerId;
    try {
      captureEl.current.setPointerCapture(e.pointerId);
    } catch {
      /* capture can fail if the pointer is already released — ignore */
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    if (isInteractiveTarget(e.target)) return;

    // When fully expanded and the inner content is scrolled, let the content
    // scroll natively; only a drag from the very top collapses the sheet.
    if (snapRef.current === "full") {
      const sc = scrollEl.current;
      if (sc && sc.contains(e.target as Node) && sc.scrollTop > 0) return;
    }
    beginDrag(e);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const delta = e.clientY - startPointerY.current;
    if (Math.abs(delta) > 4) moved.current = true;
    const s = snapsRef.current;
    const raw = startSheetY.current + delta;
    // Rubber-band resistance above the full stop.
    const next =
      raw < s.full ? s.full - Math.pow(Math.max(0, s.full - raw), 0.65) : raw;
    y.set(next);
  }

  function endDrag() {
    if (!dragging.current) return;
    dragging.current = false;
    if (captureEl.current) {
      try {
        captureEl.current.releasePointerCapture(capturePid.current);
      } catch {
        /* already released */
      }
      captureEl.current = null;
    }

    const cur = y.get();
    const vel = y.getVelocity();
    const s = snapsRef.current;
    const order: Snap[] = ["full", "half", "peek"];
    const curIndex = order.indexOf(snapRef.current);

    // Velocity-driven release: a firm flick moves exactly one step.
    if (vel > 650) {
      if (snapRef.current === "peek") {
        haptics.tap();
        closeBottomSheet();
        void animate(y, s.closed, { ...SHEET_SPRING, velocity: vel });
        return;
      }
      return applySnap(order[Math.min(order.length - 1, curIndex + 1)], true);
    }
    if (vel < -650) {
      return applySnap(order[Math.max(0, curIndex - 1)], true);
    }

    // Position-driven release: dismiss when dragged well below peek, else snap
    // to the nearest of the three points.
    const dismissThreshold = s.peek + Math.round(vh() * 0.08);
    if (cur > dismissThreshold) {
      haptics.tap();
      closeBottomSheet();
      void animate(y, s.closed, { ...SHEET_SPRING, velocity: vel });
      return;
    }

    const points: [Snap, number][] = [
      ["full", s.full],
      ["half", s.half],
      ["peek", s.peek],
    ];
    let best: Snap = "peek";
    let bestDist = Infinity;
    for (const [name, val] of points) {
      const d = Math.abs(cur - val);
      if (d < bestDist) {
        bestDist = d;
        best = name;
      }
    }
    applySnap(best, true);
  }

  if (!selectedLocation) return null;

  return (
    <>
      {/* Desktop backdrop */}
      <AnimatePresence>
        {isBottomSheetOpen && (
          <motion.div
            className="hidden lg:block fixed inset-0"
            style={{ zIndex: BACKDROP_Z, background: "rgba(6,8,15,0.35)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeBottomSheet}
          />
        )}
      </AnimatePresence>

      {/* Desktop side panel */}
      <AnimatePresence>
        {isBottomSheetOpen && (
          <motion.div
            className="hidden lg:flex fixed right-0 top-14 bottom-0 flex-col"
            style={{
              zIndex: PANEL_Z,
              width: 420,
              background: "rgba(11,15,28,0.92)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: "-16px 0 80px rgba(0,0,0,0.7)",
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
          >
            <LocationDetail
              location={selectedLocation}
              onClose={closeBottomSheet}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sheet driven by Y motion value. Anchored at FULL_TOP with a
          height (clearing the floating nav via --nav-clear) that is measured at
          runtime. Draggable everywhere except interactive elements
          (button/a/[data-no-drag]). */}
      <motion.div
        ref={panelRef}
        className="lg:hidden fixed inset-x-0 flex flex-col select-none"
        style={{
          y,
          top: FULL_TOP,
          height: `calc(100dvh - ${FULL_TOP}px - var(--nav-clear))`,
          maxHeight: `calc(100dvh - ${FULL_TOP}px - var(--nav-clear))`,
          zIndex: PANEL_Z,
          background: "rgba(11,15,28,0.94)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          boxShadow: "0 -12px 60px rgba(0,0,0,0.7)",
          touchAction: "none",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* Drag handle — thin visible pill. A tap (no movement) steps the sheet:
            from full it collapses to half; otherwise it expands a step. */}
        <div
          role="button"
          tabIndex={0}
          className="flex-shrink-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{ height: 28 }}
          onClick={() => {
            if (moved.current) return; // ignore the click synthesised after a drag
            applySnap(
              snapRef.current === "peek"
                ? "half"
                : snapRef.current === "half"
                  ? "full"
                  : "half"
            );
          }}
          aria-label={snap === "full" ? "Collapse details" : "Expand details"}
        >
          <span
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              background: "rgba(255,255,255,0.22)",
            }}
          />
        </div>

        <div className="relative flex-1 overflow-hidden flex flex-col">
          <LocationDetail
            location={selectedLocation}
            onClose={closeBottomSheet}
            scrollRef={scrollEl}
          />
        </div>
      </motion.div>
    </>
  );
}
