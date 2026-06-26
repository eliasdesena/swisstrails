#!/usr/bin/env node
/**
 * source-images.mjs
 * ----------------------------------------------------------------------------
 * Sources REAL, free, attribution-only photos for each Swiss hiking location in
 * `apps/app/data/locations.ts` and writes them to `apps/app/data/sourced-images.ts`.
 *
 * Strategy (per location):
 *   1. Primary — free photo APIs, ONLY if their keys exist in the environment:
 *        UNSPLASH_ACCESS_KEY, PEXELS_API_KEY, PIXABAY_API_KEY
 *      (Keys are not present in the default run; this path is written but skipped.)
 *   2. Fallback (KEYLESS, what actually runs) — Wikimedia Commons geosearch near
 *      the location's coordinates. Keeps real photos (image/jpeg, not maps/SVG/etc),
 *      takes up to 3 per location, and records attribution in `credit`.
 *   3. If nothing is found, the location is omitted from the output map.
 *
 * The script is RESUMABLE / IDEMPOTENT: it loads any locations already present in
 * `sourced-images.ts` and skips them, so it can be re-run to fill gaps.
 *
 * Usage:
 *   node apps/app/scripts/source-images.mjs                 # source everything missing
 *   LIMIT=20 node apps/app/scripts/source-images.mjs        # only process 20 (debug)
 *   FORCE=1 node apps/app/scripts/source-images.mjs         # ignore existing, redo all
 *
 * To use the paid/free APIs later, set the relevant key(s) in the environment:
 *   UNSPLASH_ACCESS_KEY=... PEXELS_API_KEY=... PIXABAY_API_KEY=... node apps/app/scripts/source-images.mjs
 */

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_DIR = resolve(__dirname, "..");
const LOCATIONS_PATH = resolve(APP_DIR, "data/locations.ts");
const OUTPUT_PATH = resolve(APP_DIR, "data/sourced-images.ts");

const USER_AGENT =
  "SwissTrails-ImageSourcer/1.0 (https://swisstrails.example; hiking location photo sourcing; node fetch)";

const MAX_PER_LOCATION = 3;
const GEO_RADIUS_M = 4000;
const GEO_LIMIT = 12;
const THUMB_WIDTH = 1200;
const CONCURRENCY = 4;
const POLITE_DELAY_MS = 150; // small delay between requests inside a worker
const SAVE_EVERY = 25; // checkpoint output every N newly-processed locations

const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : Infinity;
const FORCE = process.env.FORCE === "1" || process.env.FORCE === "true";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ */
/* Parse locations.ts WITHOUT importing it (it depends on "@/types").  */
/* We extract id / name / coordinates with a light regex sweep over     */
/* each top-level object literal.                                       */
/* ------------------------------------------------------------------ */
async function loadLocations() {
  const src = await readFile(LOCATIONS_PATH, "utf8");
  const locations = [];
  // Split on the `id:` field boundaries to isolate each location object.
  const idRegex = /id:\s*"(loc-\d+)"/g;
  let match;
  const indices = [];
  while ((match = idRegex.exec(src)) !== null) {
    indices.push({ id: match[1], index: match.index });
  }
  for (let i = 0; i < indices.length; i++) {
    const start = indices[i].index;
    const end = i + 1 < indices.length ? indices[i + 1].index : src.length;
    const chunk = src.slice(start, end);
    const id = indices[i].id;
    const nameMatch = chunk.match(/name:\s*"((?:[^"\\]|\\.)*)"/);
    const coordMatch = chunk.match(
      /coordinates:\s*\{\s*lat:\s*(-?\d+(?:\.\d+)?)\s*,\s*lng:\s*(-?\d+(?:\.\d+)?)\s*\}/,
    );
    if (!nameMatch || !coordMatch) continue;
    const name = nameMatch[1].replace(/\\"/g, '"');
    const lat = Number(coordMatch[1]);
    const lng = Number(coordMatch[2]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    locations.push({ id, name, lat, lng });
  }
  return locations;
}

/* ------------------------------------------------------------------ */
/* Load already-sourced ids from an existing output file (resumable).   */
/* ------------------------------------------------------------------ */
async function loadExisting() {
  if (FORCE || !existsSync(OUTPUT_PATH)) return {};
  try {
    const src = await readFile(OUTPUT_PATH, "utf8");
    const jsonStart = src.indexOf("= {", src.indexOf("SOURCED_IMAGES"));
    if (jsonStart === -1) return {};
    const objStart = src.indexOf("{", jsonStart);
    const objEnd = src.lastIndexOf("}");
    if (objStart === -1 || objEnd === -1 || objEnd <= objStart) return {};
    const objText = src.slice(objStart, objEnd + 1);
    // The generated object is valid JS object syntax; eval in a sandboxed Function.
    // eslint-disable-next-line no-new-func
    const parsed = Function(`"use strict"; return (${objText});`)();
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    console.warn("Could not parse existing output, starting fresh:", err.message);
    return {};
  }
}

/* ------------------------------------------------------------------ */
/* HTTP helper with timeout + retry.                                    */
/* ------------------------------------------------------------------ */
async function fetchJson(url, { headers = {}, retries = 3 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 20000);
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json", ...headers },
        signal: ctrl.signal,
      });
      clearTimeout(timeout);
      if (res.status === 429 || res.status >= 500) {
        const wait = 800 * (attempt + 1);
        await sleep(wait);
        continue;
      }
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      if (attempt === retries) return null;
      await sleep(600 * (attempt + 1));
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Helpers for building LocationImage objects.                          */
/* ------------------------------------------------------------------ */
function stripHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/* ------------------------------------------------------------------ */
/* SOURCE 1 — keyed free APIs (only run if env keys are present).        */
/* ------------------------------------------------------------------ */
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
const PEXELS_KEY = process.env.PEXELS_API_KEY;
const PIXABAY_KEY = process.env.PIXABAY_API_KEY;

async function fromUnsplash(loc) {
  if (!UNSPLASH_KEY) return [];
  const q = encodeURIComponent(`${loc.name} Switzerland`);
  const url = `https://api.unsplash.com/search/photos?query=${q}&per_page=${MAX_PER_LOCATION}&orientation=landscape`;
  const json = await fetchJson(url, {
    headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
  });
  if (!json?.results?.length) return [];
  return json.results.slice(0, MAX_PER_LOCATION).map((p, i) => ({
    id: `${loc.id}-unsplash-${i}`,
    url: `${p.urls.raw}&w=${THUMB_WIDTH}&q=80`,
    alt: loc.name,
    width: THUMB_WIDTH,
    credit: `${p.user?.name ?? "Unknown"} / Unsplash`,
  }));
}

async function fromPexels(loc) {
  if (!PEXELS_KEY) return [];
  const q = encodeURIComponent(`${loc.name} Switzerland`);
  const url = `https://api.pexels.com/v1/search?query=${q}&per_page=${MAX_PER_LOCATION}&orientation=landscape`;
  const json = await fetchJson(url, { headers: { Authorization: PEXELS_KEY } });
  if (!json?.photos?.length) return [];
  return json.photos.slice(0, MAX_PER_LOCATION).map((p, i) => ({
    id: `${loc.id}-pexels-${i}`,
    url: `${p.src?.large ?? p.src?.original}`,
    alt: loc.name,
    width: THUMB_WIDTH,
    credit: `${p.photographer ?? "Unknown"} / Pexels`,
  }));
}

async function fromPixabay(loc) {
  if (!PIXABAY_KEY) return [];
  const q = encodeURIComponent(`${loc.name} Switzerland`);
  const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${q}&image_type=photo&orientation=horizontal&per_page=${MAX_PER_LOCATION}`;
  const json = await fetchJson(url);
  if (!json?.hits?.length) return [];
  return json.hits.slice(0, MAX_PER_LOCATION).map((p, i) => ({
    id: `${loc.id}-pixabay-${i}`,
    url: p.largeImageURL ?? p.webformatURL,
    alt: loc.name,
    width: THUMB_WIDTH,
    credit: `${p.user ?? "Unknown"} / Pixabay`,
  }));
}

/* ------------------------------------------------------------------ */
/* SOURCE 2 — Wikimedia Commons geosearch (KEYLESS fallback).            */
/* ------------------------------------------------------------------ */
function isRealPhoto(info, title) {
  const mime = info?.mime ?? "";
  if (mime !== "image/jpeg") return false; // jpeg only -> excludes svg/png maps/icons/diagrams
  const t = (title ?? "").toLowerCase();
  // Filter out non-photographic assets that still happen to be jpeg.
  const bannedWords = [
    "map",
    "karte",
    "diagram",
    "logo",
    "icon",
    "coat of arms",
    "wappen",
    "panorama label",
    "topographic",
    "plan ",
    "chart",
    "graph",
    "scan",
    "drawing",
    "sketch",
    "blazon",
    "flag",
  ];
  if (bannedWords.some((w) => t.includes(w))) return false;
  return true;
}

async function fromCommons(loc) {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*` +
    `&generator=geosearch&ggscoord=${loc.lat}|${loc.lng}` +
    `&ggsradius=${GEO_RADIUS_M}&ggslimit=${GEO_LIMIT}&ggsnamespace=6` +
    `&prop=imageinfo&iiprop=url|extmetadata|mime|size&iiurlwidth=${THUMB_WIDTH}`;

  const json = await fetchJson(url);
  const pages = json?.query?.pages;
  if (!pages) return [];

  // Preserve geosearch ordering (nearest first) via `index`.
  const ordered = Object.values(pages).sort(
    (a, b) => (a.index ?? 1e9) - (b.index ?? 1e9),
  );

  const out = [];
  const seenUrls = new Set();
  for (const page of ordered) {
    const info = page.imageinfo?.[0];
    if (!info) continue;
    if (!isRealPhoto(info, page.title)) continue;

    const thumbUrl = info.thumburl ?? info.url;
    if (!thumbUrl || seenUrls.has(thumbUrl)) continue;
    seenUrls.add(thumbUrl);

    const meta = info.extmetadata ?? {};
    const artist = stripHtml(meta.Artist?.value) || "Unknown";
    const license =
      stripHtml(meta.LicenseShortName?.value) ||
      stripHtml(meta.License?.value) ||
      "see Wikimedia Commons";

    out.push({
      id: `${loc.id}-commons-${out.length}`,
      url: thumbUrl,
      alt: loc.name,
      width: info.thumbwidth ?? THUMB_WIDTH,
      credit: `${artist} / ${license} via Wikimedia Commons`,
    });

    if (out.length >= MAX_PER_LOCATION) break;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Source a single location: try keyed APIs first, then Commons.        */
/* ------------------------------------------------------------------ */
async function sourceLocation(loc) {
  // Primary keyed providers (skipped when no keys present).
  for (const provider of [fromUnsplash, fromPexels, fromPixabay]) {
    try {
      const imgs = await provider(loc);
      if (imgs.length) return imgs;
    } catch (err) {
      // ignore provider error, fall through
    }
  }
  // Keyless fallback.
  try {
    await sleep(POLITE_DELAY_MS);
    return await fromCommons(loc);
  } catch (err) {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Serialize the results map to a typed TS module.                      */
/* ------------------------------------------------------------------ */
function serialize(map) {
  const ids = Object.keys(map).sort((a, b) => {
    const na = Number(a.replace("loc-", ""));
    const nb = Number(b.replace("loc-", ""));
    return na - nb;
  });
  const lines = [];
  lines.push("// AUTO-GENERATED by scripts/source-images.mjs — do not edit by hand.");
  lines.push("// Real, free, attribution-only photos sourced from Wikimedia Commons");
  lines.push("// (geosearch near each location) and, when API keys are present,");
  lines.push("// Unsplash / Pexels / Pixabay. Re-run the script to refresh/extend.");
  lines.push('import type { LocationImage } from "@/types";');
  lines.push("");
  lines.push("export const SOURCED_IMAGES: Record<string, LocationImage[]> = {");
  for (const id of ids) {
    const imgs = map[id];
    if (!imgs || !imgs.length) continue;
    lines.push(`  ${JSON.stringify(id)}: [`);
    for (const img of imgs) {
      lines.push(`    ${JSON.stringify(img)},`);
    }
    lines.push("  ],");
  }
  lines.push("};");
  lines.push("");
  return lines.join("\n");
}

async function save(map) {
  await writeFile(OUTPUT_PATH, serialize(map), "utf8");
}

/* ------------------------------------------------------------------ */
/* Main driver with a small concurrency pool.                           */
/* ------------------------------------------------------------------ */
async function main() {
  const allLocations = await loadLocations();
  console.log(`Parsed ${allLocations.length} locations from locations.ts`);

  const results = await loadExisting();
  const alreadyHave = new Set(Object.keys(results));
  if (alreadyHave.size) {
    console.log(`Resuming: ${alreadyHave.size} locations already in output.`);
  }

  let todo = allLocations.filter((l) => !alreadyHave.has(l.id));
  if (Number.isFinite(LIMIT)) todo = todo.slice(0, LIMIT);
  console.log(
    `Processing ${todo.length} locations (concurrency ${CONCURRENCY}, Commons keyless)...`,
  );

  let processed = 0;
  let withImages = 0;
  let nextIndex = 0;

  async function worker(workerId) {
    while (true) {
      const i = nextIndex++;
      if (i >= todo.length) break;
      const loc = todo[i];
      const imgs = await sourceLocation(loc);
      processed++;
      if (imgs.length) {
        results[loc.id] = imgs;
        withImages++;
      }
      if (processed % 10 === 0) {
        process.stdout.write(
          `\r  ${processed}/${todo.length} processed, ${withImages} with images   `,
        );
      }
      if (processed % SAVE_EVERY === 0) {
        await save(results);
      }
    }
  }

  const workers = [];
  for (let w = 0; w < CONCURRENCY; w++) workers.push(worker(w));
  await Promise.all(workers);

  await save(results);

  const totalImages = Object.values(results).reduce((n, a) => n + a.length, 0);
  console.log("\n----------------------------------------------------");
  console.log("Coverage summary");
  console.log("----------------------------------------------------");
  console.log(`Total locations:               ${allLocations.length}`);
  console.log(`Locations with >=1 real image: ${Object.keys(results).length}`);
  console.log(`Total images sourced:          ${totalImages}`);
  console.log(`Output written to:             ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
