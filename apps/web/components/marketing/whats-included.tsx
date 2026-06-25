"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Reveal } from "@/components/shared/reveal";
import { CATEGORIES } from "@/data/categories";
import { ArrowRight } from "lucide-react";

export function WhatsIncluded() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section id="whats-inside" className="py-24 lg:py-36">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div className="max-w-xl">
            <Reveal>
              <p className="t-eyebrow mb-4">What&apos;s inside</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="t-h1">
                Every type of
                <br />
                <span className="text-alpine-300">adventure.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <p className="t-body text-fg-muted max-w-md">
              50+ locations spanning 8 categories — every one researched, verified,
              and packed with everything you need to make the trip perfect.
            </p>
          </Reveal>
        </div>

        {/* Category grid */}
        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              className="group relative card-solid p-6 card-hover overflow-hidden cursor-default"
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.05 + i * 0.07,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {/* Background hover gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative z-10">
                <span className="text-3xl mb-4 block">{cat.icon}</span>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="t-h4 text-fg">{cat.name}</h3>
                  <span className="text-fg-subtle text-xs mt-0.5 ml-2 flex-shrink-0">
                    {cat.count} spots
                  </span>
                </div>
                <p className="t-sm text-fg-muted leading-relaxed">{cat.description}</p>

                <div className="mt-5 flex items-center gap-1 text-alpine-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <Reveal delay={0.3}>
          <div className="mt-12 text-center">
            <p className="text-fg-muted text-sm">
              + New locations added every month, included in your access
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
