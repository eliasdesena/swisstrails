import type { Coordinates, Location } from "@/types";
import { distanceKm } from "@/lib/distance";

export type SortMode = "featured" | "nearest" | "newest";

export const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "nearest", label: "Nearest" },
  { value: "newest", label: "Newest" },
];

/**
 * Returns a new array sorted by the chosen mode.
 *  - "featured": original order (the curated default) — returned untouched.
 *  - "nearest":  ascending straight-line distance from `origin`. Falls back to
 *                the original order when `origin` is unknown (no permission yet),
 *                so the UI never silently reorders without a real position.
 *  - "newest":   newest first by `createdAt`, with `isNew` items prioritised.
 */
export function sortLocations(
  locations: Location[],
  mode: SortMode,
  origin: Coordinates | null
): Location[] {
  if (mode === "nearest") {
    if (!origin) return locations;
    return [...locations].sort(
      (a, b) =>
        distanceKm(origin, a.coordinates) - distanceKm(origin, b.coordinates)
    );
  }

  if (mode === "newest") {
    return [...locations].sort((a, b) => {
      if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }

  // "featured" — preserve curated order.
  return locations;
}
