/* js/tooltip.js ------------------------------------------------------- */
/**
 * Devuelve una única instancia de Popup «flotante» para mostrar
 * los datos de la fosa. La capa (`layers.js`) lo llama en cada
 * mouseenter y lo reubica; en mouseleave se oculta.
 *
 * ‣ closeButton   : false  → sin ✕
 * ‣ closeOnClick  : false  → no se cierra al hacer click sobre el mapa
 * ‣ offset        : 10     → pequeño desplazamiento del punto
 *
 * Puedes cambiar estilos CSS del popup usando .mapboxgl-popup en estilos.css
 */
import mapboxgl from "mapbox-gl";
export function createTooltip() {
  return new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 10,
  });
}
