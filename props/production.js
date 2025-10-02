// Configuración para entorno de producción
import { commonConfig } from "./common.js";

export const productionConfig = {
  ...commonConfig,

  // URLs específicas para producción
  baseUrl: "https://www.rtve.es/noticias/fosas",
  apiUrl: "https://www.rtve.es/noticias/fosas/api",

  // Configuraciones específicas de producción
  environment: "production",
  debug: false,

  // URLs públicas para assets
  assetsUrl: "https://www.rtve.es/noticias/fosas",

  // Configuraciones de mapas para producción
  map: {
    defaultCenter: [40.4168, -3.7038], // Madrid
    defaultZoom: 6,
  },

  // SEO específico para producción
  seo: {
    title: "Fosas Comunes - RTVE Noticias",
    description:
      "Aplicación para la visualización de fosas comunes de la Guerra Civil y la dictadura franquista en España",
    domain: "www.rtve.es",
    url: "https://www.rtve.es/noticias/fosas",
  },

  // Configuraciones adicionales para producción
  basePath: "/noticias/fosas",

  // Analytics y tracking para producción
  analytics: {
    enabled: true,
    gtmId: "GTM-XXXXXX", // Aquí iría el ID real de Google Tag Manager
  },
};
