// Configuración para entorno de desarrollo
import { commonConfig } from "./common.js";

export const developmentConfig = {
  ...commonConfig,

  // URLs específicas para desarrollo
  baseUrl: "http://localhost:3000",
  apiUrl: "http://localhost:3000/api",

  // Configuraciones específicas de desarrollo
  environment: "development",
  debug: true,

  // URLs públicas para assets
  assetsUrl: "http://localhost:3000",

  // Configuraciones de mapas para desarrollo
  map: {
    defaultCenter: [40.4168, -3.7038], // Madrid
    defaultZoom: 6,
  },

  // SEO específico para desarrollo
  seo: {
    title: "Fosas Comunes - Desarrollo",
    description:
      "Aplicación para la visualización de fosas comunes - Entorno de desarrollo",
    domain: "localhost:3000",
    url: "http://localhost:3000",
  },
};
