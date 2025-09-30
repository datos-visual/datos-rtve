/* lib/datos.js --------------------------------------------------------- */
import apiClient from "./axios.js";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon"; // submódulo directo [web:25][web:40]
import { point, polygon } from "@turf/helpers"; // helpers ESM soportados por Next [web:25][web:40]
import { JSON_URL } from "../../components/mapa/js/config.js"; // config local [web:38]
import { normId } from "../../components/mapa/js/utils.js"; // utilidades locales [web:38]

function normalizarLineasNarrativas(texto) {
  if (!texto) return []; // sin cambios lógicos [web:38]
  return String(texto)
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .map((s) => {
      if (s.includes("exhumación") || s.includes("exhumaciones"))
        return "exhumación temprana"; // mapping específico [web:38]
      if (s === "represaliado" || s === "represaliados") return "represión"; // mapping específico [web:38]
      if (s === "lugares") return "lugares"; // mapping específico [web:38]
      if (s === "objetos") return "objetos"; // mapping específico [web:38]
      if (s === "mujeres") return "mujeres"; // mapping específico [web:38]
      if (s === "personajes") return "personajes"; // mapping específico [web:38]
      return s; // fallback [web:38]
    })
    .filter(Boolean); // limpia vacíos [web:38]
}

export async function cargarFosas() {
  try {
    const response = await apiClient.get(JSON_URL);
    const raw = response.data;

    const { arrayOfArrays, propertiesMapping } = raw || {}; // desestructura con guardas [web:38]
    if (!Array.isArray(arrayOfArrays) || !Array.isArray(propertiesMapping)) {
      throw new Error("Formato inesperado en guia-optimizado.json"); // validación de esquema [web:38]
    }

    const rows = arrayOfArrays.map((fila) => {
      const obj = {}; // reconstrucción por mapping [web:38]
      propertiesMapping.forEach((key, i) => {
        obj[key] = fila[i] ?? null; // asignación segura [web:38]
      });
      return obj; // objeto por fila [web:38]
    });

    // Polígono simple de España para sanity-check geo
    const spain = polygon([
      [
        [-9.392, 43.791],
        [3.339, 43.757],
        [4.361, 36.0],
        [-8.684, 35.941],
        [-9.392, 43.791],
      ],
    ]); // helpers de Turf para GeoJSON [web:25]

    return rows.flatMap((r) => {
      const id = normId(r.id_datos ?? r.code); // id estable [web:38]
      const mun = r.municipality?.trim(); // municipio requerido [web:38]
      if (!id || !mun) return []; // descarta entradas inválidas [web:38]

      const lat = r.lat != null ? Number(String(r.lat).replace(",", ".")) : NaN; // normaliza latitud [web:38]
      const lon = r.lon != null ? Number(String(r.lon).replace(",", ".")) : NaN; // normaliza longitud [web:38]

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
        event_date: r.event_date ?? null,
        event_date_end: r.event_date_end ?? null,
        status: r.status_filtro?.trim() ?? null,
        linea_narrativa: r.linea_narrativa?.trim() ?? null,
        lineas: normalizarLineasNarrativas(r.linea_narrativa),
        n_buried: r.n_buried,
        detalle_linea_narrativa: r.detalle_linea_narrativa,
        fuente_info: r.fuente_info,
        fuente_enlace: r.fuente_enlace,
        url_ficha: "",
        isInDedalo: Boolean(r.isInDedalo),
        section_id: r.section_id ?? null,
        deposit_type: r.deposit_type ?? null,
      }; // conserva shape esperado por la app [web:38]

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return base; // sin coords válidas, devuelve base [web:38]

      const dentro = booleanPointInPolygon(point([lon, lat]), spain); // test geoespacial puntual [web:25]
      return dentro ? { ...base, lat, lon } : base; // añade coords si pasa el filtro [web:25]
    }); // devuelve array normalizado [web:38]
  } catch (error) {
    console.error("Error al cargar fosas:", error);
    throw new Error(`Error al cargar datos: ${error.message}`);
  }
}
