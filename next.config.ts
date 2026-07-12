import type { NextConfig } from "next";
import os from "os";
import path from "path";

// Build output outside "Uday's Portable" — apostrophes in the project path
// corrupt webpack chunks on external drives (e.g. Cannot find module './749.js').
export const NEXT_DIST_DIR = path.join(os.tmpdir(), "transitops-next");

const nextConfig: NextConfig = {
  distDir: NEXT_DIST_DIR,
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
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
