import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Ignores strict TS errors during Vercel production builds
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignores lint errors during Vercel production builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;