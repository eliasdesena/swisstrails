"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, ZoomControl } from "react-leaflet";
import { useMapStore } from "@/store/map-store";
import { PLACEHOLDER_LOCATIONS, SWITZERLAND_CENTER, SWITZERLAND_DEFAULT_ZOOM } from "@/data/locations";
import { categoryConfig } from "@/lib/utils";
import type { Location } from "@/types";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import L from "leaflet";
import "leaflet.markercluster";

// Patch HMR re-mount issue in dev
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  const proto = L.Map.prototype as unknown as Record<string, unknown>;
  if (!proto.__patched_initContainer) {
    const orig = proto._initContainer as (id: HTMLElement | string) => void;
    proto._initContainer = function (id: HTMLElement | string) {
      const el = typeof id === "string" ? document.getElementById(id) : id;
      if (el) delete (el as unknown as Record<string, unknown>)._leaflet_id;
      return orig.call(this, id);
    };
    proto.__patched_initContainer = true;
  }
}

function createLocationIcon(location: Location, isSelected: boolean) {
  const cat = categoryConfig[location.category];
  const size = isSelected ? 48 : 36;
  const borderColor = isSelected ? "#515EFF" : "#1B2040";
  const bgColor = isSelected ? "rgba(81,94,255,0.95)" : "rgba(26,32,100,0.85)";
  const shadow = isSelected
    ? "0 0 0 3px rgba(81,94,255,0.3), 0 8px 24px rgba(0,0,0,0.5)"
    : "0 4px 12px rgba(0,0,0,0.4)";

  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${bgColor};
      border:2px solid ${borderColor};
      border-radius:50% 50% 50% 4px;
      transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
      box-shadow:${shadow};
      backdrop-filter:blur(8px);
    "><span style="transform:rotate(45deg);font-size:${isSelected ? 18 : 15}px;line-height:1;">${cat.emoji}</span></div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

function createClusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount();
  const size = count >= 100 ? 52 : count >= 10 ? 44 : 36;
  const fontSize = count >= 100 ? 13 : count >= 10 ? 14 : 15;
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:rgba(14,18,48,0.92);
      border:2px solid rgba(81,94,255,0.6);
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 0 0 4px rgba(81,94,255,0.15),0 4px 16px rgba(0,0,0,0.5);
      backdrop-filter:blur(8px);
    "><span style="
      color:#fff;
      font-size:${fontSize}px;
      font-weight:600;
      font-family:inherit;
      line-height:1;
    ">${count}</span></div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MapController() {
  const map = useMap();
  const { center, zoom } = useMapStore();

  useEffect(() => {
    map.setView([center.lat, center.lng], zoom, { animate: true });
  }, [center, zoom, map]);

  return null;
}

function ClusterLayer({ locations }: { locations: Location[] }) {
  const map = useMap();
  const { openBottomSheet } = useMapStore();

  useEffect(() => {
    const group = L.markerClusterGroup({
      iconCreateFunction: createClusterIcon,
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      animate: true,
      animateAddingMarkers: false,
      disableClusteringAtZoom: 13,
    });

    locations.forEach((loc) => {
      const marker = L.marker([loc.coordinates.lat, loc.coordinates.lng], {
        icon: createLocationIcon(loc, false),
      });
      marker.on("click", () => openBottomSheet(loc.id));
      group.addLayer(marker);
    });

    map.addLayer(group);

    return () => {
      map.removeLayer(group);
    };
  }, [map, openBottomSheet, locations]);

  return null;
}

// Selected marker rendered separately so it always floats above clusters
function SelectedMarker() {
  const { selectedLocationId } = useMapStore();
  const location = PLACEHOLDER_LOCATIONS.find((l) => l.id === selectedLocationId);
  if (!location) return null;
  return (
    <Marker
      position={[location.coordinates.lat, location.coordinates.lng]}
      icon={createLocationIcon(location, true)}
      zIndexOffset={1000}
    />
  );
}

interface MapViewProps {
  locations: Location[];
}

export function MapView({ locations }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <MapContainer
      ref={mapRef}
      center={[SWITZERLAND_CENTER.lat, SWITZERLAND_CENTER.lng]}
      zoom={SWITZERLAND_DEFAULT_ZOOM}
      zoomControl={false}
      className="w-full h-full"
      style={{ background: "#0b0f1c" }}
    >
      <MapController />

      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={20}
      />

      <ZoomControl position="topleft" />
      <ClusterLayer locations={locations} />
      <SelectedMarker />
    </MapContainer>
  );
}
