// Ejemplo de cómo usar la configuración en componentes
import {
  config,
  getFullUrl,
  getAssetUrl,
  isProduction,
} from "../props/index.js";

// Ejemplo de uso en un componente
export function ExampleComponent() {
  // Acceder a la configuración actual
  const currentEnvironment = config.environment;
  const baseUrl = config.baseUrl;
  const seoTitle = config.seo.title;

  // Usar funciones helper
  const homeUrl = getFullUrl("/");
  const logoUrl = getAssetUrl("/logo.png");

  // Lógica condicional por entorno
  const showDebugInfo = !isProduction();

  return (
    <div>
      <h1>{seoTitle}</h1>
      <p>Entorno actual: {currentEnvironment}</p>
      <p>URL base: {baseUrl}</p>

      {showDebugInfo && (
        <div>
          <p>Información de debug disponible en desarrollo</p>
        </div>
      )}

      <a href={homeUrl}>Ir al inicio</a>
      <img src={logoUrl} alt="Logo" />
    </div>
  );
}

// Ejemplo de uso en API routes o funciones del servidor
export async function getServerSideProps() {
  return {
    props: {
      environment: config.environment,
      baseUrl: config.baseUrl,
      seo: config.seo,
    },
  };
}

// Ejemplo de uso para generar URLs dinámicas
export function generateSitemapUrls() {
  const routes = [
    "/",
    "/mapa",
    "/historias",
    // ... más rutas
  ];

  return routes.map((route) => getFullUrl(route));
}
