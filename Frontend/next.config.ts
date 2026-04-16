import path from "node:path";
import type { NextConfig } from "next";

const frontendRoot = path.resolve(process.cwd());

const nextConfig: NextConfig = {
  outputFileTracingRoot: frontendRoot,
  turbopack: {
    root: frontendRoot,
  },
};

export default nextConfig;
