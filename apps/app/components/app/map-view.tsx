"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, ZoomControl } from "react-leaflet";
import { useMapStore } from "@/store/map-store";
import { PLACEHOLDER_LOCATIONS, SWITZERLAND_CENTER, SWITZERLAND_DEFAULT_ZOOM } from "@/data/locations";
import type { Location } from "@/types";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import L from "leaflet";
import "leaflet.markercluster";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

const TILE_SATELLITE = `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`;
const TILE_DARK = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

const ATTR_SATELLITE = '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const ATTR_DARK = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

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

// 40px transparent hit area wrapping a 16–20px visible dot.
// White on satellite, white on dark — universally readable.
function createLocationIcon(_location: Location, isSelected: boolean) {
  const dot = isSelected ? 20 : 14;
  const bg = isSelected ? "#FFFFFF" : "rgba(255,255,255,0.85)";
  const shadow = isSelected
    ? "0 0 0 5px rgba(107,120,255,0.28), 0 3px 14px rgba(0,0,0,0.6)"
    : "0 2px 8px rgba(0,0,0,0.55), 0 0 0 1.5px rgba(255,255,255,0.1)";

  return L.divIcon({
    html: `<div style="
      width:44px;height:44px;
      display:flex;align-items:center;justify-content:center;
      cursor:pointer;
    "><div style="
      width:${dot}px;height:${dot}px;
      border-radius:50%;
      background:${bg};
      box-shadow:${shadow};
      transition:all 0.15s;
    "></div></div>`,
    className: "",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
}

function createClusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount();
  const size = count >= 100 ? 48 : count >= 10 ? 40 : 32;
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:rgba(255,255,255,0.88);
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 3px 14px rgba(0,0,0,0.45);
      backdrop-filter:blur(8px);
    "><span style="
      color:#0b0f1c;
      font-size:${count >= 100 ? 11 : 12}px;
      font-weight:700;
      font-family:inherit;
      line-height:1;
      letter-spacing:-0.3px;
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
    return () => { map.removeLayer(group); };
  }, [map, openBottomSheet, locations]);

  return null;
}

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
  isSatellite?: boolean;
}

export function MapView({ locations, isSatellite = true }: MapViewProps) {
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
      style={{ background: isSatellite ? "#1a2a1a" : "#0b0f1c" }}
    >
      <MapController />

      <TileLayer
        key={isSatellite ? "satellite" : "dark"}
        url={isSatellite ? TILE_SATELLITE : TILE_DARK}
        attribution={isSatellite ? ATTR_SATELLITE : ATTR_DARK}
        subdomains={isSatellite ? "" : "abcd"}
        maxZoom={20}
      />

      <ZoomControl position="bottomleft" />
      <ClusterLayer locations={locations} />
      <SelectedMarker />
    </MapContainer>
  );
}
