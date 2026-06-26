# Swiss Trails — UI/UX Production Overhaul Plan

> Consolidated from a 5-agent read-only audit (2026-06-26). Scope: take the app from "polished demo" to **production-grade, native-feeling** — buttery gestures, native interaction feel, floating nav, smooth motion + visual polish. **Keeps the current dark design language** (polish, not redesign). All client-side / demo-mode safe.

Organized by **build order**: shared primitives first (Phase 0), then the fixes that hang off them. Severities: **P0** = feels broken / actively wrong · **P1** = notably improves native feel · **P2** = polish.

---

## ✅ Status (shipped 2026-06-26)

All phases implemented and pushed to `main` (review on the live deploys):

| Wave | Commit | What |
|---|---|---|
| Phase 0 | `451e41c` | Floating nav, unified `--nav-h`/`--nav-clear` geometry (PWA-jank root fix), velocity-spring sheet, `lib/motion`, `lib/haptics`, surface tokens, `pressable`/`icon-button` presets |
| Phase 1a | `06af549` | Route transitions, animate-once masonry + resolver + fade-in, press-feedback sweep |
| Phase 1b | `3d59f80` | Native photo-lightbox gestures (finger-tracking paging, swipe-to-dismiss) |
| Phase 2a | `c53f129` | Explore: filter chips, persisted rail, skeleton match, instant filter scroll |
| Phase 2b | `597a531` | Map: category-tinted markers, marker pop, recenter-on-open, Leaflet gesture tuning |
| Phase 2c | `6ea2f4d` | Detail sheets: ref-counted scroll-lock fix, drag-to-dismiss, spring presentations |
| Phase 2d | `3621a79` | Favourites/Profile: animated removal, hydration guards, count-up stats, segmented control, Cantons metric, wired sign-out |
| Phase 3a | `bd7b4e0` | Trip: drag-to-reorder, animated add/remove, honest distance labelling |
| Phase 3b | `d12fb12` | Trip: real Mapbox driving legs (Haversine fallback), elevation profile, shareable link |
| Phase 4a | `a49e1aa` | Peripheral: admin dead-end fixes, checkout/login validation+errors, dvh+safe-area, image-editor mobile |
| Phase 4b | `95a2067` | Marketing: stale-year fix, /privacy + /terms, "works offline" softened, reduced-motion, testimonials grid |
| Phase 5 | `4754fe5` | `min-h-dvh` on the non-locked scrolling pages |

### Deferred (need owner input before landing)
- **Multi-day trip grouping** — a `trip-store` schema migration (`tripIds[]` → `days[]`) that touches the whole add-to-trip flow; too invasive to land blind. Own reviewable wave.
- **Per-stop notes / timing** — small store addition; parked with the multi-day wave.
- **Restore pinch-zoom** (`userScalable`) — left disabled pending on-device confirmation that the Phase 0 geometry fix resolved the "stuck nav" issue (re-enabling needs a PWA re-install to verify).

---

---

## Phase 0 — Foundations (shared primitives — build these first)

The systemic audit's headline: the token foundation in `packages/ui/src/globals.css` is strong, but **`apps/app` barely consumes it** (type scale used 27× vs 201 raw/arbitrary `text-*`; ~150 ad-hoc `bg-white/[0.0x]` fills across 8 opacity values; the easing curve hand-copied 17×). Fixing this is ~5 primitives, not 200 edits. Everything downstream consumes them.

1. **`--nav-h` + safe-area single source of truth** *(P0 — also the likely root cause of the on-device PWA jank)*
   - Today nav-height geometry is re-derived in ~10 places with **two different formulas**: `bottom-sheet.tsx:17` hardcodes `NAV_H = 74` in JS and computes height from `visualViewport`, while `(app)/layout.tsx:10` reserves `pb-[calc(4rem+env(...))]` in CSS. When those disagree, you get exactly the reported "bottom nav stuck high / sheet won't fully expand."
   - Define `--nav-h`, `--safe-t`, `--safe-b` once in `globals.css` + a JS `NAV_H` derived from the same value. Compute the sheet height from the **same unit** the layout uses (pick `dvh` everywhere or `visualViewport` everywhere — not both). Remove the `74` hardcode.
   - This unblocks the floating nav, sheet geometry, and all page padding.

2. **`lib/motion.ts` — shared motion config** *(P1)*
   - `EASE_OUT = [0.16,1,0.3,1]` (currently hand-copied 17×), `DUR.fast/base/slow` (14 scattered values today), `SPRING.snappy/soft`, and shared variants (`fadeUp`, `scaleIn`, `sheetVariants`). Unblocks transitions, press feedback, sheet exits.

3. **Surface-elevation tokens** *(P0 consistency)* — define `--surface-1/2/3` + `.surface-*` utilities; collapse the ~150 ad-hoc `bg-white/[0.0x]` fills onto a 3-step ramp; use the already-defined `--color-border` for hairlines.

4. **Type scale + control presets** *(P0/P1)* — add micro sizes (`t-2xs` for the 10–11px labels currently set as `text-[11px]`×24/`text-[10px]`×11), then sweep onto `t-*`. Add a `pressable` preset (one `active:scale-[0.97] transition-transform duration-100`) and an `icon-button` preset (44×44 hit area). Route the 66 raw `<button>`s + sub-44px icon buttons through them.

5. **`lib/haptics.ts`** *(P1)* — `tap(ms=8) → navigator.vibrate?.(ms)`, guarded by `prefers-reduced-motion` (Android/Chrome now; safe no-op on iOS). Wired into toggles/snaps in later phases. **No haptics exist anywhere today** — highest native-feel-per-line in the audit.

6. *(Optional structural)* `<TabScreen>` (canonical scroll container + safe-area padding + `overscroll-contain`), `<DragSheet>` (extract the existing well-built pointer engine so the 6 sheets stop reimplementing it), `<FloatingNav>`.

---

## Phase 1 — Headline native-feel wins (highest impact)

7. **Floating nav** *(P1 — the owner's explicit ask)* — convert `app-header.tsx:57` from a full-width docked bar to a centered, inset, rounded glass pill floating above the safe area (`bottom-[calc(env(safe-area-inset-bottom)+12px)] mx-3 rounded-2xl card-glass-strong ring-1 ring-white/[0.06]`). Add an **animated active-tab indicator** (`motion.div layoutId="navActive"` slides behind the active icon). Re-anchor the `TripPill` and the bottom-sheet stop-point to the new `--nav-h`.

8. **Bottom sheet — velocity-inherited spring settle** *(P0 — the single biggest "this is a web app" tell)* — `bottom-sheet.tsx:75-82,135-192` reads `y.getVelocity()` but only as a boolean, then settles every release with a fixed `duration: 0.32` tween. A slow drag and a hard flick animate identically. Fix: settle with `type:"spring", velocity: y.getVelocity(), stiffness:520, damping:42` so the animation is continuous with the finger. ~80% of the perceived uplift.

9. **Bottom sheet — stop per-frame geometry recompute** *(P0 jank source)* — `onPointerMove` calls `getSnaps()→visualViewport.height` on **every** pointer event (60–120Hz). Compute snaps once on drag start (+ on resize/orientation), read from a ref. (Largely dissolves if moving to framer `drag`; the systemic agent recommends **keeping the hand-rolled engine** but sharing it as `<DragSheet>`, since framer `drag` can't easily honor the nav-clearance constraint.)

10. **Press feedback everywhere** *(P1)* — exactly **one `whileTap`** exists in the app; `active:` on only ~16 of 66 buttons across 6 different scale values; map controls have **none**. Apply the `pressable` preset uniformly (nav tabs, map controls, reaction chips, CTAs, picker rows, filter rows). Add the haptic tick.

11. **Route/page transitions** *(P1)* — tab switches are hard cuts and Explore re-staggers its whole masonry on every return. Add a `PageTransition` wrapper keyed on `usePathname()` (`AnimatePresence mode="wait"`, short opacity + small `y`) in `(app)/layout.tsx`, and gate the masonry stagger to **animate once** / only new infinite-scroll windows.

12. **Photo lightbox — native gestures** *(P1, photo-first product)* — `photo-strip.tsx:148-171`: add **swipe-down-to-dismiss** (image tracks finger, backdrop fades with `offset.y`), **finger-tracking paged carousel** (neighbor slides in under the finger, not a jump-on-threshold), and a **shared-element** `layoutId` so the thumbnail expands into fullscreen and collapses back.

---

## Phase 2 — Per-screen polish

**Explore / shell**
- Masonry image **fade-in on load** + shimmer placeholder (currently grey-box→snap; `explore/page.tsx:306`). *(P1)*
- Skeleton **aspect-ratio match** so content doesn't re-flow on hydrate (`explore/loading.tsx` uses px heights vs real aspect-ratios). *(P1)*
- **Persist in-season rail dismissal** per-season (currently `useState`, reappears every visit — reads as broken). *(P0-ish bug)*
- **Instant** filter-reset scroll-to-top (global `scroll-behavior:smooth` animates a long rewind on each keystroke; pass `behavior:"auto"`). *(P1)*
- Masonry should route images through `useLocationImages` (currently bypasses the resolver → ignores admin/curated images). *(P2 behavioral)*
- Filter drawer: selectable **chips** with real filled state instead of flat text rows; bump 36px clear button to 44px. *(P1/P2)*

**Map**
- **Recenter pin above the sheet** on marker tap (pin is often hidden behind the peek sheet; `map.panInside` with offset). *(P1)*
- Animated **marker pop** on select (currently an abrupt divIcon swap). *(P1)*
- **Category-tinted markers** using existing `categoryConfig` (all 500 are identical 14px white dots today). *(P2 — high impact/low cost)*
- Leaflet gesture tuning: `zoomSnap={0.25}` (steppy pinch today), inertia, `bounceAtZoomLimits`; hide the desktop +/− zoom buttons on mobile. *(P2)*

**Detail sheets**
- Explore detail sheet: add **drag-to-dismiss + grab handle** to match the map sheet (two different sheet models today). *(P1)*
- Fix **scroll-lock collision**: `location-detail-sheet.tsx:98` / `open-in-sheet.tsx:89` write `document.body.style.overflow` directly, racing the class-based `ScrollLock` → intermittent "scroll dead after closing a sheet." Route through one ref-counted lock. *(P1)*
- Sheet open/close: spring presentation instead of 280ms tween; handle tap-cycle shouldn't skip "half" on the way down. *(P2)*

**Favourites / Profile / Trip (polish)**
- **`AnimatePresence` + `layout` + `exit`** on every removable list item (Favourites grid, Trip stops) — every removal currently teleports siblings. *(P1)*
- **Hydration guards** on persisted-store reads (Favourites grid, Profile stats, Trip) — kills the zero-flash + SSR mismatch risk. *(P1)*
- Profile stats: bigger `tabular-nums` numbers + **count-up** on mount; replace placeholder "Since 2025" with a real metric (e.g. distinct cantons). *(P1)*
- Profile **"Sign out" does nothing** (no `onClick`) — wire it or visibly disable like the "Soon" rows. *(P1 — reads as broken)*
- Directions-app control → real **segmented control** with a sliding `layoutId` thumb. *(P2)*
- Retire `Reveal` (0.65s scroll-reveal) as page-entrance on these short screens; use one fast container fade. *(P2)*

---

## Phase 3 — Trip planner feature overhaul *(greenlit — its own track)*

13. **Drag-to-reorder** *(P0)* — replace the chevron steppers (`trip/page.tsx:198`) with `framer-motion <Reorder.Group>` / long-press `useDragControls`: lift+shadow on grab, spring `layout` reflow, haptic on pickup/drop. The store's `moveItem(from,to)` already supports it; only the UI is missing. This is the interaction users judge a planner by.
14. **Real route legs & totals** *(P1)* — swap Haversine straight-line (off by 2–3× in the Alps, and it's the headline number) for OSRM/Mapbox Directions (a Mapbox token already exists); cache per leg; surface **driving time** as the headline.
15. **Multi-day itineraries** — extend store `tripIds: string[]` → `days[]`; collapsible day sections with subtotals; "auto-split by drive time"; drag stops between days.
16. **Elevation profile** — SVG sparkline from `Location.elevation` (total ascent/descent per day).
17. **Per-stop notes + timing** — running schedule ("leave 08:00 → arrive ~09:40").
18. **Share/export** — Web Share of a `/trip?stops=...` link, `.ics` calendar export, per-day GPX, animated pill-count bump + toast on add (radix-toast already a dep).

---

## Phase 4 — Peripheral screens + marketing site

**Quick trust/correctness fixes (do early — cheap, high impact):**
- **Marketing hero says "Summer 2025"** (`hero.tsx:83`) — it's mid-2026; stale year in the very first line. Drop it or derive `getFullYear()`. *(P1)*
- **Missing `/privacy` + `/terms` pages** (footer 404s) — trust + likely Stripe/legal requirement for a paid product. Add stubs. *(P1)*
- **"Works offline" overclaim** (`solution-section.tsx:25`, `faq.tsx:25`) — not built (roadmap only); refund/trust landmine against the "visit 3 spots or refund" guarantee. Soften to "installable PWA." *(P1)*
- **Admin dead-ends** — Add Location / Users / Settings routes 404; view/edit/**delete** buttons non-functional (destructive Delete with no confirm is the worst). Disable or stub like the gated Hike Buddy entry; wire "view" → `/location/[slug]`. *(P0)*

**App (auth / checkout / admin):**
- Checkout **error path silently strands** the user (swallowed catch, no error UI) on the highest-anxiety screen; add error state + validation; use the shared `Input` (currently hand-rolled). *(P1)*
- Login: no email validation/error; "magic link sent" always succeeds even for "asdf"; shared loading flag spins the wrong button. *(P1)*
- `min-h-screen` → `min-h-dvh` + safe-area insets on login/checkout/success/cancel (currently none — content can sit under the Dynamic Island / home indicator). *(P1)*
- Admin 500-row list: add debounced search (`filterLocations`) / pagination. *(P2)*

**Marketing (polish):**
- **Reduced-motion**: the JS framer sections (`hero`, `social-proof`, `problem`, `whats-included`, `testimonials`, `pricing`) drive `opacity/translate`/parallax directly and **bypass** the reduced-motion guard that `Reveal`/`Stagger` honor — a11y regression. Route through `Reveal` or gate on `useReducedMotion()`. *(P1)*
- Testimonials: horizontal-scroll carousel even on desktop (only 6 cards, hidden) → `lg:grid`. *(P2)*
- Anchor scroll-offset (`scroll-mt-20`) so jump targets clear the fixed header. *(P2)*
- Mobile menu safe-area top inset; hero CTA → checkout vs `#pricing`; normalize CTA casing; marquee edge-fade. *(P2)*

---

## Phase 5 — A11y / correctness sweep
- Re-evaluate restoring **pinch-zoom** (`userScalable:false`, WCAG 1.4.4) once the Phase-0 geometry fix removes the reason it was disabled.
- `min-h-screen`/`100vh` → `dvh` across the non-locked scrolling pages (8 occurrences).
- Bake `overscroll-contain` into the shared scroll-container primitive.

---

## Recommended sequencing
**Phase 0 → 1** delivers the biggest perceived jump (floating nav, native sheet, transitions, press feel) and fixes the on-device PWA jank at its root. **Phase 4 quick trust fixes** (stale year, dead legal links, overclaim, admin dead-ends) are cheap and worth slotting in early. **Phase 2** is broad polish. **Phase 3 (Trip)** is the one net-new feature track. **Phase 5** is cleanup.

_No files were modified during the audit. This document is the plan; nothing is implemented yet._
