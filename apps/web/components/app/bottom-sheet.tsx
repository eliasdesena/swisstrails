"use client";

import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useMapStore } from "@/store/map-store";
import { LocationDetail } from "@/components/app/location-detail";
import { PLACEHOLDER_LOCATIONS } from "@/data/locations";

// Leaflet's internal controls sit at z-index 1000.
// Our panels must exceed that to appear on top of the map.
const PANEL_Z = 1100;
const BACKDROP_Z = 1050;

type Snap = "peek" | "half" | "full";

function getSnaps(vh: number) {
  return {
    // Show drag handle + hero image top + location name overlay at the bottom of image
    peek: vh - 240,
    // ~half the screen
    half: Math.round(vh * 0.44),
    // Nearly full-screen (leave a sliver for visual breathing room)
    full: 52,
    // Completely off-screen
    closed: vh + 40,
  };
}

const SPRING = { type: "spring" as const, stiffness: 460, damping: 46 };

export function BottomSheet() {
  const { isBottomSheetOpen, selectedLocationId, closeBottomSheet } =
    useMapStore();

  const [snap, setSnap] = useState<Snap>("peek");
  const snapRef = useRef<Snap>("peek");
  const y = useMotionValue(2000);

  // Drag tracking
  const dragging = useRef(false);
  const startSheetY = useRef(0);
  const startPointerY = useRef(0);

  const selectedLocation = selectedLocationId
    ? PLACEHOLDER_LOCATIONS.find((l) => l.id === selectedLocationId)
    : null;

  function vh() {
    return typeof window !== "undefined" ? window.innerHeight : 900;
  }

  function applySnap(target: Snap | "closed", velocity = 0) {
    const s = getSnaps(vh());
    if (target !== "closed") {
      setSnap(target);
      snapRef.current = target;
    }
    animate(y, s[target], { ...SPRING, velocity });
  }

  // Open → snap to peek; close → slide off screen
  useEffect(() => {
    if (isBottomSheetOpen && selectedLocation) {
      const s = getSnaps(vh());
      y.set(s.closed);
      applySnap("peek");
    } else {
      applySnap("closed");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBottomSheetOpen, selectedLocationId]);

  // ── Pointer handlers ────────────────────────────────────────────────────
  function onDown(e: React.PointerEvent) {
    dragging.current = true;
    startSheetY.current = y.get();
    startPointerY.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const delta = e.clientY - startPointerY.current;
    const s = getSnaps(vh());
    const raw = startSheetY.current + delta;
    // Elastic resistance when pulled above the "full" snap
    const next =
      raw < s.full ? s.full - Math.pow(Math.max(0, s.full - raw), 0.65) : raw;
    y.set(next);
  }

  function onUp(_e: React.PointerEvent) {
    if (!dragging.current) return;
    dragging.current = false;

    const cur = y.get();
    const vel = y.getVelocity();
    const s = getSnaps(vh());
    const current = snapRef.current;

    // ── Velocity-first decisions ────────────────────────────
    if (vel > 700) {
      // Fast downward flick
      if (current === "full") return applySnap("half", vel);
      if (current === "half") return applySnap("peek", vel);
      // Already at peek → dismiss
      closeBottomSheet();
      animate(y, s.closed, { ...SPRING, velocity: vel });
      return;
    }
    if (vel < -700) {
      // Fast upward flick
      if (current === "peek") return applySnap("half", vel);
      return applySnap("full", vel);
    }

    // ── Position-based snap ─────────────────────────────────
    const midFH = (s.full + s.half) / 2;
    const midHP = (s.half + s.peek) / 2;
    const dismissThreshold = s.peek + 72;

    if (cur < midFH) applySnap("full");
    else if (cur < midHP) applySnap("half");
    else if (cur < dismissThreshold) applySnap("peek");
    else {
      closeBottomSheet();
      animate(y, s.closed, SPRING);
    }
  }

  if (!selectedLocation) return null;

  return (
    <>
      {/* ── Desktop backdrop ─────────────────────────────────────────── */}
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

      {/* ── Desktop side panel ───────────────────────────────────────── */}
      <AnimatePresence>
        {isBottomSheetOpen && (
          <motion.div
            className="hidden lg:flex fixed right-0 top-14 bottom-0 flex-col"
            style={{
              zIndex: PANEL_Z,
              width: 420,
              background: "rgb(11,15,28)",
              borderLeft: "1px solid rgba(81,94,255,0.15)",
              boxShadow: "-12px 0 80px rgba(0,0,0,0.7), -2px 0 0 rgba(81,94,255,0.08)",
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <LocationDetail
              location={selectedLocation}
              onClose={closeBottomSheet}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile: full-height panel driven by Y transform ──────────── */}
      {/* Always in DOM when selectedLocation exists so the animation plays */}
      <motion.div
        className="lg:hidden fixed inset-x-0 top-0 bottom-0 flex flex-col"
        style={{
          y,
          zIndex: PANEL_Z,
          background: "rgb(11,15,28)",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 -8px 80px rgba(0,0,0,0.7)",
        }}
      >
        {/* ── Drag handle ─────────────────────────────── */}
        <div
          className="flex-shrink-0 flex justify-center touch-none select-none"
          style={{ paddingTop: 12, paddingBottom: 10 }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: "rgba(255,255,255,0.2)",
            }}
          />
        </div>

        {/* ── Content ─────────────────────────────────── */}
        <div className="relative flex-1 overflow-hidden">
          {/*
           * Drag-capture overlay:
           * When not fully expanded, intercept touches on the content
           * so the user can swipe up to expand instead of scrolling.
           */}
          {snap !== "full" && (
            <div
              className="absolute inset-0 touch-none"
              style={{ zIndex: 10 }}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
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
