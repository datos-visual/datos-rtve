import { MAPBOX_TOKEN, MAP_STYLE } from "./config.js";
import mapboxgl from "mapbox-gl";
// import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder"; // Comentado temporalmente

mapboxgl.accessToken = MAPBOX_TOKEN;

/**
 * MAPA
 */
export function createMap(container) {
  const map = new mapboxgl.Map({
    container,
    style: MAP_STYLE,
    center: [-3, 40],
    zoom: 5,
    cooperativeGestures: {
    windowsHelpText: 'Mantén Ctrl para hacer zoom',
    macHelpText: 'Mantén ⌘ para hacer zoom',
    mobileHelpText: 'Usa dos dedos para mover el mapa'
  }
  });


  map.addControl(new mapboxgl.NavigationControl());
  return map;
}

/**
 * GEOCODER - Temporalmente deshabilitado para evitar errores de dependencias
 */
export function createGeocoder(map, localGeocoderFn) {
  const geocoder = new MapboxGeocoder({
    accessToken: MAPBOX_TOKEN,
    mapboxgl,
    marker: false,
    placeholder: "Buscar lugar…",
    // Limitamos búsqueda a España y a la bbox de España para resultados oficiales
    countries: "es",
    limit: 30,
    bbox: [-18.0, 27.6, 4.5, 43.9],
    localGeocoder: localGeocoderFn, // ← inyectamos resultados de fosas
  });

  map.addControl(geocoder, "top-left");
  return geocoder;
}

/** Devuelve una función localGeocoder que añade “fosas” a los resultados */
export function externalGeocoderFactory(fosas) {
  return function externalGeocoder(query) {
    // 1) Buscar en Mapbox (oficial) – lo hace el geocoder por su lado
    // 2) Añadir resultados “locales”: tus fosas
    const q = (query || "").toLowerCase();

    const fosasLocales = fosas
      .filter(
        (f) =>
          (f.id || "").toLowerCase().includes(q) ||
          (f.title || "").toLowerCase().includes(q) ||
          (f.municipio || "").toLowerCase().includes(q) ||
          (f.provincia || "").toLowerCase().includes(q)
      )
      .map((f) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [f.lon || 0, f.lat || 0] },
        place_name: `Fosa: ${f.title || f.id} — ${f.municipio}, ${f.provincia}`,
        place_type: ["fosa"], // clave para distinguirlas en on("result")
        center: [f.lon || 0, f.lat || 0],
        properties: { id: f.id },
      }));

    // Los resultados locales se concatenan con los oficiales automáticamente
    return fosasLocales;
  };
}

/** Fallback cuando una fosa no tiene lat/lon: geocodifica municipio + CP */
export function geocodeFallback(map, abrirFicha, query, id) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query
  )}.json?access_token=${MAPBOX_TOKEN}`;

  return fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const feature = data.features?.[0];
      if (!feature) {
        alert("No se pudo localizar el municipio o código postal.");
        return;
      }
      const [lon, lat] = feature.center;
      let zoom = feature.properties?.mapbox_zoom;
      if (!zoom) {
        // Heurística por tipo si no llega mapbox_zoom:
        if (feature.place_type.includes("address")) zoom = 16;
        else if (feature.place_type.includes("poi")) zoom = 15;
        else if (feature.place_type.includes("locality")) zoom = 13;
        else if (feature.place_type.includes("place")) zoom = 12;
        else zoom = 12;
      }
      map.flyTo({ center: [lon, lat], zoom });
      map.once("moveend", () => {
        window.logZoomInfo?.({ ref: `geocoder query: ${query}` });
        abrirFicha(id, lat, lon, zoom);
      });
    })
    .catch((err) => {
      console.error("Error al geocodificar:", err);
      alert("Error en la geocodificación.");
    });
}

/**
 * Enlaza toda la lógica:
 *  - selección de resultados del geocoder (fosas / lugares oficiales)
 *  - apertura de ficha
 */
export function bindGeocoderHandlers({
  map,
  geocoder,
  fosas,
  abrirFicha,
  idBuscado, // string | undefined
}) {
  // 1) Cuando el usuario selecciona un resultado del geocoder
  geocoder.on("result", (e) => {
    const ft = e.result;

    // A) Si es una “fosa” (resultado local)
    if (ft.place_type?.[0] === "fosa") {
      const { id } = ft.properties;
      const [lon, lat] = ft.center;
      const z = lat && lon ? 13 : 11;

      if (lat && lon) {
        map.flyTo({ center: [lon, lat], zoom: z });
        map.once("moveend", () => {
          window.logZoomInfo?.({ ref: `ficha: ${id}` });
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
        if (f)
          geocodeFallback(
            map,
            abrirFicha,
            `${f.municipio} ${f.codigo_postal || ""}`,
            id
          );
      }
      return;
    }

    // B) Resultado oficial de Mapbox (ciudad, lugar, etc.)
    map.flyTo({ center: ft.center, zoom: 11 });
  });

  if (idBuscado) {
    const f = fosas.find((x) => x.id === idBuscado);
    if (!f) {
      console.warn("ID no encontrado:", idBuscado);
      return;
    }

    // Si la fosa tiene lat/lon, se hace reverse geocoding para decidir el zoom
    if (f.lat && f.lon) {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${f.lon},${f.lat}.json?access_token=${MAPBOX_TOKEN}`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          const feature = data.features?.[0];
          let zoom = 14;
          if (feature) {
            if (feature.place_type.includes("address")) zoom = 16;
            else if (feature.place_type.includes("poi")) zoom = 15;
            else if (feature.place_type.includes("locality")) zoom = 13;
            else if (feature.place_type.includes("place")) zoom = 12;
            else zoom = 14;
          }
          map.flyTo({ center: [f.lon, f.lat], zoom });
          map.once("moveend", () => {
            window.logZoomInfo?.({ ref: `ficha: ${f.id}` });
            abrirFicha({
              id: f.id,
              lat: f.lat,
              lon: f.lon,
              zoom,
              url_ficha: f.url_ficha,
              title: f.title,
              municipio: f.municipio,
              provincia: f.provincia,
            });
          });
        })
        .catch(() => {
          // fallback si falla la API
          const zoom = 14;
          map.flyTo({ center: [f.lon, f.lat], zoom });
          map.once("moveend", () => {
            console.log("Zoom aplicado a la ficha (fallback):", zoom);
            abrirFicha(f.id, f.lat, f.lon, zoom, f.url_ficha);
          });
        });
    } else {
      // Sin coordenadas → fallback textual
      geocodeFallback(
        map,
        abrirFicha,
        `${f.municipio} ${f.codigo_postal || ""}`,
        f.id
      );
    }
  }
}
