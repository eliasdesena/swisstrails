"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReactionKind } from "@/types";

/**
 * Per-location social reactions for the current (local) user.
 *
 * Mirrors the favorites/visited stores: each reaction is a `Set<string>` of
 * location ids with toggle / is helpers. Purely local — persisted to
 * localStorage, no backend.
 */
interface SocialStore {
  liked: Set<string>;
  wantToGo: Set<string>;
  beenThere: Set<string>;

  toggleLiked: (id: string) => void;
  toggleWantToGo: (id: string) => void;
  toggleBeenThere: (id: string) => void;

  isLiked: (id: string) => boolean;
  isWantToGo: (id: string) => boolean;
  isBeenThere: (id: string) => boolean;

  /** Generic helpers keyed by ReactionKind — convenient for the detail UI. */
  toggleReaction: (id: string, kind: ReactionKind) => void;
  hasReaction: (id: string, kind: ReactionKind) => boolean;
}

const SET_KEY: Record<ReactionKind, "liked" | "wantToGo" | "beenThere"> = {
  like: "liked",
  wantToGo: "wantToGo",
  beenThere: "beenThere",
};

function toggleIn(set: Set<string>, id: string): Set<string> {
  const next = new Set(set);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return next;
}

export const useSocialStore = create<SocialStore>()(
  persist(
    (set, get) => ({
      liked: new Set<string>(),
      wantToGo: new Set<string>(),
      beenThere: new Set<string>(),

      toggleLiked: (id) =>
        set((state) => ({ liked: toggleIn(state.liked, id) })),
      toggleWantToGo: (id) =>
        set((state) => ({ wantToGo: toggleIn(state.wantToGo, id) })),
      toggleBeenThere: (id) =>
        set((state) => ({ beenThere: toggleIn(state.beenThere, id) })),

      isLiked: (id) => get().liked.has(id),
      isWantToGo: (id) => get().wantToGo.has(id),
      isBeenThere: (id) => get().beenThere.has(id),

      toggleReaction: (id, kind) =>
        set((state) => {
          const key = SET_KEY[kind];
          return { [key]: toggleIn(state[key], id) } as Partial<SocialStore>;
        }),

      hasReaction: (id, kind) => get()[SET_KEY[kind]].has(id),
    }),
    {
      name: "swiss-trails-social",
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name);
          if (!item) return null;
          const parsed = JSON.parse(item);
          return {
            ...parsed,
            state: {
              ...parsed.state,
              liked: new Set(parsed.state.liked ?? []),
              wantToGo: new Set(parsed.state.wantToGo ?? []),
              beenThere: new Set(parsed.state.beenThere ?? []),
            },
          };
        },
        setItem: (name, value) => {
          const toStore = {
            ...value,
            state: {
              ...value.state,
              liked: Array.from(value.state.liked),
              wantToGo: Array.from(value.state.wantToGo),
              beenThere: Array.from(value.state.beenThere),
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
