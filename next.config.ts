import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for the minimal Docker standalone build
  output: "standalone",

  // Allow Yahoo Finance thumbnail images
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "s.yimg.com" },
      { protocol: "https", hostname: "media.zenfs.com" },
    ],
  },
};

export default nextConfig;
