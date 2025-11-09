import type { NextConfig } from "next";
import type { Configuration } from "webpack";

const nextConfig: NextConfig = {
  // 👇 Evita que errores de ESLint bloqueen la compilación en Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.qrserver.com",
        pathname: "/v1/create-qr-code/**",
      },
    ],
  },

  webpack: (config: Configuration) => {
    if (config.module?.rules) {
      config.module.rules.push({
        test: /pdf\.worker\.min\.js$/,
        type: "asset/resource",
        generator: {
          filename: "static/chunks/[name].[hash][ext]",
        },
      });
    }
    return config;
  },
};

export default nextConfig;


