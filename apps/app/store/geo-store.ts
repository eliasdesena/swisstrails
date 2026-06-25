"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Coordinates } from "@/types";

export type GeoStatus =
  | "idle" // never asked
  | "prompting" // request in flight
  | "granted" // we have a position
  | "denied" // user blocked it
  | "unavailable"; // no geolocation API / hardware error / timeout

interface GeoStore {
  /** Last known user position, or null if we've never resolved one. */
  position: Coordinates | null;
  /** Epoch ms when `position` was captured (for staleness display, best-effort). */
  updatedAt: number | null;
  status: GeoStatus;
  /**
   * Ask the browser for the current position. No-op while already prompting.
   * Never throws — failures are reflected in `status`.
   */
  requestLocation: () => void;
  /** Forget the stored position (e.g. a "stop using my location" affordance). */
  clearLocation: () => void;
}

export const useGeoStore = create<GeoStore>()(
  persist(
    (set, get) => ({
      position: null,
      updatedAt: null,
      // If a position was rehydrated from storage we can treat it as granted;
      // the rehydrate handler below upgrades the status when that happens.
      status: "idle",

      requestLocation: () => {
        // Guard: SSR / unsupported browsers.
        if (
          typeof navigator === "undefined" ||
          !("geolocation" in navigator)
        ) {
          set({ status: "unavailable" });
          return;
        }
        // Don't fire a second prompt while one is in flight.
        if (get().status === "prompting") return;

        set({ status: "prompting" });

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            set({
              position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
              updatedAt: Date.now(),
              status: "granted",
            });
          },
          (err) => {
            // PERMISSION_DENIED === 1; everything else (position unavailable,
            // timeout) is treated as transiently unavailable. Keep any stored
            // position so distances already on screen don't vanish.
            set({
              status: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable",
            });
          },
          { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 }
        );
      },

      clearLocation: () =>
        set({ position: null, updatedAt: null, status: "idle" }),
    }),
    {
      name: "swiss-trails-geo",
      // Only persist the position itself — never the transient status.
      partialize: (state) => ({
        position: state.position,
        updatedAt: state.updatedAt,
      }),
      onRehydrateStorage: () => (state) => {
        // A rehydrated position is best-effort but lets distances survive
        // reloads. Mark it granted so the UI shows real distances immediately
        // without re-prompting; the user can refresh via "Near me".
        if (state?.position) state.status = "granted";
      },
    }
  )
);
