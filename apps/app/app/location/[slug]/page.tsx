import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PLACEHOLDER_LOCATIONS } from "@/data/locations";
import { categoryConfig, difficultyConfig, regionConfig, formatDuration } from "@/lib/utils";
import { DirectionsActions } from "@/components/app/directions-actions";
import { MapPin, Clock, Mountain, ArrowLeft } from "lucide-react";

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
        {/* Quick stats */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <span className={`font-medium ${DIFF_COLOR[location.difficulty]}`}>{diff.label}</span>
          <span className="flex items-center gap-1.5 text-stone-400">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(location.travelTimeMinutes)} drive
          </span>
          {location.elevation && (
            <span className="flex items-center gap-1.5 text-stone-400">
              <Mountain className="w-3.5 h-3.5" />
              {location.elevation.toLocaleString()}m
            </span>
          )}
          <span className="flex items-center gap-1.5 text-stone-400">
            <MapPin className="w-3.5 h-3.5" />
            {region.canton}
          </span>
        </div>

        {/* Description */}
        {location.description && (
          <p className="text-stone-300 leading-relaxed">{location.description}</p>
        )}

        {/* Highlights */}
        {location.highlights.length > 0 && (
          <div>
            <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-fg-muted mb-3">
              Highlights
            </p>
            <ul className="space-y-2">
              {location.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2.5 text-sm text-stone-400">
                  <span className="w-px h-3 bg-alpine-600 mt-1 flex-shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tips */}
        {location.tips.length > 0 && (
          <div>
            <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-fg-muted mb-3">
              Tips
            </p>
            <ul className="space-y-2">
              {location.tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2.5 text-sm text-stone-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-alpine-700 mt-1.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Access */}
        {location.accessInfo && (
          <div>
            <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-fg-muted mb-2">
              Getting there
            </p>
            <p className="text-stone-400 text-sm">{location.accessInfo}</p>
          </div>
        )}

        {/* CTA row */}
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
