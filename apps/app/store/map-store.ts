"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { MapState, LocationFilters, Coordinates } from "@/types";
import { SWITZERLAND_CENTER, SWITZERLAND_DEFAULT_ZOOM } from "@/data/locations";

const DEFAULT_FILTERS: LocationFilters = {
  categories: [],
  difficulties: [],
  regions: [],
  seasons: [],
  featuredOnly: false,
  hasParking: null,
  hasPublicTransport: null,
};

interface MapStore extends MapState {
  setSelectedLocation: (id: string | null) => void;
  setHoveredLocation: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  setCenter: (center: Coordinates) => void;
  openBottomSheet: (id: string) => void;
  closeBottomSheet: () => void;
  setBottomSheetSnap: (snap: MapState["bottomSheetSnap"]) => void;
  setFilters: (filters: Partial<LocationFilters>) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
  resetMap: () => void;
}

export const useMapStore = create<MapStore>()(
  subscribeWithSelector((set) => ({
    selectedLocationId: null,
    hoveredLocationId: null,
    zoom: SWITZERLAND_DEFAULT_ZOOM,
    center: SWITZERLAND_CENTER,
    isBottomSheetOpen: false,
    bottomSheetSnap: "peek",
    activeFilters: DEFAULT_FILTERS,
    searchQuery: "",

    setSelectedLocation: (id) =>
      set({ selectedLocationId: id }),

    setHoveredLocation: (id) =>
      set({ hoveredLocationId: id }),

    setZoom: (zoom) => set({ zoom }),

    setCenter: (center) => set({ center }),

    openBottomSheet: (id) =>
      set({
        selectedLocationId: id,
        isBottomSheetOpen: true,
        bottomSheetSnap: "half",
      }),

    closeBottomSheet: () =>
      set({
        isBottomSheetOpen: false,
        selectedLocationId: null,
        bottomSheetSnap: "peek",
      }),

    setBottomSheetSnap: (snap) => set({ bottomSheetSnap: snap }),

    setFilters: (filters) =>
      set((state) => ({
        activeFilters: { ...state.activeFilters, ...filters },
      })),

    clearFilters: () => set({ activeFilters: DEFAULT_FILTERS }),

    setSearchQuery: (query) => set({ searchQuery: query }),

    resetMap: () =>
      set({
        selectedLocationId: null,
        hoveredLocationId: null,
        zoom: SWITZERLAND_DEFAULT_ZOOM,
        center: SWITZERLAND_CENTER,
        isBottomSheetOpen: false,
        bottomSheetSnap: "peek",
        activeFilters: DEFAULT_FILTERS,
        searchQuery: "",
      }),
  }))
);
