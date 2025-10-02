// js/navButtons.js
// Botones "Península" y "Canarias" como overlay absoluto y preparado para estilos.

// coords para Canarias
const CANARIAS_DEFAULT = {
  center: [-15.847252225331033, 27.867463299169856],
  zoom: 5.85,
};

// coords por defecto para Península
const PENINSULA_DEFAULT = {
  center: [-3, 40],
  zoom: 5,
};

// utilidad para normalizar
export const canonical = (s) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\w]/g, "")
    .toUpperCase();

/**
 * @param {mapboxgl.Map} map
 * @param {Object} options
 * @param {number} options.top    Offset superior en px (default 16)
 * @param {number} options.left   Offset izquierdo en px (default 16)
 * @param {number} options.gap    Separación horizontal entre botones (default 8)
 * @param {Array}  options.peninsulaCenter Centro [lon,lat] para Península
 * @param {number} options.peninsulaZoom   Zoom para Península
 * @param {Object} options.canarias        {center:[lon,lat], zoom:Number}
 * @param {number} options.durationMs      Duración del flyTo en ms (default 2000)
 */

function placeBelowTopLeftControls(map, el, { left = 16, margin = 8 } = {}) {
  // contenedor de controles top-left (geocoder vive aquí)
  const topLeft = map.getContainer().querySelector(".mapboxgl-ctrl-top-left");
  const rect = topLeft ? topLeft.getBoundingClientRect() : null;
  const parentRect = map.getContainer().getBoundingClientRect();

  const top = rect ? rect.bottom - parentRect.top + margin : 16;

  el.style.top = `${Math.max(0, top)}px`;
  el.style.left = `${left}px`;
}

export function addNavButtons(map, opts = {}) {
  const {
    gap = 8,
    peninsulaCenter = PENINSULA_DEFAULT.center,
    peninsulaZoom = PENINSULA_DEFAULT.zoom,
    canarias = CANARIAS_DEFAULT,
    durationMs = 1000,
    left = 16, // 👈 nuevo: margen izquierdo
    margin = 8, // 👈 nuevo: separación bajo los controles
  } = opts;

  const wrap = document.createElement("div");
  wrap.className = "navjump";
  wrap.style.position = "absolute";
  wrap.style.zIndex = "11";
  wrap.style.display = "flex";
  wrap.style.gap = `${gap}px`;

  // botones…
  const btnPen = document.createElement("button");
  btnPen.className = "navjump__btn navjump__btn--peninsula";
  btnPen.type = "button";
  btnPen.textContent = "Península";

  const btnCan = document.createElement("button");
  btnCan.className = "navjump__btn navjump__btn--canarias";
  btnCan.type = "button";
  btnCan.textContent = "Canarias";

  wrap.append(btnPen, btnCan);
  map.getContainer().appendChild(wrap);

  // posicionamiento inicial + en resize
  const place = () => placeBelowTopLeftControls(map, wrap, { left, margin });
  place();
  // recolocar en resize y al terminar un flyTo por si cambia el layout
  window.addEventListener("resize", place);
  map.on("moveend", place);

  // navegación
  let flying = false;
  function navegarAPeninsula() {
    if (
      flying ||
      !Array.isArray(peninsulaCenter) ||
      typeof peninsulaZoom !== "number"
    )
      return;
    flying = true;
    map.flyTo({
      center: peninsulaCenter,
      zoom: peninsulaZoom,
      duration: durationMs,
    });
    map.once("moveend", () => (flying = false));
  }
  function navegarACanarias() {
    if (flying) return;
    flying = true;
    map.flyTo({
      center: canarias.center,
      zoom: canarias.zoom,
      duration: durationMs,
    });
    map.once("moveend", () => (flying = false));
  }
  btnPen.addEventListener("click", navegarAPeninsula);
  btnCan.addEventListener("click", navegarACanarias);

  return { el: wrap, navegarAPeninsula, navegarACanarias, reposition: place };
}
