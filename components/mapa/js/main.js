// main.js
// ————————————————————————————————————————————————————————————
// Ensambla el mapa: datos, capas, toolbar, controles externos (geocoder,
// leyenda, botones de navegación) y resolución de rutas SEO.
// ————————————————————————————————————————————————————————————

import { initMap } from "./initMap.js";
import { cargarFosas } from "./datos.js";
import { parseSeoPath, setCanonicalPathOnly } from "./utils.js";
import { abrirFicha } from "./overlay.js";
//import { APP_BASE_PATH } from "./config.js";
import { APP_BASE_PATH, ADMIN_TILES } from "./config.js";
import { montarCapaFosas, actualizarDatosFosas } from "./layers.js";
import { initToolbar } from "./filters.js";

import { createGeocoder, externalGeocoderFactory } from "./geocoder.js";
import { addLegend } from "./legend.js";
import { addNavButtons } from "./navButtons.js";

// Exponer para consola (solo debug)
window.ADMIN_TILES = ADMIN_TILES;

//--------------------------------------------------------//
//                          Utils
//--------------------------------------------------------//

const d = (...args) => console.debug("[MAPA]", ...args);

// Normaliza ruta SEO con lower y sin trailing slash
function normalizeSeoPath(p) {
  if (!p) return "/";
  const s = String(p).trim().toLowerCase();
  return s.endsWith("/") && s !== "/" ? s.slice(0, -1) : s;
}

// Slug de un campo (acepta dobles claves por compat)
function slug(f, a, b) {
  const v = f?.[a] ?? f?.[b] ?? "";
  return String(v)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const urlSeoOf = (f) =>
  f?.url_seo ||
  `/${slug(f, "ccaaSeo", "ccaa_seo")}/${slug(
    f,
    "provinciaSeo",
    "provincia_seo"
  )}/${slug(f, "municipioSeo", "municipality_seo")}/${slug(
    f,
    "tituloSeo",
    "title_seo"
  )}`.toLowerCase();

function buildIndexBySeo(rows) {
  const idx = new Map();
  for (const f of rows) idx.set(normalizeSeoPath(urlSeoOf(f)), f);
  return idx;
}

function computeBounds(rows) {
  const pts = rows
    .map((r) => [Number(r.lon), Number(r.lat)])
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (!pts.length) return null;
  let [w, s] = pts[0],
    [e, n] = pts[0];
  for (const [x, y] of pts) {
    if (x < w) w = x;
    if (x > e) e = x;
    if (y < s) s = y;
    if (y > n) n = y;
  }
  return [
    [w, s],
    [e, n],
  ];
}

// ----------------------------------------------------------
// Fuentes/capas “ghost” para poder consultar tiles admin
// ----------------------------------------------------------
function ensureAdminSources(map) {
  const style = map.getStyle();
  const has = (id) => !!style.sources?.[id];

  // CCAA
  if (!has("ccaa-source")) {
    map.addSource("ccaa-source", {
      type: "vector",
      url: ADMIN_TILES.ccaa.url,
    });
  }
  if (!map.getLayer("ccaa-source-ghost")) {
    map.addLayer({
      id: "ccaa-source-ghost",
      type: "fill",
      source: "ccaa-source",
      "source-layer": ADMIN_TILES.ccaa.sourceLayer,
      paint: { "fill-opacity": 0 },
    });
  }

  // PROVINCIAS
  if (!has("prov-source")) {
    map.addSource("prov-source", {
      type: "vector",
      url: ADMIN_TILES.provincias.url,
    });
  }
  if (!map.getLayer("prov-source-ghost")) {
    map.addLayer({
      id: "prov-source-ghost",
      type: "fill",
      source: "prov-source",
      "source-layer": ADMIN_TILES.provincias.sourceLayer,
      paint: { "fill-opacity": 0 },
    });
  }

  // MUNICIPIOS
  if (!has("mun-source")) {
    map.addSource("mun-source", {
      type: "vector",
      url: ADMIN_TILES.municipios.url,
    });
  }
  if (!map.getLayer("mun-source-ghost")) {
    map.addLayer({
      id: "mun-source-ghost",
      type: "fill",
      source: "mun-source",
      "source-layer": ADMIN_TILES.municipios.sourceLayer,
      paint: { "fill-opacity": 0 },
    });
  }
}

// Devuelve las features renderizadas de una capa concreta.
// Importante: usamos las capas -ghost que están visibles (opacidad 0).
function getRenderedFeatures(map, layerId) {
  try {
    return map.queryRenderedFeatures({ layers: [layerId] }) || [];
  } catch (e) {
    console.error("[tiles] queryRenderedFeatures error en", layerId, e);
    return [];
  }
}

// Normaliza texto a slug SEO (para comparar con NAMEUNIT)
function toSeoName(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getFeatureNameSeo(ft) {
  const name =
    ft?.properties?.NAMEUNIT || ft?.properties?.Text || ft?.properties?.name;
  return toSeoName(name);
}

// Busca por NATCODE en las SOURCE FEATURES (no render-features)
function findFeatureByNatcode(
  map,
  sourceId,
  sourceLayer,
  natProp,
  { endsWith, equals, sliceMatch }
) {
  const feats =
    map.querySourceFeatures(sourceId, { "source-layer": sourceLayer }) || [];
  return (
    feats.find((ft) => {
      const raw = ft?.properties?.[natProp];
      if (raw == null) return false;
      const nat = String(raw);
      if (equals && nat === equals) return true;
      if (endsWith && nat.endsWith(endsWith)) return true;
      if (sliceMatch) {
        const { start, end, value } = sliceMatch; // posiciones 0-based
        return nat.slice(start, end) === value;
      }
      return false;
    }) || null
  );
}

// Obtiene NATCODE de una provincia para deducir el código CCAA, si hace falta
function getProvinceFeatureForProvCode(map, prov2) {
  return findFeatureByNatcode(
    map,
    "prov-source",
    ADMIN_TILES.provincias.sourceLayer,
    ADMIN_TILES.natcodeProp,
    { sliceMatch: { start: 4, end: 6, value: prov2 } }
  );
}

// bbbox rápido a partir de una geometría
function bboxFromGeom(geom) {
  let w = Infinity,
    s = Infinity,
    e = -Infinity,
    n = -Infinity;
  const walk = (c) => {
    if (!c) return;
    if (typeof c[0] === "number") {
      const [x, y] = c;
      if (x < w) w = x;
      if (x > e) e = x;
      if (y < s) s = y;
      if (y > n) n = y;
    } else {
      for (const cc of c) walk(cc);
    }
  };
  walk(geom.coordinates);
  if (!Number.isFinite(w)) return null;
  return [
    [w, s],
    [e, n],
  ];
}

// Obtiene NATCODE de CCAA a partir de nombre SEO
function getCcaaFeatureByName(map, ccaaSeo) {
  const feats = getRenderedFeatures(map, "ccaa-source-ghost");
  const wantedSeo = toSeoName(ccaaSeo);
  return feats.find((ft) => getFeatureNameSeo(ft) === wantedSeo) || null;
}

// Obtiene NATCODE de provincia a partir de nombre SEO
function getProvFeatureByName(map, provSeo) {
  const feats = getRenderedFeatures(map, "prov-source-ghost");
  const wantedSeo = toSeoName(provSeo);
  return feats.find((ft) => getFeatureNameSeo(ft) === wantedSeo) || null;
}

// Idem municipio
function getMunFeatureByName(map, munSeo) {
  const feats = getRenderedFeatures(map, "mun-source-ghost");
  const wantedSeo = toSeoName(munSeo);
  return feats.find((ft) => getFeatureNameSeo(ft) === wantedSeo) || null;
}

// Helpers de nombre→código
function getProvCodeFromName(map, provSeo) {
  const ft = getProvFeatureByName(map, provSeo);
  if (!ft) return null;
  const nat = String(ft?.properties?.[ADMIN_TILES.natcodeProp] || "");
  return nat.slice(4, 6) || null; // dígitos 5–6
}

function getCcaaCodeFromProvCode(map, prov2) {
  const ft = getProvinceFeatureForProvCode(map, prov2);
  if (!ft) return null;
  const nat = String(ft?.properties?.[ADMIN_TILES.natcodeProp] || "");
  return nat.slice(2, 4) || null; // dígitos 3–4
}

// Buscar feat renderizada por NATCODE en capa ghost (ccaa/prov/mun)
function findRenderedByNatcode(map, layerId, natProp, match) {
  const feats = getRenderedFeatures(map, layerId);
  return (
    feats.find((ft) => {
      const raw = ft?.properties?.[natProp];
      if (raw == null) return false;
      const nat = String(raw);
      if (match.equals && nat === match.equals) return true;
      if (match.endsWith && nat.endsWith(match.endsWith)) return true;
      if (match.sliceMatch) {
        const { start, end, value } = match.sliceMatch;
        return nat.slice(start, end) === value;
      }
      return false;
    }) || null
  );
}

// Intenta encuadrar por polígono admin, devolviendo true si se hizo fitBounds
function tryFitAdmin(
  map,
  fosas,
  { ccaa = null, provincia = null, municipio = null }
) {
  const LAY_CCAA = "ccaa-source-ghost";
  const LAY_PROV = "prov-source-ghost";
  const LAY_MUN = "mun-source-ghost";
  const K = ADMIN_TILES.natcodeProp;

  // ============================
  // MUNICIPIO
  // ============================
  if (municipio) {
    const ft =
      getMunFeatureByName(map, municipio) ||
      findRenderedByNatcode(map, LAY_MUN, K, { endsWith: municipio });
    if (ft) {
      const b = bboxFromGeom(ft.geometry);
      if (b) {
        map.fitBounds(b, { padding: 60, duration: 900 });
        return true;
      }
    }
  }

  // ============================
  // PROVINCIA
  // ============================
  if (level === "prov") {
    // a) NATCODE por dígitos 5–6 (slice 4,6)
    let prov2 = null;
    if (row?.cod_ine) {
      const s = String(row.cod_ine).replace(/\D/g, "");
      if (s.length >= 4) prov2 = s.slice(2, 4);
    }
    if (!prov2 && provincia) {
      prov2 = getProvCodeFromName(map, provincia);
    }
    if (prov2) {
      const ft = findRenderedByNatcode(map, LAY_PROV, K, {
        sliceMatch: { start: 4, end: 6, value: prov2 },
      });
      if (ft) {
        const b = bboxFromGeom(ft.geometry);
        if (b) {
          map.fitBounds(b, { padding: 60, duration: 900 });
          return true;
        }
      }
    }

    // b) Por nombre (bilingües)
    const feats = getRenderedFeatures(map, LAY_PROV);
    const wantedSeo = toSeoName(provincia);
    const ftByName =
      feats.find((ft) => getFeatureNameSeo(ft) === wantedSeo) || null;
    if (ftByName) {
      const b = bboxFromGeom(ftByName.geometry);
      if (b) {
        map.fitBounds(b, { padding: 60, duration: 900 });
        return true;
      }
    }

    return false;
  }
}

function applyLevelFilterAndView(map, fosas, { ccaa, provincia, municipio }) {
  d("[filter] level start →", {
    ccaa,
    provincia,
    municipio,
    total: fosas.length,
  });

  // 0) Intento prioritario: encuadrar el polígono administrativo (tiles)
  if (tryFitAdmin(map, fosas, { ccaa, provincia, municipio })) {
    return; // ya hicimos fitBounds al polígono → salimos
  }

  // Fallback por puntos (lo que ya tenías)
  let filtered = fosas;
  if (ccaa)
    filtered = filtered.filter((f) => (f.ccaaSeo || f.ccaa_seo) === ccaa);
  if (provincia)
    filtered = filtered.filter(
      (f) => (f.provinciaSeo || f.provincia_seo) === provincia
    );
  if (municipio)
    filtered = filtered.filter(
      (f) => (f.municipioSeo || f.municipality_seo) === municipio
    );

  if (!filtered.length) {
    d("[filter] sin puntos, no se puede encuadrar");
    return;
  }

  const b = computeBounds(filtered);
  if (!b) return;
  map.fitBounds(b, { padding: 60, duration: 900 });
}

// =============================
// Zoom recomendado por municipio
// =============================
function getMunicipalZoom(map, fosas, muniSeo, padding = 80) {
  if (!muniSeo) return 14;

  const rows = fosas.filter(
    (f) => (f.municipioSeo || f.municipality_seo) === muniSeo
  );
  if (!rows.length) return 14;

  const pts = rows
    .map((r) => [Number(r.lon), Number(r.lat)])
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (!pts.length) return 14;

  let [w, s] = pts[0],
    [e, n] = pts[0];
  for (const [x, y] of pts) {
    if (x < w) w = x;
    if (x > e) e = x;
    if (y < s) s = y;
    if (y > n) n = y;
  }
  const cam = map.cameraForBounds(
    [
      [w, s],
      [e, n],
    ],
    { padding }
  );
  return Math.max(12, Math.min(16, cam.zoom));
}

/* =======================================
    Volar SOLO al punto (sin abrir ficha)
   ======================================= */
function flyToOnly(map, fosa, fosas, defaultZoom = 14) {
  const lon = Number(fosa.lon),
    lat = Number(fosa.lat);
  const municipioSeo = fosa.municipioSeo || fosa.municipality_seo;
  // Reutiliza la misma lógica de zoom municipal para coherencia
  const zoom = getMunicipalZoom(map, fosas, municipioSeo);
  const z = Number.isFinite(zoom) ? zoom : defaultZoom;

  if (Number.isFinite(lon) && Number.isFinite(lat)) {
    map.flyTo({ center: [lon, lat], zoom: z, essential: true });
  } else {
    console.warn("[flyToOnly] fosa sin coordenadas válidas:", fosa);
  }
}

/* =======================================
    Volar y abrir ficha (mantiene nombre)
   ======================================= */
async function openFichaAfterFly(map, fosa, fosas) {
  const lon = Number(fosa.lon),
    lat = Number(fosa.lat);
  const municipioSeo = fosa.municipioSeo || fosa.municipality_seo;
  const zoom = getMunicipalZoom(map, fosas, municipioSeo);
  d("[ficha] flyTo", { lon, lat, municipioSeo, zoom });

  const open = () => {
    const urlSeo = urlSeoOf(fosa);
    abrirFicha({
      id: String(fosa.id),
      title: fosa.title ?? fosa.titulo ?? "",
      municipio: fosa.municipio ?? fosa.municipality ?? "",
      provincia: fosa.provincia ?? "",
      url_ficha: fosa.url_ficha,
      lat,
      lon,
      zoom,
      url_seo: urlSeo,
      base: APP_BASE_PATH,
    });
  };

  if (Number.isFinite(lon) && Number.isFinite(lat)) {
    map.once("moveend", open);
    map.flyTo({ center: [lon, lat], zoom, essential: true });
  } else {
    open();
  }
}

/* =====
    App
   ===== */

(async () => {
  // 1) Mapa (espera estilo)
  const map = initMap();
  window.map = map;
  await new Promise((r) =>
    map.isStyleLoaded && map.isStyleLoaded() ? r() : map.once("load", r)
  );

  // Fuentes administrativas invisibles
  ensureAdminSources(map);

  // Espera a que haya al menos un frame renderizado (tiles listos para queryRenderedFeatures)
  await new Promise((r) => map.once("idle", r));

  //--------------------------------------------------------//
  // DEBUG: confirmar estilo y fuentes/capas “ghost”
  //--------------------------------------------------------//
  d("[boot] style loaded?", map.isStyleLoaded?.());
  const srcs = map.getStyle()?.sources || {};
  d("[boot] sources:", Object.keys(srcs));
  d("[boot] has ccaa-source?", !!srcs["ccaa-source"]);
  d("[boot] has prov-source?", !!srcs["prov-source"]);
  d("[boot] has mun-source?", !!srcs["mun-source"]);

  d("[boot] layer ccaa-source-ghost?", !!map.getLayer("ccaa-source-ghost"));
  d("[boot] layer prov-source-ghost?", !!map.getLayer("prov-source-ghost"));
  d("[boot] layer mun-source-ghost?", !!map.getLayer("mun-source-ghost"));

  // 2) Datos normalizados
  const fosas = await cargarFosas();

  //--------------------------------------------------------//
  // 3) Montar capa de puntos + recuento + hover + eventos
  //--------------------------------------------------------//
  montarCapaFosas(map, fosas);
  actualizarDatosFosas(map, fosas);

  // 4) Geocoder (externo + local), leyenda y toolbar
  const externalGeocoder = externalGeocoderFactory(fosas);
  const geocoder = createGeocoder(map, externalGeocoder);
  initToolbar(map, fosas);

  // 5) Interacciones del geocoder
  geocoder.on("result", (e) => {
    const ft = e.result;
    // Si es fosa del localGeocoder:
    if (ft.place_type?.[0] === "fosa") {
      const id = ft.properties?.id ?? ft.id;
      const f = fosas.find((x) => String(x.id) === String(id));
      if (f) openFichaAfterFly(map, f, fosas);
    } else {
      // resto de tipos → flyTo básico
      map.flyTo({ center: ft.center, zoom: 12, essential: true });
    }
  });

  // 5.2) Limpieza de overlay al cerrar
  window.addEventListener("closeFicha", () => {
    // no tocamos las capas; solo se cierra el overlay
  });

  // 5.3) Resto de overlays
  addLegend(map);
  const nav = addNavButtons(map); // OJO: sin coma colgante

  // 6) Índice para resolver URLs SEO exactas
  const indexBySeo = buildIndexBySeo(fosas);

  // 7) Canonical sin parámetros
  setCanonicalPathOnly();

  // 8) Resolver ruta SEO (mapa + capas + controles listos)
  const parsed = parseSeoPath(location.pathname);
  if (parsed) {
    const { ccaa, provincia, municipio, slug } = parsed;

    if (slug) {
      const ruta = normalizeSeoPath(
        `/${ccaa}/${provincia}/${municipio}/${slug}`
      );
      const target = indexBySeo.get(ruta);

      if (target) {
        flyToOnly(map, target, fosas); // solo vuelo; NO overlay
      } else {
        applyLevelFilterAndView(map, fosas, { ccaa, provincia, municipio });
      }
    } else if (municipio || provincia || ccaa) {
      applyLevelFilterAndView(map, fosas, { ccaa, provincia, municipio });
    } else {
      // sin ruta concreta → encuadre inicial a Península si hay botones
      nav?.flyPeninsula?.();
    }
  } else {
    nav?.flyPeninsula?.();
    d("[seo] pathname:", location.pathname, "parsed:", parsed);
  }

  // 9) Interacción: click en punto (evento custom desde layers)
  map.on("openficha", async (ev) => {
    const f = fosas.find((x) => String(x.id) === String(ev.id)) || ev;
    const merged = { ...f, ...ev };
    await openFichaAfterFly(map, merged, fosas);
  });
})();
p
