"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  Reorder,
  useDragControls,
} from "framer-motion";
import {
  Route,
  Map as MapIcon,
  GripVertical,
  X,
  Clock,
  MapPin,
  Navigation,
  Download,
  Trash2,
  MoveRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTripStore } from "@/store/trip-store";
import { PLACEHOLDER_LOCATIONS } from "@/data/locations";
import { distanceKm, formatDistance } from "@/lib/distance";
import { googleMapsRoute, downloadGpxRoute, type RouteStop } from "@/lib/deep-links";
import { regionConfig, formatVisitDuration } from "@/lib/utils";
import { fadeUp, staggerContainer, SPRING } from "@/lib/motion";
import { haptics } from "@/lib/haptics";
import type { Location } from "@/types";

export default function TripPage() {
  const tripIds = useTripStore((s) => s.tripIds);
  const setOrder = useTripStore((s) => s.setOrder);
  const removeFromTrip = useTripStore((s) => s.removeFromTrip);
  const clearTrip = useTripStore((s) => s.clearTrip);

  // The page reads the persisted (localStorage) trip store. Gate render behind a
  // `mounted` flag so we don't flash a 0/empty state or risk an SSR mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Resolve ids → locations, preserving trip order. Drop any stale ids.
  const stops = useMemo(() => {
    const byId = new Map(PLACEHOLDER_LOCATIONS.map((l) => [l.id, l]));
    return tripIds
      .map((id) => byId.get(id))
      .filter((l): l is Location => Boolean(l));
  }, [tripIds]);

  // Straight-line ("as the crow flies") distance between consecutive stops.
  const legKm = useMemo(
    () =>
      stops.map((loc, i) =>
        i === 0 ? 0 : distanceKm(stops[i - 1].coordinates, loc.coordinates)
      ),
    [stops]
  );
  const totalKm = useMemo(() => legKm.reduce((a, b) => a + b, 0), [legKm]);

  const routeStops: RouteStop[] = useMemo(
    () =>
      stops.map((l) => ({
        lat: l.coordinates.lat,
        lng: l.coordinates.lng,
        name: l.name,
      })),
    [stops]
  );

  const totalVisitMin = useMemo(
    () => stops.reduce((a, l) => a + l.visitDurationHours.min, 0),
    [stops]
  );
  const totalVisitMax = useMemo(
    () => stops.reduce((a, l) => a + l.visitDurationHours.max, 0),
    [stops]
  );

  // Reorder operates on ids — the store's source of truth. Only commit a true
  // permutation (setOrder guards this too).
  const handleReorder = (ids: string[]) => setOrder(ids);

  const handleRemove = (id: string) => {
    haptics.tap();
    removeFromTrip(id);
  };

  // Until hydrated, render the shell only — avoids the zero-flash / mismatch.
  if (!mounted) {
    return <div className="h-full" aria-hidden />;
  }

  if (stops.length === 0) {
    return (
      <div className="h-full overflow-y-auto px-4 lg:px-6 pb-4 lg:pb-6 pt-[max(1rem,env(safe-area-inset-top))] lg:pt-6">
        <motion.div
          className="max-w-2xl mx-auto"
          variants={staggerContainer(0.06)}
          initial="hidden"
          animate="show"
        >
          <div className="mb-8">
            <motion.h1 variants={fadeUp} className="t-h2 text-fg mb-1">
              Your Trip
            </motion.h1>
            <motion.p variants={fadeUp} className="t-body text-fg-muted">
              Plan your route across Switzerland
            </motion.p>
          </div>

          <motion.div
            variants={fadeUp}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-14 h-14 rounded-lg bg-white/[0.04] flex items-center justify-center mb-6">
              <Route className="w-6 h-6 text-stone-600" />
            </div>
            <h2 className="t-h3 text-fg mb-3">Your trip is empty</h2>
            <p className="t-body text-fg-muted max-w-sm mb-8">
              Add spots from any location to build an itinerary, then open the
              whole route in Google Maps.
            </p>
            <Button asChild variant="alpine" className="pressable">
              <Link href="/explore" onClick={() => haptics.tap()}>
                <MapIcon className="w-4 h-4" />
                Explore spots
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-6">
      <motion.div
        className="max-w-2xl mx-auto"
        variants={staggerContainer(0.05)}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="mb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="t-h2 text-fg mb-1">Your Trip</h1>
              <p className="t-body text-fg-muted">
                {stops.length} stop{stops.length > 1 ? "s" : ""}
                <span className="text-stone-600"> · </span>
                ~{formatVisitDuration(totalVisitMin, totalVisitMax)}
                {/* Straight-line total is de-emphasised vs. the visit-time total. */}
                <span className="text-stone-700"> · </span>
                <span className="text-fg-subtle">
                  {formatDistance(totalKm)} as the crow flies
                </span>
              </p>
            </div>
            <button
              onClick={() => {
                haptics.warn();
                clearTrip();
              }}
              className="pressable flex items-center gap-1.5 h-9 px-3 text-xs font-medium rounded-lg text-stone-400 hover:text-red-300 hover:bg-red-950/30 transition-colors flex-shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </motion.div>

        {/* Honest labelling — distances are straight-line, not driving routes. */}
        <motion.p
          variants={fadeUp}
          className="text-fg-subtle text-xs mb-4 flex items-center gap-1.5"
        >
          <Navigation className="w-3 h-3" />
          Distances are straight-line (as the crow flies), not driving routes.
        </motion.p>

        {/* Itinerary — drag a stop by its handle to reorder. */}
        <Reorder.Group
          axis="y"
          values={tripIds}
          onReorder={handleReorder}
          className="space-y-2 mb-6"
        >
          <AnimatePresence initial={false}>
            {stops.map((loc, i) => (
              <TripStopItem
                key={loc.id}
                loc={loc}
                index={i}
                isLast={i === stops.length - 1}
                legDistance={i > 0 ? formatDistance(legKm[i]) : null}
                onRemove={() => handleRemove(loc.id)}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {/* CTAs */}
        <motion.div variants={fadeUp} className="space-y-2">
          {/* Primary — open the whole route in Google Maps */}
          <Button variant="alpine" size="lg" className="w-full pressable" asChild>
            <a
              href={googleMapsRoute(routeStops)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => haptics.tap()}
            >
              <Navigation className="w-4 h-4" />
              Open route in Google Maps
            </a>
          </Button>

          {/* Secondary — download all waypoints as a GPX file */}
          <button
            onClick={() => {
              haptics.tap();
              downloadGpxRoute(routeStops, "swiss-trails-trip");
            }}
            className="pressable w-full flex items-center justify-center gap-2 h-11 px-4 text-sm font-medium rounded-lg bg-white/[0.04] text-stone-300 hover:text-fg hover:bg-white/[0.07] transition-colors"
          >
            <Download className="w-4 h-4" />
            Download GPX
          </button>
        </motion.div>

        <div className="h-6" />
      </motion.div>
    </div>
  );
}

/**
 * A single draggable trip stop. Wrapped in `Reorder.Item` keyed by the location
 * id (the store's source of truth). Drag is gated to the grip handle via
 * `useDragControls` so vertical scroll on the card body still works on touch.
 *
 * a11y: keyboard users can't drag, so each item keeps small up/down controls in
 * the handle column as a secondary, fully-accessible reorder affordance.
 */
function TripStopItem({
  loc,
  index,
  isLast,
  legDistance,
  onRemove,
}: {
  loc: Location;
  index: number;
  isLast: boolean;
  legDistance: string | null;
  onRemove: () => void;
}) {
  const moveUp = useTripStore((s) => s.moveUp);
  const moveDown = useTripStore((s) => s.moveDown);
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={loc.id}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={() => haptics.snap()}
      onDragEnd={() => haptics.snap()}
      // Lift + shadow + slight scale on grab; spring layout settle on drop.
      whileDrag={{
        scale: 1.03,
        boxShadow: "0 14px 32px rgba(0,0,0,0.5)",
        zIndex: 50,
      }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={SPRING.gentle}
      style={{ position: "relative" }}
      className="list-none"
    >
      {/* Leg distance connector — reflows with the drag, collapses on remove. */}
      {legDistance && (
        <div className="flex items-center gap-2 pl-4 py-1.5 text-fg-subtle text-xs">
          <MoveRight className="w-3.5 h-3.5" />
          {legDistance}
          <span className="text-stone-700">·</span>
          <span className="text-stone-600">as the crow flies</span>
        </div>
      )}

      <div className="card-solid rounded-xl p-3 flex items-center gap-3">
        {/* Drag handle + order index + keyboard fallback controls */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <button
            type="button"
            aria-label={`Move ${loc.name} up`}
            disabled={index === 0}
            onClick={() => {
              haptics.snap();
              moveUp(index);
            }}
            className="w-6 h-5 flex items-center justify-center rounded text-stone-500 enabled:hover:text-fg enabled:active:scale-90 disabled:opacity-30 transition-colors"
          >
            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none">
              <path
                d="M4 10l4-4 4 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div
            role="button"
            tabIndex={0}
            aria-label={`Drag to reorder ${loc.name}`}
            onPointerDown={(e) => dragControls.start(e)}
            className="touch-none cursor-grab active:cursor-grabbing flex flex-col items-center gap-0.5 text-stone-500 hover:text-stone-300 transition-colors"
          >
            <GripVertical className="w-4 h-4" />
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-alpine-900/60 text-alpine-300 text-xs font-semibold">
              {index + 1}
            </span>
          </div>

          <button
            type="button"
            aria-label={`Move ${loc.name} down`}
            disabled={isLast}
            onClick={() => {
              haptics.snap();
              moveDown(index);
            }}
            className="w-6 h-5 flex items-center justify-center rounded text-stone-500 enabled:hover:text-fg enabled:active:scale-90 disabled:opacity-30 transition-colors"
          >
            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none">
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Thumbnail */}
        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-white/[0.04]">
          <img
            src={loc.heroImage.url}
            alt={loc.name}
            className="w-full h-full object-cover pointer-events-none"
            loading="lazy"
            draggable={false}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-fg text-sm font-medium line-clamp-1">{loc.name}</p>
          <p className="text-fg-muted text-xs mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {regionConfig[loc.region].label}
          </p>
          <p className="text-fg-subtle text-xs mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatVisitDuration(
              loc.visitDurationHours.min,
              loc.visitDurationHours.max
            )}{" "}
            visit
          </p>
        </div>

        {/* Remove */}
        <button
          type="button"
          aria-label={`Remove ${loc.name} from trip`}
          onClick={onRemove}
          className="icon-button flex-shrink-0 w-9 h-9 min-w-0 min-h-0 rounded-lg text-stone-600 hover:text-red-300 hover:bg-red-950/30 active:scale-95 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </Reorder.Item>
  );
}
