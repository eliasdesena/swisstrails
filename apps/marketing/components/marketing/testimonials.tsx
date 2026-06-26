"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { TESTIMONIALS } from "@/data/testimonials";
import { cn } from "@/lib/utils";

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: (typeof TESTIMONIALS)[0];
  index: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cn(
        "h-full w-full card-solid p-6 lg:p-7 rounded-xl"
      )}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : Math.min(index * 0.08, 0.3), ease: [0.16, 1, 0.3, 1] }}
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
        <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-xs font-semibold text-stone-400">
          {testimonial.name.charAt(0)}
        </div>
        <div>
          <p className="text-fg text-sm font-medium">{testimonial.name}</p>
          <p className="text-fg-muted text-xs">
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
        <div className="mt-4 pt-3">
          <p className="text-fg-muted text-xs">
            Visited: <span className="text-fg-muted">{testimonial.locationVisited}</span>
          </p>
        </div>
      )}
    </motion.div>
  );
}

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 lg:py-36 bg-trail-900/30 scroll-mt-20 lg:scroll-mt-24">
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

        {/* Testimonial cards — snap-scroll on mobile, grid on desktop */}
        <div
          className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0 lg:[mask-image:none] lg:[-webkit-mask-image:none]"
        >
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.id}
              className="snap-start flex-shrink-0 w-[82vw] max-w-[340px] lg:w-auto lg:max-w-none"
            >
              <TestimonialCard testimonial={t} index={i} />
            </div>
          ))}
        </div>

        {/* Rating summary */}
        <Reveal delay={0.3}>
          <div className="mt-12 flex flex-col lg:flex-row items-center justify-center gap-8 py-8">
            <div className="text-center">
              <p className="text-5xl font-bold text-fg tracking-tight">4.9</p>
              <div className="flex gap-1 justify-center mt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
                ))}
              </div>
              <p className="text-fg-muted text-sm mt-1">Average rating</p>
            </div>
            <div className="hidden lg:block w-px h-16 bg-white/[0.07]" />
            <div className="text-center">
              <p className="text-5xl font-bold text-fg tracking-tight">3,200+</p>
              <p className="text-fg-muted text-sm mt-3">Explorers this year</p>
            </div>
            <div className="hidden lg:block w-px h-16 bg-white/[0.07]" />
            <div className="text-center">
              <p className="text-5xl font-bold text-fg tracking-tight">98%</p>
              <p className="text-fg-muted text-sm mt-3">Would recommend</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
