import type { NextConfig } from "next";

/**
 * Fixture mode serves `/api/v1` from route handlers, so the remote proxy has to
 * be dropped — rewrites are matched before the filesystem, and would otherwise
 * shadow every fixture.
 */
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "1";

const nextConfig: NextConfig = {
  // Move .next cache to local folder to avoid slow filesystem warnings
  // when project is on network drives
  outputFileTracingRoot: process.cwd(),
  output: "standalone",
  async rewrites() {
    if (USE_MOCKS) return [];

    return [
      {
        source: "/api/:path*",
        destination: "https://flexfit-rjw3.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
