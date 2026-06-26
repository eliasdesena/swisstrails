"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HikeBuddyProfile } from "@/types";

/**
 * The current (local) user's editable Hike Buddy profile. Persisted to
 * localStorage — no backend. Seeded with sensible defaults so matching works
 * out of the box before the user customises anything.
 */
const DEFAULT_PROFILE: HikeBuddyProfile = {
  id: "me",
  displayName: "You",
  avatarInitial: "Y",
  preferredDifficulty: "moderate",
  preferredRegions: ["bern", "valais"],
  pace: "steady",
  availability: ["weekend"],
  experience: "intermediate",
  languages: ["en"],
};

interface HikeBuddyStore {
  profile: HikeBuddyProfile;
  /** Merge a partial update into the profile (id always stays "me"). */
  updateProfile: (patch: Partial<Omit<HikeBuddyProfile, "id">>) => void;
  /** Reset back to the default seed profile. */
  resetProfile: () => void;
}

export const useHikeBuddyStore = create<HikeBuddyStore>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,

      updateProfile: (patch) =>
        set((state) => ({
          profile: { ...state.profile, ...patch, id: state.profile.id },
        })),

      resetProfile: () => set({ profile: DEFAULT_PROFILE }),
    }),
    {
      name: "swiss-trails-hike-buddy",
    }
  )
);
