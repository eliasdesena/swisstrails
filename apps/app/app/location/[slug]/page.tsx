import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PLACEHOLDER_LOCATIONS } from "@/data/locations";
import { categoryConfig, difficultyConfig, regionConfig, formatDuration } from "@/lib/utils";
import { DirectionsActions } from "@/components/app/directions-actions";
import { WeatherWidget } from "@/components/app/weather-widget";
import { PhotoStrip } from "@/components/app/photo-strip";
import {
  MapPin, Clock, Mountain, ArrowLeft, Navigation, Gauge,
  Car, Bus, Lightbulb,
} from "lucide-react";
import type { LocationImage } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PLACEHOLDER_LOCATIONS.map((loc) => ({ slug: loc.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const location = PLACEHOLDER_LOCATIONS.find((l) => l.slug === slug);
  if (!location) return {};

  const cat = categoryConfig[location.category];

  return {
    title: location.name,
    description: location.tagline,
    openGraph: {
      title: `${location.name} — Swiss Trails`,
      description: location.tagline,
      images: [{ url: location.heroImage.url, width: 1200, height: 800, alt: location.heroImage.alt }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${location.name} — Swiss Trails`,
      description: location.tagline,
      images: [location.heroImage.url],
    },
  };
}

export default async function LocationPage({ params }: Props) {
  const { slug } = await params;
  const location = PLACEHOLDER_LOCATIONS.find((l) => l.slug === slug);
  if (!location) notFound();

  const cat = categoryConfig[location.category];
  const diff = difficultyConfig[location.difficulty];
  const region = regionConfig[location.region];

  // Photos for the strip: hero first, then gallery (dedupe by url).
  const photoStrip: LocationImage[] = [
    location.heroImage,
    ...location.gallery.filter((g) => g.url !== location.heroImage.url),
  ];

  const DIFF_COLOR: Record<string, string> = {
    easy: "text-emerald-400",
    moderate: "text-yellow-400",
    challenging: "text-orange-400",
    expert: "text-red-400",
  };

  return (
    <div className="min-h-screen bg-trail-950 text-fg">
      {/* Hero */}
      <div className="relative h-[55vh] min-h-[340px]">
        <Image
          src={location.heroImage.url}
          alt={location.heroImage.alt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-trail-950 via-trail-950/30 to-black/20" />

        {/* Back */}
        <div className="absolute top-0 left-0 right-0 px-2 pt-[max(0.5rem,env(safe-area-inset-top))] flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 h-11 px-2 text-white/80 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Swiss Trails
          </Link>
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-6">
          <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-stone-400 mb-1">
            {cat.label} · {region.label}
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white leading-tight">
            {location.name}
          </h1>
          {location.tagline && (
            <p className="text-stone-400 text-sm mt-1.5 max-w-xl">{location.tagline}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-5 py-8 space-y-8">
        {/* Photo strip — hero + gallery thumbnails, swipeable, with lightbox */}
        <PhotoStrip photos={photoStrip} />

        {/* Key stats — essentials up top */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Stat
            icon={<Gauge className="w-4 h-4" />}
            label="Difficulty"
            value={diff.label}
            valueClass={DIFF_COLOR[location.difficulty]}
          />
          {location.elevation && (
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
          <Stat
            icon={<Car className="w-4 h-4" />}
            label="By car"
            value={`~${formatDuration(location.travelTimeMinutes)}`}
          />
          <Stat
            icon={<MapPin className="w-4 h-4" />}
            label="Canton"
            value={region.canton}
          />
        </div>

        {/* Description */}
        {location.description && (
          <p className="text-stone-300 leading-relaxed">{location.description}</p>
        )}

        {/* Getting there — access + parking/transport chips */}
        {(location.accessInfo || location.parkingAvailable || location.publicTransport) && (
          <div>
            <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-fg-muted mb-2.5 flex items-center gap-1.5">
              <Navigation className="w-3 h-3" />
              Getting there
            </p>
            {location.accessInfo && (
              <p className="text-stone-400 text-sm mb-2.5">{location.accessInfo}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {location.parkingAvailable && (
                <span className="inline-flex items-center gap-1.5 bg-white/[0.05] rounded-full px-3 py-1.5 text-xs text-stone-300">
                  <Car className="w-3.5 h-3.5" /> Parking
                </span>
              )}
              {location.publicTransport && (
                <span className="inline-flex items-center gap-1.5 bg-white/[0.05] rounded-full px-3 py-1.5 text-xs text-stone-300">
                  <Bus className="w-3.5 h-3.5" /> Public transport
                </span>
              )}
            </div>
          </div>
        )}

        {/* Weather (client island) */}
        <WeatherWidget
          lat={location.coordinates.lat}
          lng={location.coordinates.lng}
        />

        {/* Highlights — short */}
        {location.highlights.length > 0 && (
          <div>
            <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-fg-muted mb-3">
              Highlights
            </p>
            <ul className="space-y-2">
              {location.highlights.slice(0, 5).map((h) => (
                <li key={h} className="flex items-start gap-2.5 text-sm text-stone-400">
                  <span className="w-px h-3 bg-alpine-600 mt-1 flex-shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tips — demoted below the essentials */}
        {location.tips.length > 0 && (
          <details className="group rounded-xl border border-white/[0.06] overflow-hidden">
            <summary className="flex items-center justify-between gap-2 px-4 min-h-[48px] py-3 cursor-pointer list-none text-sm font-medium text-stone-200">
              <span className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-alpine-400" />
                Insider tips
              </span>
              <span className="text-fg-muted text-xs group-open:hidden">Show</span>
              <span className="text-fg-muted text-xs hidden group-open:inline">Hide</span>
            </summary>
            <ul className="px-4 pb-4 pt-0 space-y-2">
              {location.tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2.5 text-sm text-stone-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-alpine-700 mt-1.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </details>
        )}

        {/* CTA row — Get directions is the primary action */}
        <div className="pt-4 flex gap-3">
          <DirectionsActions location={location} />
          <Link
            href="/explore"
            className="flex items-center justify-center gap-2 h-11 px-4 flex-shrink-0 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-stone-300 font-medium text-sm transition-colors"
          >
            Explore all 500+
          </Link>
        </div>

        {/* Upsell */}
        <div className="rounded-xl bg-white/[0.03] p-5 text-center">
          <p className="text-fg text-sm font-medium mb-1">Want 500+ more locations like this?</p>
          <p className="text-fg-muted text-xs mb-4">One payment. Lifetime access. Hidden lakes, secret viewpoints, night skies.</p>
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center gap-2 px-6 h-12 rounded-lg bg-gold-400 hover:bg-gold-300 active:bg-gold-500 text-trail-950 text-sm font-semibold transition-colors"
          >
            Get Swiss Trails — CHF 29
          </Link>
        </div>
      </div>
    </div>
  );
}

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
        <span className={`block text-sm font-medium text-stone-200 mt-1 truncate ${valueClass ?? ""}`}>
          {value}
        </span>
      </span>
    </div>
  );
}
