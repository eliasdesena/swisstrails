"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Navigation,
  Apple,
  Mountain,
  Map as MapIcon,
  Train,
  Download,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  googleMapsDirections,
  appleMapsDirections,
  komootPlan,
  switzerlandMobilityMap,
  sbbDirections,
  downloadGpx,
  formatCoordinates,
} from "@/lib/deep-links";
import type { Location } from "@/types";

interface OpenInSheetProps {
  location: Location | null;
  onClose: () => void;
}

interface RowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  href?: string;
  onClick?: () => void;
  /** When true, show a transient "Copied!" / done state on the trailing edge. */
  done?: boolean;
}

function Row({ icon: Icon, label, hint, href, onClick, done }: RowProps) {
  const inner = (
    <>
      <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.05] text-alpine-300 flex-shrink-0">
        <Icon className="w-[18px] h-[18px]" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm text-fg font-medium leading-tight">{label}</span>
        {hint && <span className="block text-xs text-fg-muted mt-0.5">{hint}</span>}
      </span>
      {done ? (
        <Check className="w-4 h-4 text-alpine-400 flex-shrink-0" />
      ) : (
        <Navigation className="w-3.5 h-3.5 text-fg-subtle flex-shrink-0 rotate-45" />
      )}
    </>
  );

  const className = cn(
    "w-full flex items-center gap-3 px-2 min-h-[52px] py-2.5 rounded-lg text-left",
    "hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors"
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" className={className} onClick={onClick}>
      {inner}
    </button>
  );
}

export function OpenInSheet({ location, onClose }: OpenInSheetProps) {
  const [copied, setCopied] = useState(false);

  // Body-scroll-lock while open.
  useEffect(() => {
    if (location) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setCopied(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [location?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function copyCoords() {
    if (!location) return;
    const text = formatCoordinates(location.coordinates.lat, location.coordinates.lng);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  }

  const lat = location?.coordinates.lat ?? 0;
  const lng = location?.coordinates.lng ?? 0;

  return (
    <AnimatePresence>
      {location && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[1500] bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className={cn(
              "fixed z-[1600] flex flex-col overflow-hidden bg-trail-950",
              "inset-x-0 bottom-0 rounded-t-xl",
              "lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2",
              "lg:w-[420px] lg:rounded-xl"
            )}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Open in / Get directions"
          >
            {/* Grab handle */}
            <div className="flex justify-center pt-2.5 pb-1 lg:hidden">
              <span className="w-9 h-1 rounded-full bg-white/15" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-2 pb-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-fg-muted">
                  Get directions
                </p>
                <h3 className="text-fg text-base font-semibold leading-tight line-clamp-1">
                  {location.name}
                </h3>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-11 h-11 -mr-2 flex items-center justify-center text-fg-muted hover:text-fg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Options */}
            <div className="px-3 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-0.5 overflow-y-auto overscroll-contain">
              <Row
                icon={Navigation}
                label="Get directions — Google Maps"
                href={googleMapsDirections(lat, lng)}
              />
              <Row
                icon={Apple}
                label="Get directions — Apple Maps"
                href={appleMapsDirections(lat, lng, location.name)}
              />
              <Row
                icon={Mountain}
                label="Open in Komoot"
                hint="Plan a route nearby"
                href={komootPlan(lat, lng)}
              />
              <Row
                icon={MapIcon}
                label="Open in SwitzerlandMobility"
                hint="Swiss national hiking map"
                href={switzerlandMobilityMap(lat, lng)}
              />
              {location.publicTransport && (
                <Row
                  icon={Train}
                  label="Get there by train (SBB)"
                  hint="Public transport journey planner"
                  href={sbbDirections(lat, lng)}
                />
              )}
              <Row
                icon={Download}
                label="Download GPX"
                hint="For Garmin & GPS apps"
                onClick={() =>
                  downloadGpx(lat, lng, location.name, location.slug)
                }
              />
              <Row
                icon={copied ? Check : Copy}
                label={copied ? "Copied!" : "Copy coordinates"}
                hint={formatCoordinates(lat, lng)}
                onClick={copyCoords}
                done={copied}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
