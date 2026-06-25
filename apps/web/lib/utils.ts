import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Difficulty, Season, LocationCategory, Region } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}min`;
}

export function formatVisitDuration(min: number, max: number): string {
  if (min === max) return `${min}h`;
  return `${min}–${max}h`;
}

export function formatDistance(km?: number): string {
  if (!km) return "—";
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

export function formatElevation(meters?: number): string {
  if (!meters) return "—";
  return `${meters.toLocaleString()}m`;
}

export const difficultyConfig: Record<
  Difficulty,
  { label: string; color: string; bgColor: string }
> = {
  easy: {
    label: "Easy",
    color: "text-alpine-300",
    bgColor: "bg-alpine-950",
  },
  moderate: {
    label: "Moderate",
    color: "text-gold-300",
    bgColor: "bg-gold-950",
  },
  challenging: {
    label: "Challenging",
    color: "text-orange-300",
    bgColor: "bg-orange-950",
  },
  expert: {
    label: "Expert",
    color: "text-red-300",
    bgColor: "bg-red-950",
  },
};

export const seasonConfig: Record<
  Season,
  { label: string; emoji: string; months: string }
> = {
  spring: { label: "Spring", emoji: "🌱", months: "Mar–May" },
  summer: { label: "Summer", emoji: "☀️", months: "Jun–Aug" },
  autumn: { label: "Autumn", emoji: "🍂", months: "Sep–Nov" },
  winter: { label: "Winter", emoji: "❄️", months: "Dec–Feb" },
  "year-round": { label: "Year-round", emoji: "🌍", months: "All year" },
};

export const categoryConfig: Record<
  LocationCategory,
  { label: string; emoji: string; color: string }
> = {
  "hidden-lake": { label: "Hidden Lake", emoji: "💧", color: "#60C4E8" },
  viewpoint: { label: "Viewpoint", emoji: "🏔", color: "#47A462" },
  waterfall: { label: "Waterfall", emoji: "🌊", color: "#5BA8D5" },
  gorge: { label: "Gorge", emoji: "🪨", color: "#A07850" },
  "sunset-spot": { label: "Sunset Spot", emoji: "🌅", color: "#F5864A" },
  "night-sky": { label: "Night Sky", emoji: "✨", color: "#8B7FD4" },
  "road-trip": { label: "Road Trip", emoji: "🚗", color: "#E8B838" },
  "photo-spot": { label: "Photo Spot", emoji: "📸", color: "#D47FA0" },
  forest: { label: "Forest", emoji: "🌲", color: "#3D8C5E" },
  glacier: { label: "Glacier", emoji: "🧊", color: "#88C8E0" },
  "alpine-meadow": { label: "Alpine Meadow", emoji: "🌸", color: "#7EB86A" },
  river: { label: "River", emoji: "🏞", color: "#48B0A8" },
};

export const regionConfig: Record<Region, { label: string; canton: string }> =
  {
    bern: { label: "Bern", canton: "BE" },
    zurich: { label: "Zurich", canton: "ZH" },
    graubunden: { label: "Graubünden", canton: "GR" },
    valais: { label: "Valais", canton: "VS" },
    lucerne: { label: "Lucerne", canton: "LU" },
    uri: { label: "Uri", canton: "UR" },
    ticino: { label: "Ticino", canton: "TI" },
    "st-gallen": { label: "St. Gallen", canton: "SG" },
    appenzell: { label: "Appenzell", canton: "AI/AR" },
    fribourg: { label: "Fribourg", canton: "FR" },
    vaud: { label: "Vaud", canton: "VD" },
    obwalden: { label: "Obwalden", canton: "OW" },
    nidwalden: { label: "Nidwalden", canton: "NW" },
    schwyz: { label: "Schwyz", canton: "SZ" },
    glarus: { label: "Glarus", canton: "GL" },
    jura: { label: "Jura", canton: "JU" },
    neuchatel: { label: "Neuchâtel", canton: "NE" },
    solothurn: { label: "Solothurn", canton: "SO" },
  };

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}

export function getGravatarUrl(email: string, size = 80): string {
  const hash = Array.from(email.toLowerCase().trim()).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0
  );
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=mp`;
}

export function formatPrice(amount: number, currency = "CHF"): string {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getMapLink(lat: number, lng: number, name: string): string {
  const encoded = encodeURIComponent(name);
  return `https://maps.google.com/?q=${lat},${lng}&label=${encoded}`;
}

export function getShareUrl(slug: string): string {
  return `https://swiss-trails.com/location/${slug}`;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
