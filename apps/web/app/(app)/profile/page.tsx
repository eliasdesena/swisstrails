"use client";

import { User, Mail, MapPin, Heart, Settings, LogOut, Shield, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/shared/reveal";
import { useFavoritesStore } from "@/store/favorites-store";

const MENU_ITEMS = [
  {
    icon: MapPin,
    label: "Explore the map",
    href: "/explore",
    description: "Discover new locations",
  },
  {
    icon: Heart,
    label: "Saved locations",
    href: "/favorites",
    description: "View your favourites",
  },
  {
    icon: Settings,
    label: "Account settings",
    href: "#",
    description: "Email, password, preferences",
  },
  {
    icon: Shield,
    label: "Privacy & data",
    href: "#",
    description: "Manage your data",
  },
];

export default function ProfilePage() {
  const { favoriteIds } = useFavoritesStore();

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-lg mx-auto p-4 lg:p-6">
        {/* Profile header */}
        <Reveal>
          <div className="flex items-center gap-4 mb-8 p-5 card-solid rounded-2xl">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-alpine-700 to-alpine-900 border border-alpine-700 flex items-center justify-center">
              <User className="w-6 h-6 text-alpine-200" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="t-h4 text-fg truncate">Explorer</h2>
              <p className="text-fg-subtle text-sm truncate mt-0.5">
                user@example.com
              </p>
            </div>
            <Badge variant="alpine">Active</Badge>
          </div>
        </Reveal>

        {/* Stats */}
        <Reveal delay={0.1}>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "Saved", value: favoriteIds.size.toString(), icon: "❤️" },
              { label: "Explored", value: "0", icon: "🗺" },
              { label: "Member since", value: "2025", icon: "⭐️" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="card-solid rounded-xl p-4 text-center"
              >
                <span className="text-xl">{stat.icon}</span>
                <p className="t-h4 text-fg mt-1">{stat.value}</p>
                <p className="text-fg-subtle text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Menu */}
        <Reveal delay={0.2}>
          <div className="card-solid rounded-2xl overflow-hidden mb-6">
            {MENU_ITEMS.map((item, i) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-5 py-4 border-b border-stone-800 last:border-0 hover:bg-trail-800 transition-colors group"
                whileTap={{ scale: 0.99 }}
              >
                <div className="w-9 h-9 rounded-xl bg-trail-800 border border-stone-800 group-hover:border-stone-700 flex items-center justify-center transition-colors flex-shrink-0">
                  <item.icon className="w-4 h-4 text-fg-muted group-hover:text-fg transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-fg text-sm font-medium">{item.label}</p>
                  <p className="text-fg-subtle text-xs mt-0.5">{item.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-fg-subtle group-hover:text-fg-muted transition-colors flex-shrink-0" />
              </motion.a>
            ))}
          </div>
        </Reveal>

        {/* Access info */}
        <Reveal delay={0.3}>
          <div className="p-5 border border-alpine-800/50 bg-alpine-900/20 rounded-2xl mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-alpine-800 border border-alpine-700 flex items-center justify-center">
                <Shield className="w-4 h-4 text-alpine-300" />
              </div>
              <div>
                <p className="text-fg text-sm font-medium">Full access active</p>
                <p className="text-fg-subtle text-xs">Lifetime · includes all future locations</p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Sign out */}
        <Reveal delay={0.35}>
          <Button variant="ghost" className="w-full text-fg-subtle hover:text-fg">
            <LogOut className="w-4 h-4" />
            Sign out
          </Button>
        </Reveal>
      </div>
    </div>
  );
}
