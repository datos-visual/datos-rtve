// Inicializa listeners al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("ficha-overlay");
  const iframe = document.getElementById("ficha-iframe");
  const btnClose = document.getElementById("ficha-close");

  if (btnClose) {
    btnClose.onclick = () => {
      cerrarOverlay();
    };
  }

  // Expone la función para los iframes (fichas)
  window.cerrarOverlay = cerrarOverlay;

  function cerrarOverlay() {
    overlay.hidden = true;
    iframe.src = "";
    overlay.style.display = ""; // Limpia el display (si lo has tocado)
  }
});

export function abrirFicha(id, lat, lon, zoom = 14, urlFicha = null) {
  const overlay = document.getElementById("ficha-overlay");
  const iframe = document.getElementById("ficha-iframe");
  let urlCompleta;

  if (urlFicha) {
    urlCompleta = urlFicha;
  } else {
    // Si no hay URL de ficha, carga una ficha local basada en el ID
    urlCompleta = `ficha${id}.html?id=${id}&lat=${lat}&lon=${lon}&zoom=${zoom}`;
  }

  iframe.src = urlCompleta;
  overlay.hidden = false;
  overlay.style.display = "flex";
}
