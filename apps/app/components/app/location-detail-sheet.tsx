"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useDragControls, type PanInfo } from "framer-motion";
import {
  X, MapPin, ArrowRight, Clock, Mountain, Navigation,
  Route, MapPinned, Share2, Car, Bus, Gauge, Ruler,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { SPRING, EASE_OUT } from "@/lib/motion";
import { haptics } from "@/lib/haptics";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scroll-lock";
import { useMapStore } from "@/store/map-store";
import { useGeoStore } from "@/store/geo-store";
import { useTripStore } from "@/store/trip-store";
import { distanceKm as haversineKm, formatDistance } from "@/lib/distance";
import { similarLocations } from "@/lib/similarity";
import {
  categoryConfig, regionConfig, difficultyConfig, seasonConfig,
  formatDuration, cn,
} from "@/lib/utils";
import { useMapPrefStore } from "@/store/map-pref-store";
import { OpenInSheet } from "@/components/app/open-in-sheet";
import { WeatherWidget } from "@/components/app/weather-widget";
import { PhotoStrip } from "@/components/app/photo-strip";
import { ReactionBar } from "@/components/app/reaction-bar";
import { useLocationImages } from "@/lib/location-images";
import { PLACEHOLDER_LOCATIONS } from "@/data/locations";
import type { Location, Difficulty } from "@/types";

interface LocationDetailSheetProps {
  location: Location | null;
  onClose: () => void;
  onSelectSimilar: (location: Location) => void;
}

const DIFF_COLORS: Record<Difficulty, string> = {
  easy: "text-alpine-400",
  moderate: "text-yellow-400",
  challenging: "text-orange-400",
  expert: "text-red-400",
};

function IconAction({
  label,
  active,
  activeClass,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  activeClass?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      data-no-drag
      aria-label={label}
      aria-pressed={active}
      onClick={() => {
        haptics.tap();
        onClick();
      }}
      className={cn(
        "pressable w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full transition-colors",
        active ? activeClass : "bg-surface-2 text-stone-300 hover:text-fg hover:bg-surface-hover"
      )}
    >
      {children}
    </button>
  );
}

export function LocationDetailSheet({
  location,
  onClose,
  onSelectSimilar,
}: LocationDetailSheetProps) {
  const router = useRouter();
  const { openBottomSheet } = useMapStore();
  const userPosition = useGeoStore((s) => s.position);
  const inTrip = useTripStore((s) =>
    location ? s.tripIds.includes(location.id) : false
  );
  const toggleInTrip = useTripStore((s) => s.toggleInTrip);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [openInSheet, setOpenInSheet] = useState(false);
  const requestDirections = useMapPrefStore((s) => s.requestDirections);

  const dragControls = useDragControls();

  // Real straight-line distance from the user, when we know their position.
  const awayKm =
    location && userPosition
      ? formatDistance(haversineKm(userPosition, location.coordinates))
      : null;

  // Real "More like this" ranking — scores every other spot by a weighted blend
  // of category, geographic proximity, difficulty and region. Deterministic.
  const similar = location
    ? similarLocations(location, PLACEHOLDER_LOCATIONS, 10)
    : [];

  useEffect(() => {
    if (!location) return;
    scrollRef.current?.scrollTo(0, 0);
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [location?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Only start a drag when the gesture shouldn't be a native scroll or a child
  // interaction: never on buttons/links/inputs/[data-no-drag], and from inside
  // the scroll body only when it's already at the top (so down-drags from a
  // scrolled list scroll instead of dismissing).
  function onSheetPointerDown(e: React.PointerEvent) {
    // Desktop renders a centered modal — drag-to-dismiss is a mobile affordance.
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    const el = e.target as Element | null;
    if (el?.closest("button, a, input, select, textarea, [data-no-drag]")) return;
    const sc = scrollRef.current;
    if (sc && sc.contains(el as Node) && sc.scrollTop > 0) return;
    dragControls.start(e);
  }

  // Drag-to-dismiss: close when dragged past a threshold or flicked down with
  // velocity; otherwise framer springs back to the constraint (0). Mirrors the
  // bottom-sheet's release feel.
  function onDragEnd(_e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (info.offset.y > 120 || info.velocity.y > 650) {
      haptics.tap();
      onClose();
    }
  }

  function viewOnMap() {
    if (!location) return;
    openBottomSheet(location.id);
    router.push("/map");
    onClose();
  }

  function share() {
    if (!location) return;
    const url = `https://swiss-trails.com/location/${location.slug}`;
    if (navigator.share) void navigator.share({ title: location.name, url });
    else void navigator.clipboard.writeText(url);
  }

  const cat = location ? categoryConfig[location.category] : null;
  const region = location ? regionConfig[location.region] : null;
  const diff = location ? difficultyConfig[location.difficulty] : null;

  // Resolved by source priority (admin override → sourced; Supabase later).
  const photos = useLocationImages(location);

  return (
    <AnimatePresence>
      {location && cat && region && diff && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[1300] bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className={cn(
              "fixed z-[1400] flex flex-col overflow-hidden bg-trail-950",
              "inset-x-0 bottom-0 rounded-t-xl",
              "lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2",
              "lg:w-[520px] lg:max-h-[86vh] lg:rounded-xl"
            )}
            style={{ maxHeight: "calc(100dvh - 24px)" }}
            initial={{ y: "100%" }}
            animate={{ y: 0, transition: SPRING.soft }}
            exit={{ y: "100%", transition: { duration: 0.22, ease: EASE_OUT } }}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.04, bottom: 0.7 }}
            onPointerDown={onSheetPointerDown}
            onDragEnd={onDragEnd}
          >
            {/* Grab handle — drag-to-dismiss affordance (mobile). */}
            <div className="flex justify-center pt-2.5 pb-1 lg:hidden">
              <span className="w-9 h-1.5 rounded-full bg-white/15" />
            </div>

            {/* ── NON-SCROLLING HEADER: title + icon actions + photo strip ── */}
            <div className="flex-shrink-0 px-5 pt-1.5 pb-3">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="text-fg text-[22px] font-semibold leading-tight">{location.name}</h2>
                  <p className="text-fg-muted text-[13px] mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                    <span>{cat.label}</span>
                    <span className="text-fg-subtle">·</span>
                    <span>{region.label}</span>
                    <span className="text-fg-subtle">·</span>
                    <span className={cn("font-medium", DIFF_COLORS[location.difficulty])}>{diff.label}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <IconAction
                    label={inTrip ? "Remove from trip" : "Add to trip"}
                    active={inTrip}
                    activeClass="bg-alpine-500/15 text-alpine-400"
                    onClick={() => toggleInTrip(location.id)}
                  >
                    {inTrip ? <MapPinned className="w-[18px] h-[18px]" /> : <Route className="w-[18px] h-[18px]" />}
                  </IconAction>
                  <IconAction label="Close" onClick={onClose}>
                    <X className="w-5 h-5" />
                  </IconAction>
                </div>
              </div>

              {/* Reaction counts — Like / Want to go / Been there. */}
              <ReactionBar locationId={location.id} className="mt-2.5" />

              <PhotoStrip photos={photos} className="mt-3" />
            </div>

            {/* ── SCROLLABLE BODY ── */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
              <div className="px-5 pb-4 space-y-5">
                {/* Key stats */}
                <div className="grid grid-cols-2 gap-2">
                  <Stat icon={<Gauge className="w-4 h-4" />} label="Difficulty" value={diff.label} valueClass={DIFF_COLORS[location.difficulty]} />
                  {location.distanceKm != null && (
                    <Stat icon={<Ruler className="w-4 h-4" />} label="Distance" value={`${location.distanceKm} km`} />
                  )}
                  {location.elevation != null && (
                    <Stat icon={<Mountain className="w-4 h-4" />} label="Elevation" value={`${location.elevation.toLocaleString()} m`} />
                  )}
                  <Stat icon={<Clock className="w-4 h-4" />} label="Visit time" value={`${location.visitDurationHours.min}–${location.visitDurationHours.max} h`} />
                  {awayKm ? (
                    <Stat icon={<Navigation className="w-4 h-4" />} label="From you" value={`${awayKm} away`} />
                  ) : (
                    <Stat icon={<Car className="w-4 h-4" />} label="By car" value={`~${formatDuration(location.travelTimeMinutes)}`} />
                  )}
                </div>

                {/* Description */}
                {location.description && (
                  <p className="text-stone-300 text-sm leading-relaxed">{location.description}</p>
                )}

                {/* Highlights — short */}
                {location.highlights.length > 0 && (
                  <Section title="Highlights">
                    <ul className="space-y-1.5">
                      {location.highlights.slice(0, 4).map((h, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-stone-400">
                          <span className="w-px h-3 bg-alpine-600 mt-1.5 flex-shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {/* Getting there */}
                {(location.accessInfo || location.parkingAvailable || location.publicTransport) && (
                  <Section title="Getting there" icon={<Navigation className="w-3 h-3" />}>
                    {location.accessInfo && (
                      <p className="text-stone-400 text-sm mb-2.5">{location.accessInfo}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {location.parkingAvailable && <InfoChip icon={<Car className="w-3.5 h-3.5" />}>Parking</InfoChip>}
                      {location.publicTransport && <InfoChip icon={<Bus className="w-3.5 h-3.5" />}>Public transport</InfoChip>}
                    </div>
                  </Section>
                )}

                {/* Best season — compact chip set */}
                {location.bestSeason.length > 0 && (
                  <Section title="Best season">
                    <div className="flex flex-wrap gap-1.5">
                      {location.bestSeason.map((s) => {
                        const sc = seasonConfig[s];
                        return (
                          <span key={s} className="inline-flex items-center gap-1.5 bg-white/[0.05] rounded-full px-3 py-1 text-xs text-stone-300">
                            <span>{sc.emoji}</span>
                            {sc.label}
                            <span className="text-fg-subtle">{sc.months}</span>
                          </span>
                        );
                      })}
                    </div>
                  </Section>
                )}

                {/* Weather */}
                <WeatherWidget lat={location.coordinates.lat} lng={location.coordinates.lng} />

                {/* Similar */}
                {similar.length > 0 && (
                  <Section title="Similar nearby">
                    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                      {similar.map((sim) => (
                        <button
                          key={sim.id}
                          data-no-drag
                          onClick={() => {
                            haptics.tap();
                            scrollRef.current?.scrollTo(0, 0);
                            onSelectSimilar(sim);
                          }}
                          className="pressable flex-shrink-0 w-28 rounded-lg overflow-hidden bg-surface-1 text-left"
                        >
                          <div className="relative h-16">
                            <img
                              src={sim.heroImage.url}
                              alt={sim.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          </div>
                          <div className="p-1.5">
                            <p className="text-stone-200 text-xs font-medium line-clamp-1">{sim.name}</p>
                            <p className="text-fg-muted text-[11px] mt-0.5">{regionConfig[sim.region].label}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </Section>
                )}

                <div className="h-1" />
              </div>
            </div>

            {/* Sticky footer — Get directions is the primary CTA; View on Map secondary. */}
            <div className="flex-shrink-0 border-t border-white/[0.06] bg-trail-950/95 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex gap-2">
              <button
                type="button"
                data-no-drag
                onClick={() => {
                  haptics.tap();
                  requestDirections({
                    lat: location.coordinates.lat,
                    lng: location.coordinates.lng,
                    name: location.name,
                  });
                }}
                className="pressable flex-1 flex items-center justify-center gap-2 min-h-[44px] py-3.5 bg-alpine-600 hover:bg-alpine-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Navigation className="w-4 h-4" />
                Get directions
              </button>
              <button
                data-no-drag
                onClick={() => {
                  haptics.tap();
                  setOpenInSheet(true);
                }}
                aria-label="More apps"
                className="pressable w-11 flex-shrink-0 flex items-center justify-center bg-surface-2 hover:bg-surface-hover text-stone-200 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                data-no-drag
                onClick={() => {
                  haptics.tap();
                  viewOnMap();
                }}
                className="pressable flex items-center justify-center gap-1.5 px-4 min-h-[44px] py-3.5 bg-surface-2 hover:bg-surface-hover text-stone-200 text-sm font-medium rounded-lg transition-colors flex-shrink-0"
              >
                <MapPin className="w-4 h-4" />
                Map
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Open in… sheet (deep links) */}
          <OpenInSheet
            location={openInSheet ? location : null}
            onClose={() => setOpenInSheet(false)}
          />
        </>
      )}
    </AnimatePresence>
  );
}

/* ── small presentational helpers ── */

function Stat({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-3 py-2.5">
      <span className="text-fg-muted flex-shrink-0">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[11px] text-fg-muted leading-none">{label}</span>
        <span className={cn("block text-sm font-medium text-stone-200 mt-1 truncate", valueClass)}>{value}</span>
      </span>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-fg-muted mb-2.5 flex items-center gap-1.5">
        {icon}
        {title}
      </p>
      {children}
    </div>
  );
}

function InfoChip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-white/[0.05] rounded-full px-3 py-1.5 text-xs text-stone-300">
      {icon}
      {children}
    </span>
  );
}
