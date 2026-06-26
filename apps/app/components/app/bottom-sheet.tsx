"use client";

import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useMapStore } from "@/store/map-store";
import { LocationDetail } from "@/components/app/location-detail";
import { PLACEHOLDER_LOCATIONS } from "@/data/locations";

const PANEL_Z = 1100;
const BACKDROP_Z = 1050;

// Geometry (px). The mobile panel is anchored at `FULL_TOP` from the viewport
// top and its height is constrained to clear the bottom nav, so the sticky CTA
// inside LocationDetail always stays visible. Snap positions are expressed as a
// downward translate (`y`) from that anchor.
const FULL_TOP = 52; // gap above the panel when fully expanded
const NAV_H = 74; // mobile bottom nav incl. safe area (~4rem + inset)

type Snap = "peek" | "half" | "full";

const EASE = [0.16, 1, 0.3, 1] as const;

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

  // Visible viewport height — prefer visualViewport / dvh so iOS browser-chrome
  // changes don't break the snap geometry.
  function vh() {
    if (typeof window === "undefined") return 900;
    return window.visualViewport?.height ?? window.innerHeight;
  }

  // Available panel height when fully expanded (stops at the bottom nav).
  function panelHeight() {
    return Math.max(240, vh() - FULL_TOP - NAV_H);
  }

  // Snap translate values (downward offset from the FULL_TOP anchor).
  // peek shows a sliver; half shows ~50% of the viewport; full is expanded.
  function getSnaps() {
    const h = panelHeight();
    const viewport = vh();
    return {
      full: 0,
      half: Math.max(0, Math.min(h - 120, h - (viewport * 0.5 - FULL_TOP))),
      peek: Math.max(0, h - Math.round(viewport * 0.15)),
      closed: h + NAV_H + 40,
    };
  }

  function applySnap(target: Snap | "closed") {
    const s = getSnaps();
    if (target !== "closed") {
      setSnap(target);
      snapRef.current = target;
    }
    void animate(y, s[target], { duration: 0.32, ease: EASE });
  }

  useEffect(() => {
    if (isBottomSheetOpen && selectedLocation) {
      const s = getSnaps();
      y.set(s.closed);
      applySnap("peek");
    } else {
      applySnap("closed");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBottomSheetOpen, selectedLocationId]);

  function beginDrag(e: React.PointerEvent) {
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
    // Never hijack drags that start on interactive elements.
    if (isInteractiveTarget(e.target)) return;

    // When fully expanded and the inner content is scrolled, let the content
    // scroll natively; only a drag from the very top of the content collapses
    // the sheet (standard bottom-sheet behaviour).
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
    const s = getSnaps();
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
    const s = getSnaps();
    const order: Snap[] = ["full", "half", "peek"];
    const curIndex = order.indexOf(snapRef.current);

    // Velocity-driven release: a firm flick moves exactly one step.
    if (vel > 650) {
      // flick down — collapse one step, or dismiss from peek.
      if (snapRef.current === "peek") {
        closeBottomSheet();
        void animate(y, s.closed, { duration: 0.25, ease: EASE });
        return;
      }
      return applySnap(order[Math.min(order.length - 1, curIndex + 1)]);
    }
    if (vel < -650) {
      // flick up — expand one step.
      return applySnap(order[Math.max(0, curIndex - 1)]);
    }

    // Position-driven release: snap to the nearest of the three points,
    // and dismiss when dragged well below peek.
    const dismissThreshold = s.peek + Math.round(vh() * 0.08);
    if (cur > dismissThreshold) {
      closeBottomSheet();
      void animate(y, s.closed, { duration: 0.25, ease: EASE });
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
    applySnap(best);
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
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <LocationDetail
              location={selectedLocation}
              onClose={closeBottomSheet}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sheet driven by Y motion value. Anchored at FULL_TOP with a
          height that clears the bottom nav so the sticky CTA stays on-screen.
          The whole sheet is draggable (pointer handlers on the wrapper) except
          interactive elements (button/a/[data-no-drag]); `select-none` +
          `touch-action: none` prevent text selection while dragging. */}
      <motion.div
        className="lg:hidden fixed inset-x-0 flex flex-col select-none"
        style={{
          y,
          top: FULL_TOP,
          height: `calc(100dvh - ${FULL_TOP}px - (4rem + env(safe-area-inset-bottom)))`,
          maxHeight: `calc(100dvh - ${FULL_TOP}px - (4rem + env(safe-area-inset-bottom)))`,
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
        {/* Drag handle — thin visible pill. It is NOT marked data-no-drag, so
            the sheet drags when grabbed here; a tap (no movement) cycles
            peek → half → full → peek. */}
        <div
          role="button"
          tabIndex={0}
          className="flex-shrink-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{ height: 28 }}
          onClick={() => {
            // Ignore the click synthesised at the end of a real drag.
            if (moved.current) return;
            applySnap(
              snapRef.current === "peek"
                ? "half"
                : snapRef.current === "half"
                  ? "full"
                  : "peek"
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
