export const MAPBOX_TOKEN =
  "pk.eyJ1IjoiZGF0b3NydHZlIiwiYSI6ImNrczV5YW9sdDI1azUyb3BqZW91ZGRhbzMifQ.0vdRqqdlTOWqrOtg7ldSNQ";

export const MAP_STYLE = "mapbox://styles/datosrtve/cmfuvuooo000501sb6z0ids6d";

// wwww: https://www.rtve.es/datos-repo/test-fosas/v2/guia-optimizado.json

// api: https://api.rtve.es/datos-repo/test-fosas/v2/guia-optimizado.json

// En desarrollo, añadimos un cache-buster; en producción permitimos caché HTTP/CDN
export const JSON_URL = `https://www.rtve.es/datos-repo/test-fosas/v5/guia-optimizado.json${process.env.NODE_ENV === 'development' ? `?${Date.now()}` : ''}`;

// pk.eyJ1IjoiZGF0b3NydHZlIiwiYSI6ImNtZHJjb2llZjBjazYya3I1N2E3YXFtc2QifQ.e3G_sQz3-YWOWI25jm6vkA

export const DEFAULT_FICHA_URL = "ficha.html";

export const APP_BASE_PATH = "/";

// --- Tilesets administrativos (para fitBounds invisible) ---
export const ADMIN_TILES = {
  ccaa: {
    url: "mapbox://datosrtve.4hzf5zvy",
    sourceLayer: "POL-CCAA-21ksqe", // nombre de layer dentro del tileset
  },
  provincias: {
    url: "mapbox://datosrtve.661bpwam",
    sourceLayer: "POL-PROVINCIAS-dynac0",
  },
  municipios: {
    url: "mapbox://datosrtve.796bp21x",
    sourceLayer: "POL-MUNICIPIOS-1dnw5v",
  },
  // Propiedad de atributo en los tiles con el código INSPIRE
  natcodeProp: "NATCODE", // en tus capturas aparece como NATCODE
};
