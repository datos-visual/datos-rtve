import "../../styles/_mostrarMas.scss";
import upChevron from "../../assets/icon-up-chevron.svg";
import downChevron from "../../assets/icon-down-chevron.svg";

class MostrarMas extends HTMLElement {
  constructor() {
    super();
    this.expanded = false;
  }

  connectedCallback() {
    const contenido = this.innerHTML;
    this.innerHTML = `
      <div class="mostrar-mas-componente">
        <div class="contenido" style="display: none;">${contenido}</div>
        <button class="toggle-btn">⬇ Más información</button>
      </div>
    `;
    this.querySelector(".toggle-btn").addEventListener("click", () => {
      this.expanded = !this.expanded;
      this.render();
    });
    this.render(); // estado inicial
  }

  render() {
    const contenido = this.querySelector(".contenido");
    const btn = this.querySelector(".toggle-btn");

    if (this.expanded) {
      contenido.style.display = "block";
      btn.innerHTML = `<span>Menos información</span><img src=${upChevron} alt="" class="" />`;
    } else {
      contenido.style.display = "none";
      btn.innerHTML = `<span>Más información</span><img src=${downChevron} alt="" class="" />`;
    }
  }
}

customElements.define("mostrar-mas", MostrarMas);
