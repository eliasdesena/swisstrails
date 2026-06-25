import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { MockBanner } from "@/components/shared/mock-banner";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://app.swiss-trails.com"),
  title: {
    default: "Swiss Trails",
    template: "%s | Swiss Trails",
  },
  description: "500+ hidden gems across Switzerland — explore the map, save your favourites.",
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
    <html lang="en" suppressHydrationWarning className={dmSans.variable}>
      <body className="bg-trail-950 text-fg antialiased">
        {children}
        <MockBanner />
      </body>
    </html>
  );
}
