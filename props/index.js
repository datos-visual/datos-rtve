// Gestor de configuración por entornos usando JSON
import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer el archivo config.json
let configData;
try {
  const configPath = join(__dirname, "config.json");
  const configFile = readFileSync(configPath, "utf8");
  configData = JSON.parse(configFile);
} catch (error) {
  console.error("Error al leer config.json:", error);
  // Configuración de fallback básica
  configData = {
    common: {
      projectName: "Fosas Comunes",
      version: "1.0.0",
    },
    development: {
      baseUrl: "http://localhost:3000",
      environment: "development",
      assetsUrl: "http://localhost:3000",
      seo: { title: "Fosas Comunes - Desarrollo" },
    },
  };
}

/**
 * Obtiene la configuración según el entorno actual
 * @returns {Object} Configuración del entorno actual
 */
function getConfig() {
  // Determinar el entorno actual
  // Prioridad: APP_ENV > NODE_ENV > default (development)
  const appEnv = process.env.APP_ENV;
  const nodeEnv = process.env.NODE_ENV;

  let environment;

  if (appEnv) {
    environment = appEnv.toLowerCase();
  } else if (nodeEnv === "production") {
    // Si NODE_ENV es production pero no hay APP_ENV, asumimos production
    environment = "production";
  } else {
    // Por defecto, development
    environment = "development";
  }

  // Obtener la configuración base común
  const commonConfig = configData.common || {};

  // Obtener la configuración específica del entorno
  // Regla: cualquier entorno distinto de 'development' usa producción (PRE = PROD)
  let envConfig;
  if (environment === 'development') {
    envConfig = configData.development || {};
  } else {
    envConfig = configData.production || {};
  }

  // Combinar configuración común con la específica del entorno
  return {
    ...commonConfig,
    ...envConfig,
  };
}

// Exportar la configuración actual
export const config = getConfig();

// Función helper para verificar el entorno actual
export const isProduction = () => config.environment === "production";
export const isPreproduction = () => config.environment === "preproduction";
export const isDevelopment = () => config.environment === "development";

// Función helper para obtener URLs completas
export const getFullUrl = (path = "") => {
  const basePath = config.basePath || "";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // Si ya tenemos basePath en baseUrl, no lo duplicamos
  if (config.baseUrl.includes(basePath) && basePath) {
    return `${config.baseUrl}${cleanPath}`;
  }

  return `${config.baseUrl}${basePath}${cleanPath}`;
};

// Función helper para obtener URLs de assets
export const getAssetUrl = (assetPath) => {
  const basePath = config.basePath || "";
  const cleanPath = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;

  // Si ya tenemos basePath en assetsUrl, no lo duplicamos
  if (config.assetsUrl.includes(basePath) && basePath) {
    return `${config.assetsUrl}${cleanPath}`;
  }

  return `${config.assetsUrl}${basePath}${cleanPath}`;
};
