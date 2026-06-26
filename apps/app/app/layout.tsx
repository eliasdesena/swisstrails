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
  // "black-translucent" makes web content render behind the iOS status bar in
  // a standalone PWA (combined with viewport-fit=cover) — so the map can reach
  // the top edge. Top UI must respect env(safe-area-inset-top).
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Swiss Trails",
  },
};

export const viewport: Viewport = {
  themeColor: "#06080F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // The app is a native-style PWA shell — pinch-zooming the chrome (and the
  // map UI overlay) is unwanted. The map does its own zoom internally (Leaflet),
  // so browser zoom only causes a stuck, shifted-up layout. Disable it.
  maximumScale: 1,
  userScalable: false,
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
