"use client";

import { motion } from "framer-motion";

import { Shield, Zap, Star, RefreshCw } from "lucide-react";

const MARQUEE_ITEMS = [
  "Hidden Lakes",
  "Secret Viewpoints",
  "Waterfalls",
  "Sunset Spots",
  "Night Sky",
  "Road Trips",
  "Photo Locations",
  "Gorges",
];

const TRUST_ITEMS = [
  { icon: Zap, label: "Instant access" },
  { icon: Shield, label: "Secure payment" },
  { icon: Star, label: "4.9 rating" },
  { icon: RefreshCw, label: "Monthly updates" },
];

export function SocialProof() {
  return (
    <section id="stats" className="relative py-6">
      {/* Stats row */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] rounded-xl overflow-hidden">
          {[
            { value: "3,200+", label: "Explorers" },
            { value: "500+", label: "Locations" },
            { value: "★ 4.9", label: "Average rating" },
            { value: "CHF 29", label: "One-time, forever" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center justify-center py-8 px-4 bg-trail-900"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <span className="text-2xl lg:text-3xl font-bold text-fg tracking-tight">
                {stat.value}
              </span>
              <span className="text-fg-subtle text-sm mt-1">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Marquee */}
      <div className="mt-8 overflow-hidden">
        <div className="flex animate-marquee gap-0">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-6 px-8 py-3 whitespace-nowrap flex-shrink-0"
            >
              <span className="text-stone-600 text-sm tracking-wide">{item}</span>
              <span className="w-px h-3 bg-stone-800 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Trust indicators */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-8">
        <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-alpine-500" />
              <span className="text-fg-subtle text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
