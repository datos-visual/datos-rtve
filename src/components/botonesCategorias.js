import "../styles/_botonesCategorias.scss";

import iconFiltro from "../assets/iconFiltro.svg";
import iconExhumados from "../assets/iconFiltroExhumados.svg";
import iconLugares from "../assets/iconFiltroLugares.svg";
import iconMujeres from "../assets/iconFiltroMujeres.svg";
import iconObjetos from "../assets/iconFiltroObjetos.svg";
import iconPersonajes from "../assets/iconFiltroPersonajes.svg";
import iconRepresion from "../assets/iconFiltroRepresion.svg";
import lineHistoria from "../assets/line-historia.svg";

const ICONOS_POR_DEFECTO = {
  todas: iconFiltro,
  represion: iconRepresion,
  mujeres: iconMujeres,
  lugares: iconLugares,
  personajes: iconPersonajes,
  objetos: iconObjetos,
  Exhumaciones: iconExhumados,
};

class BotonesCategorias extends HTMLElement {
  static get observedAttributes() {
    return ["categorias", "seleccionada"];
  }

  constructor() {
    super();
    this._categorias = [];
    this._seleccionada = "";
    this._iconos = ICONOS_POR_DEFECTO;
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === "categorias" && newVal) {
      this._categorias = JSON.parse(newVal);
    }
    if (name === "seleccionada") {
      this._seleccionada = newVal;
    }
    this.render();
  }

  connectedCallback() {
    this.render();
    window.addEventListener("resize", () => this.render()); // re-render no resize
  }

  render() {
    if (!this._categorias.length) return;

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // Dropdown personalizado con iconos
      const iconoSeleccionado = this._iconos[this._seleccionada] || "";
      this.innerHTML = `
        <div class="categorias-dropdown custom-dropdown">
          <button id="dropdown-toggle">
            <img src="${iconoSeleccionado}" alt="${
        this._seleccionada
      }" style="width:24px;height:24px;margin-right:8px;" />
            <span style="flex:1;text-align:left;">
              ${
                this._seleccionada === "Exhumaciones"
                  ? "Exhumaciones tempranas"
                  : this._seleccionada === "lugares"
                  ? "Lugares destacados"
                  : this.capitalize(this._seleccionada)
              }
            </span>
            <span style="margin-left:auto;">&#9662;</span>
          </button>
          <div id="dropdown-menu" style="display:none;position:absolute;top:110%;left:0;width:100%;background:#fff;border:1px solid #ccc;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.1);z-index:10;">
            ${this._categorias
              .map(
                (cat) => `
                  <div class="dropdown-option" data-cat="${cat}" style="display:flex;align-items:center;padding:8px 12px;cursor:pointer;">
                    <img src="${
                      this._iconos[cat] || ""
                    }" alt="${cat}" style="width:20px;height:20px;margin-right:8px;" />
                    <span>
                      ${
                        cat === "Exhumaciones"
                          ? "Exhumaciones tempranas"
                          : cat === "lugares"
                          ? "Lugares destacados"
                          : this.capitalize(cat)
                      }
                    </span>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      `;

      const toggle = this.querySelector("#dropdown-toggle");
      const menu = this.querySelector("#dropdown-menu");
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.style.display = menu.style.display === "none" ? "block" : "none";
      });
      document.addEventListener("click", () => {
        if (menu) menu.style.display = "none";
      });
      this.querySelectorAll(".dropdown-option").forEach((opt) => {
        opt.addEventListener("click", (e) => {
          const cat = opt.getAttribute("data-cat");
          this._seleccionada = cat;
          this.dispatchEvent(
            new CustomEvent("categoria-cambiada", {
              detail: cat,
              bubbles: true,
              composed: true,
            })
          );
          menu.style.display = "none";
          this.render();
        });
      });
    } else {
      this.innerHTML = `
        <div class="botones-categorias">
          ${this._categorias
            .map(
              (cat) => `
              <button 
                class="btn-cat btn-cat--${cat} ${
                this._seleccionada === cat ? "activa" : ""
              }" 
                data-cat="${cat}">
                <img src="${
                  this._iconos[cat] || ""
                }" alt="${cat}" class="category-icon" />
                <span class="category-text">${
                  cat === "Exhumaciones"
                    ? "EXHUMACIONES TEMPRANAS"
                    : cat === "lugares"
                    ? "LUGARES DESTACADOS"
                    : this.capitalize(cat).toUpperCase()
                }</span>
                <img src="${lineHistoria}" alt="" class="category-line" aria-hidden="true" />
              </button>`
            )
            .join("")}
        </div>
      `;

      this.querySelectorAll(".btn-cat").forEach((btn) =>
        btn.addEventListener("click", () => {
          this.dispatchEvent(
            new CustomEvent("categoria-cambiada", {
              detail: btn.dataset.cat,
              bubbles: true,
              composed: true,
            })
          );
        })
      );
    }
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

customElements.define("botones-categorias", BotonesCategorias);
