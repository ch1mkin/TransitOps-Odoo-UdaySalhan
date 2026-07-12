import type { NextConfig } from "next";
import path from "path";

const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  // Keep .next inside the project. A remote distDir (/tmp) breaks the RSC client
  // manifest in dev (segment-explorer-node / __webpack_modules__ errors).
  serverExternalPackages: ["zod"],
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Avoid stale chunks on external volumes and paths with special characters.
      config.cache = false;
      config.snapshot = {
        ...config.snapshot,
        managedPaths: [],
      };
      // Polling helps external/USB volumes where native file events are unreliable.
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 600,
        ignored: ["**/.git/**", "**/node_modules/**"],
      };
    }

    // Normalize resolution from the project root (helps apostrophe paths on external drives).
    config.resolve = {
      ...config.resolve,
      symlinks: true,
      modules: [
        path.join(projectRoot, "node_modules"),
        ...(config.resolve?.modules ?? ["node_modules"]),
      ],
    };

    return config;
  },
};

export default nextConfig;
