"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { TESTIMONIALS } from "@/data/testimonials";
import { cn } from "@/lib/utils";

function TestimonialCard({
  testimonial,
  index,
  isActive,
}: {
  testimonial: (typeof TESTIMONIALS)[0];
  index: number;
  isActive: boolean;
}) {
  return (
    <motion.div
      className={cn(
        "flex-shrink-0 w-full max-w-sm card-solid p-7 rounded-2xl transition-all duration-500",
        isActive
          ? "border-alpine-800/60 shadow-[0_0_40px_rgba(81,94,255,0.12)]"
          : "opacity-70"
      )}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Stars */}
      <div className="flex gap-1 mb-5">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star
            key={i}
            className="w-3.5 h-3.5 fill-gold-400 text-gold-400"
          />
        ))}
      </div>

      {/* Quote */}
      <p className="t-body text-fg-muted leading-relaxed mb-6">
        &ldquo;{testimonial.content}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-alpine-700 to-alpine-900 border border-alpine-700 flex items-center justify-center text-sm font-semibold text-alpine-200">
          {testimonial.name.charAt(0)}
        </div>
        <div>
          <p className="text-fg text-sm font-medium">{testimonial.name}</p>
          <p className="text-fg-subtle text-xs">
            {testimonial.city}
            {testimonial.age && `, ${testimonial.age}`}
          </p>
        </div>
        {testimonial.verified && (
          <div className="ml-auto">
            <span className="text-xs text-alpine-500 font-medium">✓ Verified</span>
          </div>
        )}
      </div>

      {testimonial.locationVisited && (
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <p className="text-fg-subtle text-xs">
            Visited: <span className="text-fg-muted">{testimonial.locationVisited}</span>
          </p>
        </div>
      )}
    </motion.div>
  );
}

export function Testimonials() {
  const [activeIndex] = useState(1);

  return (
    <section id="testimonials" className="py-24 lg:py-36 bg-trail-900/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Reveal>
            <p className="t-eyebrow mb-4">What explorers say</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="t-h1 mb-4">
              Real people.
              <br />
              <span className="text-alpine-300">Real adventures.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="t-body text-fg-muted max-w-md mx-auto">
              Over 3,200 explorers have already unlocked their best Swiss summers.
            </p>
          </Reveal>
        </div>

        {/* Testimonial cards — horizontal scroll */}
        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none">
          {TESTIMONIALS.map((t, i) => (
            <div key={t.id} className="snap-start flex-shrink-0 w-[320px]">
              <TestimonialCard
                testimonial={t}
                index={i}
                isActive={i === activeIndex}
              />
            </div>
          ))}
        </div>

        {/* Rating summary */}
        <Reveal delay={0.3}>
          <div className="mt-12 flex flex-col lg:flex-row items-center justify-center gap-8 py-8 border-y border-white/[0.06]">
            <div className="text-center">
              <p className="text-5xl font-bold text-fg tracking-tight">4.9</p>
              <div className="flex gap-1 justify-center mt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
                ))}
              </div>
              <p className="text-fg-subtle text-sm mt-1">Average rating</p>
            </div>
            <div className="hidden lg:block w-px h-16 bg-white/[0.07]" />
            <div className="text-center">
              <p className="text-5xl font-bold text-fg tracking-tight">3,200+</p>
              <p className="text-fg-subtle text-sm mt-3">Explorers this year</p>
            </div>
            <div className="hidden lg:block w-px h-16 bg-white/[0.07]" />
            <div className="text-center">
              <p className="text-5xl font-bold text-fg tracking-tight">98%</p>
              <p className="text-fg-subtle text-sm mt-3">Would recommend</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
