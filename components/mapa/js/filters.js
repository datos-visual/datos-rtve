export function initToolbar(toolbar, onFilter) {
  ["Represión", "Objetos", "Mujeres", "Lugares", "Personajes"].forEach(
    (tag) => {
      const b = document.createElement("button");
      b.className = "toolbar-btn";
      b.textContent = tag;
      b.onclick = () => onFilter(tag);
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
