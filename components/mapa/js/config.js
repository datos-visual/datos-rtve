export const MAPBOX_TOKEN =
  "pk.eyJ1IjoiZGF0b3NydHZlIiwiYSI6ImNrczV5YW9sdDI1azUyb3BqZW91ZGRhbzMifQ.0vdRqqdlTOWqrOtg7ldSNQ";

export const MAP_STYLE = "mapbox://styles/datosrtve/cmfuvuooo000501sb6z0ids6d";

// wwww: https://www.rtve.es/datos-repo/test-fosas/v2/guia-optimizado.json

// api: https://api.rtve.es/datos-repo/test-fosas/v2/guia-optimizado.json

// En desarrollo, añadimos un cache-buster; en producción permitimos caché HTTP/CDN
export const JSON_URL = `https://www.rtve.es/datos-repo/test-fosas/v3/guia-optimizado.json${process.env.NODE_ENV === 'development' ? `?${Date.now()}` : ''}`;

// pk.eyJ1IjoiZGF0b3NydHZlIiwiYSI6ImNtZHJjb2llZjBjazYya3I1N2E3YXFtc2QifQ.e3G_sQz3-YWOWI25jm6vkA
