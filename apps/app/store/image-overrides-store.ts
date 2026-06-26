"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LocationImage } from "@/types";

/**
 * Admin image overrides — priority slot #2 in the image source-priority model
 * (see `lib/location-images.ts`). When an override list exists for a location
 * it fully replaces the sourced Unsplash/Wikimedia images in the app UI.
 *
 * Persisted as a plain `Record<locationId, LocationImage[]>` (no Sets, no
 * Maps) under `swiss-trails-image-overrides`, so the default persist
 * serializer round-trips it cleanly.
 */
interface ImageOverridesStore {
  /** locationId → ordered override images (first = primary/hero). */
  overrides: Record<string, LocationImage[]>;

  /** Replace the whole override list for a location. Empty array clears it. */
  setOverride: (id: string, imgs: LocationImage[]) => void;
  /** Read the override list for a location, or `undefined` if none. */
  getOverride: (id: string) => LocationImage[] | undefined;
  /** Append a single image to the override list (creating it if absent). */
  addImage: (id: string, img: LocationImage) => void;
  /** Remove the image with the given url from a location's override. */
  removeImage: (id: string, url: string) => void;
  /** Move an image within the list from one index to another. */
  reorder: (id: string, from: number, to: number) => void;
  /** Promote the image with the given url to the front (primary/hero). */
  setPrimary: (id: string, url: string) => void;
  /** Drop the override entirely — the location falls back to sourced images. */
  clearOverride: (id: string) => void;
}

/** Unique-enough id for an admin-added image (no crypto dependency required). */
function makeImageId(): string {
  return `ovr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useImageOverridesStore = create<ImageOverridesStore>()(
  persist(
    (set, get) => ({
      overrides: {},

      setOverride: (id, imgs) =>
        set((state) => {
          const next = { ...state.overrides };
          if (imgs.length === 0) {
            delete next[id];
          } else {
            next[id] = imgs;
          }
          return { overrides: next };
        }),

      getOverride: (id) => get().overrides[id],

      addImage: (id, img) =>
        set((state) => {
          const current = state.overrides[id] ?? [];
          // Skip exact-url duplicates so adding twice is a no-op.
          if (current.some((i) => i.url === img.url)) return state;
          const withId: LocationImage = {
            ...img,
            id: img.id || makeImageId(),
          };
          return { overrides: { ...state.overrides, [id]: [...current, withId] } };
        }),

      removeImage: (id, url) =>
        set((state) => {
          const current = state.overrides[id];
          if (!current) return state;
          const filtered = current.filter((i) => i.url !== url);
          const next = { ...state.overrides };
          if (filtered.length === 0) {
            delete next[id];
          } else {
            next[id] = filtered;
          }
          return { overrides: next };
        }),

      reorder: (id, from, to) =>
        set((state) => {
          const current = state.overrides[id];
          if (!current) return state;
          if (
            from === to ||
            from < 0 ||
            to < 0 ||
            from >= current.length ||
            to >= current.length
          ) {
            return state;
          }
          const next = [...current];
          const [moved] = next.splice(from, 1);
          next.splice(to, 0, moved);
          return { overrides: { ...state.overrides, [id]: next } };
        }),

      setPrimary: (id, url) =>
        set((state) => {
          const current = state.overrides[id];
          if (!current) return state;
          const idx = current.findIndex((i) => i.url === url);
          if (idx <= 0) return state; // already primary or not found
          const next = [...current];
          const [moved] = next.splice(idx, 1);
          next.unshift(moved);
          return { overrides: { ...state.overrides, [id]: next } };
        }),

      clearOverride: (id) =>
        set((state) => {
          if (!(id in state.overrides)) return state;
          const next = { ...state.overrides };
          delete next[id];
          return { overrides: next };
        }),
    }),
    {
      name: "swiss-trails-image-overrides",
      // Plain JSON record — the default persist serializer handles it.
    }
  )
);
