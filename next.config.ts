import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // For Static Export

  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.lapip.net",
        port: "",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "lapip.net",
        port: "",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
        pathname: "/uploads/**",
      },
    ],
  },

  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
    // Additional Sass options can go here
  },
};

export default nextConfig;
