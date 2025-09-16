/* js/datos.js --------------------------------------------------------- */
import * as turf from "https://cdn.jsdelivr.net/npm/@turf/turf@6.5.0/+esm";
import { JSON_URL } from "./config.js";
import { fetchJSON, normId } from "./utils.js";

/**
 * Normaliza la(s) línea(s) narrativa(s) a un array en minúsculas sin tildes/variantes.
 * Conserva compatibilidad con tus categorías.
 */
function normalizarLineasNarrativas(texto) {
  if (!texto) return [];
  // admite coma-separados
  return String(texto)
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .map((s) => {
      if (s.includes("exhumación") || s.includes("exhumaciones"))
        return "exhumación temprana";
      if (s === "represaliado" || s === "represaliados") return "represión";
      if (s === "lugares") return "lugares";
      if (s === "objetos") return "objetos";
      if (s === "mujeres") return "mujeres";
      if (s === "personajes") return "personajes";
      return s;
    })
    .filter(Boolean);
}

/**
 * Descarga guia-optimizado.json (arrayOfArrays + propertiesMapping),
 * lo normaliza y devuelve el array final (con/sin coords).
 */
export async function cargarFosas() {
  const raw = await fetchJSON(JSON_URL);

  const { arrayOfArrays, propertiesMapping } = raw || {};
  if (!Array.isArray(arrayOfArrays) || !Array.isArray(propertiesMapping)) {
    throw new Error("Formato inesperado en guia-optimizado.json");
  }

  // Convierte cada fila en objeto usando el mapping
  const rows = arrayOfArrays.map((fila) => {
    const obj = {};
    propertiesMapping.forEach((key, i) => {
      obj[key] = fila[i] ?? null;
    });
    return obj;
  });

  // Polígono simple de España para sanity-check geo (como antes)
  const spain = turf.polygon([
    [
      [-9.392, 43.791],
      [3.339, 43.757],
      [4.361, 36.0],
      [-8.684, 35.941],
      [-9.392, 43.791],
    ],
  ]);

  return rows.flatMap((r) => {
    const id = normId(r.id_datos ?? r.code);
    const mun = r.municipality?.trim();
    if (!id || !mun) return [];

    // lat/lon a Number
    const lat = r.lat != null ? Number(String(r.lat).replace(",", ".")) : NaN;
    const lon = r.lon != null ? Number(String(r.lon).replace(",", ".")) : NaN;

    // Mantén los “nombres clásicos” que usa la app
    const base = {
      id,
      municipio: mun,
      municipio_seo: r.municipality_seo ?? null,
      provincia: r.provincia?.trim() ?? null,
      provincia_seo: r.provincia_seo ?? null,
      ccaa: r.ccaa?.trim() ?? null,
      ccaa_seo: r.ccaa_seo ?? null,

      title: r.title?.trim() ?? null,
      title_seo: r.title_seo ?? null,

      // fechas
      event_date: r.event_date ?? null,
      event_date_end: r.event_date_end ?? null,

      // status mapeado desde status_filtro
      status: r.status_filtro?.trim() ?? null,

      // texto crudo y array normalizado
      linea_narrativa: r.linea_narrativa?.trim() ?? null,
      lineas: normalizarLineasNarrativas(r.linea_narrativa),

      // estos quizá no existan en esta fuente (quedan undefined)
      n_buried: r.n_buried,
      detalle_linea_narrativa: r.detalle_linea_narrativa,
      fuente_info: r.fuente_info,
      fuente_enlace: r.fuente_enlace,

      // utilidades
      url_ficha: "",
      isInDedalo: Boolean(r.isInDedalo),
      section_id: r.section_id ?? null,
      deposit_type: r.deposit_type ?? null,
    };

    // Si no hay coords válidas, devolvemos el objeto base (como hacía el antiguo)
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return base;

    // Con coords válidas: sólo si caen dentro del polígono
    const dentro = turf.booleanPointInPolygon(turf.point([lon, lat]), spain);
    return dentro ? { ...base, lat, lon } : base;
  });
}

// /* js/datos.js --------------------------------------------------------- */
// import * as turf from "https://cdn.jsdelivr.net/npm/@turf/turf@6.5.0/+esm";
// import { JSON_URL } from "./config.js";
// import { fetchJSON, normId } from "./utils.js";

// /**
//  * Descarga guia-optimizado.json (arrayOfArrays + propertiesMapping),
//  * lo normaliza a objetos y devuelve el array final (con/sin coords).
//  */
// export async function cargarFosas() {
//   const raw = await fetchJSON(JSON_URL);

//   const { arrayOfArrays, propertiesMapping } = raw || {};
//   if (!Array.isArray(arrayOfArrays) || !Array.isArray(propertiesMapping)) {
//     throw new Error("Formato inesperado en guia-optimizado.json");
//   }

//   // Convierte cada fila en objeto usando el mapping
//   const rows = arrayOfArrays.map((fila) => {
//     const obj = {};
//     propertiesMapping.forEach((key, i) => {
//       obj[key] = fila[i] ?? null;
//     });
//     return obj;
//   });

//   const spain = turf.polygon([
//     [
//       [-9.392, 43.791],
//       [3.339, 43.757],
//       [4.361, 36.0],
//       [-8.684, 35.941],
//       [-9.392, 43.791],
//     ],
//   ]);

//   return rows.flatMap((r) => {
//     // id normalizado (compat con código existente)
//     const id = normId(r.id_datos ?? r.code);
//     const mun = r.municipality?.trim();
//     if (!id || !mun) return [];

//     // lat/lon como Number
//     const lat = r.lat != null ? Number(String(r.lat).replace(",", ".")) : NaN;
//     const lon = r.lon != null ? Number(String(r.lon).replace(",", ".")) : NaN;

//     const base = {
//       id,
//       // nombres “clásicos” usados por la app
//       municipio: mun,
//       municipio_seo: r.municipality_seo ?? null,
//       provincia: r.provincia?.trim() ?? null,
//       provincia_seo: r.provincia_seo ?? null,
//       ccaa: r.ccaa?.trim() ?? null,
//       ccaa_seo: r.ccaa_seo ?? null,

//       title: r.title?.trim() ?? null,
//       title_seo: r.title_seo ?? null,

//       event_date: r.event_date ?? null,
//       event_date_end: r.event_date_end ?? null,

//       // En el JSON se llama status_filtro
//       status: r.status_filtro?.trim() ?? null,

//       linea_narrativa: r.linea_narrativa?.trim() ?? null,

//       // Estos quizá no existan en esta fuente (quedarán undefined)
//       n_buried: r.n_buried,
//       detalle_linea_narrativa: r.detalle_linea_narrativa,
//       fuente_info: r.fuente_info,
//       fuente_enlace: r.fuente_enlace,

//       // utilidades
//       url_ficha: `ficha${id}.html`,
//       isInDedalo: Boolean(r.isInDedalo),
//       section_id: r.section_id ?? null,
//       deposit_type: r.deposit_type ?? null,
//     };

//     // Si no hay coordenadas válidas, devolvemos el objeto sin lat/lon
//     if (!Number.isFinite(lat) || !Number.isFinite(lon)) return base;

//     // Filtro geográfico (por seguridad)
//     const dentro = turf.booleanPointInPolygon(turf.point([lon, lat]), spain);
//     return dentro ? { ...base, lat, lon } : [];
//   });
// }
