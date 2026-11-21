import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Legacy trailing-slash URLs should reach their final destination in one hop.
  skipTrailingSlashRedirect: true,
  images: {
    // Serve original CDN assets instead of creating Vercel Image Optimization
    // variants for every product image requested by visitors and crawlers.
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31_536_000,
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "www.pexels.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "vienthongquangthang.com" },
      { protocol: "https", hostname: "cdn.vienthongquangthang.com" },
      { protocol: "https", hostname: "images.seeklogo.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
