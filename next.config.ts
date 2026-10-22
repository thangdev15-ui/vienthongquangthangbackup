import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Legacy trailing-slash URLs should reach their final destination in one hop.
  skipTrailingSlashRedirect: true,
  images: {
    // Product/banner assets are already stored at their display-ready source URLs.
    // Avoid paying for a new optimizer transformation on every image request.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "www.pexels.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "vienthongquangthang.com" },
      { protocol: "https", hostname: "images.seeklogo.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
