import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Move .next cache to local folder to avoid slow filesystem warnings
  // when project is on network drives
  outputFileTracingRoot: process.cwd(),
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://flexfit-rjw3.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
