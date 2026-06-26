import type {
  Difficulty,
  HikeBuddyProfile,
  HikePace,
} from "@/types";

/**
 * Deterministic Hike Buddy matching.
 *
 * `matchScore(a, b)` returns a 0–100 compatibility score from a weighted blend
 * of shared regions, compatible difficulty/pace, overlapping availability and
 * shared languages. No randomness — the same two profiles always score the
 * same. `findMatches` ranks a pool of candidates against "me", best first.
 */

// Both difficulty and pace are ordered scales, so "compatible" can be measured
// as a small gap rather than an exact match.
const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  easy: 0,
  moderate: 1,
  challenging: 2,
  expert: 3,
};

const PACE_ORDER: Record<HikePace, number> = {
  relaxed: 0,
  steady: 1,
  brisk: 2,
};

// Weights sum to 100 so the raw score IS the 0–100 result.
const WEIGHTS = {
  regions: 32,
  difficulty: 22,
  pace: 18,
  availability: 16,
  languages: 12,
} as const;

/** Fraction (0–1) of `a`'s items also present in `b`. Empty `a` → 0. */
function overlapFraction<T>(a: readonly T[], b: readonly T[]): number {
  if (a.length === 0) return 0;
  const setB = new Set(b);
  const shared = a.reduce((n, item) => (setB.has(item) ? n + 1 : n), 0);
  return shared / a.length;
}

/** Symmetric region overlap relative to the smaller list (Szymkiewicz–Simpson). */
function regionScore(a: HikeBuddyProfile, b: HikeBuddyProfile): number {
  if (a.preferredRegions.length === 0 || b.preferredRegions.length === 0) {
    return 0;
  }
  const setB = new Set(b.preferredRegions);
  const shared = a.preferredRegions.reduce(
    (n, r) => (setB.has(r) ? n + 1 : n),
    0
  );
  const denom = Math.min(a.preferredRegions.length, b.preferredRegions.length);
  return shared / denom;
}

/** Closeness on an ordered scale: 1 = identical, tapering to 0 at max gap. */
function scaleCloseness(gap: number, maxGap: number): number {
  return Math.max(0, 1 - gap / maxGap);
}

/**
 * Compatibility score between two hikers, 0–100. Symmetric for the region,
 * difficulty, pace and language signals; availability uses a symmetric overlap
 * too, so `matchScore(a, b) === matchScore(b, a)`.
 */
export function matchScore(a: HikeBuddyProfile, b: HikeBuddyProfile): number {
  // Regions
  const regions = regionScore(a, b);

  // Difficulty — closeness on the ordered scale (max gap 3).
  const diffGap = Math.abs(
    DIFFICULTY_ORDER[a.preferredDifficulty] -
      DIFFICULTY_ORDER[b.preferredDifficulty]
  );
  const difficulty = scaleCloseness(diffGap, 3);

  // Pace — closeness on the ordered scale (max gap 2).
  const paceGap = Math.abs(PACE_ORDER[a.pace] - PACE_ORDER[b.pace]);
  const pace = scaleCloseness(paceGap, 2);

  // Availability — symmetric overlap (relative to the smaller list).
  const availDenom = Math.min(a.availability.length, b.availability.length);
  const availShared = (() => {
    const setB = new Set(b.availability);
    return a.availability.reduce((n, s) => (setB.has(s) ? n + 1 : n), 0);
  })();
  const availability = availDenom === 0 ? 0 : availShared / availDenom;

  // Languages — fraction of "my" languages the other person also speaks.
  const languages = Math.max(
    overlapFraction(a.languages, b.languages),
    overlapFraction(b.languages, a.languages)
  );

  const score =
    WEIGHTS.regions * regions +
    WEIGHTS.difficulty * difficulty +
    WEIGHTS.pace * pace +
    WEIGHTS.availability * availability +
    WEIGHTS.languages * languages;

  return Math.round(score);
}

export interface BuddyMatch {
  profile: HikeBuddyProfile;
  score: number;
}

/**
 * Rank `others` against `me`, best first. `me` is excluded by id. Ties break
 * deterministically by id so the ordering never wobbles between renders.
 */
export function findMatches(
  me: HikeBuddyProfile,
  others: HikeBuddyProfile[],
  limit = 10
): BuddyMatch[] {
  return others
    .filter((o) => o.id !== me.id)
    .map((o) => ({ profile: o, score: matchScore(me, o) }))
    .sort((x, y) => {
      if (y.score !== x.score) return y.score - x.score;
      return x.profile.id.localeCompare(y.profile.id);
    })
    .slice(0, limit);
}
