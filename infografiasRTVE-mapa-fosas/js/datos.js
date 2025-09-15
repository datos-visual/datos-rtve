/* js/datos.js --------------------------------------------------------- */
import * as turf from "https://cdn.jsdelivr.net/npm/@turf/turf@6.5.0/+esm";
import { JSON_URL } from "./config.js";
import { fetchJSON, normId } from "./utils.js";

// Mapeo de índices del array
const CAMPOS = {
  ccaa: 0,
  ccaa_seo: 1,
  code: 2,
  deposit_type: 3,
  event_date: 4,
  event_date_end: 5,
  id_datos: 6,
  isInDedalo: 7,
  lat: 8,
  linea_narrativa: 9,
  lon: 10,
  municipality: 11,
  municipality_seo: 12,
  provincia: 13,
  provincia_seo: 14,
  ref_interventions_date_start: 15,
  ref_interventions_date_end: 16,
  section_id: 17,
  title: 18,
  title_seo: 19,
};

/**
 * Descarga el JSON optimizado, depura y devuelve
 * un array de fosas con campos clave y coordenadas
 */
export async function cargarFosas() {
  const raw = await fetchJSON(JSON_URL);
  const fosas = [];

  function normalizarLineasNarrativas(texto) {
    if (!texto) return [];
    return texto
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

  for (const r of raw.arrayOfArrays) {
    const id = normId(r[CAMPOS.id_datos]);
    const lat = +(r[CAMPOS.lat] || "").replace(",", ".");
    const lon = +(r[CAMPOS.lon] || "").replace(",", ".");
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    const lineas = normalizarLineasNarrativas(r[CAMPOS.linea_narrativa]);

    fosas.push({
      id,
      municipio: r[CAMPOS.municipality]?.trim() || "",
      title: r[CAMPOS.title]?.trim() || "",
      provincia: r[CAMPOS.provincia]?.trim() || "",
      lineas,
      isInDedalo: r[CAMPOS.isInDedalo] === true,
      url_ficha: `ficha${id}.html`,
      lat,
      lon,
    });
  }

  return fosas;
}