import { MAPBOX_TOKEN, MAP_STYLE } from "./config.js";

mapboxgl.accessToken = MAPBOX_TOKEN;

/**
 * MAPA
 */
export function createMap() {
  const map = new mapboxgl.Map({
    container: "map",
    style: MAP_STYLE,
    center: [-3, 40],
    zoom: 5,
  });

  map.addControl(new mapboxgl.NavigationControl());
  return map;
}

/**
 * GEOCODER
 */
export function createGeocoder(map, externalGeocoder) {
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl,
    marker: false,
    language: "es",
    countries: "es",
    flyTo: false,
    placeholder: "Buscar municipio, dirección o fosa…",
    externalGeocoder,
    limit: 15,
    bbox: [-18.0, 27.6, 4.5, 43.9], // [W, S, E, N] = España (incluye Canarias y Baleares)
    //localGeocoderOnly: false
    //externalGeocoder: externalGeocoderFn
  });
  map.addControl(geocoder, "top-left");
  geocoder.on("result", () => {
    const input = document.querySelector(".mapboxgl-ctrl-geocoder input");
    if (input) input.value = ""; // limpia el campo
  });
  return geocoder;
}
