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
      id: String(f.id),
      geometry: { type: "Point", coordinates: [f.lon, f.lat] },
      properties: {
        id: String(f.id),
        municipio: f.municipio,
        title: f.title,
        provincia: f.provincia,
        status: f.status,
        url_ficha: f.url_ficha,
      },
    })),
});

/* Estado global de hover */
let hoveredId = null;

/**
 * Añade capas al mapa y conecta tooltip + eventos (sólo sobre puntos visibles).
 * @param {mapboxgl.Map} map
 * @param {Array<Object>} fosas
 * @param {boolean} soloNarrativas - si true → puntos naranjas, si false → puntos rojos
 */
export function montarCapaFosas(map, fosas, soloNarrativas = false) {
  const geo = toGeoJSON(fosas);
  if (!map.getSource("fosas")) {
    map.addSource("fosas", { type: "geojson", data: geo });
  } else {
    // Si ya existe la fuente, actualizar los datos
    map.getSource("fosas").setData(geo);
  }

  // Capa sombra
  if (!map.getLayer("fosasShadow")) {
    map.addLayer(
      {
        id: "fosasShadow",
        type: "circle",
        source: "fosas",
        paint: {
          "circle-radius": 6,
          "circle-color": "rgba(0, 0, 0, 0.1)",
          "circle-blur": 0.8,
        },
      },
      "waterway-label"
    );
  }

  // Capa principal (con feature-state)
  if (!map.getLayer("fosasLayer")) {
    map.addLayer(
      {
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
      },
      "fosasShadow"
    );
  }

  // Capa invisible para hit-testing (mayor radio)
  if (!map.getLayer("fosasHit")) {
    map.addLayer(
      {
        id: "fosasHit",
        type: "circle",
        source: "fosas",
        paint: {
          "circle-radius": 15,
          "circle-color": "rgba(0,0,0,0)",
          "circle-stroke-width": 0,
        },
      },
      "fosasLayer"
    );
  }

  // Capa de resaltado
  if (!map.getLayer("fosaHighlight")) {
    map.addLayer({
      id: "fosaHighlight",
      type: "circle",
      source: "fosas",
      paint: {
        "circle-radius": 10,
        "circle-color": "#f8eb9e",
        "circle-stroke-color": "#000000",
        "circle-stroke-width": 2,
      },
      filter: ["==", "id", ""],
    });
  }

  /* Tooltip */
  const tooltip = createTooltip();

  // Hover sobre puntos visibles
  map.on("mousemove", "fosasHit", (e) => {
    const f = e.features[0];
    const id = f.properties.id;

    tooltip
      .setLngLat(f.geometry.coordinates)
      .setHTML(
        `
      <strong>${f.properties.title || "Sin título"}</strong><br>
      ${f.properties.provincia || ""}<br>
      ${f.properties.status || ""}
    `
      )
      .addTo(map);

    map.getCanvas().style.cursor = "pointer";

    // Highlight visual con feature-state
    if (hoveredId !== id) {
      if (hoveredId !== null) {
        map.setFeatureState(
          { source: "fosas", id: hoveredId },
          { hover: false }
        );
      }
      hoveredId = id;
      map.setFeatureState({ source: "fosas", id: hoveredId }, { hover: true });
      map.setFilter("fosaHighlight", ["==", "id", id]);
    }

    // Lista lateral
    document
      .querySelector(".fosas-laterales li.highlight")
      ?.classList.remove("highlight");
    document
      .querySelector(`.fosas-laterales li[data-id="${id}"]`)
      ?.classList.add("highlight");
  });

  // Limpieza si no hay puntos debajo del cursor
  map.on("mousemove", (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["fosasHit"],
    });

    // No hay feature visible justo debajo del cursor
    if (
      (!features.length ||
        !features[0].layer ||
        features[0].layer.id !== "fosasHit") &&
      hoveredId !== null
    ) {
      tooltip.remove();
      map.getCanvas().style.cursor = "";

      map.setFeatureState({ source: "fosas", id: hoveredId }, { hover: false });
      hoveredId = null;

      map.setFilter("fosaHighlight", ["==", "id", ""]);
    }
  });

  map.on("mouseleave", "fosasHit", () => {
    tooltip.remove();
    map.getCanvas().style.cursor = "";

    if (hoveredId !== null) {
      map.setFeatureState({ source: "fosas", id: hoveredId }, { hover: false });
      hoveredId = null;
    }

    map.setFilter("fosaHighlight", ["==", "id", ""]);
    document
      .querySelector(".fosas-laterales li.highlight")
      ?.classList.remove("highlight");
  });

  map.on("click", "fosasHit", (e) => {
    const props = e.features[0].properties;
    const [lon, lat] = e.features[0].geometry.coordinates;
    map.fire("openficha", {
      id: normId(props.id),
      lat,
      lon,
      title: props.title,
      municipio: props.municipio,
      provincia: props.provincia,
      url_ficha: props.url_ficha,
    });
  });
}

/* refrescar los datos */
export function actualizarDatosFosas(map, fosasFiltradas) {
  // 1. Actualizar la fuente de datos (crítico para que aparezcan los puntos)
  const src = map.getSource("fosas");
  if (src) {
    src.setData(toGeoJSON(fosasFiltradas));
  }

  // 2. Aplicar filtros por IDs (para ocultar puntos no filtrados)
  const ids = fosasFiltradas.map((f) => String(f.id));
  if (!map.getLayer("fosasLayer")) return;

  if (ids.length === 0) {
    map.setFilter("fosasLayer", ["==", "id", "___NINGUNO___"]);
    map.setFilter("fosasShadow", ["==", "id", "___NINGUNO___"]);
    map.setFilter("fosasHit", ["==", "id", "___NINGUNO___"]);
    map.setFilter("fosaHighlight", ["==", "id", ""]);
  } else {
    map.setFilter("fosasLayer", ["in", "id", ...ids]);
    map.setFilter("fosasShadow", ["in", "id", ...ids]);
    map.setFilter("fosasHit", ["in", "id", ...ids]);
    // fosaHighlight se actualiza solo desde hover
  }
}
