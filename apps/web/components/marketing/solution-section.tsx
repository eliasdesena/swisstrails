"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Reveal, Stagger } from "@/components/shared/reveal";
import { MapPin, Search, Heart, Route } from "lucide-react";

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
    icon: Route,
    title: "Works offline on mobile",
    body: "No signal in the mountains? Every saved location works offline. Your adventures don't stop when the signal does.",
  },
];

export function SolutionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="solution" className="py-24 lg:py-36 bg-trail-900/40">
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
                    <div className="w-10 h-10 rounded-xl bg-alpine-900 border border-alpine-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <feature.icon className="w-4.5 h-4.5 text-alpine-400" />
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
              initial={{ opacity: 0, x: 40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
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
                        { x: "50%", y: "35%" },
                        { x: "30%", y: "55%" },
                        { x: "68%", y: "60%" },
                      ].map((pos, i) => (
                        <motion.div
                          key={i}
                          className="absolute flex flex-col items-center"
                          style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -100%)" }}
                          animate={{ y: [0, -4, 0] }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.8,
                            ease: "easeInOut",
                          }}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 border-trail-900 shadow-lg flex items-center justify-center text-xs ${i === 0 ? "bg-alpine-400" : "bg-stone-600"}`}>
                            {i === 0 ? "💧" : "•"}
                          </div>
                          <div className="w-0.5 h-2 bg-alpine-400 opacity-60" />
                          <div className="w-1 h-1 bg-alpine-400 rounded-full opacity-40" />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom sheet preview */}
                  <div className="mt-3 mx-3 card-glass-strong rounded-2xl p-4">
                    <div className="w-8 h-1 bg-stone-600 rounded-full mx-auto mb-3" />
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-alpine-900/60 border border-alpine-800 flex items-center justify-center text-xl">
                        💧
                      </div>
                      <div className="flex-1">
                        <p className="text-fg text-sm font-medium">Hidden Alpine Lake</p>
                        <p className="text-fg-subtle text-xs mt-0.5">Valais · 2,100m · Moderate</p>
                      </div>
                      <motion.button
                        className="w-8 h-8 rounded-full bg-trail-700 border border-white/[0.1] flex items-center justify-center"
                        whileTap={{ scale: 0.9 }}
                      >
                        <Heart className="w-3.5 h-3.5 text-fg-muted" />
                      </motion.button>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {["2h hike", "Swimming", "Photography"].map((tag) => (
                        <span key={tag} className="text-xs bg-trail-700 text-fg-subtle px-2 py-1 rounded-full">
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
