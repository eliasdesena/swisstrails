"use client";

import { Reveal } from "@/components/shared/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    q: "What exactly do I get?",
    a: "You get instant access to our curated map of 50+ handpicked locations across Switzerland. Each location includes photos, descriptions, insider tips, coordinates, difficulty ratings, best times to visit, what to bring, travel time estimates, and more. Everything you need, nothing you don't.",
  },
  {
    q: "Is this really a one-time payment?",
    a: "Yes. CHF 29 once, access forever. We add new locations regularly (usually 5–10 per month) and you automatically get them included — no additional cost, no subscription. Ever.",
  },
  {
    q: "Do I need special equipment or experience?",
    a: "Most locations are accessible with standard outdoor gear. Each location clearly states its difficulty level, what you'll need to bring, and how to get there. We have options for all fitness levels — from gentle 30-minute walks to full-day hikes.",
  },
  {
    q: "Can I use this on my phone?",
    a: "Absolutely. Swiss Trails is built mobile-first. It works seamlessly on iOS and Android through your browser — no app download needed. The map, location details, and your saved favourites all work perfectly on mobile.",
  },
  {
    q: "What if I don't have a car?",
    a: "Many locations are accessible by public transport — bus, train, or cable car. Each location has clear travel instructions including public transport options and journey times from major cities.",
  },
  {
    q: "How is this different from a regular hiking app?",
    a: "Swiss Trails isn't a hiking app. It's a curated collection of experiences — a mix of lakes, viewpoints, falls, drives, gorges, and night sky spots. Think less 'fitness tracker' and more 'insider guide from someone who spent years finding the good stuff.'",
  },
  {
    q: "What's your refund policy?",
    a: "We stand behind our curation completely. If you visit 3 locations and genuinely don't love the experience, we'll give you a full refund — no questions asked. We're that confident in what's inside.",
  },
  {
    q: "Are you adding more locations?",
    a: "Yes — we add 5–10 new locations every month. The map grows over time and you'll always have access to the latest additions with your one-time payment.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 lg:py-36">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left: header */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <p className="t-eyebrow mb-4">FAQ</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="t-h1 mb-6">
                Questions?
                <br />
                <span className="text-stone-500">Answered.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="t-body text-fg-muted max-w-sm">
                Everything you need to know before unlocking your best Swiss summer.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-10 p-6 card-solid rounded-xl">
                <p className="text-fg font-medium mb-2">Still have a question?</p>
                <p className="text-fg-muted text-sm mb-4">
                  Reach us at{" "}
                  <a
                    href="mailto:hello@swiss-trails.com"
                    className="text-alpine-400 hover:underline"
                  >
                    hello@swiss-trails.com
                  </a>
                </p>
                <p className="text-fg-subtle text-xs">
                  We reply within a few hours
                </p>
              </div>
            </Reveal>
          </div>

          {/* Right: accordion */}
          <Reveal delay={0.2} direction="none">
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-base">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
