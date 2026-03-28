import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/test-results/**",
          "**/playwright-report/**",
          "**/tests/**",
          "**/node_modules/**",
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
