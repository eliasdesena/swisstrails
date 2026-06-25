import type { Coordinates } from "@/types";

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Great-circle (straight-line) distance between two coordinates, in kilometres.
 * Uses the Haversine formula. This is "as the crow flies" — not a driving route.
 */
export function distanceKm(a: Coordinates, b: Coordinates): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Human-friendly distance label.
 *  < 1 km   → "850 m"   (rounded to nearest 10 m)
 *  < 10 km  → "4.2 km"  (one decimal so short hops feel precise)
 *  ≥ 10 km  → "12 km" / "120 km" (whole km)
 */
export function formatDistance(km: number): string {
  if (!Number.isFinite(km) || km < 0) return "—";
  if (km < 1) {
    const m = Math.round((km * 1000) / 10) * 10;
    return `${m} m`;
  }
  if (km < 10) {
    return `${km.toFixed(1)} km`;
  }
  return `${Math.round(km)} km`;
}

/**
 * Straight-line distance from an origin to a location, formatted as "X away".
 * Returns null when there is no origin so callers can omit a misleading label.
 */
export function distanceLabel(
  origin: Coordinates | null,
  target: Coordinates
): string | null {
  if (!origin) return null;
  return `${formatDistance(distanceKm(origin, target))} away`;
}
