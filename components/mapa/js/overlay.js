"use client"; // Obligatorio para Next 13+ app dir

export function initOverlay() {
  const overlay = document.getElementById("ficha-overlay");
  const iframe = document.getElementById("ficha-iframe");
  const btnClose = document.getElementById("ficha-close");

  if (!overlay || !iframe) return;

  if (btnClose) {
    btnClose.onclick = () => cerrarOverlay();
  }

  window.cerrarOverlay = cerrarOverlay;

  function cerrarOverlay() {
    overlay.hidden = true;
    iframe.src = "";
    overlay.style.display = "";
  }
}

export function abrirFicha(id, lat, lon, zoom = 14, urlFicha = null) {
  const overlay = document.getElementById("ficha-overlay");
  const iframe = document.getElementById("ficha-iframe");
  if (!overlay || !iframe) return;

  const urlCompleta =
    urlFicha ?? `ficha${id}.html?id=${id}&lat=${lat}&lon=${lon}&zoom=${zoom}`;

  iframe.src = urlCompleta;
  overlay.hidden = false;
  overlay.style.display = "flex";
}
