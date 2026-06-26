"use client";

import Link from "next/link";
import { Route } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTripStore } from "@/store/trip-store";

/**
 * Floating "Trip · N" pill — links to /trip. Only rendered when the trip is
 * non-empty. Sits bottom-left, lifted above the mobile bottom nav + safe area
 * so it never collides with the map's satellite toggle (top-right), the count
 * (bottom-center), or the directions controls.
 *
 * Reactive: subscribes to the trip length so the count updates live.
 */
export function TripPill() {
  const count = useTripStore((s) => s.tripIds.length);

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          className="absolute left-3 z-[1100] bottom-[calc(1rem+4.625rem+env(safe-area-inset-bottom))] lg:bottom-4"
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="/trip"
            aria-label={`Open your trip, ${count} ${count === 1 ? "stop" : "stops"}`}
            className="flex items-center gap-2 h-11 pl-3.5 pr-4 rounded-full bg-alpine-600/95 hover:bg-alpine-500 active:bg-alpine-700 text-white text-sm font-medium backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.4)] transition-colors active:scale-95"
          >
            <Route className="w-4 h-4" />
            Trip
            <span className="ml-0.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-white/20 text-xs font-semibold">
              {count}
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
