// overlay.js
// ------------------------------------------------------------------

// 1) --- Listeners & cerrarOverlay() ────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("ficha-overlay");
  const iframe  = document.getElementById("ficha-iframe");
  const btnClose= document.getElementById("ficha-close");

  if (btnClose) btnClose.onclick = cerrarOverlay;

  window.cerrarOverlay = cerrarOverlay;

  function cerrarOverlay() {
    overlay.hidden        = true;
    iframe.src            = "";
    overlay.style.display = "";
  }
});

// 2) --- abrirFicha() con fallback automático ──────────────────────
/**
 * @param {Object}  opts
 * @param {string}  opts.id
 * @param {number}  opts.lat
 * @param {number}  opts.lon
 * @param {string}  [opts.title]
 * @param {string}  [opts.municipio]
 * @param {string}  [opts.provincia]
 * @param {number}  [opts.zoom=14]
 * @param {string?} opts.url_ficha
 */
export function abrirFicha({
  id, lat, lon,
  title = "", municipio = "", provincia = "",
  zoom = 14,
  url_ficha = null
}) {
  const overlay = document.getElementById("ficha-overlay");
  const iframe  = document.getElementById("ficha-iframe");

  // --- Construir la URL completa correctamente ---------------------
  let urlCompleta;
  if (url_ficha) {
    const sep = url_ficha.includes("?") ? "&" : "?";
    urlCompleta = `${url_ficha}${sep}id=${id}&lat=${lat}&lon=${lon}&zoom=${zoom}`;
  } else {
    // Ruta relativa desde el mismo origen que index.html
    const base = window.location.origin + window.location.pathname.replace(/index\.html$/, '');
    urlCompleta = `${base}ficha${id}.html?id=${id}&lat=${lat}&lon=${lon}&zoom=${zoom}`;
  }

  // --- Mostrar overlay ---------------------------------------------
  iframe.src            = urlCompleta;
  overlay.hidden        = false;
  overlay.style.display = "flex";

  // --- Fallback si la ficha no existe o devuelve 404 --------------
  iframe.onload = () => {
    try {
      const doc = iframe.contentDocument;

      if (
        !doc ||
        doc.body.children.length === 0 ||
        /404|not\s*found/i.test(doc.body.innerText)
      ) {
        const html = `
          <style>
            body{margin:0;font-family:Arial,sans-serif;padding:1.5rem}
            h1{margin:0 0 .5rem;font-size:1.3rem}
            .small{color:#555}
          </style>
          <h1>${title || "Fosa sin ficha"}</h1>
          <p class="small"><strong>ID:</strong> ${id}</p>
          <p><strong>Localización:</strong> ${[municipio, provincia].filter(Boolean).join(", ") || "—"}</p>
          <p><strong>Coordenadas:</strong> ${lat.toFixed(5)}, ${lon.toFixed(5)}</p>
          <p><strong>Zoom:</strong> ${zoom}</p>
        `;
        doc.open();
        doc.write(html);
        doc.close();
      }
    } catch (err) {
      console.warn("No se pudo inspeccionar la ficha (posible cross-origin):", err);
    }
  };
}