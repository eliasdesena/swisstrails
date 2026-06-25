"use client";

import { useState } from "react";
import { Navigation } from "lucide-react";
import { OpenInSheet } from "@/components/app/open-in-sheet";
import { platformDirections } from "@/lib/deep-links";
import type { Location } from "@/types";

interface DirectionsActionsProps {
  location: Location;
}

/**
 * Client island for the public SSG location page.
 * Renders a one-tap platform-default "Get directions" button plus a
 * "More apps" affordance that opens the full Open-in deep-link sheet.
 */
export function DirectionsActions({ location }: DirectionsActionsProps) {
  const [openInSheet, setOpenInSheet] = useState(false);
  const { lat, lng } = { lat: location.coordinates.lat, lng: location.coordinates.lng };

  return (
    <>
      <div className="flex-1 flex gap-2 min-w-0">
        <a
          href={platformDirections(lat, lng, location.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg bg-alpine-600 hover:bg-alpine-500 text-white font-medium text-sm transition-colors"
        >
          <Navigation className="w-4 h-4" />
          Get directions
        </a>
        <button
          type="button"
          onClick={() => setOpenInSheet(true)}
          className="px-3 h-11 flex-shrink-0 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-stone-300 font-medium text-sm transition-colors"
        >
          More apps
        </button>
      </div>

      <OpenInSheet
        location={openInSheet ? location : null}
        onClose={() => setOpenInSheet(false)}
      />
    </>
  );
}
