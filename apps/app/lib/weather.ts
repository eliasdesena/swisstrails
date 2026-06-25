/* ─────────────────────────────────────────────
   WEATHER — Open-Meteo (free, no API key)
   https://open-meteo.com
───────────────────────────────────────────── */

/**
 * lucide-react icon names usable by the weather widget.
 * Kept as a string union so the widget can map name → component
 * without this module importing React / lucide.
 */
export type WeatherIconName =
  | "Sun"
  | "CloudSun"
  | "Cloud"
  | "Cloudy"
  | "CloudFog"
  | "CloudDrizzle"
  | "CloudRain"
  | "CloudSnow"
  | "CloudLightning";

export interface DailyForecast {
  /** ISO date string, e.g. "2026-06-26" */
  date: string;
  hi: number;
  lo: number;
  label: string;
  icon: WeatherIconName;
  /** Max precipitation probability for the day, 0–100 (null if unknown) */
  precipProbability: number | null;
}

export interface WeatherData {
  current: {
    temp: number;
    label: string;
    icon: WeatherIconName;
    windKmh: number;
  };
  daily: DailyForecast[];
  /** Resolved IANA timezone reported by Open-Meteo. */
  timezone: string;
}

/* ── WMO weather_code mapping ─────────────────
   https://open-meteo.com/en/docs (WMO Weather interpretation codes)
*/
interface CodeInfo {
  label: string;
  icon: WeatherIconName;
}

const WMO: Record<number, CodeInfo> = {
  0: { label: "Clear", icon: "Sun" },
  1: { label: "Mainly clear", icon: "CloudSun" },
  2: { label: "Partly cloudy", icon: "CloudSun" },
  3: { label: "Overcast", icon: "Cloudy" },
  45: { label: "Fog", icon: "CloudFog" },
  48: { label: "Rime fog", icon: "CloudFog" },
  51: { label: "Light drizzle", icon: "CloudDrizzle" },
  53: { label: "Drizzle", icon: "CloudDrizzle" },
  55: { label: "Dense drizzle", icon: "CloudDrizzle" },
  56: { label: "Freezing drizzle", icon: "CloudDrizzle" },
  57: { label: "Freezing drizzle", icon: "CloudDrizzle" },
  61: { label: "Light rain", icon: "CloudRain" },
  63: { label: "Rain", icon: "CloudRain" },
  65: { label: "Heavy rain", icon: "CloudRain" },
  66: { label: "Freezing rain", icon: "CloudRain" },
  67: { label: "Freezing rain", icon: "CloudRain" },
  71: { label: "Light snow", icon: "CloudSnow" },
  73: { label: "Snow", icon: "CloudSnow" },
  75: { label: "Heavy snow", icon: "CloudSnow" },
  77: { label: "Snow grains", icon: "CloudSnow" },
  80: { label: "Rain showers", icon: "CloudRain" },
  81: { label: "Rain showers", icon: "CloudRain" },
  82: { label: "Heavy showers", icon: "CloudRain" },
  85: { label: "Snow showers", icon: "CloudSnow" },
  86: { label: "Snow showers", icon: "CloudSnow" },
  95: { label: "Thunderstorm", icon: "CloudLightning" },
  96: { label: "Thunderstorm", icon: "CloudLightning" },
  99: { label: "Thunderstorm", icon: "CloudLightning" },
};

const FALLBACK: CodeInfo = { label: "Unknown", icon: "Cloud" };

function describeCode(code: number): CodeInfo {
  return WMO[code] ?? FALLBACK;
}

/* ── In-memory cache (module-level) ─────────────
   Keyed by rounded lat,lng so reopening the same location's sheet
   doesn't refetch. Mirrored to sessionStorage so it survives client-side
   navigations within a tab. TTL ~30 min keeps call volume tiny.
*/
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  data: WeatherData;
  expires: number;
}

const memoryCache = new Map<string, CacheEntry>();

/** Round to ~3 decimals (~110m) so nearby reopens share a cache entry. */
function cacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

function sessionKey(key: string): string {
  return `swisstrails:weather:${key}`;
}

function readSession(key: string): WeatherData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(sessionKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (parsed.expires > Date.now()) return parsed.data;
    window.sessionStorage.removeItem(sessionKey(key));
  } catch {
    /* sessionStorage may be unavailable (private mode, etc.) — ignore */
  }
  return null;
}

function writeSession(key: string, entry: CacheEntry): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(sessionKey(key), JSON.stringify(entry));
  } catch {
    /* quota / disabled — non-fatal */
  }
}

/* ── Open-Meteo response shape (subset we request) ── */
interface OpenMeteoResponse {
  timezone?: string;
  current?: {
    temperature_2m?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: (number | null)[];
  };
}

/**
 * Build the keyless Open-Meteo forecast URL for a coordinate.
 * No API key, no auth — Open-Meteo is free and keyless.
 */
export function weatherUrl(lat: number, lng: number): string {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current: "temperature_2m,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    forecast_days: "4",
    timezone: "auto",
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

function parse(json: OpenMeteoResponse): WeatherData {
  const current = json.current ?? {};
  const currentInfo = describeCode(current.weather_code ?? -1);

  const d = json.daily ?? {};
  const times = d.time ?? [];
  const daily: DailyForecast[] = times.map((date, i) => {
    const info = describeCode(d.weather_code?.[i] ?? -1);
    return {
      date,
      hi: Math.round(d.temperature_2m_max?.[i] ?? 0),
      lo: Math.round(d.temperature_2m_min?.[i] ?? 0),
      label: info.label,
      icon: info.icon,
      precipProbability: d.precipitation_probability_max?.[i] ?? null,
    };
  });

  return {
    current: {
      temp: Math.round(current.temperature_2m ?? 0),
      label: currentInfo.label,
      icon: currentInfo.icon,
      windKmh: Math.round(current.wind_speed_10m ?? 0),
    },
    daily,
    timezone: json.timezone ?? "auto",
  };
}

/**
 * Fetch weather for a coordinate from Open-Meteo (client-side, keyless).
 *
 * Caching: checks the module-level Map first, then sessionStorage, before
 * hitting the network. Successful responses are written to both with a
 * ~30 min TTL. Rejects on network/HTTP failure so callers can show a
 * graceful "unavailable" state.
 */
export async function fetchWeather(lat: number, lng: number): Promise<WeatherData> {
  const key = cacheKey(lat, lng);

  const mem = memoryCache.get(key);
  if (mem && mem.expires > Date.now()) return mem.data;

  const session = readSession(key);
  if (session) {
    memoryCache.set(key, { data: session, expires: Date.now() + CACHE_TTL_MS });
    return session;
  }

  const res = await fetch(weatherUrl(lat, lng));
  if (!res.ok) {
    throw new Error(`Open-Meteo request failed: ${res.status}`);
  }

  const json = (await res.json()) as OpenMeteoResponse;
  const data = parse(json);

  const entry: CacheEntry = { data, expires: Date.now() + CACHE_TTL_MS };
  memoryCache.set(key, entry);
  writeSession(key, entry);

  return data;
}
