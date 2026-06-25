import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import { MockBanner } from "@/components/shared/mock-banner";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
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
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={spaceGrotesk.variable}>
      <body className="bg-trail-950 text-fg antialiased">
        {children}
        <MockBanner />
      </body>
    </html>
  );
}
