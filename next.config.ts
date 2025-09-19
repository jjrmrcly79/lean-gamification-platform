import type { NextConfig } from 'next';
// Importamos el tipo 'Configuration' directamente desde webpack
import type { Configuration } from 'webpack';

const nextConfig: NextConfig = {
  // Le indicamos a la función que el parámetro 'config' es de tipo 'Configuration'
  webpack: (config: Configuration) => {
    // Es buena práctica verificar si module y rules existen antes de usarlos
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