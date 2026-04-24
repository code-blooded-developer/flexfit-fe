import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Move .next cache to local folder to avoid slow filesystem warnings
  // when project is on network drives
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
