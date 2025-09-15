const lineasActivas = new Set();

export function initToolbar(toolbar, onFilter) {
  const tags = [
    "Todos",
    "Represión",
    "Objetos",
    "Mujeres",
    "Lugares",
    "Personajes",
    "Exhumación temprana",
  ];
  let activo = null;

  tags.forEach((tag) => {
    const b = document.createElement("button");
    b.className = "toolbar-btn";
    b.textContent = tag;

    b.onclick = () => {
      const key = tag.toLowerCase();

      // Si se pulsa el mismo botón activo ⇒ desactiva
      if (activo === key) {
        activo = null;
        b.classList.remove("activo");
        onFilter([]); // sin filtros = todas
      } else {
        activo = key;

        // Desactiva todos, activa solo el pulsado
        toolbar
          .querySelectorAll("button")
          .forEach((btn) => btn.classList.remove("activo"));
        b.classList.add("activo");

        // Si es "todos", quitamos todos los filtros
        if (key === "todos") {
          onFilter([]);
        } else {
          onFilter([key]);
        }
      }
    };

    toolbar.append(b);
  });

  toolbar.hidden = false;
}