import type { Difficulty, Location, LocationCategory } from "@/types";
import { distanceKm } from "@/lib/distance";

/**
 * Real, deterministic "More like this" ranking.
 *
 * Every candidate location is scored against a `target` by a weighted blend of
 * four signals, then the top N are returned (best first). No randomness, no
 * network — the result is stable across renders for the same inputs.
 */

// Difficulty has a natural order, so "near difficulty" can be measured as a gap.
const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  easy: 0,
  moderate: 1,
  challenging: 2,
  expert: 3,
};

/**
 * Thematically related categories. Sharing a group earns a mild bonus — far
 * weaker than an exact category match, but enough to surface, e.g., a gorge
 * next to a waterfall when there aren't many exact matches nearby.
 */
const RELATED_CATEGORY_GROUPS: LocationCategory[][] = [
  ["hidden-lake", "waterfall", "river", "gorge"], // water
  ["viewpoint", "sunset-spot", "photo-spot", "night-sky"], // vistas / photography
  ["glacier", "alpine-meadow", "forest"], // alpine terrain
];

// Scoring weights — tuned so category dominates, then proximity, then the rest.
const WEIGHTS = {
  sameCategory: 50,
  relatedCategory: 18,
  proximity: 30, // scaled by closeness (see below)
  difficulty: 12, // scaled by how near the difficulty is
  sameRegion: 10,
} as const;

// Distance (km) at which the proximity bonus has fully decayed to zero.
// Switzerland is ~350 km across, so 200 km gives a smooth, useful gradient.
const PROXIMITY_FALLOFF_KM = 200;

function areRelated(a: LocationCategory, b: LocationCategory): boolean {
  return RELATED_CATEGORY_GROUPS.some(
    (group) => group.includes(a) && group.includes(b)
  );
}

function scoreCandidate(target: Location, candidate: Location): number {
  let score = 0;

  // 1. Category — exact match is the strongest signal; related is a mild nudge.
  if (candidate.category === target.category) {
    score += WEIGHTS.sameCategory;
  } else if (areRelated(candidate.category, target.category)) {
    score += WEIGHTS.relatedCategory;
  }

  // 2. Geographic proximity — closer is better, decaying linearly to zero.
  const km = distanceKm(target.coordinates, candidate.coordinates);
  const closeness = Math.max(0, 1 - km / PROXIMITY_FALLOFF_KM);
  score += WEIGHTS.proximity * closeness;

  // 3. Difficulty — full credit for an exact match, tapering with the gap.
  const diffGap = Math.abs(
    DIFFICULTY_ORDER[candidate.difficulty] - DIFFICULTY_ORDER[target.difficulty]
  );
  const diffCloseness = Math.max(0, 1 - diffGap / 3); // 3 = max possible gap
  score += WEIGHTS.difficulty * diffCloseness;

  // 4. Same region — a flat bonus.
  if (candidate.region === target.region) {
    score += WEIGHTS.sameRegion;
  }

  return score;
}

/**
 * Returns the `limit` locations most similar to `target`, best first.
 * The target itself is always excluded. Ties are broken deterministically by
 * `id` so the order never wobbles between renders.
 */
export function similarLocations(
  target: Location,
  all: Location[],
  limit = 10
): Location[] {
  return all
    .filter((l) => l.id !== target.id)
    .map((l) => ({ location: l, score: scoreCandidate(target, l) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.location.id.localeCompare(b.location.id);
    })
    .slice(0, limit)
    .map((entry) => entry.location);
}
