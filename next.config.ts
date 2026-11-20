import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    localPatterns: [
      {
        pathname: "/icons/**",
        search: "",
      },
      {
        pathname: "/images/branding/hero-hoodie.png",
        search: "?v=2",
      },
    ],
  },
  experimental: {
    agentUpgrade: "security",
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
