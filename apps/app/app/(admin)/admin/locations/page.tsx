"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, Eye, ImageIcon, Search, X } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PLACEHOLDER_LOCATIONS } from "@/data/locations";
import { categoryConfig, difficultyConfig, cn } from "@/lib/utils";
import { useImageOverridesStore } from "@/store/image-overrides-store";
import { LocationImageEditor } from "@/components/admin/location-image-editor";
import { haptics } from "@/lib/haptics";
import type { Location } from "@/types";

export default function AdminLocationsPage() {
  const [editing, setEditing] = useState<Location | null>(null);
  const [query, setQuery] = useState("");
  // Debounce the name search so typing across 500 rows stays responsive.
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(id);
  }, [query]);
  // Subscribe so the per-row "override" badge updates live as edits are made.
  const overrides = useImageOverridesStore((s) => s.overrides);

  const results = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();
    if (!q) return PLACEHOLDER_LOCATIONS;
    return PLACEHOLDER_LOCATIONS.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        loc.slug.toLowerCase().includes(q) ||
        loc.region.toLowerCase().includes(q)
    );
  }, [debouncedQuery]);

  return (
    <div className="min-h-dvh bg-trail-950 p-6 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="t-h2 text-fg">Locations</h1>
            <p className="text-fg-muted text-sm mt-1">
              {results.length === PLACEHOLDER_LOCATIONS.length
                ? `${PLACEHOLDER_LOCATIONS.length} locations total`
                : `${results.length} of ${PLACEHOLDER_LOCATIONS.length} locations`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-fg-muted hover:text-fg text-sm transition-colors">
              ← Dashboard
            </Link>
            <Button
              variant="alpine"
              size="md"
              aria-disabled="true"
              title="Coming soon"
              className="opacity-50 cursor-not-allowed pointer-events-none"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Location</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 max-w-md">
          <Input
            type="search"
            placeholder="Search by name, slug or region…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
            suffix={
              query ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    haptics.tap();
                    setQuery("");
                  }}
                  className="text-fg-subtle hover:text-fg transition-colors pressable"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : undefined
            }
          />
        </div>

        {results.length === 0 ? (
          <div className="card-solid rounded-2xl py-16 text-center">
            <p className="text-fg text-sm font-medium">No locations match “{debouncedQuery}”</p>
            <p className="text-fg-muted text-xs mt-1">Try a different name, slug or region.</p>
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="lg:hidden space-y-3">
              {results.map((loc) => {
                const cat = categoryConfig[loc.category];
                const diff = difficultyConfig[loc.difficulty];
                const hasOverride = !!overrides[loc.id]?.length;
                return (
                  <div key={loc.id} className="card-solid rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-fg text-sm font-medium truncate">{loc.name}</p>
                        <p className="text-fg-subtle text-xs mt-0.5 truncate">{loc.slug}</p>
                      </div>
                      {loc.isFeatured ? (
                        <Badge variant="alpine" size="sm">Featured</Badge>
                      ) : loc.isNew ? (
                        <Badge variant="gold" size="sm">New</Badge>
                      ) : (
                        <Badge variant="default" size="sm">Active</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-fg-muted">{cat.emoji} {cat.label}</span>
                      <span className="text-fg-muted capitalize">{loc.region}</span>
                      <span className={`font-medium ${diff.color}`}>{diff.label}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        type="button"
                        aria-label="Edit images"
                        onClick={() => {
                          haptics.tap();
                          setEditing(loc);
                        }}
                        className="pressable relative flex-1 h-11 rounded-lg bg-trail-700 border border-stone-700 flex items-center justify-center gap-1.5 text-fg-muted hover:text-fg transition-colors"
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span className="text-xs font-medium">Images</span>
                        {hasOverride && (
                          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-alpine-400" />
                        )}
                      </button>
                      <Link
                        href={`/location/${loc.slug}`}
                        aria-label={`View ${loc.name}`}
                        title="View live page"
                        onClick={() => haptics.tap()}
                        className="pressable flex-1 h-11 rounded-lg bg-trail-700 border border-stone-700 flex items-center justify-center text-fg-muted hover:text-fg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        aria-label="Edit details"
                        aria-disabled="true"
                        title="Editing — coming soon"
                        className="flex-1 h-11 rounded-lg bg-trail-700 border border-stone-700 flex items-center justify-center text-fg-subtle opacity-40 cursor-not-allowed"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete"
                        aria-disabled="true"
                        title="Delete — confirm required, coming soon"
                        className="flex-1 h-11 rounded-lg bg-red-950 border border-red-900 flex items-center justify-center text-red-400 opacity-40 cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Locations table — desktop */}
            <div className="card-solid rounded-2xl overflow-hidden hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-800">
                      {["Name", "Category", "Region", "Difficulty", "Status", "Actions"].map((h) => (
                        <th
                          key={h}
                          className="text-left px-5 py-3 text-fg-subtle text-xs font-medium uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((loc) => {
                      const cat = categoryConfig[loc.category];
                      const diff = difficultyConfig[loc.difficulty];
                      const hasOverride = !!overrides[loc.id]?.length;
                      return (
                        <tr
                          key={loc.id}
                          className="border-b border-stone-800/50 last:border-0 hover:bg-trail-800/40 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <p className="text-fg text-sm font-medium">{loc.name}</p>
                            <p className="text-fg-subtle text-xs mt-0.5">{loc.slug}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-fg-muted text-sm">
                              {cat.emoji} {cat.label}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-fg-muted text-sm capitalize">
                              {loc.region}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-xs font-medium ${diff.color}`}>
                              {diff.label}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {loc.isFeatured ? (
                              <Badge variant="alpine" size="sm">Featured</Badge>
                            ) : loc.isNew ? (
                              <Badge variant="gold" size="sm">New</Badge>
                            ) : (
                              <Badge variant="default" size="sm">Active</Badge>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                aria-label="Edit images"
                                title="Edit images"
                                onClick={() => {
                                  haptics.tap();
                                  setEditing(loc);
                                }}
                                className="pressable relative h-7 px-2 rounded-lg bg-trail-700 border border-stone-700 flex items-center gap-1 text-fg-subtle hover:text-fg transition-colors"
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Images</span>
                                {hasOverride && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-alpine-400" />
                                )}
                              </button>
                              <Link
                                href={`/location/${loc.slug}`}
                                aria-label={`View ${loc.name}`}
                                title="View live page"
                                className="pressable w-7 h-7 rounded-lg bg-trail-700 border border-stone-700 flex items-center justify-center text-fg-subtle hover:text-fg transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                type="button"
                                aria-label="Edit details"
                                aria-disabled="true"
                                title="Editing — coming soon"
                                className={cn(
                                  "w-7 h-7 rounded-lg bg-trail-700 border border-stone-700",
                                  "flex items-center justify-center text-fg-subtle opacity-40 cursor-not-allowed"
                                )}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                aria-label="Delete"
                                aria-disabled="true"
                                title="Delete — confirm required, coming soon"
                                className={cn(
                                  "w-7 h-7 rounded-lg bg-red-950 border border-red-900",
                                  "flex items-center justify-center text-red-400 opacity-40 cursor-not-allowed"
                                )}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Per-location image editor (modal / bottom-sheet) */}
      {editing && (
        <LocationImageEditor location={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
