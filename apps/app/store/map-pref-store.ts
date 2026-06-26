"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { directionsUrlFor, openUrl, type MapAppPref } from "@/lib/deep-links";

interface DirectionsTarget {
  lat: number;
  lng: number;
  name: string;
}

interface MapPrefStore {
  /** Chosen directions app. `null` = not asked yet (prompt on first use). */
  preferredMapApp: MapAppPref | null;
  /** When set, the first-use picker is shown for this destination. */
  pickerTarget: DirectionsTarget | null;

  /** Set the preference directly (from Settings). */
  setPreferredMapApp: (app: MapAppPref) => void;
  /** "Get directions" tap: open immediately if a preference exists, else ask. */
  requestDirections: (target: DirectionsTarget) => void;
  /** Picker choice: remember the app and open the pending destination in it. */
  chooseAndOpen: (app: MapAppPref) => void;
  /** Close the picker without choosing (cancels the pending directions). */
  dismissPicker: () => void;
}

export const useMapPrefStore = create<MapPrefStore>()(
  persist(
    (set, get) => ({
      preferredMapApp: null,
      pickerTarget: null,

      setPreferredMapApp: (app) => set({ preferredMapApp: app }),

      requestDirections: (target) => {
        const pref = get().preferredMapApp;
        if (pref) {
          openUrl(directionsUrlFor(pref, target.lat, target.lng, target.name));
        } else {
          set({ pickerTarget: target });
        }
      },

      chooseAndOpen: (app) => {
        const target = get().pickerTarget;
        set({ preferredMapApp: app, pickerTarget: null });
        if (target) {
          openUrl(directionsUrlFor(app, target.lat, target.lng, target.name));
        }
      },

      dismissPicker: () => set({ pickerTarget: null }),
    }),
    {
      name: "swiss-trails-map-pref",
      // Only the preference is durable; the transient picker target is not.
      partialize: (s) => ({ preferredMapApp: s.preferredMapApp }),
    }
  )
);
