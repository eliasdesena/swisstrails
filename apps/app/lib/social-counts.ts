import type { ReactionKind, SocialCounts } from "@/types";

/**
 * Deterministic social counts.
 *
 * There is no backend, so per-location "community" counts are derived from a
 * stable hash of the location id. The same id always yields the same plausible
 * base counts, and the DISPLAYED count simply adds the current user's own
 * reaction on top (so toggling feels live without any network).
 */

/** djb2 — small, fast, deterministic string hash. */
function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  // Force unsigned 32-bit so downstream maths is stable across platforms.
  return h >>> 0;
}

/**
 * A second, salted hash so the three reactions for one location don't all move
 * together. Salting the id keeps everything deterministic.
 */
function saltedHash(locationId: string, salt: string): number {
  return hash(`${locationId}::${salt}`);
}

// Plausible ranges per reaction. "Like" is the most common interaction,
// "been there" the rarest — this keeps the numbers feeling realistic.
const RANGES: Record<ReactionKind, { min: number; max: number }> = {
  like: { min: 40, max: 980 },
  wantToGo: { min: 25, max: 620 },
  beenThere: { min: 8, max: 240 },
};

function rangedCount(locationId: string, kind: ReactionKind): number {
  const { min, max } = RANGES[kind];
  const span = max - min + 1;
  return min + (saltedHash(locationId, kind) % span);
}

/** Stable pseudo-random base counts for a location (excludes the user). */
export function baseCounts(locationId: string): SocialCounts {
  return {
    like: rangedCount(locationId, "like"),
    wantToGo: rangedCount(locationId, "wantToGo"),
    beenThere: rangedCount(locationId, "beenThere"),
  };
}

/** Base count for a single reaction kind. */
export function baseCount(locationId: string, kind: ReactionKind): number {
  return rangedCount(locationId, kind);
}

/**
 * The number the UI should render for a reaction: the deterministic base plus
 * 1 when the current user has toggled this reaction on.
 *
 * @example
 *   const liked = useSocialStore((s) => s.isLiked(loc.id));
 *   const count = displayedCount(loc.id, "like", liked);
 */
export function displayedCount(
  locationId: string,
  kind: ReactionKind,
  userToggled: boolean
): number {
  return baseCount(locationId, kind) + (userToggled ? 1 : 0);
}

/** Convenience: all three displayed counts at once. */
export function displayedCounts(
  locationId: string,
  userReactions: { like: boolean; wantToGo: boolean; beenThere: boolean }
): SocialCounts {
  return {
    like: displayedCount(locationId, "like", userReactions.like),
    wantToGo: displayedCount(locationId, "wantToGo", userReactions.wantToGo),
    beenThere: displayedCount(locationId, "beenThere", userReactions.beenThere),
  };
}
