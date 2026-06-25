"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Reveal } from "@/components/shared/reveal";

const STORY_MOMENTS = [
  { emoji: "🌅", text: "The sunrise you nearly missed" },
  { emoji: "💧", text: "The lake no one else knew about" },
  { emoji: "🚗", text: "The drive that made you realize Switzerland is something else" },
  { emoji: "✨", text: "The night sky that made you go quiet" },
  { emoji: "🏔", text: "The view that stopped the conversation mid-sentence" },
];

export function EmotionalStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <section
      ref={containerRef}
      className="relative py-24 lg:py-40 overflow-hidden"
    >
      {/* Atmospheric background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          style={{ y }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 70% 80% at 60% 50%, rgba(81, 94, 255, 0.12) 0%, transparent 60%),
                radial-gradient(ellipse 50% 60% at 20% 60%, rgba(6, 8, 15, 0.8) 0%, transparent 50%),
                linear-gradient(180deg, var(--color-trail-950) 0%, rgba(11, 15, 28, 0.95) 50%, var(--color-trail-950) 100%)
              `,
            }}
          />
        </motion.div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center">
        <Reveal>
          <p className="t-eyebrow mb-8">The experience</p>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="t-display text-fg mb-8 max-w-3xl mx-auto">
            The places you&apos;ll still
            <br />
            talk about in{" "}
            <span className="text-alpine-300">ten years.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.25}>
          <p className="t-xl text-fg-muted max-w-2xl mx-auto mb-16 leading-relaxed">
            You know that feeling — standing somewhere so beautiful it&apos;s almost unreal.
            The kind of moment that makes you want to freeze time.
            <br /><br />
            These aren&apos;t just locations.
            They&apos;re the raw material of your best memories.
          </p>
        </Reveal>

        {/* Moments list */}
        <div className="flex flex-col max-w-lg mx-auto mb-16">
          {STORY_MOMENTS.map((moment, i) => (
            <Reveal key={moment.text} delay={0.35 + i * 0.1} direction="left">
              <div className="flex items-center gap-5 py-4 border-b border-white/[0.06] last:border-0 text-left">
                <span className="font-mono text-alpine-600 flex-shrink-0 tabular-nums" style={{ fontSize: 11 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-fg text-sm">{moment.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.9}>
          <p className="t-h3 text-stone-500 italic">
            &ldquo;Swiss Trails was the best summer of my life.&rdquo;
          </p>
          <p className="text-fg-subtle text-sm mt-3">— Noah K., Bern</p>
        </Reveal>
      </div>
    </section>
  );
}
