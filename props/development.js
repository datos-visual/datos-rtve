// Configuración para entorno de development
import { commonConfig } from "./common.js";

export const developmentConfig = {
  ...commonConfig,

  // URLs específicas para development
  baseUrl: "https://www-pre.rtve.es/noticias/fosas",
  apiUrl: "https://www-pre.rtve.es/noticias/fosas/api",

  // Configuraciones específicas de development
  environment: "development",
  debug: false,

  // URLs públicas para assets
  assetsUrl: "https://www-pre.rtve.es/noticias/fosas",

  // Configuraciones de mapas para development
  map: {
    defaultCenter: [40.4168, -3.7038], // Madrid
    defaultZoom: 6,
  },

  // SEO específico para development
  seo: {
    title: "Fosas Comunes - RTVE Noticias",
    description:
      "Aplicación para la visualización de fosas comunes de la Guerra Civil y la dictadura franquista en España",
    domain: "www-pre.rtve.es",
    url: "https://www-pre.rtve.es/noticias/fosas",
  },

  // Configuraciones adicionales para development
  basePath: "/noticias/fosas",
};
