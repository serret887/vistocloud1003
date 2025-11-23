import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Enable Fast Refresh
  reactStrictMode: true,
  // Use Turbopack for faster HMR (Next.js 16+)
  // Uncomment the line below if you want to use Turbopack
  // experimental: {
  //   turbo: {},
  // },
};

export default nextConfig;
