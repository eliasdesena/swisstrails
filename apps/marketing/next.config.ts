import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@swiss-trails/ui"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react", "@swiss-trails/ui"],
  },
};

export default nextConfig;
