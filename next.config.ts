import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/os", destination: "/os/index.html" }];
  },
};

export default nextConfig;
