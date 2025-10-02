// Configuración para entorno de local
import { commonConfig } from "./common.js";

export const localConfig = {
  ...commonConfig,

  // URLs específicas para local
  baseUrl: "http://localhost:3000",
  apiUrl: "http://localhost:3000/api",

  // Configuraciones específicas de local
  environment: "development",
  debug: true,

  // URLs públicas para assets
  assetsUrl: "http://localhost:3000",

  // Configuraciones de mapas para local
  map: {
    defaultCenter: [40.4168, -3.7038], // Madrid
    defaultZoom: 6,
  },

  // SEO específico para local
  seo: {
    title: "Fosas Comunes - local",
    description:
      "Aplicación para la visualización de fosas comunes - Entorno de desarrollo",
    domain: "localhost:3000",
    url: "http://localhost:3000",
  },
};
