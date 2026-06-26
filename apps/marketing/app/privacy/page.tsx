import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Swiss Trails collects, uses, and protects your data.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "26 June 2026";

const SECTIONS = [
  {
    title: "1. What data we collect",
    body: [
      "When you purchase access to Swiss Trails, we collect the information needed to create and manage your account: your email address and basic account details. Payments are processed by Stripe — we never see or store your full card number.",
      "We may also collect anonymous usage data (such as which locations are viewed) to improve the product. This is not linked to your identity.",
    ],
  },
  {
    title: "2. How we use your data",
    body: [
      "We use your data to deliver your purchase, give you access to the map, send you essential account and product emails, and improve Swiss Trails over time. We do not sell your personal data to third parties.",
    ],
  },
  {
    title: "3. Cookies",
    body: [
      "We use a small number of essential cookies to keep you logged in and to remember your preferences. We may use privacy-friendly analytics to understand how the site is used in aggregate. You can disable cookies in your browser, though some features may stop working.",
    ],
  },
  {
    title: "4. Data retention & your rights",
    body: [
      "We keep your account data for as long as your account is active. You can request a copy of your data, or ask us to delete it, at any time by contacting us.",
    ],
  },
  {
    title: "5. Contact",
    body: [
      "Questions about your privacy? Email us at hello@swiss-trails.com and we'll get back to you within a few hours.",
    ],
  },
];

export default function PrivacyPage() {
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
        <h1 className="t-h1 mb-4">Privacy Policy</h1>
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
