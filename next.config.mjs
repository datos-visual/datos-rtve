/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración base que se aplicará según APP_ENV en tiempo de ejecución
  // Por defecto usa desarrollo (sin basePath) si APP_ENV no está definido o es 'development'
  basePath:
    process.env.APP_ENV === "preproduction" ||
    process.env.APP_ENV === "production"
      ? "/noticias/fosas"
      : "",

  // Para assets estáticos, usar la misma configuración que basePath
  assetPrefix:
    process.env.APP_ENV === "preproduction" ||
    process.env.APP_ENV === "production"
      ? "/noticias/fosas"
      : "",

  // Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fotografias.larazon.es",
      },
      {
        protocol: "https",
        hostname: "www.rtve.es",
      },
      {
        protocol: "https",
        hostname: "img.rtve.es",
      },
    ],
  },

  // Variables de entorno públicas
  env: {
    APP_ENV: process.env.APP_ENV || "development",
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
    return [
      {
        source: "/embed/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
