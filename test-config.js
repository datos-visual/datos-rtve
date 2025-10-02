// Test de configuración por entornos
import {
  config,
  getFullUrl,
  getAssetUrl,
  isProduction,
  isDevelopment,
  isPreproduction,
} from "./props/index.js";

console.log("=== CONFIGURACIÓN ACTUAL ===");
console.log("Entorno:", config.environment);
console.log("URL Base:", config.baseUrl);
console.log("Base Path:", config.basePath || "No definido");
console.log("Assets URL:", config.assetsUrl);
console.log("");

console.log("=== SEO ===");
console.log("Título:", config.seo.title);
console.log("Descripción:", config.seo.description);
console.log("Dominio:", config.seo.domain);
console.log("URL SEO:", config.seo.url);
console.log("");

console.log("=== HELPER FUNCTIONS ===");
console.log("URL completa home:", getFullUrl("/"));
console.log("URL completa mapa:", getFullUrl("/mapa"));
console.log("URL asset logo:", getAssetUrl("/logo.png"));
console.log("");

console.log("=== VERIFICACIÓN DE ENTORNO ===");
console.log("Es desarrollo:", isDevelopment());
console.log("Es preproducción:", isPreproduction());
console.log("Es producción:", isProduction());
console.log("");

console.log("=== VARIABLES DE ENTORNO ===");
console.log("APP_ENV:", process.env.APP_ENV || "No definido");
console.log("NODE_ENV:", process.env.NODE_ENV || "No definido");
