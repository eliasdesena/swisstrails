"use client";

import {
  Clock, Navigation, Heart, Share2, Mountain,
  ChevronLeft, Bus, Car, Lightbulb, Package, ChevronDown,
  MoreHorizontal, CheckCircle2, Route, MapPinned, Ruler, Gauge,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/store/favorites-store";
import { useVisitedStore } from "@/store/visited-store";
import { useTripStore } from "@/store/trip-store";
import { useGeoStore } from "@/store/geo-store";
import { distanceKm, formatDistance } from "@/lib/distance";
import {
  cn,
  difficultyConfig,
  categoryConfig,
  seasonConfig,
  regionConfig,
  formatDuration,
} from "@/lib/utils";
import { platformDirections } from "@/lib/deep-links";
import { OpenInSheet } from "@/components/app/open-in-sheet";
import { WeatherWidget } from "@/components/app/weather-widget";
import { PhotoStrip } from "@/components/app/photo-strip";
import { ReactionBar } from "@/components/app/reaction-bar";
import type { Location, LocationImage } from "@/types";

interface LocationDetailProps {
  location: Location;
  onClose: () => void;
  /** Optional ref for the scrollable body — lets the sheet read scrollTop
      so a drag-down from the top can collapse it. */
  scrollRef?: React.Ref<HTMLDivElement>;
}

const DIFF_COLOR: Record<string, string> = {
  easy: "text-alpine-400",
  moderate: "text-yellow-400",
  challenging: "text-orange-400",
  expert: "text-red-400",
};

/** Compact, square icon action used in the title header row. */
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
      onClick={onClick}
      className={cn(
        "w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full transition-colors active:scale-95",
        active ? activeClass : "bg-white/[0.06] text-stone-300 hover:text-fg hover:bg-white/[0.1]"
      )}
    >
      {children}
    </button>
  );
}

export function LocationDetail({ location, onClose, scrollRef }: LocationDetailProps) {
  const [openInSheet, setOpenInSheet] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const visited = useVisitedStore((s) => s.visitedIds.has(location.id));
  const toggleVisited = useVisitedStore((s) => s.toggleVisited);
  const inTrip = useTripStore((s) => s.tripIds.includes(location.id));
  const toggleInTrip = useTripStore((s) => s.toggleInTrip);
  const userPosition = useGeoStore((s) => s.position);
  const fav = isFavorite(location.id);
  const diff = difficultyConfig[location.difficulty];
  const cat = categoryConfig[location.category];
  const region = regionConfig[location.region];

  const awayKm = userPosition
    ? formatDistance(distanceKm(userPosition, location.coordinates))
    : null;

  // Photos for the strip: hero first, then gallery (skip dupes by url).
  const photos: LocationImage[] = [
    location.heroImage,
    ...location.gallery.filter((g) => g.url !== location.heroImage.url),
  ];

  function share() {
    const url = `https://swiss-trails.com/location/${location.slug}`;
    if (navigator.share) void navigator.share({ title: location.name, url });
    else void navigator.clipboard.writeText(url);
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── NON-SCROLLING HEADER: title + icon actions + photo strip ── */}
      <div className="flex-shrink-0 px-4 pt-1 pb-3">
        {/* Title row + compact icon actions */}
        <div className="flex items-start gap-3">
          {/* Close (mobile uses the drag handle; this is the explicit back/close) */}
          <button
            type="button"
            data-no-drag
            aria-label="Close"
            onClick={onClose}
            className="hidden lg:flex w-9 h-9 -ml-1 mt-0.5 flex-shrink-0 items-center justify-center rounded-full text-stone-400 hover:text-fg hover:bg-white/[0.06] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0 flex-1">
            <h2 className="text-fg text-[22px] font-semibold leading-tight">
              {location.name}
            </h2>
            <p className="text-fg-muted text-[13px] mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span>{cat.label}</span>
              <span className="text-fg-subtle">·</span>
              <span>{region.label}</span>
              <span className="text-fg-subtle">·</span>
              <span className={cn("font-medium", DIFF_COLOR[location.difficulty])}>
                {diff.label}
              </span>
            </p>
          </div>

          {/* Compact icon actions: favourite, visited, add-to-trip, share */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <IconAction
              label={fav ? "Remove favourite" : "Add favourite"}
              active={fav}
              activeClass="bg-red-500/15 text-red-400"
              onClick={() => toggleFavorite(location.id)}
            >
              <Heart className={cn("w-[18px] h-[18px]", fav && "fill-red-400")} />
            </IconAction>
            <IconAction
              label={visited ? "Mark not visited" : "Mark visited"}
              active={visited}
              activeClass="bg-emerald-500/15 text-emerald-400"
              onClick={() => toggleVisited(location.id)}
            >
              <CheckCircle2 className="w-[18px] h-[18px]" />
            </IconAction>
            <IconAction
              label={inTrip ? "Remove from trip" : "Add to trip"}
              active={inTrip}
              activeClass="bg-alpine-500/15 text-alpine-400"
              onClick={() => toggleInTrip(location.id)}
            >
              {inTrip ? <MapPinned className="w-[18px] h-[18px]" /> : <Route className="w-[18px] h-[18px]" />}
            </IconAction>
            <IconAction label="Share" onClick={share}>
              <Share2 className="w-[18px] h-[18px]" />
            </IconAction>
          </div>
        </div>

        {/* Reaction counts — Like / Want to go / Been there. */}
        <ReactionBar locationId={location.id} className="mt-2.5" />

        {/* Photo strip — horizontal, swipeable; data-no-drag so it scrolls
            independently of the sheet. */}
        <PhotoStrip photos={photos} className="mt-3" />
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div
        ref={scrollRef}
        data-sheet-scroll
        className="flex-1 overflow-y-auto overscroll-contain"
      >
        <div className="px-4 pb-5 space-y-5">
          {/* Key stats — distance / elevation / duration / from-you */}
          <div className="grid grid-cols-2 gap-2">
            <Stat
              icon={<Gauge className="w-4 h-4" />}
              label="Difficulty"
              value={diff.label}
              valueClass={DIFF_COLOR[location.difficulty]}
            />
            {location.distanceKm != null && (
              <Stat
                icon={<Ruler className="w-4 h-4" />}
                label="Distance"
                value={`${location.distanceKm} km`}
              />
            )}
            {location.elevation != null && (
              <Stat
                icon={<Mountain className="w-4 h-4" />}
                label="Elevation"
                value={`${location.elevation.toLocaleString()} m`}
              />
            )}
            <Stat
              icon={<Clock className="w-4 h-4" />}
              label="Visit time"
              value={`${location.visitDurationHours.min}–${location.visitDurationHours.max} h`}
            />
            {awayKm ? (
              <Stat
                icon={<Navigation className="w-4 h-4" />}
                label="From you"
                value={`${awayKm} away`}
              />
            ) : (
              <Stat
                icon={<Car className="w-4 h-4" />}
                label="By car"
                value={`~${formatDuration(location.travelTimeMinutes)}`}
              />
            )}
          </div>

          {/* Description */}
          {location.description && (
            <p className="text-stone-300 text-sm leading-relaxed">{location.description}</p>
          )}

          {/* Highlights — short bullet list */}
          {location.highlights.length > 0 && (
            <Section title="Highlights">
              <ul className="space-y-1.5">
                {location.highlights.slice(0, 4).map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-sm text-stone-400">
                    <span className="w-px h-3 bg-alpine-600 mt-1.5 flex-shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Getting there — access + parking/transport chips */}
          <Section title="Getting there" icon={<Navigation className="w-3 h-3" />}>
            {location.accessInfo && (
              <p className="text-stone-400 text-sm mb-2.5">{location.accessInfo}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {location.parkingAvailable && <InfoChip icon={<Car className="w-3.5 h-3.5" />}>Parking</InfoChip>}
              {location.publicTransport && <InfoChip icon={<Bus className="w-3.5 h-3.5" />}>Public transport</InfoChip>}
            </div>
          </Section>

          {/* Best season — compact inline chip set */}
          {location.bestSeason.length > 0 && (
            <Section title="Best season">
              <div className="flex flex-wrap gap-1.5">
                {location.bestSeason.map((s) => {
                  const sc = seasonConfig[s];
                  return (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 bg-white/[0.05] rounded-full px-3 py-1 text-xs text-stone-300"
                    >
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

          {/* Insider tips + What to bring — collapsed by default to declutter */}
          {(location.tips.length > 0 || location.whatToBring.length > 0) && (
            <div className="rounded-xl border border-white/[0.06] overflow-hidden">
              <button
                type="button"
                data-no-drag
                onClick={() => setTipsOpen((v) => !v)}
                aria-expanded={tipsOpen}
                className="w-full flex items-center justify-between gap-2 px-3.5 min-h-[44px] py-2.5 text-left active:bg-white/[0.03] transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-stone-200">
                  <Lightbulb className="w-4 h-4 text-alpine-400" />
                  Tips &amp; what to bring
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-fg-muted transition-transform",
                    tipsOpen && "rotate-180"
                  )}
                />
              </button>
              {tipsOpen && (
                <div className="px-3.5 pb-3.5 pt-0.5 space-y-3.5">
                  {location.tips.length > 0 && (
                    <ol className="space-y-2">
                      {location.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-stone-400">
                          <span className="text-alpine-400 text-[11px] font-mono mt-0.5 flex-shrink-0">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {tip}
                        </li>
                      ))}
                    </ol>
                  )}
                  {location.whatToBring.length > 0 && (
                    <div>
                      <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-fg-muted mb-2 flex items-center gap-1.5">
                        <Package className="w-3 h-3" />
                        What to bring
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {location.whatToBring.map((item) => (
                          <span
                            key={item}
                            className="bg-white/[0.04] text-stone-400 text-xs px-2.5 py-1 rounded-full"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM CTA — Get directions is the single primary action ── */}
      <div className="flex-shrink-0 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex gap-2 border-t border-white/[0.06]">
        <Button variant="alpine" size="lg" className="flex-1" asChild>
          <a
            data-no-drag
            href={platformDirections(location.coordinates.lat, location.coordinates.lng, location.name)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Navigation className="w-4 h-4" />
            Get directions
          </a>
        </Button>
        <button
          type="button"
          data-no-drag
          aria-label="More apps"
          onClick={() => setOpenInSheet(true)}
          className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-lg bg-white/[0.06] text-stone-300 hover:text-fg active:scale-95 transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <OpenInSheet
        location={openInSheet ? location : null}
        onClose={() => setOpenInSheet(false)}
      />
    </div>
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
        <span className={cn("block text-sm font-medium text-stone-200 mt-1 truncate", valueClass)}>
          {value}
        </span>
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
