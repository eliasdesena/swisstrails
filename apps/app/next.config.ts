import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@swiss-trails/ui"],
  images: {
    // Serve images straight from the source CDN (Unsplash URLs are already
    // sized via ?w=&q=). This bypasses Vercel's Image Optimization so it
    // doesn't count against the free-plan image/transform quota.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react", "@swiss-trails/ui"],
  },
};

export default nextConfig;

