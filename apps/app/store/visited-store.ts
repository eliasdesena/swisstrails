"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface VisitedStore {
  visitedIds: Set<string>;
  markVisited: (id: string) => void;
  unmarkVisited: (id: string) => void;
  toggleVisited: (id: string) => void;
  isVisited: (id: string) => boolean;
  setVisited: (ids: string[]) => void;
}

export const useVisitedStore = create<VisitedStore>()(
  persist(
    (set, get) => ({
      visitedIds: new Set<string>(),

      markVisited: (id) =>
        set((state) => {
          const next = new Set(state.visitedIds);
          next.add(id);
          return { visitedIds: next };
        }),

      unmarkVisited: (id) =>
        set((state) => {
          const next = new Set(state.visitedIds);
          next.delete(id);
          return { visitedIds: next };
        }),

      toggleVisited: (id) => {
        const { visitedIds, markVisited, unmarkVisited } = get();
        if (visitedIds.has(id)) {
          unmarkVisited(id);
        } else {
          markVisited(id);
        }
      },

      isVisited: (id) => get().visitedIds.has(id),

      setVisited: (ids) => set({ visitedIds: new Set(ids) }),
    }),
    {
      name: "swiss-trails-visited",
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name);
          if (!item) return null;
          const parsed = JSON.parse(item);
          return {
            ...parsed,
            state: {
              ...parsed.state,
              visitedIds: new Set(parsed.state.visitedIds ?? []),
            },
          };
        },
        setItem: (name, value) => {
          const toStore = {
            ...value,
            state: {
              ...value.state,
              visitedIds: Array.from(value.state.visitedIds),
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
