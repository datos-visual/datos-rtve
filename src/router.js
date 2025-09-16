export async function router(path) {
  const app = document.getElementById("app");

  switch (path) {
    case "/":
      await import("./components/introUnified.js");
      app.innerHTML = `<intro-section></intro-section>`;
      break;

    case "/historias":
      await import("./pages/historias.js");
      app.innerHTML = `<historias-section></historias-section>`;
      break;

    case "/mapa":
      await import("./pages/buscadorFosas.js");
      app.innerHTML = `<mapa-section></mapa-section>`;
      break;

    default:
      app.innerHTML = `<h2>404 - Página no encontrada</h2>`;
  }

  attachNavHandlers();
}

function attachNavHandlers() {
  document.querySelectorAll("[data-link]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const href = btn.getAttribute("data-link");
      window.history.pushState({}, "", href);
      router(href);
    });
  });
}
