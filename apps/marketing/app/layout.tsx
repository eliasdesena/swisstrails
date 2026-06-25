import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://swiss-trails.com"),
  title: {
    default: "Swiss Trails — Discover Switzerland's Hidden Gems",
    template: "%s | Swiss Trails",
  },
  description:
    "500+ handpicked locations across Switzerland — hidden lakes, secret viewpoints, and weekends you'll remember forever. One payment. Lifetime access.",
  keywords: [
    "Switzerland hiking",
    "hidden lakes Switzerland",
    "Swiss viewpoints",
    "weekend trips Switzerland",
    "nature Switzerland",
    "Swiss adventures",
    "hidden gems Switzerland",
  ],
  authors: [{ name: "Swiss Trails" }],
  creator: "Swiss Trails",
  openGraph: {
    type: "website",
    locale: "en_CH",
    url: "https://swiss-trails.com",
    siteName: "Swiss Trails",
    title: "Swiss Trails — Your Best Summer, Already Planned",
    description:
      "500+ handpicked locations across Switzerland. Hidden lakes, secret viewpoints, and weekends you'll remember forever.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Swiss Trails — Hidden gems across Switzerland" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Swiss Trails — Your Best Summer, Already Planned",
    description: "500+ handpicked locations across Switzerland. One payment. Lifetime access.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#06080F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={spaceGrotesk.variable}>
      <body className="bg-trail-950 text-fg antialiased">
        {children}
      </body>
    </html>
  );
}
