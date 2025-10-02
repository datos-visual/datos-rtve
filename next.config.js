// Importar la configuración por entornos
import { config } from "./props/index.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurar basePath para entornos de preproducción y producción
  basePath: config.basePath || "",

  // Configurar assetPrefix para los assets estáticos
  assetPrefix: config.basePath || "",

  // Configuración de imágenes desde la configuración del entorno
  images: config.images,

  // Variables de entorno públicas
  env: {
    APP_ENV: process.env.APP_ENV || "development",
    BASE_URL: config.baseUrl,
    ASSETS_URL: config.assetsUrl,
  },

  webpack: (config, { isServer }) => {
    // Configuración para manejar dependencias de Node.js en el cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    return config;
  },

  // Configuración para permitir el embebido del mapa en sitios externos
  async headers() {
    return config.embedHeaders;
  },
};

export default nextConfig;
