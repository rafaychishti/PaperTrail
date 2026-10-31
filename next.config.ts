import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  // Photos of working are resized in the browser, but allow some headroom.
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
};

export default nextConfig;
