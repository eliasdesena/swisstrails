"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Eye, ImageIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLACEHOLDER_LOCATIONS } from "@/data/locations";
import { categoryConfig, difficultyConfig } from "@/lib/utils";
import { useImageOverridesStore } from "@/store/image-overrides-store";
import { LocationImageEditor } from "@/components/admin/location-image-editor";
import type { Location } from "@/types";

export default function AdminLocationsPage() {
  const [editing, setEditing] = useState<Location | null>(null);
  // Subscribe so the per-row "override" badge updates live as edits are made.
  const overrides = useImageOverridesStore((s) => s.overrides);

  return (
    <div className="min-h-screen bg-trail-950 p-6 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="t-h2 text-fg">Locations</h1>
            <p className="text-fg-muted text-sm mt-1">
              {PLACEHOLDER_LOCATIONS.length} locations total
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-fg-muted hover:text-fg text-sm transition-colors">
              ← Dashboard
            </Link>
            <Button variant="alpine" size="md">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Location</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Mobile card list */}
        <div className="lg:hidden space-y-3">
          {PLACEHOLDER_LOCATIONS.map((loc) => {
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
                    onClick={() => setEditing(loc)}
                    className="relative flex-1 h-11 rounded-lg bg-trail-700 border border-stone-700 flex items-center justify-center gap-1.5 text-fg-muted hover:text-fg transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">Images</span>
                    {hasOverride && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-alpine-400" />
                    )}
                  </button>
                  <button aria-label="View" className="flex-1 h-11 rounded-lg bg-trail-700 border border-stone-700 flex items-center justify-center text-fg-muted hover:text-fg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button aria-label="Edit" className="flex-1 h-11 rounded-lg bg-trail-700 border border-stone-700 flex items-center justify-center text-fg-muted hover:text-fg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button aria-label="Delete" className="flex-1 h-11 rounded-lg bg-red-950 border border-red-900 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors">
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
                {PLACEHOLDER_LOCATIONS.map((loc) => {
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
                            onClick={() => setEditing(loc)}
                            className="relative h-7 px-2 rounded-lg bg-trail-700 border border-stone-700 flex items-center gap-1 text-fg-subtle hover:text-fg transition-colors"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">Images</span>
                            {hasOverride && (
                              <span className="w-1.5 h-1.5 rounded-full bg-alpine-400" />
                            )}
                          </button>
                          <button className="w-7 h-7 rounded-lg bg-trail-700 border border-stone-700 flex items-center justify-center text-fg-subtle hover:text-fg transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button className="w-7 h-7 rounded-lg bg-trail-700 border border-stone-700 flex items-center justify-center text-fg-subtle hover:text-fg transition-colors">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button className="w-7 h-7 rounded-lg bg-red-950 border border-red-900 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors">
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
      </div>

      {/* Per-location image editor (modal / bottom-sheet) */}
      {editing && (
        <LocationImageEditor location={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
