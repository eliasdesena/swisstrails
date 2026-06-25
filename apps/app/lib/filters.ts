import type { Location, LocationFilters } from "@/types";

export function filterLocations(
  locations: Location[],
  query: string,
  filters: LocationFilters
): Location[] {
  const q = query.toLowerCase().trim();

  return locations.filter((loc) => {
    if (q) {
      const hit =
        loc.name.toLowerCase().includes(q) ||
        loc.tagline.toLowerCase().includes(q) ||
        loc.region.toLowerCase().includes(q) ||
        loc.tags.some((t) => t.toLowerCase().includes(q));
      if (!hit) return false;
    }

    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(loc.category)
    ) {
      return false;
    }

    if (
      filters.difficulties.length > 0 &&
      !filters.difficulties.includes(loc.difficulty)
    ) {
      return false;
    }

    if (
      filters.regions.length > 0 &&
      !filters.regions.includes(loc.region)
    ) {
      return false;
    }

    return true;
  });
}

export function countActiveFilters(filters: LocationFilters): number {
  return (
    filters.categories.length +
    filters.difficulties.length +
    filters.regions.length
  );
}
