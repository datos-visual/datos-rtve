/** @type {import('next').NextConfig} */

import { createRequire } from 'module'
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const require = createRequire(import.meta.url)
const propsPackage = require('./package.json')

// Obtener directorio actual y leer package.json para versión
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf8"));

// Leer configuración de props
const propsConfig = JSON.parse(readFileSync(join(__dirname, "props", "config.json"), "utf8"));

// Función para obtener la configuración de assets según el entorno
const getAssetConfig = () => {
  const env = process.env.APP_ENV || "development";
  
  // Obtener configuración del entorno actual
  const envConfig = propsConfig[env] || propsConfig.development;

  return {
    basePath: envConfig.basePath || "",
    assetPrefix: "", // Se establecerá después de crear nextConfig
  };
};

const assetConfig = getAssetConfig();

const nextConfig = {
  // Configuración base que se aplicará según APP_ENV en tiempo de ejecución
  basePath: assetConfig.basePath,

  // Para assets estáticos (CSS, JS), usar URLs específicas de RTVE
  // assetPrefix se establecerá después de crear nextConfig

  // Asegurar que las URLs terminen en barra (/)
  trailingSlash: true,

  // Build ID basado en la versión del package.json para control de versiones
  generateBuildId: async () => {
    return packageJson.version;
  },

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
      {
        protocol: "https",
        hostname: "js.rtve.es",
      },
      {
        protocol: "https",
        hostname: "js-pre.rtve.es",
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

// Establecer assetPrefix usando la fórmula estándar de RTVE
// Obtener el dominio JS del entorno actual
const env = process.env.APP_ENV || "development";
const envConfig = propsConfig[env] || propsConfig.development;
const jsDomain = envConfig.domains?.js || "";

// Solo establecer assetPrefix si hay dominio JS (no en desarrollo)
if (jsDomain) {
  nextConfig.assetPrefix = `${jsDomain}/pages/${propsPackage.distName}/${propsPackage.version}`;
}

export default nextConfig;
