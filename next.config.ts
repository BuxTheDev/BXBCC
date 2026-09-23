import type { NextConfig } from "next";
const workspaceRoutes = ["/", "/os", "/command", "/today", "/fronts", "/goals", "/tasks", "/review", "/entities", "/assets", "/money", "/contacts", "/deals", "/documents", "/capture", "/settings"];
const nextConfig: NextConfig = {
  async rewrites() {
    return { beforeFiles: workspaceRoutes.map(source => ({ source, destination: "/os/index.html" })) };
  },
  async redirects() {
    return [
      {source:"/people/:path*",destination:"/contacts",permanent:false},
      {source:"/portfolio/:path*",destination:"/assets",permanent:false},
      {source:"/ventures/:path*",destination:"/fronts",permanent:false},
      {source:"/organizations",destination:"/contacts",permanent:false},
      {source:"/contacts/:id",destination:"/contacts",permanent:false},
      {source:"/deals/:id",destination:"/deals",permanent:false}
    ];
  }
};
export default nextConfig;
