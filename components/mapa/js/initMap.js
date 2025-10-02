import { MAPBOX_TOKEN, MAP_STYLE } from "./config.js";
import mapboxgl from "mapbox-gl";
// import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder"; // Comentado temporalmente
import "mapbox-gl/dist/mapbox-gl.css";
// import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css"; // Comentado temporalmente

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
  });

  map.addControl(new mapboxgl.NavigationControl());
  return map;
}

/**
 * GEOCODER - Temporalmente deshabilitado para evitar errores de dependencias
 */
export function createGeocoder(map, localGeocoderFn) {
  // Geocoder temporalmente deshabilitado hasta resolver problemas de dependencias
  return null;
  
  /* Código original comentado:
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl,
    marker: false,
    flyTo: false,
    placeholder: "Buscar municipio, dirección o fosa…",
    localGeocoder: localGeocoderFn,
  });
  map.addControl(geocoder, "top-left");
  return geocoder;
  */
}
