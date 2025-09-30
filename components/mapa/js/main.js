import { createMap, createGeocoder } from "./initMap.js";
import { cargarFosas } from "../../../app/lib/datos.js";
import { montarCapaFosas, actualizarDatosFosas } from "./layers.js";
import { abrirFicha } from "./overlay.js";
import { initToolbar } from "./filters.js";
import { getParam, normId } from "./utils.js";
import { JSON_URL } from "./config.js";
import { MAPBOX_TOKEN } from "./config.js";

const map = createMap();

let fosas = [];
const idURL = getParam("ficha");
const idBuscado = idURL ? normId(idURL) : null;

// ENCAPSULA TODO
(async function iniciar() {
  fosas = await cargarFosas();

  const conXY = fosas.filter((f) => f.lat && f.lon);

  // Espera a que el mapa y el estilo estén cargados
  map.once("load", () => {
    montarCapaFosas(map, conXY);

    // Handler click SIEMPRE después de la capa
    map.on("openficha", (e) => {
      // Busca el registro completo (preparado para f.url_ficha)
      const fosa = fosas.find((f) => f.id === normId(e.id));
      abrirFicha(normId(e.id), e.lat, e.lon, map.getZoom(), fosa?.url_ficha);
    });

    // Handler de resultado de geocoder
    const geocoder = createGeocoder(map, localGeocoder);
    geocoder.on("result", (e) => {
      const ft = e.result;
      if (ft.place_type?.[0] === "fosa") {
        const { id } = ft.properties;
        const [lon, lat] = ft.center;
        const z = lat && lon ? 13 : 11;
        if (lat && lon) {
          map.flyTo({ center: [lon, lat], zoom: z });
          map.once("moveend", () => abrirFicha(id, lat, lon, z));
        } else {
          const f = fosas.find((x) => x.id === id);
          if (f) geocodeFallback(`${f.municipio} ${f.codigo_postal || ""}`, id);
        }
      } else {
        map.flyTo({ center: ft.center, zoom: 11 });
      }
    });

    // Handler de ?ficha= en la URL (provisional)
    if (idBuscado) {
      const f = fosas.find((x) => x.id === idBuscado);
      if (!f) return console.warn("ID no encontrado:", idBuscado);

      const zURL = +getParam("zoom") || 14;
      if (f.lat && f.lon) {
        map.flyTo({ center: [f.lon, f.lat], zoom: zURL });
        map.once("moveend", () =>
          abrirFicha(f.id, f.lat, f.lon, zURL, f.url_ficha)
        );
      } else {
        geocodeFallback(`${f.municipio} ${f.codigo_postal || ""}`, f.id);
      }
    }
  });
})();

// LocalGeocoder
const localGeocoder = (q) => {
  const txt = q.toLowerCase();
  return fosas
    .filter(
      (f) =>
        (f.id || "").toLowerCase().includes(txt) ||
        (f.title || "").toLowerCase().includes(txt) ||
        (f.municipio || "").toLowerCase().includes(txt) ||
        (f.provincia || "").toLowerCase().includes(txt) ||
        (f.ccaa || "").toLowerCase().includes(txt)
    )
    .slice(0, 10)
    .map((f) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [f.lon || 0, f.lat || 0] },
      place_name: `Fosa: ${f.title || f.id} — ${f.municipio}`,
      place_type: ["fosa"],
      center: [f.lon || 0, f.lat || 0],
      properties: { id: f.id },
    }));
};

function geocodeFallback(query, id) {
  const geocoderUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query
  )}.json?access_token=${MAPBOX_TOKEN}`;

  fetch(geocoderUrl)
    .then((res) => res.json())
    .then((data) => {
      if (data.features && data.features.length > 0) {
        const [lon, lat] = data.features[0].center;
        map.flyTo({ center: [lon, lat], zoom: 12 });
        map.once("moveend", () => abrirFicha(id, lat, lon, 12));
      } else {
        alert("No se pudo localizar el municipio o código postal.");
      }
    })
    .catch((err) => {
      console.error("Error al geocodificar:", err);
      alert("Error en la geocodificación.");
    });
}

window.cerrarOverlay = function () {
  document.getElementById("ficha-overlay").hidden = true;
  document.getElementById("ficha-iframe").src = "";
};
