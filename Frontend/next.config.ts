import path from "node:path";
import type { NextConfig } from "next";

const frontendRoot = path.resolve(process.cwd());

const backendRemotePattern = (() => {
  try {
    const { protocol, hostname, port } = new URL(
      process.env.BACKEND_URL ?? "http://127.0.0.1:8000",
    );
    return {
      protocol: protocol.replace(":", "") as "http" | "https",
      hostname,
      ...(port ? { port } : {}),
    };
  } catch {
    return { protocol: "http" as const, hostname: "127.0.0.1", port: "8000" };
  }
})();

const nextConfig: NextConfig = {
  outputFileTracingRoot: frontendRoot,
  turbopack: {
    root: frontendRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      backendRemotePattern,
    ],
  },
};

export default nextConfig;
