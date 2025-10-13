export function initToolbar(toolbar, onFilter) {
  // Orden solicitado: REPRESALIADOS, MUJERES, LUGARES, OBJETOS, NOMBRES PROPIOS
  ["Represaliados", "Mujeres", "Lugares", "Objetos", "Nombres propios"].forEach(
    (tag) => {
      const b = document.createElement("button");
      b.className = "toolbar-btn";
      b.textContent = tag;
      // Normaliza las etiquetas visibles a claves internas
      const key = (
        tag === "Represión" || tag === "Represaliados"
          ? "represion"
          : tag === "Personajes" || tag === "Nombres propios"
          ? "personajes"
          : tag.toLowerCase()
      );
      b.onclick = () => onFilter(key);
      toolbar.append(b);
    }
  );

  const close = document.createElement("button");
  close.className = "toolbar-btn toolbar-close";
  close.textContent = "×";
  close.onclick = () => (toolbar.hidden = true);
  toolbar.append(close);

  toolbar.hidden = false;
}
