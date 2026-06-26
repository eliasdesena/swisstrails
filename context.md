# Swiss Trails — Project Context (A–Z)

> A complete reference for the Swiss Trails project: product, architecture, code, deployment, conventions, what's been built, what's pending. Last compiled 2026‑06‑26.

---

## 1. Product

**Swiss Trails** is a mobile‑first PWA that sells curated access to **500+ hidden hiking/nature spots across Switzerland** — hidden lakes, secret viewpoints, waterfalls, night‑sky spots, etc. Business model: **one‑time payment (CHF 29), lifetime access** (no subscription).

Two surfaces:
- **Marketing site** — the public landing/sales page (`swiss-trails.com`).
- **The app** — the actual product: map + explore + saved spots, an installable PWA (`app.swiss-trails.com`).

Tagline used across the product: *"Your best Swiss summer, already planned."*

---

## 2. Repository & Monorepo Layout

- **Local path:** `/Users/elias/Desktop/CODE/swisstrails`
- **GitHub:** `eliasdesena/swisstrails` (branch: `main`)
- **Monorepo:** Turborepo + **pnpm workspaces** (`pnpm-workspace.yaml` globs `apps/*` and `packages/*`).

```
swisstrails/
├── apps/
│   ├── app/         → swiss-trails-app   (the PWA — Next.js 15)
│   ├── marketing/   → swiss-trails-marketing (landing page — Next.js 15)
│   └── web/         → DEAD legacy pre-split copy ⚠️ (not deployed; should be deleted)
├── packages/
│   ├── ui/          → @swiss-trails/ui   (shared components + design tokens / globals.css)
│   ├── types/       → @swiss-trails/types (shared TypeScript types)
│   └── config/      → @swiss-trails/config (shared tsconfig base)
├── turbo.json
├── vercel.json      (root: sets NEXT_PUBLIC_MOCK_MODE=true at build)
└── pnpm-workspace.yaml
```

> ⚠️ **`apps/web` is dead code** — the original combined app before the marketing/app split. It is not deployed and should be removed at some point. All real work is in `apps/app` and `apps/marketing`.

### Shared packages

- **`@swiss-trails/ui`** (`packages/ui/src`): the **design-token CSS** (`globals.css` — `@theme {}` + base/components layers, no `@import "tailwindcss"` of its own), plus shared components (`button`, `badge`, `input`, `accordion`, `brand/logo`, `shared/reveal`, `shared/mock-banner`). Each app re-exports these via shallow **stub files** (e.g. `apps/app/components/ui/button.tsx` → `export { Button } from "@swiss-trails/ui/components/ui/button"`) so all `@/components/...` imports work unchanged. Apps use `transpilePackages: ["@swiss-trails/ui"]`.
- **`@swiss-trails/types`** (`packages/types/index.ts`): all shared domain types. App-side alias `@/types` re-exports this.
- **`@swiss-trails/config`**: base `tsconfig` (each app inlines the critical compiler options — see note in §17).

---

## 3. Tech Stack

| Area | Choice |
|---|---|
| Framework | **Next.js 15** (App Router), **React 19** |
| Styling | **TailwindCSS v4** — tokens via `@theme {}` in CSS, **no `tailwind.config`** |
| Fonts | **DM Sans** (body/UI, via `next/font`, CSS var `--font-sans`) + **Alcyone** (display/headings, `@font-face`, `--font-heading`) |
| State | **Zustand** (+ `persist` middleware → `localStorage`) |
| Animation | **framer-motion** |
| Map | **Leaflet** + **react-leaflet** + **react-leaflet-cluster**; **Mapbox satellite** tiles (public token) |
| Icons | **lucide-react** |
| Auth | **next-auth v5** (Google + Resend magic link) — **bypassed in mock mode** |
| DB (planned) | **Prisma** schema present; **Supabase** planned, **not connected yet** |
| Payments (planned) | **Stripe** checkout — **mocked** |
| Package mgr | **pnpm** + **Turborepo** |
| Hosting | **Vercel** |

---

## 4. Deployment (Vercel)

Two Vercel projects, each rooted at an app directory:

| Project | Root dir | Preview URL | Production (not linked yet) |
|---|---|---|---|
| `swisstrails-web` | `apps/marketing` | `swisstrails-web.vercel.app` | `swiss-trails.com` |
| `swisstrails-app` | `apps/app` | `swisstrails-app.vercel.app` | `app.swiss-trails.com` |

- Each app has a `vercel.json` with a Turbo build filter, e.g. app: `cd ../.. && pnpm turbo build --filter=swiss-trails-app`.
- Root directory + env vars were configured via the Vercel API/CLI (account: `eliasdesenas-projects`).
- **Both are in mock/demo mode right now** (`NEXT_PUBLIC_MOCK_MODE=true`). Custom domains are **not** linked yet (deliberate).
- Marketing → app cross-links use `NEXT_PUBLIC_APP_URL` (preview: the app's vercel URL; prod: `app.swiss-trails.com`).

### Environment variables

**Active (mock mode):**
- `NEXT_PUBLIC_MOCK_MODE=true` — the master demo switch.
- `NEXT_PUBLIC_MAPBOX_TOKEN` — **public** Mapbox token (`pk....`) for satellite tiles.
- `NEXT_PUBLIC_APP_URL` — marketing's link target to the app.
- `AUTH_SECRET`, `NEXTAUTH_URL` — required by next-auth even in mock mode (the middleware wraps `auth()`).

**Referenced in code, needed for real launch (not set / placeholder now):**
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_PRODUCT_ID`, `STRIPE_WEBHOOK_SECRET`
- Auth providers: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`
- Optional image sourcing (re-run the script with these to prefer them over Wikimedia): `UNSPLASH_ACCESS_KEY`, `PEXELS_API_KEY`, `PIXABAY_API_KEY`

> Local secrets live in `apps/app/.env.local` (git-ignored): mock mode, mapbox token, a generated `AUTH_SECRET`, `NEXTAUTH_URL=http://localhost:3001`. **Never commit `.env.local`.**

---

## 5. Mock / Demo Mode

When `NEXT_PUBLIC_MOCK_MODE=true`:
- **Middleware** (`apps/app/middleware.ts`) **skips all auth guards** — every route is open.
- A floating **"Demo Mode"** badge shows (bottom-right; `MockBanner`, gated by the flag).
- **Login** page shows an "Enter as Demo User" bypass + instant magic-link mock.
- **Checkout** page has preview-success / preview-cancel links and skips real Stripe.
- The `/admin` dashboard is reachable (in production it gates to `role: admin`).

---

## 6. Data Model (`packages/types/index.ts`)

Key types:

- **`Location`** (the core entity, 500 of them):
  `id` (e.g. `"loc-001"`), `slug`, `name`, `tagline`, `description`, `longDescription?`, `category` (`LocationCategory`), `difficulty` (`Difficulty`), `region` (`Region`/canton), `coordinates {lat,lng}`, `heroImage` (`LocationImage`), `gallery` (`LocationImage[]`), `tags[]`, `bestSeason` (`Season[]`), `travelTimeMinutes`, `visitDurationHours {min,max}`, `highlights[]`, `tips[]`, `whatToBring[]`, `accessInfo`, `parkingAvailable`, `publicTransport`, `elevation?`, `distanceKm?`, `isFeatured`, `isNew`, `viewCount`, `saveCount`, `createdAt`, `updatedAt`.
- **`LocationImage`**: `{ id, url, alt, width?, height?, credit?, isHero? }`.
- **`Difficulty`**: `easy | moderate | challenging | expert`.
- **`Season`**: `spring | summer | autumn | winter | year-round`.
- **`LocationCategory`** (12): `hidden-lake, viewpoint, waterfall, gorge, sunset-spot, night-sky, road-trip, photo-spot, forest, glacier, alpine-meadow, river`.
- **`Region`** (18 Swiss cantons): `bern, zurich, graubunden, valais, lucerne, uri, ticino, st-gallen, appenzell, fribourg, vaud, obwalden, nidwalden, schwyz, glarus, jura, neuchatel, solothurn`.
- **Social:** `ReactionKind = like | wantToGo | beenThere`, `SocialCounts`.
- **Hike Buddy:** `HikeBuddyProfile`, `HikePace`, `ExperienceLevel`, `AvailabilitySlot`.
- Also: `Category`, `Testimonial`, `PricingPlan`, `UserRole`, `UserProfile`, `Purchase`, `Favorite`, `MapState`, `LocationFilters`, `SearchResult`, `Database`.

### Data files (`apps/app/data/`)
- `locations.ts` — the 500 `PLACEHOLDER_LOCATIONS` (coordinates web-verified). ~17.5k lines.
- `sourced-images.ts` — **auto-generated**: `SOURCED_IMAGES: Record<id, LocationImage[]>` — real Wikimedia Commons photos (499/500 covered, ~1,495 images). Do not hand-edit.
- `categories.ts`, `hike-buddies.ts` (12 seed buddy profiles), `testimonials.ts`.

---

## 7. Routes (`apps/app/app`)

```
/                         → redirects to /explore
(app)/layout.tsx          → app shell: AppHeader (bottom nav), ScrollLock, MapAppPicker
(app)/explore             → masonry "wall" + search + sort + in-season rail (infinite scroll)
(app)/map                 → full-screen Leaflet map; floating controls; bottom sheet
(app)/favorites           → saved spots grid
(app)/profile             → stats, menu, Directions-app preference, gated Hike Buddy
(app)/trip                → itinerary planner (ordered stops, route, GPX)
(app)/hike-buddy          → gated "Coming Soon" (flag off)
(auth)/login              → magic-link / Google (mock bypass)
checkout, checkout/success, checkout/cancel  → Stripe (mock)
(admin)/admin             → dashboard (unlinked; role-gated in prod)
(admin)/admin/locations   → location list + per-row "Edit images" editor
location/[slug]           → public SSG location page (shareable/SEO)
api/* → auth/[...nextauth], favorites, locations, stripe/checkout, stripe/webhook
```

Marketing (`apps/marketing/app`): `(marketing)/page.tsx` (the landing page composed of `components/marketing/*` sections: hero, problem, solution, emotional-story, whats-included, social-proof, testimonials, pricing, faq, footer, navbar) + `location/[slug]` (redirects to the app domain).

---

## 8. State Stores (`apps/app/store/`, all Zustand + localStorage)

| Store | Key | Purpose |
|---|---|---|
| `favorites-store` | `swiss-trails-favorites` | Saved/favourited spots → **also the "Like"** (see §9 reactions) |
| `visited-store` | `swiss-trails-visited` | Visited spots → **also "Been there"**; drives Profile "Explored" stat |
| `social-store` | `swiss-trails-social` | Reactions; now only `wantToGo` is actively used (like/been migrated to favourites/visited) |
| `trip-store` | `swiss-trails-trip` | Ordered itinerary (`tripIds: string[]`) |
| `geo-store` | (persists position) | User geolocation (on-demand), for "near me" / distances |
| `map-store` | — | Map search query, active filters, selected location / bottom sheet |
| `map-pref-store` | `swiss-trails-map-pref` | Preferred directions app (auto/apple/google) + first-use picker state |
| `image-overrides-store` | `swiss-trails-image-overrides` | Admin per-location image overrides |
| `hike-buddy-store` | `swiss-trails-hike-buddy` | The current user's editable HikeBuddyProfile |

---

## 9. Libraries / Helpers (`apps/app/lib/`)

- **`deep-links.ts`** — directions/"Open in…" URL builders + native handoff:
  - Native app schemes: `appleMapsApp` (`maps://`), `googleMapsApp` (`comgooglemaps://`), `geoUri` (`geo:`).
  - Web builders: `googleMapsDirections`, `appleMapsDirections`, `komootPlan`, `switzerlandMobilityMap` (with WGS84→LV95 conversion `wgs84ToLv95`), `sbbDirections`.
  - `openUrl(url)` — schemes → same-window nav (opens the app, no inset browser); http(s) → new tab.
  - `directionsUrlFor(app, …)` + `openDirections(…)` (auto) — used by the map-pref flow.
  - GPX: `buildGpxWaypoint`/`downloadGpx`, `buildGpxRoute`/`downloadGpxRoute`, multi-stop `googleMapsRoute`.
- **`location-images.ts`** — **image source-priority resolver**: `useLocationImages(location)` returns the effective image list by priority: **Supabase/user-upload (gated)** → **admin override** → **sourced** (`heroImage` + Wikimedia `SOURCED_IMAGES[id]` + `gallery`, deduped). `resolveSourcedImages()` is the pure version.
- **`social-counts.ts`** — deterministic per-location "community" base counts (hashed from id); `displayedCount(id, kind, userToggled)` = base + (1 if you toggled).
- **`distance.ts`** — Haversine `distanceKm`, `formatDistance`.
- **`sort.ts`** — `sortLocations(list, mode, origin)`: `featured | nearest | newest`.
- **`filters.ts`** — `filterLocations` (search + category/difficulty/region), `countActiveFilters`.
- **`season.ts`** — `currentSeason()` (month→season), `isInSeason(location)` (for the in-season rail; **month-based, never time-of-day**).
- **`similarity.ts`** — `similarLocations()` (real "More like this": category + proximity + difficulty + region, deterministic).
- **`weather.ts`** — `fetchWeather(lat,lng)` via **Open-Meteo** (free, **no API key**), in-memory + sessionStorage cache (~30 min). WMO code → label/icon.
- **`hike-buddy.ts`** — `matchScore(a,b)` + `findMatches()` (regions/difficulty/pace/availability/language weighting).
- **`flags.ts`** — `HIKE_BUDDY_ENABLED=false`, `SUPABASE_IMAGES_ENABLED=false`.
- **`auth.ts`** (next-auth config), **`stripe.ts`**, **`supabase/`** (client/server — not connected), **`utils.ts`** (`cn`, `difficultyConfig`, `categoryConfig`, `regionConfig`, `seasonConfig`, formatters).

---

## 10. Key Components (`apps/app/components/`)

- **`app/app-header.tsx`** — desktop top bar (`lg:`) + **mobile bottom tab nav** (Explore/Map/Favourites/Profile), 24px icons.
- **`app/bottom-sheet.tsx`** — the Google-Maps-style **draggable sheet** on the map (3 snaps: peek/half/full; drag-anywhere-except-`button,a,[data-no-drag]`; `select-none`; collapse-on-scroll-top; sizes from `visualViewport`/`dvh`; stops at the nav so the CTA stays visible).
- **`app/location-detail.tsx`** — the sheet **content** (map). Sticky header = title + sub-line + icon actions (add-to-trip, share) + **ReactionBar** + **PhotoStrip**; scrollable body = stats grid, description, getting-there, best-season, weather, highlights, collapsible tips; sticky **Get directions** CTA + "more apps".
- **`app/location-detail-sheet.tsx`** — the explore-page detail sheet (mirrors the above; footer has Get directions / share / "Map").
- **`app/photo-strip.tsx`** — horizontal photo strip + full-screen lightbox carousel.
- **`app/reaction-bar.tsx`** — the 3 engagement chips (Like→favourites, Want-to-go→social, Been-there→visited), with counts.
- **`app/open-in-sheet.tsx`** — "Open in…" sheet (Google/Apple Maps native, Komoot, SwitzerlandMobility, SBB, GPX, copy coords).
- **`app/map-app-picker.tsx`** — first-use "Open directions in…" picker (Apple/Google/device default).
- **`app/map-view.tsx`** — Leaflet map (clusters, custom 44px markers, satellite/standard toggle).
- **`app/location-card.tsx`**, **`app/location-grid.tsx`**, **`app/filter-drawer.tsx`**, **`app/sort-control.tsx`**, **`app/search-panel.tsx`** (dead/unused), **`app/weather-widget.tsx`**, **`app/trip-pill.tsx`** (floating "Trip · N").
- **`app/scroll-lock.tsx`** — locks the document on tab routes (see §13).
- **`admin/location-image-editor.tsx`** — the admin image editor drawer/modal.
- **`shared/mock-banner.tsx`** (Demo badge), **`shared/reveal.tsx`** (scroll reveal), **`brand/logo.tsx`**.

---

## 11. Features (what the app does)

- **Explore** — full-bleed masonry "wall" (`columns-2/3/4`), **infinite scroll** (24-card windows via IntersectionObserver — caps image bandwidth), search, **sort** (Featured/Nearest/Newest), dismissible **"In season now"** rail.
- **Map** — full-screen satellite Leaflet map with **floating frosted controls** (no header bar), clustering, tap a marker → draggable bottom sheet.
- **Location detail** — Google-Maps-style sheet (see §10): photos, stats, weather, getting-there, highlights/tips, reactions, directions.
- **Get directions / Open in…** — opens the **native maps app** (Apple/Google via URL schemes), preferred app chosen on first use + in Settings; plus Komoot, SwitzerlandMobility (Swiss LV95), SBB (when `publicTransport`), GPX download, copy coords.
- **Near me** — on-demand geolocation → real "X km away" + sort by nearest.
- **Weather** — per-spot current + 4-day forecast (Open-Meteo, free).
- **Favourites / Visited** — saved + visited lists (localStorage), surfaced as the Like / Been-there chips and the Profile stats.
- **Trip planner** — add spots, reorder, leg distances + total, "Open route in Google Maps" (multi-waypoint), GPX export; floating Trip pill + Profile entry.
- **Discovery** — in-season rail + real "More like this".
- **Social (foundation)** — Like / Want-to-go / Been-there counts (deterministic base + user). Synced to favourites/visited.
- **Hike Buddy** — full matching engine + data model **built but gated** (`HIKE_BUDDY_ENABLED=false`); shows as a greyed **"Coming Soon"** entry in Profile.
- **Admin** — `/admin` dashboard, `/admin/locations` with **per-location image editor** (add by URL, reorder, set primary, reset; Supabase upload gated).

---

## 12. Design System

- **Tokens** (in `packages/ui/src/globals.css`, `@theme`):
  - **trail** (near-black navy backgrounds, `trail-950 #06080F` … `trail-600`).
  - **alpine** (brand blue accent, `alpine-500 #515EFF` …).
  - **gold** (CTAs/highlights, `gold-400 #F5B828`).
  - **stone** (neutral grays). Semantic: `--color-fg #F0EDE6`, `fg-muted` (stone-400), `fg-subtle` (stone-600), `fg-faint`.
  - Radii, shadows, motion easings; **`clamp()` type scale** utilities (`t-display`, `t-h1`…`t-h4`, `t-body`).
- **Fonts:** Alcyone (display headings) + DM Sans (body/UI).
- **Conventions enforced this session:** ≥44px touch targets; **inputs ≥16px** (avoid iOS focus-zoom — shared `Input` is `text-base`, `rounded-lg`); contrast lifted off `fg-subtle`/stone-600 for readable copy.
- Dark theme only.

---

## 13. PWA / iOS specifics (important & subtle)

The app is a **standalone installable PWA** with several deliberate iOS behaviours (root `apps/app/app/layout.tsx`):

- **`viewport-fit=cover`** + **`apple-mobile-web-app-status-bar-style: black-translucent`** → content (the **map**) renders **edge-to-edge behind the status bar/Dynamic Island**. ⚠️ iOS bakes the status-bar style at **install time** — after changing it you must **remove & re-add the PWA to the home screen**.
- **`maximumScale: 1` + `userScalable: false`** → **pinch-zoom disabled** on the app chrome/map overlay (the map zooms internally via Leaflet). (Re-added after a brief removal; the zoom was causing a "stuck nav" look.)
- **Safe-area insets** (`env(safe-area-inset-*)`): top padding on each tab page's header; the bottom nav model is **`nav height = 4rem + env(safe-area-inset-bottom)`**, and `main` reserves exactly that so the map meets the nav with no black gap. (iOS already lifts `fixed bottom-0` above the home indicator, so the nav pads by **only** `env(...)`, not an extra base gap — that double-count was a fixed bug.)
- **`ScrollLock`** (`components/app/scroll-lock.tsx`, mounted by the `(app)` layout): adds an `.app-shell-locked` class to `html`/`body` (`position: fixed; overflow: hidden; overscroll-behavior: none`) **only on the four tab routes**, so the document can't scroll/rubber-band — only inner containers scroll. Scrolling pages (location/login/checkout/admin) and the marketing site are **not** locked.
- `overscroll-behavior: none` is global on `html`/`body`.

> **Open / needs on-device verification:** after disabling zoom, confirm (a) the bottom nav sits correctly (not "stuck high") and (b) the map sheet expands fully. If those persist when not zoomed, it's a deeper interaction between the `position: fixed` document lock and the dynamic viewport — to be debugged with device feedback.

---

## 14. Image pipeline

1. **Sourcing** (`scripts/source-images.mjs`, run output → `data/sourced-images.ts`): keyless **Wikimedia Commons geosearch** (4 km radius) per location → up to 3 real, attributed photos (`"<Artist> / <License> via Wikimedia Commons"`), served from **Commons' CDN**. 499/500 covered (gap: loc-175 Saflischpass). The script will prefer Unsplash/Pexels/Pixabay if those API keys are present in env, and is resumable (`FORCE=1`, `LIMIT=N`).
2. **Hero baseline:** each location also has an Unsplash hero (`?w=1200&q=80`).
3. **Resolution priority** (`lib/location-images.ts`): Supabase/user upload (gated) → admin override (localStorage) → sourced (hero + Commons + gallery).
4. **Bandwidth:** `next.config.ts` sets **`images.unoptimized: true`** so images stream from the source CDN and **don't hit Vercel's image-optimization quota**; explore also lazy-loads via infinite scroll.

---

## 15. Auth / payments / persistence (current state)

- **Auth:** next-auth v5 configured (Google + Resend magic link), **bypassed in mock mode**. `AUTH_SECRET` required even so.
- **Payments:** Stripe checkout flow exists but is **mocked** (no live keys).
- **Persistence:** everything user-specific (favourites, visited, trip, reactions, image overrides, map preference, hike-buddy profile) is **client-side `localStorage`**. **No backend is connected.** Supabase is the intended backend (image upload + cross-device sync are gated behind `SUPABASE_IMAGES_ENABLED`).

---

## 16. Local development

`pnpm install` at the repo root. Dev servers (also wired into `.claude/launch.json` for the preview tooling):

- **App:** `cd apps/app && PORT=3001 pnpm exec next dev` → http://localhost:3001 (needs `apps/app/.env.local` with mock mode + mapbox token + `AUTH_SECRET`).
- **Marketing:** `cd apps/marketing && PORT=3000 pnpm exec next dev` → http://localhost:3000.
- Type-check: `node_modules/.bin/tsc --noEmit -p apps/app/tsconfig.json`.
- Turbo scripts at root: `pnpm dev`, `pnpm dev:app`, `pnpm dev:marketing`, `pnpm build`.

---

## 17. Conventions & gotchas

- **Commit AND push after every change** (the owner works remotely and reviews via the live deploy). End commit bodies with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- **Never commit `.env.local`.** The public Mapbox token (`pk....`) is fine to use locally; secrets are not.
- **tsconfig:** each app **inlines** the compiler options (target/jsx/paths/etc.) rather than only `extends`-ing `@swiss-trails/config`, because `tsc` run directly didn't resolve the package `extends` reliably.
- **`apps/web` is dead** — ignore/delete.
- **`search-panel.tsx`** is unused dead code.
- Tailwind v4: there is **no `tailwind.config`**; tokens are CSS-only; `@source` directives scan the shared package.

---

## 18. Session history — what was built (chronological)

The project went from a single combined app to the current state over one long session. Milestones (newest→oldest in `git log`):

1. **PWA polish & icons** — generated all PWA icons from the logo SVG, manifest, OG image, loading states, copy fixes, location deeplink page.
2. **Monorepo split** — separated marketing vs app into `apps/marketing` + `apps/app` with shared `packages/ui|types|config`; two Vercel projects; mock mode + cross-app URLs wired; app root → `/explore`.
3. **Mobile/UX audit (multi-agent) + fixes** — systemic a11y (16px inputs, 44px targets, contrast), bottom-nav, explore/map controls, detail sheets, flows, admin, loading skeletons, marketing menu/accordion/contrast.
4. **Font swap** — Space Grotesk → **DM Sans**.
5. **Feature build-out (multi-agent):** the "Open in…" deep links, geolocation/near-me, weather (Open-Meteo), visited tracking, trip planner, discovery (in-season + real similarity), social reaction counts + gated Hike Buddy.
6. **Detail redesign** — Google-Maps-style draggable sheet (3 snaps), decluttered hierarchy, sticky title + photo strip, removed the "Save" button.
7. **Coordinates** — validated all 500; fixed 7 (duplicates + misplaced peaks).
8. **PWA viewport saga** — float map controls (no header), reach status bar (black-translucent), bottom-nav/home-indicator math, document scroll-lock (kill rubber-band), re-disable pinch-zoom.
9. **Explore infinite scroll + image bandwidth** (`unoptimized`).
10. **Images** — source-priority model + **admin image editor**; Wikimedia Commons sourcing (499/500); merged into the resolver.
11. **Directions** — native maps-app handoff (no inset browser) + **preferred-map-app** (ask on first use + Settings).
12. **Reactions** — synced Like↔Favourite, Been-there↔Visited; removed duplicate icon actions.
13. **Polish items** — input radius, profile "Explore the map" → /map, trip page polish, admin "8→500" stat fix.

---

## 19. Known issues / pending / roadmap

**Needs the owner's on-device check (after current deploy):**
- iOS PWA bottom-nav position ("stuck high") and panel/sheet full expansion — believed fixed by disabling zoom; confirm on device.
- Re-add the PWA to the home screen to pick up the `black-translucent` status bar.

**Not yet implemented (intentionally gated / awaiting setup):**
- **Supabase** not connected → no real persistence, no cross-device sync, no user image uploads (the admin "Upload — Supabase soon" button is gated).
- **Real auth** (Google/Resend), **Stripe** payments — mocked.
- **Hike Buddy** UI is gated (`HIKE_BUDDY_ENABLED=false`).
- **Image sourcing** currently Wikimedia-only; add `UNSPLASH_ACCESS_KEY`/`PEXELS_API_KEY`/`PIXABAY_API_KEY` and re-run `scripts/source-images.mjs` for location-specific stock too. Commons photos are accurate but variable quality — curate via the admin editor.
- **Custom domains** not linked (`swiss-trails.com` / `app.swiss-trails.com`).
- **`saveCount`/`viewCount`** in data are static placeholders; community counts are deterministic, not real.
- **`apps/web`** dead copy to delete.

**Product roadmap ideas (discussed):** itinerary depth, collections/curated lists, offline maps (PWA), webcams/trail status, sunrise/sunset (the owner asked to keep sunset/night spots as **normal categories — no time-of-day gating**), referrals/gifting, push notifications, real reviews/UGC, cross-device favourites sync (the place a real account earns its keep).

---

## 20. Quick reference — "where do I…?"

| I want to… | Look at |
|---|---|
| Change a location's data | `apps/app/data/locations.ts` |
| Add/curate images for a location | `/admin/locations` → "Edit images" (or `data/sourced-images.ts` for sourced) |
| Change design tokens / colors / type | `packages/ui/src/globals.css` |
| Touch the bottom sheet behaviour | `components/app/bottom-sheet.tsx` |
| Change directions behaviour | `lib/deep-links.ts` + `store/map-pref-store.ts` |
| Change the image priority logic | `lib/location-images.ts` |
| Flip a gated feature | `lib/flags.ts` |
| App shell / nav / safe-area | `app/(app)/layout.tsx`, `components/app/app-header.tsx`, `components/app/scroll-lock.tsx` |
| PWA viewport / status bar / zoom | `app/layout.tsx` (`viewport` + `appleWebApp`) |
| Run it locally | §16 |
```
