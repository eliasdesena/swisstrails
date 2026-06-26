import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of Swiss Trails.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "26 June 2026";

const SECTIONS = [
  {
    title: "1. Your access & licence",
    body: [
      "Swiss Trails is sold as a one-time purchase that grants you lifetime access to the curated map and its location data, including new locations added over time. This licence is personal to you and is for your own non-commercial use.",
      "You may not resell, redistribute, scrape, or republish our location data, photos, or descriptions without our written permission.",
    ],
  },
  {
    title: "2. Refund guarantee",
    body: [
      "We stand behind our curation. If you visit 3 locations and genuinely don't love the experience, contact us and we'll give you a full refund — no questions asked. Refund requests are handled through Stripe.",
    ],
  },
  {
    title: "3. Accuracy & responsibility",
    body: [
      "We work hard to keep every location accurate, but conditions in the outdoors change. Trail status, access, weather, and safety can vary. Always check current conditions, prepare appropriately, and use your own judgement before setting out.",
      "Swiss Trails is a planning resource, not a substitute for proper preparation, navigation, or local guidance.",
    ],
  },
  {
    title: "4. Limitation of liability",
    body: [
      "Swiss Trails is provided \"as is.\" To the fullest extent permitted by law, we are not liable for any injury, loss, or damage arising from your use of the locations or information we provide. You explore at your own risk.",
    ],
  },
  {
    title: "5. Changes & contact",
    body: [
      "We may update these terms from time to time; the latest version always lives on this page. Questions? Email us at hello@swiss-trails.com.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-trail-950 text-fg">
      <div className="max-w-2xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
        <Link href="/" className="inline-flex group mb-12">
          <Logo
            iconClassName="text-alpine-500 group-hover:text-alpine-400 transition-colors"
            wordmarkClassName="text-fg"
          />
        </Link>

        <p className="t-eyebrow mb-4">Legal</p>
        <h1 className="t-h1 mb-4">Terms of Service</h1>
        <p className="text-fg-muted text-sm mb-12">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="t-h4 text-fg mb-3">{section.title}</h2>
              {section.body.map((p, i) => (
                <p
                  key={i}
                  className="t-body text-fg-muted leading-relaxed mb-3 last:mb-0"
                >
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/[0.06]">
          <Link
            href="/"
            className="text-alpine-400 hover:underline text-sm"
          >
            ← Back to Swiss Trails
          </Link>
        </div>
      </div>
    </main>
  );
}
