"use client";

import { useEffect, useState } from "react";
import {
  Sun,
  CloudSun,
  Cloud,
  Cloudy,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  type LucideIcon,
} from "lucide-react";
import { fetchWeather, type WeatherData, type WeatherIconName } from "@/lib/weather";
import { cn } from "@/lib/utils";

interface WeatherWidgetProps {
  lat: number;
  lng: number;
  className?: string;
}

const ICONS: Record<WeatherIconName, LucideIcon> = {
  Sun,
  CloudSun,
  Cloud,
  Cloudy,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
};

/** Short weekday abbreviation in the location's local context, e.g. "Mon". */
function dayLabel(iso: string, index: number): string {
  if (index === 0) return "Today";
  // Append midday to avoid the date string being parsed as UTC and shifting a day.
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export function WeatherWidget({ lat, lng, className }: WeatherWidgetProps) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setData(null);

    fetchWeather(lat, lng)
      .then((d) => {
        if (!active) return;
        setData(d);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [lat, lng]);

  // Never block the page: a tiny muted note on failure.
  if (status === "error") {
    return (
      <p className={cn("text-fg-muted text-xs", className)}>Weather unavailable</p>
    );
  }

  return (
    <div className={className}>
      <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-fg-muted mb-3 flex items-center gap-1.5">
        <Cloud className="w-3 h-3" />
        Weather
      </p>

      {status === "loading" || !data ? (
        <WeatherSkeleton />
      ) : (
        <div className="bg-white/[0.03] rounded-xl p-4">
          {/* Current conditions */}
          <div className="flex items-center gap-3">
            <CurrentIcon name={data.current.icon} />
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-fg text-2xl font-semibold leading-none">
                  {data.current.temp}°
                </span>
                <span className="text-stone-300 text-sm truncate">
                  {data.current.label}
                </span>
              </div>
              <p className="text-fg-muted text-[11px] mt-1 flex items-center gap-1">
                <Wind className="w-3 h-3" />
                {data.current.windKmh} km/h wind
              </p>
            </div>
          </div>

          {/* Forecast strip */}
          {data.daily.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-2 border-t border-white/[0.06] pt-3">
              {data.daily.slice(0, 4).map((day, i) => {
                const Icon = ICONS[day.icon] ?? Cloud;
                return (
                  <div key={day.date} className="flex flex-col items-center text-center">
                    <span className="text-fg-muted text-[10px] font-medium uppercase tracking-wide">
                      {dayLabel(day.date, i)}
                    </span>
                    <Icon className="w-5 h-5 my-1.5 text-stone-300" />
                    <span className="text-stone-200 text-xs font-medium">
                      {day.hi}°
                      <span className="text-fg-muted font-normal"> {day.lo}°</span>
                    </span>
                    {day.precipProbability != null && day.precipProbability > 0 && (
                      <span className="text-alpine-400 text-[10px] mt-1 flex items-center gap-0.5">
                        <Droplets className="w-2.5 h-2.5" />
                        {day.precipProbability}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CurrentIcon({ name }: { name: WeatherIconName }) {
  const Icon = ICONS[name] ?? Cloud;
  return (
    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/[0.04] flex items-center justify-center">
      <Icon className="w-6 h-6 text-stone-200" />
    </div>
  );
}

function WeatherSkeleton() {
  return (
    <div className="bg-white/[0.03] rounded-xl p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-white/[0.05]" />
        <div className="space-y-2">
          <div className="h-5 w-24 rounded bg-white/[0.05]" />
          <div className="h-3 w-16 rounded bg-white/[0.04]" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 border-t border-white/[0.06] pt-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="h-2.5 w-8 rounded bg-white/[0.05]" />
            <div className="w-5 h-5 rounded-full bg-white/[0.05]" />
            <div className="h-3 w-10 rounded bg-white/[0.04]" />
          </div>
        ))}
      </div>
    </div>
  );
}
