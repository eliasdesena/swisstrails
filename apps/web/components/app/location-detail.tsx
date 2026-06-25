"use client";

import {
  Clock, MapPin, Navigation, Heart, Share2, Mountain,
  Thermometer, Star, CheckCircle, Lightbulb, Package,
  ChevronLeft, Camera, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFavoritesStore } from "@/store/favorites-store";
import {
  cn,
  difficultyConfig,
  categoryConfig,
  seasonConfig,
  formatDuration,
  formatVisitDuration,
  getMapLink,
  formatElevation,
} from "@/lib/utils";
import type { Location } from "@/types";

interface LocationDetailProps {
  location: Location;
  onClose: () => void;
}

export function LocationDetail({ location, onClose }: LocationDetailProps) {
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(null);
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const fav = isFavorite(location.id);
  const diff = difficultyConfig[location.difficulty];
  const cat = categoryConfig[location.category];

  return (
    <div className="flex flex-col h-full">
      {/* Hero image */}
      <div className="relative flex-shrink-0 h-56 sm:h-72">
        <Image
          src={location.heroImage.url}
          alt={location.heroImage.alt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-trail-950/90 via-trail-950/20 to-transparent" />

        {/* Back / close */}
        <button
          className="absolute top-4 left-4 w-9 h-9 bg-trail-950/70 backdrop-blur-sm rounded-full border border-stone-700/50 flex items-center justify-center text-fg-muted hover:text-fg transition-colors"
          onClick={onClose}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            className="w-9 h-9 bg-trail-950/70 backdrop-blur-sm rounded-full border border-stone-700/50 flex items-center justify-center text-fg-muted hover:text-fg transition-colors"
            onClick={() => {
              const url = `https://swiss-trails.com/location/${location.slug}`;
              if (navigator.share) {
                void navigator.share({ title: location.name, url });
              } else {
                void navigator.clipboard.writeText(url);
              }
            }}
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            className={cn(
              "w-9 h-9 rounded-full border backdrop-blur-sm flex items-center justify-center transition-colors",
              fav
                ? "bg-red-900/80 border-red-700 text-red-300"
                : "bg-trail-950/70 border-stone-700/50 text-fg-muted hover:text-fg"
            )}
            onClick={() => toggleFavorite(location.id)}
          >
            <Heart className={cn("w-4 h-4", fav && "fill-current")} />
          </button>
        </div>

        {/* Bottom overlay info */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <Badge
            className="mb-2 bg-trail-950/80 backdrop-blur-sm border-stone-700/50 text-fg-muted"
          >
            {cat.emoji} {cat.label}
          </Badge>
          <h2 className="t-h3 text-fg">{location.name}</h2>
          <p className="text-fg-muted text-sm mt-1">{location.tagline}</p>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Quick stats */}
        <div className="flex divide-x divide-stone-800 border-b border-stone-800">
          {[
            {
              icon: Clock,
              label: "Travel",
              value: formatDuration(location.travelTimeMinutes),
            },
            {
              icon: Mountain,
              label: "Elevation",
              value: location.elevation ? formatElevation(location.elevation) : "—",
            },
            {
              icon: Thermometer,
              label: "Visit",
              value: formatVisitDuration(
                location.visitDurationHours.min,
                location.visitDurationHours.max
              ),
            },
            {
              icon: Star,
              label: "Level",
              value: diff.label,
              valueClass: diff.color,
            },
          ].map(({ icon: Icon, label, value, valueClass }) => (
            <div
              key={label}
              className="flex-1 flex flex-col items-center py-4 gap-1 bg-trail-900"
            >
              <Icon className="w-3.5 h-3.5 text-fg-subtle" />
              <span className="text-fg-subtle text-xs">{label}</span>
              <span className={cn("text-fg text-sm font-semibold", valueClass)}>
                {value}
              </span>
            </div>
          ))}
        </div>

        <div className="p-5 space-y-7">
          {/* Description */}
          <div>
            <p className="t-body text-fg-muted leading-relaxed">
              {location.longDescription ?? location.description}
            </p>
          </div>

          {/* Highlights */}
          {location.highlights.length > 0 && (
            <div>
              <h3 className="text-fg font-semibold text-sm mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-alpine-400" />
                Highlights
              </h3>
              <ul className="space-y-2">
                {location.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5">
                    <span className="w-1 h-1 rounded-full bg-alpine-500 mt-2 flex-shrink-0" />
                    <span className="text-fg-muted text-sm">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {location.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {location.tags.map((tag) => (
                <Badge key={tag} variant="default" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Best seasons */}
          <div>
            <h3 className="text-fg font-semibold text-sm mb-3">Best season</h3>
            <div className="flex flex-wrap gap-2">
              {location.bestSeason.map((s) => {
                const sc = seasonConfig[s];
                return (
                  <div
                    key={s}
                    className="flex items-center gap-1.5 bg-trail-800 border border-stone-800 rounded-lg px-3 py-1.5"
                  >
                    <span className="text-base">{sc.emoji}</span>
                    <div>
                      <p className="text-fg text-xs font-medium">{sc.label}</p>
                      <p className="text-fg-subtle text-xs">{sc.months}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          {location.tips.length > 0 && (
            <div>
              <h3 className="text-fg font-semibold text-sm mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-gold-400" />
                Insider tips
              </h3>
              <ul className="space-y-2.5">
                {location.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 p-3 bg-gold-950/30 border border-gold-900/30 rounded-xl">
                    <span className="text-gold-500 text-xs font-bold mt-0.5 flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-fg-muted text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* What to bring */}
          {location.whatToBring.length > 0 && (
            <div>
              <h3 className="text-fg font-semibold text-sm mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-fg-subtle" />
                What to bring
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {location.whatToBring.map((item) => (
                  <span
                    key={item}
                    className="bg-trail-800 border border-stone-800 text-fg-muted text-xs px-2.5 py-1 rounded-lg"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Getting there */}
          <div>
            <h3 className="text-fg font-semibold text-sm mb-3 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-fg-subtle" />
              Getting there
            </h3>
            <p className="text-fg-muted text-sm mb-3">{location.accessInfo}</p>
            <div className="flex flex-wrap gap-2">
              {location.parkingAvailable && (
                <Badge variant="default" size="sm">🚗 Parking available</Badge>
              )}
              {location.publicTransport && (
                <Badge variant="default" size="sm">🚂 Public transport</Badge>
              )}
            </div>
          </div>

          {/* Coordinates */}
          <div className="bg-trail-800 border border-stone-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-fg-subtle text-xs">Coordinates</p>
              <MapPin className="w-3.5 h-3.5 text-fg-subtle" />
            </div>
            <p className="font-mono text-fg text-sm">
              {location.coordinates.lat.toFixed(6)}, {location.coordinates.lng.toFixed(6)}
            </p>
          </div>

          {/* Gallery */}
          {location.gallery.length > 0 && (
            <div>
              <h3 className="text-fg font-semibold text-sm mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4 text-fg-subtle" />
                Gallery
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {location.gallery.map((img, i) => (
                  <button
                    key={img.id}
                    className="aspect-square rounded-xl overflow-hidden relative"
                    onClick={() => setActiveGalleryIndex(i)}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="100px"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="flex-shrink-0 p-4 border-t border-stone-800 bg-trail-900/80 backdrop-blur-sm flex gap-3">
        <Button
          variant="outline"
          size="md"
          className="flex-1"
          onClick={() => toggleFavorite(location.id)}
        >
          <Heart className={cn("w-4 h-4", fav && "fill-red-400 text-red-400")} />
          {fav ? "Saved" : "Save"}
        </Button>
        <Button
          variant="gold"
          size="md"
          className="flex-1"
          asChild
        >
          <a
            href={getMapLink(
              location.coordinates.lat,
              location.coordinates.lng,
              location.name
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Navigation className="w-4 h-4" />
            Open in Maps
          </a>
        </Button>
      </div>

      {/* Gallery lightbox */}
      <AnimatePresence>
        {activeGalleryIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-trail-950/95 backdrop-blur-xl flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveGalleryIndex(null)}
          >
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-trail-800 border border-stone-700 flex items-center justify-center text-fg-muted hover:text-fg">
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden">
              <Image
                src={location.gallery[activeGalleryIndex].url}
                alt={location.gallery[activeGalleryIndex].alt}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
