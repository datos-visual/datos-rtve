/** @type {import('next').NextConfig} */

// Función para obtener la configuración de assets según el entorno
const getAssetConfig = () => {
  const env = process.env.APP_ENV;

  switch (env) {
    case "preproduction":
      return {
        basePath: "/noticias/fosas",
        assetPrefix: "https://css-pre.rtve.es/css",
      };
    case "production":
      return {
        basePath: "/noticias/fosas",
        assetPrefix: "https://css.rtve.es/css",
      };
    default:
      // Desarrollo (development o undefined)
      return {
        basePath: "",
        assetPrefix: "",
      };
  }
};

const assetConfig = getAssetConfig();

const nextConfig = {
  // Configuración base que se aplicará según APP_ENV en tiempo de ejecución
  basePath: assetConfig.basePath,

  // Para assets estáticos (CSS, JS), usar URLs específicas de RTVE
  assetPrefix: assetConfig.assetPrefix,

  // Configuración de imágenes
  images: {
    // Loader personalizado para manejar imágenes según el entorno
    loader:
      process.env.APP_ENV === "preproduction" ||
      process.env.APP_ENV === "production"
        ? "custom"
        : "default",
    loaderFile: "./lib/imageLoader.js",

    // Configuración de dominios remotos permitidos
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
      {
        protocol: "https",
        hostname: "img-pre.rtve.es",
      },
      {
        protocol: "https",
        hostname: "css-pre.rtve.es",
      },
      {
        protocol: "https",
        hostname: "css.rtve.es",
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
