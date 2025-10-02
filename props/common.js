// Configuración común para todos los entornos
export const commonConfig = {
  // Configuraciones base que se aplicarán a todos los entornos
  projectName: "Fosas Comunes",
  version: "1.0.0",

  // Configuraciones de imágenes
  images: {
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
    ],
  },

  // Configuraciones de headers para embed
  embedHeaders: [
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
  ],

  // Rutas de la aplicación
  routes: {
    home: "/",
    mapa: "/mapa",
    historias: "/historias",
    embed: "/embed",
  },
};
