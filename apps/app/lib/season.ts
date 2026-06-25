import type { Location, Season } from "@/types";

/**
 * The four real seasons, in calendar order, that a date can fall into.
 * "year-round" is intentionally excluded — it is a property of a *location*,
 * not a moment in time, so `currentSeason` never returns it.
 */
export type CalendarSeason = Exclude<Season, "year-round">;

/**
 * Maps the month of the given date to its meteorological season.
 *   Dec–Feb → winter
 *   Mar–May → spring
 *   Jun–Aug → summer
 *   Sep–Nov → autumn
 *
 * Month-of-year only — there is deliberately no time-of-day logic here.
 */
export function currentSeason(date: Date = new Date()): CalendarSeason {
  const month = date.getMonth(); // 0 = January … 11 = December
  if (month <= 1 || month === 11) return "winter"; // Dec, Jan, Feb
  if (month <= 4) return "spring"; // Mar, Apr, May
  if (month <= 7) return "summer"; // Jun, Jul, Aug
  return "autumn"; // Sep, Oct, Nov
}

/**
 * True when the location is a good pick for the given season — either because
 * its `bestSeason` explicitly lists that season, or because it is flagged
 * "year-round" (good any time). Applied uniformly to every category.
 */
export function isInSeason(
  location: Location,
  season: Season = currentSeason()
): boolean {
  return (
    location.bestSeason.includes(season) ||
    location.bestSeason.includes("year-round")
  );
}
