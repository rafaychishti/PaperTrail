import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Photos of working are resized in the browser, but allow some headroom.
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
};

export default nextConfig;
