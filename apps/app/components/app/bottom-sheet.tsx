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
const NAV_H = 74; // mobile bottom nav incl. safe area (~4.625rem + inset)
const PEEK_VISIBLE = 300; // how much of the panel is visible when peeking

type Snap = "peek" | "full";

const EASE = [0.16, 1, 0.3, 1] as const;

export function BottomSheet() {
  const { isBottomSheetOpen, selectedLocationId, closeBottomSheet } =
    useMapStore();

  const [snap, setSnap] = useState<Snap>("peek");
  const snapRef = useRef<Snap>("peek");
  const y = useMotionValue(2000);

  const dragging = useRef(false);
  const startSheetY = useRef(0);
  const startPointerY = useRef(0);

  const selectedLocation = selectedLocationId
    ? PLACEHOLDER_LOCATIONS.find((l) => l.id === selectedLocationId)
    : null;

  // Visible viewport height — prefer visualViewport / dvh so iOS browser-chrome
  // changes don't break the snap geometry.
  function vh() {
    if (typeof window === "undefined") return 900;
    return window.visualViewport?.height ?? window.innerHeight;
  }

  // Available panel height when fully expanded.
  function panelHeight() {
    return Math.max(240, vh() - FULL_TOP - NAV_H);
  }

  // Snap translate values (downward offset from the FULL_TOP anchor).
  function getSnaps() {
    const h = panelHeight();
    return {
      full: 0,
      peek: Math.max(0, h - PEEK_VISIBLE),
      closed: h + NAV_H + 40,
    };
  }

  function applySnap(target: Snap | "closed") {
    const s = getSnaps();
    if (target !== "closed") {
      setSnap(target);
      snapRef.current = target;
    }
    void animate(y, s[target], { duration: 0.3, ease: EASE });
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

  function onDown(e: React.PointerEvent) {
    dragging.current = true;
    startSheetY.current = y.get();
    startPointerY.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const delta = e.clientY - startPointerY.current;
    const s = getSnaps();
    const raw = startSheetY.current + delta;
    // Rubber-band resistance above the full stop.
    const next =
      raw < s.full ? s.full - Math.pow(Math.max(0, s.full - raw), 0.65) : raw;
    y.set(next);
  }

  function onUp() {
    if (!dragging.current) return;
    dragging.current = false;

    const cur = y.get();
    const vel = y.getVelocity();
    const s = getSnaps();
    const current = snapRef.current;

    // Velocity-driven release: flick down expands toward peek / dismiss,
    // flick up expands toward full.
    if (vel > 700) {
      if (current === "full") return applySnap("peek");
      closeBottomSheet();
      void animate(y, s.closed, { duration: 0.25, ease: EASE });
      return;
    }
    if (vel < -700) {
      return applySnap("full");
    }

    // Position-driven release between the two resting states.
    const midFP = (s.full + s.peek) / 2;
    const dismissThreshold = s.peek + 96;

    if (cur < midFP) applySnap("full");
    else if (cur < dismissThreshold) applySnap("peek");
    else {
      closeBottomSheet();
      void animate(y, s.closed, { duration: 0.25, ease: EASE });
    }
  }

  function toggleSnap() {
    applySnap(snapRef.current === "full" ? "peek" : "full");
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
          height that clears the bottom nav so the sticky CTA stays on-screen. */}
      <motion.div
        className="lg:hidden fixed inset-x-0 flex flex-col"
        style={{
          y,
          top: FULL_TOP,
          height: `calc(100dvh - ${FULL_TOP}px - ${NAV_H}px)`,
          maxHeight: `calc(100dvh - ${FULL_TOP}px - ${NAV_H}px)`,
          zIndex: PANEL_Z,
          background: "rgba(11,15,28,0.94)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          boxShadow: "0 -12px 60px rgba(0,0,0,0.7)",
        }}
      >
        {/* Drag handle — thin visible pill (40×4) inside a ≥44px grab target.
            The whole header strip is draggable and toggles on tap. */}
        <div
          className="flex-shrink-0 flex items-center justify-center touch-none select-none cursor-grab active:cursor-grabbing"
          style={{ height: 44 }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onClick={toggleSnap}
          role="button"
          aria-label={snap === "full" ? "Collapse details" : "Expand details"}
        >
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              background: "rgba(255,255,255,0.18)",
            }}
          />
        </div>

        <div className="relative flex-1 overflow-hidden">
          {snap !== "full" && (
            <div
              className="absolute inset-0 touch-none"
              style={{ zIndex: 10 }}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onClick={() => applySnap("full")}
            />
          )}
          <LocationDetail
            location={selectedLocation}
            onClose={closeBottomSheet}
          />
        </div>
      </motion.div>
    </>
  );
}
