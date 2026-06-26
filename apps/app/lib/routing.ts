import type { Coordinates } from "@/types";
import { distanceKm } from "@/lib/distance";

/**
 * ROUTING — real driving legs via the Mapbox Directions API, with a
 * bulletproof Haversine fallback.
 *
 * The page must NEVER break when the API is unreachable (no token, fetch
 * error, offline, sandbox). Every failure path resolves to an `estimated`
 * leg derived from the straight-line distance, so callers can render the same
 * UI they would for a real leg — just labelled honestly as an estimate.
 */

export interface RouteLeg {
  /** Driving (or estimated) distance, kilometres. */
  distanceKm: number;
  /** Driving (or estimated) time, minutes. */
  durationMin: number;
  /** True when this is a Haversine estimate, not a real Mapbox route. */
  estimated: boolean;
}

/** Average driving speed (km/h) for the rough fallback estimate. */
const FALLBACK_SPEED_KMH = 55;
/** Multiplier: real roads are longer/slower than the crow-flies line. */
const FALLBACK_DETOUR_FACTOR = 1.3;

/** Round trips to a coord pair, stable cache key (6 dp ≈ 0.1 m precision). */
function cacheKey(from: Coordinates, to: Coordinates): string {
  const k = (c: Coordinates) => `${c.lng.toFixed(6)},${c.lat.toFixed(6)}`;
  return `${k(from)};${k(to)}`;
}

/** In-memory cache (per page session) — fastest path, survives re-renders. */
const memCache = new Map<string, RouteLeg>();

const STORE_PREFIX = "st-route:";

function readSessionCache(key: string): RouteLeg | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RouteLeg;
    if (
      typeof parsed.distanceKm === "number" &&
      typeof parsed.durationMin === "number"
    ) {
      return parsed;
    }
  } catch {
    /* corrupt/unavailable — ignore, fall through */
  }
  return null;
}

function writeSessionCache(key: string, leg: RouteLeg): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(STORE_PREFIX + key, JSON.stringify(leg));
  } catch {
    /* quota/unavailable — caching is best-effort */
  }
}

/** The graceful fallback leg, derived purely from the Haversine distance. */
export function estimateLeg(from: Coordinates, to: Coordinates): RouteLeg {
  const straight = distanceKm(from, to);
  const roadKm = straight * FALLBACK_DETOUR_FACTOR;
  const durationMin = (roadKm / FALLBACK_SPEED_KMH) * 60;
  return {
    distanceKm: straight,
    durationMin,
    estimated: true,
  };
}

/**
 * Fetch a single driving leg from `from` → `to`.
 *
 * Resolves to a real `{ estimated: false }` leg on success, or a graceful
 * `{ estimated: true }` Haversine estimate on ANY failure (missing token,
 * network error, non-OK response, empty `routes`). Never rejects — callers
 * can `await` it without a try/catch and always get a renderable leg.
 */
export async function fetchRouteLeg(
  from: Coordinates,
  to: Coordinates,
  signal?: AbortSignal
): Promise<RouteLeg> {
  const key = cacheKey(from, to);

  const cached = memCache.get(key) ?? readSessionCache(key);
  if (cached) {
    memCache.set(key, cached);
    return cached;
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  // No token → straight to the fallback. Do NOT cache the estimate, so a later
  // session with a token (or network) can upgrade to a real leg.
  if (!token) {
    return estimateLeg(from, to);
  }

  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}` +
    `?access_token=${token}&overview=false`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return estimateLeg(from, to);

    const data: unknown = await res.json();
    const route = (data as { routes?: Array<{ distance?: number; duration?: number }> })
      ?.routes?.[0];

    if (
      !route ||
      typeof route.distance !== "number" ||
      typeof route.duration !== "number"
    ) {
      return estimateLeg(from, to);
    }

    const leg: RouteLeg = {
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60,
      estimated: false,
    };
    // Only real legs are cached — estimates stay cheap to recompute and
    // upgradeable on a future successful fetch.
    memCache.set(key, leg);
    writeSessionCache(key, leg);
    return leg;
  } catch {
    // AbortError, network failure, JSON parse error, offline/sandbox — all
    // resolve to the safe estimate.
    return estimateLeg(from, to);
  }
}

/** Human-friendly drive time. `<60` → "45 min", else "1h 20m" / "2h". */
export function formatDuration(min: number): string {
  if (!Number.isFinite(min) || min < 0) return "—";
  const rounded = Math.round(min);
  if (rounded < 60) return `${rounded} min`;
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
