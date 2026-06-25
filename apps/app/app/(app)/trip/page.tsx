"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Route,
  Map as MapIcon,
  ChevronUp,
  ChevronDown,
  X,
  Clock,
  MapPin,
  Navigation,
  Download,
  Trash2,
  MoveRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
import { useTripStore } from "@/store/trip-store";
import { PLACEHOLDER_LOCATIONS } from "@/data/locations";
import { distanceKm, formatDistance } from "@/lib/distance";
import { googleMapsRoute, downloadGpxRoute, type RouteStop } from "@/lib/deep-links";
import { regionConfig, formatVisitDuration, cn } from "@/lib/utils";
import type { Location } from "@/types";

export default function TripPage() {
  const tripIds = useTripStore((s) => s.tripIds);
  const moveUp = useTripStore((s) => s.moveUp);
  const moveDown = useTripStore((s) => s.moveDown);
  const removeFromTrip = useTripStore((s) => s.removeFromTrip);
  const clearTrip = useTripStore((s) => s.clearTrip);

  // Resolve ids → locations, preserving trip order. Drop any stale ids.
  const stops = useMemo(() => {
    const byId = new Map(PLACEHOLDER_LOCATIONS.map((l) => [l.id, l]));
    return tripIds
      .map((id) => byId.get(id))
      .filter((l): l is Location => Boolean(l));
  }, [tripIds]);

  // Straight-line distance between consecutive stops, plus the total.
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

  if (stops.length === 0) {
    return (
      <div className="h-full overflow-y-auto p-4 lg:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Reveal>
              <h1 className="t-h2 text-fg mb-1">Your Trip</h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="t-body text-fg-muted">Plan your route across Switzerland</p>
            </Reveal>
          </div>

          <motion.div
            className="flex flex-col items-center justify-center py-24 text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-14 h-14 rounded-lg bg-white/[0.04] flex items-center justify-center mb-6">
              <Route className="w-6 h-6 text-stone-600" />
            </div>
            <h2 className="t-h3 text-fg mb-3">Your trip is empty</h2>
            <p className="t-body text-fg-muted max-w-sm mb-8">
              Add spots from any location to build an itinerary, then open the
              whole route in Google Maps.
            </p>
            <Button asChild variant="alpine">
              <Link href="/explore">
                <MapIcon className="w-4 h-4" />
                Explore spots
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Reveal>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="t-h2 text-fg mb-1">Your Trip</h1>
                <p className="t-body text-fg-muted">
                  {stops.length} stop{stops.length > 1 ? "s" : ""}
                  <span className="text-stone-600"> · </span>
                  {formatDistance(totalKm)} total
                  <span className="text-stone-600"> · </span>
                  ~{formatVisitDuration(totalVisitMin, totalVisitMax)} of visits
                </p>
              </div>
              <button
                onClick={clearTrip}
                className="flex items-center gap-1.5 h-9 px-3 text-xs font-medium rounded-lg text-stone-400 hover:text-red-300 hover:bg-red-950/30 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          </Reveal>
        </div>

        {/* Distances are straight-line ("as the crow flies"), not driving routes. */}
        <Reveal delay={0.05}>
          <p className="text-fg-subtle text-xs mb-4 flex items-center gap-1.5">
            <Navigation className="w-3 h-3" />
            Distances shown are straight-line between stops.
          </p>
        </Reveal>

        {/* Itinerary list */}
        <div className="space-y-2 mb-6">
          {stops.map((loc, i) => (
            <div key={loc.id}>
              {/* Leg distance connector */}
              {i > 0 && (
                <div className="flex items-center gap-2 pl-4 py-1.5 text-fg-subtle text-xs">
                  <MoveRight className="w-3.5 h-3.5" />
                  {formatDistance(legKm[i])}
                </div>
              )}

              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                className="card-solid rounded-xl p-3 flex items-center gap-3"
              >
                {/* Order index */}
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-alpine-900/60 text-alpine-300 text-xs font-semibold flex items-center justify-center">
                  {i + 1}
                </div>

                {/* Thumbnail */}
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-white/[0.04]">
                  <img
                    src={loc.heroImage.url}
                    alt={loc.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
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

                {/* Controls */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <button
                    aria-label="Move up"
                    disabled={i === 0}
                    onClick={() => moveUp(i)}
                    className={cn(
                      "w-11 h-11 flex items-center justify-center rounded-lg transition-colors",
                      i === 0
                        ? "text-stone-700 cursor-not-allowed"
                        : "text-stone-400 hover:text-fg hover:bg-white/[0.05] active:scale-95"
                    )}
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  <button
                    aria-label="Move down"
                    disabled={i === stops.length - 1}
                    onClick={() => moveDown(i)}
                    className={cn(
                      "w-11 h-11 flex items-center justify-center rounded-lg transition-colors",
                      i === stops.length - 1
                        ? "text-stone-700 cursor-not-allowed"
                        : "text-stone-400 hover:text-fg hover:bg-white/[0.05] active:scale-95"
                    )}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>

                <button
                  aria-label={`Remove ${loc.name} from trip`}
                  onClick={() => removeFromTrip(loc.id)}
                  className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-lg text-stone-500 hover:text-red-300 hover:bg-red-950/30 active:scale-95 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="space-y-2">
          {/* Primary — open the whole route in Google Maps */}
          <Button variant="alpine" size="lg" className="w-full" asChild>
            <a
              href={googleMapsRoute(routeStops)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation className="w-4 h-4" />
              Open route in Google Maps
            </a>
          </Button>

          {/* Secondary — download all waypoints as a GPX file */}
          <button
            onClick={() => downloadGpxRoute(routeStops, "swiss-trails-trip")}
            className="w-full flex items-center justify-center gap-2 h-11 px-4 text-sm font-medium rounded-lg bg-white/[0.04] text-stone-300 hover:text-fg hover:bg-white/[0.07] active:scale-[0.99] transition-colors"
          >
            <Download className="w-4 h-4" />
            Download GPX
          </button>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
}
