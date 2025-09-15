import { createMap, createGeocoder } from "./initMap.js";
import { cargarFosas } from "./datos.js";
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

// SE ENCAPSULA TODO
(async function iniciar() {
  fosas = await cargarFosas(JSON_URL);
  const conXY = fosas.filter((f) => f.lat && f.lon);

  // Se espera a que el mapa y el estilo estén cargados
  map.once("load", () => {
    montarCapaFosas(map, conXY);

    // Se inicializa toolbar con botones de líneas narrativas
    let fosasFiltradas = conXY; // se actualizará según los filtros activos

    initToolbar(document.getElementById("toolbar"), (tags) => {
      if (!tags || tags.length === 0) {
        fosasFiltradas = conXY;
      } else {
        fosasFiltradas = conXY.filter(
          (f) => f.lineas && tags.some((tag) => f.lineas.includes(tag))
        );
      }

      const idsFiltrados = fosasFiltradas.map((f) => f.id);
      map.setFilter("fosasLayer", ["in", "id", ...idsFiltrados]);
      map.setFilter("fosasShadow", ["in", "id", ...idsFiltrados]);
      map.setFilter("fosasHit", ["in", "id", ...idsFiltrados]); // ← nueva línea
      map.setFilter("fosaHighlight", ["==", "id", ""]);

      map.once("idle", () => {
        actualizarRecuento();
      });
    });

    // Muestra número de fosas visibles según viewport
    const contador = document.getElementById("recuento-fosas");
    contador.hidden = false;

    function actualizarRecuento() {
      const contador = document.getElementById("recuento-fosas");
      const lista = document.getElementById("lista-fosas");
      const ul = document.getElementById("lista-fosas-ul");

      const bounds = map.getBounds();

      // Solo fosas dentro del viewport
      const visibles = fosasFiltradas.filter((f) => {
        return (
          f.lat >= bounds.getSouth() &&
          f.lat <= bounds.getNorth() &&
          f.lon >= bounds.getWest() &&
          f.lon <= bounds.getEast()
        );
      });

      // Recuento simple
      contador.textContent = `Fosas visibles: ${visibles.length}`;

      if (visibles.length === 0) {
        lista.hidden = true;
        return;
      }

      const datosOrdenados = visibles
        .slice()
        .sort((a, b) => (a.title || "").localeCompare(b.title || ""));

      ul.innerHTML = ""; // limpia
      datosOrdenados.forEach((f) => {
        const li = document.createElement("li");
        li.textContent = `${f.title || "(Sin título)"}`;
        li.dataset.id = f.id;

        // Click: igual que un punto
        li.onclick = () => {
          const [lon, lat] = [f.lon, f.lat];
          li.scrollIntoView({ behavior: "smooth", block: "center" }); // scroll al centro

          map.flyTo({ center: [lon, lat], zoom: 14 });
          map.once("moveend", () => {
            map.fire("openficha", {
              id: normId(f.id),
              lat,
              lon,
              title: f.title,
              municipio: f.municipio,
              provincia: f.provincia,
              url_ficha: f.url_ficha,
            });
          });
        };

        // Hover: resalta punto y entrada
        li.onmouseenter = () => {
          map.setFilter("fosaHighlight", ["==", "id", f.id]);
          document
            .querySelectorAll(".fosas-laterales li")
            .forEach((el) => el.classList.remove("highlight"));
          li.classList.add("highlight");
        };

        li.onmouseleave = () => {
          map.setFilter("fosaHighlight", ["==", "id", ""]);
          li.classList.remove("highlight");
        };

        ul.appendChild(li);
      });

      lista.hidden = false;
    }

    map.on("moveend", actualizarRecuento);
    map.on("zoomend", actualizarRecuento);
    map.on("resize", actualizarRecuento);

    map.once("idle", () => {
      //Justo después de renderizar el mapa
      actualizarRecuento();
    });

    // Handler click SIEMPRE después de la capa
    map.on("openficha", (e) => {
      // Busca el registro completo (preparado para f.url_ficha)
      const fosa = fosas.find((f) => f.id === normId(e.id));
      //abrirFicha(normId(e.id), e.lat, e.lon, map.getZoom(), fosa?.url_ficha);
      abrirFicha({
        id: normId(e.id),
        lat: e.lat,
        lon: e.lon,
        zoom: map.getZoom(),
        url_ficha: fosa?.url_ficha,
        title: fosa?.title,
        municipio: fosa?.municipio,
        provincia: fosa?.provincia,
      });
    });

    // Handler de resultado de geocoder
    const geocoder = createGeocoder(map, externalGeocoder);
    geocoder.on("result", (e) => {
      const ft = e.result;
      if (ft.place_type?.[0] === "fosa") {
        const { id } = ft.properties;
        const [lon, lat] = ft.center;
        const z = lat && lon ? 13 : 11;
        if (lat && lon) {
          map.flyTo({ center: [lon, lat], zoom: z });
          map.once("moveend", () => {
            window.logZoomInfo({ ref: `ficha: ${f.id}` });
            //abrirFicha(id, lat, lon, z);
            const fosa = fosas.find((f) => f.id === id);
            abrirFicha({
              id,
              lat,
              lon,
              zoom: z,
              url_ficha: fosa?.url_ficha,
              title: fosa?.title,
              municipio: fosa?.municipio,
              provincia: fosa?.provincia,
            });
          });
        } else {
          const f = fosas.find((x) => x.id === id);
          if (f) geocodeFallback(`${f.municipio} ${f.codigo_postal || ""}`, id);
        }
      } else {
        map.flyTo({ center: ft.center, zoom: 11 });
      }
    });

    // Handler de ?ficha= en la URL (ZOOM DINÁMICO CON GEOCODER)
    if (idBuscado) {
      const f = fosas.find((x) => x.id === idBuscado);
      if (!f) return console.warn("ID no encontrado:", idBuscado);

      if (f.lat && f.lon) {
        // Pide el feature contextual más relevante a Mapbox
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${f.lon},${f.lat}.json?access_token=${MAPBOX_TOKEN}`;
        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            // Escoge el feature más relevante
            const feature = data.features?.[0];
            let zoom = 14;
            // Calcula zoom según el tipo de lugar devuelto
            if (feature) {
              if (feature.place_type.includes("address")) zoom = 16;
              else if (feature.place_type.includes("poi")) zoom = 15;
              else if (feature.place_type.includes("locality")) zoom = 13;
              else if (feature.place_type.includes("place")) zoom = 12;
              else zoom = 14;
            }
            map.flyTo({ center: [f.lon, f.lat], zoom: zoom });
            map.once("moveend", () => {
              window.logZoomInfo({ ref: `ficha: ${f.id}` });
              //abrirFicha(f.id, f.lat, f.lon, zoom, f.url_ficha);
              abrirFicha({
                id: f.id,
                lat: f.lat,
                lon: f.lon,
                zoom: zoom,
                url_ficha: f.url_ficha,
                title: f.title,
                municipio: f.municipio,
                provincia: f.provincia,
              });
            });
          })
          .catch((err) => {
            // Si falla, usa el zoom por defecto
            map.flyTo({ center: [f.lon, f.lat], zoom: zoom });
            map.once("moveend", () => {
              console.log("Zoom aplicado a la ficha:", zoom); // 👈 Aquí ves el zoom en consola
              abrirFicha(f.id, f.lat, f.lon, zoom, f.url_ficha);
            });
          });
      } else {
        geocodeFallback(`${f.municipio} ${f.codigo_postal || ""}`, f.id);
      }
    }
  });
})();

// localGeocoder
const externalGeocoder = (query) => {
  const mapboxQueryUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query
  )}.json?access_token=${MAPBOX_TOKEN}&bbox=-18.0,27.6,4.5,43.9&country=es`;

  return fetch(mapboxQueryUrl)
    .then((res) => res.json())
    .then((data) => {
      const oficiales = data.features || [];

      const fosasLocales = fosas
        .filter(
          (f) =>
            (f.id || "").toLowerCase().includes(query.toLowerCase()) ||
            (f.title || "").toLowerCase().includes(query.toLowerCase()) ||
            (f.municipio || "").toLowerCase().includes(query.toLowerCase()) ||
            (f.provincia || "").toLowerCase().includes(query.toLowerCase())
        )
        .map((f) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [f.lon || 0, f.lat || 0] },
          place_name: `🕳️ Fosa: ${f.title || f.id} — ${f.municipio}, ${
            f.provincia
          }`,
          place_type: ["fosa"],
          center: [f.lon || 0, f.lat || 0],
          properties: { id: f.id },
        }));

      // Primero resultados oficiales, luego fosas
      return [...oficiales, ...fosasLocales];
    });
};

function geocodeFallback(query, id) {
  const geocoderUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query
  )}.json?access_token=${MAPBOX_TOKEN}`;

  fetch(geocoderUrl)
    .then((res) => res.json())
    .then((data) => {
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lon, lat] = feature.center;
        // Usa el zoom recomendado si existe, si no lo deduce por tipo
        let zoom = feature.properties?.mapbox_zoom;
        if (!zoom) {
          if (feature.place_type.includes("address")) zoom = 16;
          else if (feature.place_type.includes("poi")) zoom = 15;
          else if (feature.place_type.includes("locality")) zoom = 13;
          else if (feature.place_type.includes("place")) zoom = 12;
          else zoom = 12;
        }
        map.flyTo({ center: [lon, lat], zoom: zoom });
        map.once("moveend", () => {
          // Log contextual
          window.logZoomInfo({ ref: `geocoder query: ${query}` });
          abrirFicha(id, lat, lon, zoom);
        });
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

window._map = map;

// Log automático
window.logZoomInfo = function (context = {}) {
  const zoom = _map.getZoom();
  const center = _map.getCenter();
  const msg = [
    `[MAP INFO] Zoom: ${zoom.toFixed(2)}`,
    `Centro: [${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}]`,
    `Referencia: ${context.ref || "manual/movimiento"}`,
  ].join(" | ");
  console.log(msg);
};
