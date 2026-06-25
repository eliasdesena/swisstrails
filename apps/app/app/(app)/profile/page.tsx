"use client";

import { User, MapPin, Heart, Settings, LogOut, Shield, ChevronRight, Star } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
import { useFavoritesStore } from "@/store/favorites-store";

const MENU_ITEMS = [
  {
    icon: MapPin,
    label: "Explore the map",
    href: "/explore",
    description: "Discover new locations",
    soon: false,
  },
  {
    icon: Heart,
    label: "Saved locations",
    href: "/favorites",
    description: "View your favourites",
    soon: false,
  },
  {
    icon: Settings,
    label: "Account settings",
    href: "#",
    description: "Email, password, preferences",
    soon: true,
  },
  {
    icon: Shield,
    label: "Privacy & data",
    href: "#",
    description: "Manage your data",
    soon: true,
  },
];

export default function ProfilePage() {
  const { favoriteIds } = useFavoritesStore();

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-lg mx-auto p-4 lg:p-6">
        {/* Profile header */}
        <Reveal>
          <div className="flex items-center gap-4 mb-8 p-5 card-solid rounded-xl">
            <div className="w-12 h-12 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-stone-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="t-h4 text-fg truncate">Explorer</h2>
              <p className="text-fg-muted text-sm truncate mt-0.5">
                user@example.com
              </p>
            </div>
            <span className="text-xs font-medium text-alpine-400 bg-alpine-900/40 px-2 py-0.5 rounded">
              Active
            </span>
          </div>
        </Reveal>

        {/* Stats */}
        <Reveal delay={0.1}>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "Saved", value: favoriteIds.size.toString(), Icon: Heart },
              { label: "Explored", value: "0", Icon: MapPin },
              { label: "Since", value: "2025", Icon: Star },
            ].map((stat) => (
              <div
                key={stat.label}
                className="card-solid rounded-lg p-4 text-center"
              >
                <stat.Icon className="w-4 h-4 text-fg-muted mx-auto mb-1.5" />
                <p className="text-fg text-base font-semibold">{stat.value}</p>
                <p className="text-fg-muted text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Menu */}
        <Reveal delay={0.2}>
          <div className="card-solid rounded-xl overflow-hidden mb-6">
            {MENU_ITEMS.map((item) => {
              const inner = (
                <>
                  <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-fg-muted group-hover:text-fg transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-fg text-sm font-medium">{item.label}</p>
                    <p className="text-fg-muted text-xs mt-0.5">{item.description}</p>
                  </div>
                  {item.soon ? (
                    <span className="text-[10px] font-medium uppercase tracking-wide text-fg-subtle bg-white/[0.04] px-2 py-1 rounded flex-shrink-0">
                      Soon
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-fg-subtle group-hover:text-fg-muted transition-colors flex-shrink-0" />
                  )}
                </>
              );
              return item.soon ? (
                <div
                  key={item.label}
                  aria-disabled="true"
                  className="flex items-center gap-3 px-5 min-h-[60px] py-3 opacity-70 cursor-default group"
                >
                  {inner}
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-5 min-h-[60px] py-3 hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors group"
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        </Reveal>

        {/* Access info */}
        <Reveal delay={0.3}>
          <div className="p-4 bg-white/[0.02] rounded-xl mb-6">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                <Shield className="w-3.5 h-3.5 text-alpine-500" />
              </div>
              <div>
                <p className="text-fg text-sm font-medium">Full access active</p>
                <p className="text-fg-muted text-xs">Lifetime · includes all future locations</p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Sign out */}
        <Reveal delay={0.35}>
          <Button variant="ghost" className="w-full text-fg-muted hover:text-fg">
            <LogOut className="w-4 h-4" />
            Sign out
          </Button>
        </Reveal>
      </div>
    </div>
  );
}
