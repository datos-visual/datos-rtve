export function abrirFicha(id, lat, lon, zoom = 14, urlFicha = null) {
  const overlay = document.getElementById("ficha-overlay");
  const iframe = document.getElementById("ficha-iframe");
  if (!overlay || !iframe) return;

  const urlCompleta =
    urlFicha ?? `ficha${id}.html?id=${id}&lat=${lat}&lon=${lon}&zoom=${zoom}`;

  // Cargamos la ficha YA para que esté lista al terminar el vuelo,
  // pero NO mostramos el overlay aún.
  iframe.src = urlCompleta;

  // Función que abre realmente el overlay (una sola vez)
  const abrirAhora = () => {
    const m = window.map;
    if (m && typeof m.off === "function") {
      m.off("moveend", abrirAhora);
    }
    overlay.hidden = false;
    overlay.style.display = "flex";
  };

  const m = window.map;
  // Si hay mapa y está volando/moviéndose, esperamos a 'moveend'
  if (m && typeof m.on === "function") {
    // Si el build no tiene isMoving, abrimos tras un pequeño timeout de cortesía
    const moviendose = typeof m.isMoving === "function" ? m.isMoving() : true;

    if (moviendose) {
      let abierto = false;
      const handler = () => {
        if (abierto) return;
        abierto = true;
        m.off("moveend", handler);
        abrirAhora();
      };
      m.on("moveend", handler);

      // Salvaguarda: si por lo que sea no llega 'moveend', abrimos igual
      setTimeout(() => {
        if (!abierto) {
          try {
            m.off("moveend", handler);
          } catch {}
          abrirAhora();
        }
      }, 800);
    } else {
      // No hay vuelo en curso: abrimos ya
      abrirAhora();
    }
  } else {
    // No hay referencia al mapa: abrimos ya
    abrirAhora();
  }
}
