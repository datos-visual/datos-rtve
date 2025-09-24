import { createTooltip } from "./tooltip.js";
import { normId } from "./utils.js";

/* transforma el array de registros a FeatureCollection */
const toGeoJSON = (filas) => ({
  type: "FeatureCollection",
  features: filas
    .filter((f) => {
      const n = parseInt(f?.id, 10);
      return Number.isFinite(n) && Number.isFinite(f?.lat) && Number.isFinite(f?.lon);
    })
    .map((f) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [f.lon, f.lat] },
      properties: {
        id: f.id,
        municipio: f.municipio,
        title: f.title,
        provincia: f.provincia,
        status: f.status,
        url_ficha: f.url_ficha,
      },
    })),
});

/**
 * Añade la capa de fosas al mapa y conecta tooltip + eventos.
 * Si ya existe la capa, la reemplaza para evitar duplicados.
 * @param {mapboxgl.Map} map   instancia del mapa
 * @param {Array<Object>} fosas   array procesado (con lat / lon)
 * @param {boolean} soloNarrativas   si true → puntos naranjas, si false → puntos rojos
 */
export function montarCapaFosas(map, fosas, soloNarrativas = false) {
  const geo = toGeoJSON(fosas);

  // Fuente
  if (!map.getSource("fosas")) {
    map.addSource("fosas", { type: "geojson", data: geo });
  } else {
    map.getSource("fosas").setData(geo);
  }

  // Eliminar capas existentes si hay
  if (map.getLayer("fosasLayer")) map.removeLayer("fosasLayer");

  // Capa principal
  const capa = {
    id: "fosasLayer",
    type: "circle",
    source: "fosas",
    paint: {
      "circle-radius": 5,
      "circle-color": soloNarrativas ? "#D69F1A" : "#796060", // naranja si narrativas, rojo si no
      "circle-stroke-color": "rgba(0,0,0,.6)",
      "circle-stroke-width": 0.5,
      "circle-blur": 0.4,
    },
  };

  map.addLayer(capa, "waterway-label");

  // Tooltip y eventos
  const tooltip = createTooltip();

  map.on("mouseenter", "fosasLayer", (e) => {
    const p = e.features[0].properties;
    tooltip
      .setLngLat(e.features[0].geometry.coordinates)
      .setHTML(
        `
        <strong>${p.title || "Sin título"}</strong><br>
        ${p.provincia || ""}<br>
        ${p.status || ""}
      `
      )
      .addTo(map);
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "fosasLayer", () => {
    tooltip.remove();
    map.getCanvas().style.cursor = "";
  });

  map.on("click", "fosasLayer", (e) => {
    const props = e.features[0].properties;
    const [lon, lat] = e.features[0].geometry.coordinates;
    const rawId = props?.id;
    const n = parseInt(rawId, 10);
    if (!Number.isFinite(n)) return; // evitar emitir eventos con id inválido
    map.fire("openficha", {
      id: normId(rawId),
      lat,
      lon,
    });
  });
}

/**
 * Actualiza los datos de la capa (sin removerla)
 */
export function actualizarDatosFosas(map, fosas) {
  const src = map.getSource("fosas");
  if (src) src.setData(toGeoJSON(fosas));
}
