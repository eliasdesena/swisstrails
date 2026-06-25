"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Reveal } from "@/components/shared/reveal";

const PAIN_POINTS = [
  {
    emoji: "😔",
    title: "Same places, every weekend",
    body: "Interlaken again? The Instagram crowd? You know Switzerland is incredible — but somehow you end up in the same ten spots every summer.",
  },
  {
    emoji: "⏳",
    title: "Summer slipping away",
    body: "June turns to September in a blink. How many weekends did you actually remember? How many times did you say 'I'll go next weekend'?",
  },
  {
    emoji: "🔍",
    title: "Hours of research, no results",
    body: "Down the rabbit hole of blog posts, Reddit threads, and half-baked Google Maps lists. You spend more time researching than actually going.",
  },
  {
    emoji: "🗺",
    title: "Missing the places worth finding",
    body: "The spots that become stories — the ones you talk about years later — are never the ones you stumble across. They take insider knowledge.",
  },
];

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="problem" className="py-24 lg:py-36 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-stone-800 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-16 lg:mb-24">
          <Reveal>
            <p className="t-eyebrow mb-4">The problem</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="t-h1 mb-6 text-fg">
              Every weekend
              <br />
              <span className="text-stone-500">feels the same.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="t-xl text-fg-muted max-w-lg">
              You know Switzerland is extraordinary. But somehow, you end up at the
              same crowded spots — scrolling through Instagram for inspiration that
              never comes.
            </p>
          </Reveal>
        </div>

        {/* Pain point grid */}
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6"
        >
          {PAIN_POINTS.map((point, i) => (
            <motion.div
              key={point.title}
              className="card-solid p-8 card-hover group"
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.65,
                delay: 0.1 + i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <span className="font-mono text-alpine-600 tracking-wider mb-5 block" style={{ fontSize: 11 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="t-h4 text-fg mb-3">{point.title}</h3>
              <p className="t-body text-fg-muted leading-relaxed">{point.body}</p>
            </motion.div>
          ))}
        </div>

        {/* Stat callout */}
        <Reveal delay={0.5}>
          <div className="mt-16 p-8 lg:p-12 border border-white/[0.08] rounded-3xl bg-trail-900/50 text-center">
            <p className="t-h2 text-fg mb-4">
              83% of people visit the{" "}
              <span className="text-stone-500">same 10 tourist spots</span>{" "}
              their entire lives.
            </p>
            <p className="t-body text-fg-muted">
              Switzerland has <span className="text-alpine-400 font-medium">500+ hidden gems</span> that most locals have never found.
            </p>
          </div>
        </Reveal>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-stone-800 to-transparent" />
    </section>
  );
}
