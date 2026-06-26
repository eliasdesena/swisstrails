/* ─────────────────────────────────────────────
   DEEP-LINK HELPERS — "Open in… / Get directions"

   Pure, client-side URL/Blob builders. No network
   calls, no API keys. Every function takes plain
   (lat, lng, name) args so it's trivial to test.
───────────────────────────────────────────── */

/** Google Maps turn-by-turn directions to the destination (not just a dropped pin). */
export function googleMapsDirections(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/** Apple Maps directions. `daddr` = destination address, `q` = label. */
export function appleMapsDirections(lat: number, lng: number, name: string): string {
  return `https://maps.apple.com/?daddr=${lat},${lng}&q=${encodeURIComponent(name)}`;
}

/** Native `geo:` URI — opens the device's default GPS/maps app on Android. */
export function geoUri(lat: number, lng: number, name: string): string {
  return `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(name)})`;
}

/** Komoot — plan a route in the area around the destination. */
export function komootPlan(lat: number, lng: number): string {
  return `https://www.komoot.com/plan/@${lat},${lng},14z`;
}

/**
 * Convert WGS84 (lat,lng in degrees) → Swiss LV95 (E,N in metres).
 * swisstopo approximate ("Näherungslösung") formula, accurate to ~1 m.
 */
export function wgs84ToLv95(lat: number, lng: number): { E: number; N: number } {
  // Auxiliary values: arc-seconds relative to the Bern reference, / 10000.
  const phi = (lat * 3600 - 169028.66) / 10000;
  const lam = (lng * 3600 - 26782.5) / 10000;

  const E =
    2600072.37 +
    211455.93 * lam -
    10938.51 * lam * phi -
    0.36 * lam * phi * phi -
    44.54 * lam ** 3;

  const N =
    1200147.07 +
    308807.95 * phi +
    3745.25 * lam ** 2 +
    76.63 * phi ** 2 -
    194.56 * lam ** 2 * phi +
    119.79 * phi ** 3;

  return { E, N };
}

/**
 * SchweizMobil / SwitzerlandMobility — the Swiss national hiking map.
 * Uses LV95 coordinates, so we convert first.
 */
export function switzerlandMobilityMap(lat: number, lng: number): string {
  const { E, N } = wgs84ToLv95(lat, lng);
  return `https://map.schweizmobil.ch/?lang=en&bgLayer=pk&E=${Math.round(E)}&N=${Math.round(N)}&zoom=7`;
}

/**
 * SBB public-transport journey planner, pointed at the destination coords.
 * Only surface this when a location has `publicTransport: true`.
 */
export function sbbDirections(lat: number, lng: number): string {
  return `https://www.sbb.ch/en?nach=${lat},${lng}`;
}

/** `"LAT, LNG"` — handy for copy-to-clipboard. */
export function formatCoordinates(lat: number, lng: number): string {
  return `${lat}, ${lng}`;
}

/** Build a minimal, valid GPX 1.1 document with a single named waypoint. */
export function buildGpxWaypoint(lat: number, lng: number, name: string): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Swiss Trails" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <wpt lat="${lat}" lon="${lng}">
    <name>${esc(name)}</name>
  </wpt>
</gpx>
`;
}

/**
 * Trigger a client-side download of a GPX waypoint file. No network.
 * Works with Garmin Connect, Komoot import, OsmAnd, and any GPS app.
 */
export function downloadGpx(lat: number, lng: number, name: string, slug: string): void {
  if (typeof document === "undefined") return;
  const gpx = buildGpxWaypoint(lat, lng, name);
  const blob = new Blob([gpx], { type: "application/gpx+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug}.gpx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ─────────────────────────────────────────────
   MULTI-STOP / ITINERARY HELPERS
───────────────────────────────────────────── */

/** A single ordered itinerary stop. */
export interface RouteStop {
  lat: number;
  lng: number;
  name: string;
}

/**
 * Multi-waypoint Google Maps driving directions.
 *
 * The origin is omitted so Google uses the user's current location. The last
 * stop becomes the `destination`; every stop before it is an ordered
 * `waypoints` entry (pipe-separated). Returns "" for an empty list.
 *
 *   https://www.google.com/maps/dir/?api=1
 *     &destination=<lastLat>,<lastLng>
 *     &waypoints=<lat>,<lng>|<lat>,<lng>|…
 *     &travelmode=driving
 */
export function googleMapsRoute(stops: RouteStop[]): string {
  if (stops.length === 0) return "";
  const last = stops[stops.length - 1];
  const params = new URLSearchParams({ api: "1" });
  params.set("destination", `${last.lat},${last.lng}`);
  if (stops.length > 1) {
    const waypoints = stops
      .slice(0, -1)
      .map((s) => `${s.lat},${s.lng}`)
      .join("|");
    params.set("waypoints", waypoints);
  }
  params.set("travelmode", "driving");
  // Decode the `,` and `|` separators back to their literal form — Google's
  // `api=1` directions endpoint expects `lat,lng` pairs joined by `|`.
  const query = params.toString().replace(/%2C/g, ",").replace(/%7C/g, "|");
  return `https://www.google.com/maps/dir/?${query}`;
}

/** Build a GPX 1.1 document containing an ordered list of named waypoints. */
export function buildGpxRoute(stops: RouteStop[]): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const wpts = stops
    .map(
      (s) =>
        `  <wpt lat="${s.lat}" lon="${s.lng}">\n    <name>${esc(s.name)}</name>\n  </wpt>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Swiss Trails" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
${wpts}
</gpx>
`;
}

/** Trigger a client-side download of a multi-waypoint GPX file. No network. */
export function downloadGpxRoute(stops: RouteStop[], filename = "swiss-trails-trip"): void {
  if (typeof document === "undefined" || stops.length === 0) return;
  const gpx = buildGpxRoute(stops);
  const blob = new Blob([gpx], { type: "application/gpx+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.gpx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** iOS detection so the one-tap default can use Apple Maps on Apple devices. */
export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/** Android detection (for the native `geo:` handoff). */
export function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/.test(navigator.userAgent);
}

/** Apple Maps app via its native URL scheme — opens the Maps app, not a browser. */
export function appleMapsApp(lat: number, lng: number, name: string): string {
  return `maps://?daddr=${lat},${lng}&q=${encodeURIComponent(name)}`;
}

/** Google Maps app via its native URL scheme (opens the app when installed). */
export function googleMapsApp(lat: number, lng: number): string {
  return `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`;
}

/**
 * Open a URL in the right place. Native app schemes (`maps://`,
 * `comgooglemaps://`, `geo:`) are handed to the OS via a same-window navigation
 * so the actual app launches — no inset in-app browser. http(s) links (web-only
 * services) open in a separate browser tab/instance.
 */
export function openUrl(url: string): void {
  if (typeof window === "undefined") return;
  if (/^https?:/i.test(url)) {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    window.location.href = url;
  }
}

/**
 * One-tap "Get directions" → the platform's native maps app directly:
 * Apple Maps (`maps://`) on iOS, the default `geo:` handler on Android, and
 * Google Maps (web) on desktop. Avoids the in-app browser popup.
 */
export function openDirections(lat: number, lng: number, name: string): void {
  let url: string;
  if (isIOS()) url = appleMapsApp(lat, lng, name);
  else if (isAndroid()) url = geoUri(lat, lng, name);
  else url = googleMapsDirections(lat, lng);
  openUrl(url);
}

/**
 * Platform-default "Get directions" URL (string form, for contexts that need an
 * href). Prefer {@link openDirections} for click handlers — it uses native
 * schemes and avoids the in-app browser.
 */
export function platformDirections(lat: number, lng: number, name: string): string {
  return isIOS()
    ? appleMapsDirections(lat, lng, name)
    : googleMapsDirections(lat, lng);
}
