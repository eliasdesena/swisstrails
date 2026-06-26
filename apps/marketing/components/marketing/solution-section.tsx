"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { Reveal, Stagger } from "@/components/shared/reveal";
import { MapPin, Search, Heart, Smartphone, Droplets } from "lucide-react";

const FEATURES = [
  {
    icon: MapPin,
    title: "Every location researched",
    body: "Months of exploration distilled into precise coordinates, tips, and everything you need to make the trip perfect.",
  },
  {
    icon: Search,
    title: "Filter by what you want",
    body: "Hidden lakes, viewpoints, waterfalls, night sky spots — filter by category, difficulty, season, and region.",
  },
  {
    icon: Heart,
    title: "Save your favourites",
    body: "Build your personal adventure list. Plan multi-day trips. Never lose a spot you love.",
  },
  {
    icon: Smartphone,
    title: "Add to your home screen",
    body: "Mobile-first and installable as a web app — open it in your browser and tap 'Add to Home Screen' for one-tap access on the trail.",
  },
];

export function SolutionSection() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="solution" className="py-24 lg:py-36 bg-trail-900/40 scroll-mt-20 lg:scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Text side */}
          <div>
            <Reveal>
              <p className="t-eyebrow mb-4">The solution</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="t-h1 mb-6">
                Everything you need.
                <br />
                <span className="text-alpine-300">Nothing you don&apos;t.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="t-xl text-fg-muted mb-10 max-w-lg">
                Swiss Trails gives you instant access to the locations worth finding
                — without the research, without the crowded trails, without wasting
                another perfect weekend.
              </p>
            </Reveal>

            <div className="space-y-6">
              <Stagger initialDelay={0.3} staggerDelay={0.1} direction="left">
                {FEATURES.map((feature) => (
                  <div key={feature.title} className="flex gap-4">
                    <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <feature.icon className="w-4 h-4 text-stone-500" />
                    </div>
                    <div>
                      <h3 className="t-label text-fg mb-1">{feature.title}</h3>
                      <p className="t-sm text-fg-muted">{feature.body}</p>
                    </div>
                  </div>
                ))}
              </Stagger>
            </div>
          </div>

          {/* Visual side — app mockup */}
          <div ref={ref}>
            <motion.div
              className="relative"
              initial={reduce ? false : { opacity: 0, x: 40 }}
              animate={reduce || isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: reduce ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Phone mockup */}
              <div className="relative mx-auto max-w-sm">
                {/* Glow */}
                <div className="absolute inset-0 rounded-[40px] bg-alpine-900/20 blur-3xl scale-110" />

                {/* Phone frame */}
                <div className="relative bg-trail-800 rounded-[40px] border border-white/[0.1] shadow-2xl overflow-hidden aspect-[9/19]">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-6 pt-5 pb-3">
                    <span className="text-fg text-xs font-medium">9:41</span>
                    <div className="w-24 h-5 bg-trail-700 rounded-full" />
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-1.5 bg-fg rounded-sm" />
                    </div>
                  </div>

                  {/* Map area */}
                  <div className="mx-3 rounded-2xl overflow-hidden" style={{ height: "55%" }}>
                    <div
                      className="w-full h-full relative"
                      style={{
                        background: "linear-gradient(145deg, #0a1f0e 0%, #0d2918 30%, #112214 60%, #081008 100%)",
                      }}
                    >
                      {/* Simulated map roads */}
                      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 300 280">
                        <path d="M30 60 Q90 80 150 60 T270 90" stroke="#47A462" strokeWidth="1.5" fill="none" />
                        <path d="M0 140 Q60 120 120 150 T280 130" stroke="#47A462" strokeWidth="1" fill="none" />
                        <path d="M60 0 Q80 70 90 140 T110 280" stroke="#47A462" strokeWidth="1" fill="none" />
                        <path d="M180 0 Q170 80 165 140 T160 280" stroke="#47A462" strokeWidth="1" fill="none" />
                        <circle cx="150" cy="90" r="3" fill="#47A462" opacity="0.8" />
                        <circle cx="90" cy="140" r="3" fill="#47A462" opacity="0.8" />
                        <circle cx="200" cy="160" r="3" fill="#47A462" opacity="0.8" />
                      </svg>

                      {/* Simulated pins */}
                      {[
                        { x: "50%", y: "35%", active: true },
                        { x: "30%", y: "55%", active: false },
                        { x: "68%", y: "60%", active: false },
                      ].map((pos, i) => (
                        <div
                          key={i}
                          className="absolute"
                          style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -50%)" }}
                        >
                          <div className={`w-2.5 h-2.5 rounded-full shadow ${pos.active ? "bg-alpine-400" : "bg-stone-600/70"}`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom sheet preview */}
                  <div className="mt-3 mx-3 card-glass-strong rounded-xl p-4">
                    <div className="w-6 h-0.5 bg-stone-700 rounded-full mx-auto mb-3" />
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center">
                        <Droplets className="w-4 h-4 text-stone-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-fg text-sm font-medium">Hidden Alpine Lake</p>
                        <p className="text-stone-600 text-xs mt-0.5">Valais · 2,100m · Moderate</p>
                      </div>
                      <button className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center">
                        <Heart className="w-3.5 h-3.5 text-stone-600" />
                      </button>
                    </div>
                    <div className="mt-3 flex gap-1.5">
                      {["2h hike", "Swimming", "Photography"].map((tag) => (
                        <span key={tag} className="text-xs bg-white/[0.04] text-stone-500 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
