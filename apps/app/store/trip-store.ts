"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Trip / itinerary store.
 *
 * Unlike favourites (a Set, order-agnostic), a trip is an **ordered** list of
 * location ids — the sequence is the itinerary. Persisted to localStorage as a
 * plain string[] so no custom (de)serialisation is needed.
 */
interface TripStore {
  tripIds: string[];
  addToTrip: (id: string) => void;
  removeFromTrip: (id: string) => void;
  toggleInTrip: (id: string) => void;
  isInTrip: (id: string) => boolean;
  /** Move the item at `from` to index `to`, preserving order of the rest. */
  moveItem: (from: number, to: number) => void;
  moveUp: (index: number) => void;
  moveDown: (index: number) => void;
  clearTrip: () => void;
}

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      tripIds: [],

      addToTrip: (id) =>
        set((state) =>
          state.tripIds.includes(id)
            ? state
            : { tripIds: [...state.tripIds, id] }
        ),

      removeFromTrip: (id) =>
        set((state) => ({
          tripIds: state.tripIds.filter((x) => x !== id),
        })),

      toggleInTrip: (id) => {
        const { tripIds, addToTrip, removeFromTrip } = get();
        if (tripIds.includes(id)) {
          removeFromTrip(id);
        } else {
          addToTrip(id);
        }
      },

      isInTrip: (id) => get().tripIds.includes(id),

      moveItem: (from, to) =>
        set((state) => {
          if (
            from === to ||
            from < 0 ||
            to < 0 ||
            from >= state.tripIds.length ||
            to >= state.tripIds.length
          ) {
            return state;
          }
          const next = [...state.tripIds];
          const [moved] = next.splice(from, 1);
          next.splice(to, 0, moved);
          return { tripIds: next };
        }),

      moveUp: (index) => get().moveItem(index, index - 1),
      moveDown: (index) => get().moveItem(index, index + 1),

      clearTrip: () => set({ tripIds: [] }),
    }),
    {
      name: "swiss-trails-trip",
    }
  )
);
