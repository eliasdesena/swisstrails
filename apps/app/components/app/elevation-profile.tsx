"use client";

import { useMemo } from "react";
import { Mountain, TrendingUp, TrendingDown } from "lucide-react";
import type { Location } from "@/types";

/**
 * Compact inline elevation sparkline across the trip's stops.
 *
 * Plots each stop's `Location.elevation` (m) as a smooth-ish polyline, with the
 * total ascent (sum of positive deltas) and descent (sum of negative deltas)
 * between consecutive stops. Stops without an elevation are skipped gracefully;
 * if fewer than two stops have an elevation, the whole component renders null so
 * the header stays clean.
 *
 * Dark token palette: `--color-accent` for the line/area, `fg-subtle` for axis.
 */
export function ElevationProfile({ stops }: { stops: Location[] }) {
  const data = useMemo(() => {
    // Keep stop index alongside the value so labels stay meaningful even when
    // some stops have no elevation.
    const points = stops
      .map((l, i) => ({ i, e: l.elevation }))
      .filter((p): p is { i: number; e: number } => typeof p.e === "number");

    if (points.length < 2) return null;

    const elevations = points.map((p) => p.e);
    const min = Math.min(...elevations);
    const max = Math.max(...elevations);
    const range = max - min || 1; // avoid /0 on a flat profile

    // Ascent / descent over the full ordered sequence of elevation-bearing stops.
    let ascent = 0;
    let descent = 0;
    for (let k = 1; k < points.length; k++) {
      const delta = points[k].e - points[k - 1].e;
      if (delta > 0) ascent += delta;
      else descent += -delta;
    }

    // Viewbox coordinates. Padding keeps the line off the edges.
    const W = 100;
    const H = 32;
    const padY = 4;
    const usableH = H - padY * 2;

    const coords = points.map((p, k) => {
      const x = points.length === 1 ? 0 : (k / (points.length - 1)) * W;
      const y = padY + (1 - (p.e - min) / range) * usableH;
      return { x, y };
    });

    const linePath = coords
      .map((c, k) => `${k === 0 ? "M" : "L"}${c.x.toFixed(2)},${c.y.toFixed(2)}`)
      .join(" ");

    // Closed area path under the line for the subtle fill.
    const areaPath =
      `M${coords[0].x.toFixed(2)},${H} ` +
      coords.map((c) => `L${c.x.toFixed(2)},${c.y.toFixed(2)}`).join(" ") +
      ` L${coords[coords.length - 1].x.toFixed(2)},${H} Z`;

    return { min, max, ascent, descent, linePath, areaPath, coords, W, H };
  }, [stops]);

  if (!data) return null;

  const fmt = (m: number) => `${Math.round(m).toLocaleString("en-CH")} m`;

  return (
    <div className="rounded-xl bg-surface-1 border border-white/[0.04] p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="t-2xs text-fg-muted flex items-center gap-1.5">
          <Mountain className="w-3.5 h-3.5" />
          Elevation
        </span>
        <span className="t-3xs text-fg-subtle flex items-center gap-2.5">
          <span className="flex items-center gap-1 text-alpine-300">
            <TrendingUp className="w-3 h-3" />
            {fmt(data.ascent)}
          </span>
          <span className="flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            {fmt(data.descent)}
          </span>
        </span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${data.W} ${data.H}`}
          preserveAspectRatio="none"
          className="w-full h-10"
          role="img"
          aria-label={`Elevation profile: ${fmt(data.ascent)} ascent, ${fmt(
            data.descent
          )} descent`}
        >
          <defs>
            <linearGradient id="elev-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={data.areaPath} fill="url(#elev-fill)" />
          <path
            d={data.linePath}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {data.coords.map((c, k) => (
            <circle
              key={k}
              cx={c.x}
              cy={c.y}
              r="1.6"
              fill="var(--color-accent)"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      </div>

      <div className="flex items-center justify-between mt-1">
        <span className="t-3xs text-fg-subtle">{fmt(data.min)}</span>
        <span className="t-3xs text-fg-subtle">{fmt(data.max)}</span>
      </div>
    </div>
  );
}
