import type { NextConfig } from "next";

/**
 * Static export for Cloudflare Pages.
 * `npm run build` writes a fully static site to `out/` — no Node server required.
 * NEXT_PUBLIC_BASE_PATH is optional (only needed when hosting under a sub-path).
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  // A stray package-lock.json in the user home folder confused workspace-root detection.
  outputFileTracingRoot: process.cwd(),
  transpilePackages: ["three"],
};

export default nextConfig;
