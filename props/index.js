// Gestor de configuración por entornos
import { localConfig } from "./local.js";
import { developmentConfig } from "./development.js";
import { productionConfig } from "./production.js";

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
    // Por defecto, local
    environment = "local";
  }

  // Devolver la configuración según el entorno
  switch (environment) {
    case "local":
      return localConfig;

    case "development":
    case "pre":
      return developmentConfig;

    case "production":
    case "prod":
      return productionConfig;

    default:
      console.warn(
        `Entorno '${environment}' no reconocido. Usando configuración de desarrollo.`
      );
      return localConfig;
  }
}

// Exportar la configuración actual
export const config = getConfig();

// Exportar también las configuraciones individuales por si se necesitan
export { localConfig, developmentConfig, productionConfig };

// Función helper para verificar el entorno actual
export const isProduction = () => config.environment === "production";
export const isdevelopment = () => config.environment === "development";
export const isLocal = () => config.environment === "local";

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
