import "../../styles/intro/_introScreen2.scss";
import "../botonesCategorias";
import { CATEGORIES } from "./config/constants.js";
import flechaHistorias from "../../assets/flecha-historias-2.svg";
import flechaMapas from "../../assets/flecha-mapas.svg";

class IntroScreen2 extends HTMLElement {
  constructor() {
    super();
    this.currentCategoryIndex = 0;
    this.tooltipVisible = false;
  }

  connectedCallback() {
    this.render();
    this.initEvents();
  }

  render() {
    const textContent = [
      "La Guerra Civil y el franquismo convirtieron a España en una gran fosa común. En las últimas décadas se han exhumado los restos de más de 18.000 víctimas. Se estima que más de 20.000 siguen en cementerios, cunetas, pozos y otros lugares donde los responsables de sus asesinatos intentaron ocultar los cuerpos o enterrarlos sin dignidad, para prolongar el castigo a ellos y a sus familias.",
      "Además de los muertos en combate o a causa de los bombardeos, 100.000 personas fueron asesinadas por los sublevados y 55.000 por los republicanos durante la guerra. Después y hasta 1946, la dictadura mató a otras 50.000 personas, a menudo tras juicios sumarísimos sin garantías.",
      "Este es el primer mapa audiovisual de las fosas de la Guerra Civil y el franquismo, donde puedes descubrir las 6.000 fosas de España y recuperar la memoria de algunas de las víctimas. Una parte de la historia que yace aún en la tierra."
    ];

    this.innerHTML = `
      <section class="info-screen" id="screen2" aria-label="Información del proyecto">
        <div class="info-content">
          <div class="text-container">
            <div class="info-text-wrapper">
              ${textContent.map(text => `<p class="info-text">${text}</p>`).join('')}
            </div>
            <div class="button-wrapper">
              <button class="btn-historias">
                <span>Historias</span>
                <img src="${flechaHistorias}" alt="" class="flecha-btn" aria-hidden="true" />
              </button>
              <a data-link="/mapa" class="primary-btn">
                <span>Mapa de fosas</span>
                <img src="${flechaMapas}" alt="" class="flecha-2-btn" aria-hidden="true" />
              </a>
              <a data-link="/mapa" class="text-link-btn">
                <span>Saltar introducción</span>
              </a>
            </div>
          </div>
          <div class="tooltip-categorias hidden">
            <botones-categorias categorias='${JSON.stringify(CATEGORIES)}'></botones-categorias>
            <div class="bottom-navigation">
              <div class="category-navigation">
                <button class="nav-button prev" aria-label="Categoría anterior">‹</button>
                <button class="nav-button next" aria-label="Siguiente categoría">›</button>
              </div>
            </div>
          </div>
        </div>
        <div class="info-footer">
          <p>Un proyecto del equipo de RTVE Noticias. © Corporación de Radio y Televisión Española 2025</p>
        </div>
      </section>
    `;
  }

  initEvents() {
    this.elements = {
      prevBtn: this.querySelector(".nav-button.prev"),
      nextBtn: this.querySelector(".nav-button.next"),
      btnHistorias: this.querySelector(".btn-historias"),
      tooltip: this.querySelector(".tooltip-categorias"),
      flecha: this.querySelector(".flecha-btn")
    };

    this.updateTooltip(false);

    // Tooltip
    this.elements.btnHistorias?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.updateTooltip(!this.tooltipVisible);
    });
    
    document.addEventListener("click", (e) => {
      if (this.tooltipVisible && !this.elements.btnHistorias?.contains(e.target) && !this.elements.tooltip?.contains(e.target)) {
        this.updateTooltip(false);
      }
    });
    
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.tooltipVisible) this.updateTooltip(false);
    });

    // Navegación
    this.elements.prevBtn?.addEventListener("click", () => this.navigate(-1));
    this.elements.nextBtn?.addEventListener("click", () => this.navigate(1));

    // Selección de categoría
    this.addEventListener("categoria-cambiada", (e) => {
      this.dispatchEvent(new CustomEvent("intro-navigation", {
        detail: { action: "category-selected", data: { category: e.detail } },
        bubbles: true
      }));
      this.updateTooltip(false);
    });
  }

  navigate(direction) {
    const categoryButtons = this.querySelectorAll(".btn-cat");
    if (!categoryButtons.length) return;

    const total = categoryButtons.length;
    this.currentCategoryIndex = (this.currentCategoryIndex + direction + total) % total;
    
    const targetButton = categoryButtons[this.currentCategoryIndex];
    const container = this.querySelector(".botones-categorias");
    
    // Scroll suave
    if (container && targetButton) {
      const scrollLeft = targetButton.offsetLeft - container.clientWidth / 2 + targetButton.clientWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }

    // Actualizar visuales
    categoryButtons.forEach((btn, i) => {
      btn.classList.toggle("highlighted", i === this.currentCategoryIndex);
    });
    
    const { prevBtn, nextBtn } = this.elements;
    if (prevBtn && nextBtn) {
      prevBtn.classList.toggle("at-start", this.currentCategoryIndex === 0);
      nextBtn.classList.toggle("at-end", this.currentCategoryIndex === categoryButtons.length - 1);
    }
  }

  updateTooltip(visible) {
    this.tooltipVisible = visible;
    const { tooltip, btnHistorias, flecha } = this.elements;
    
    if (tooltip && btnHistorias) {
      tooltip.classList.toggle("hidden", !visible);
      tooltip.style.display = visible ? "block" : "none";
      btnHistorias.classList.toggle("active", visible);
      btnHistorias.setAttribute("aria-expanded", visible.toString());
      
      if (flecha) {
        flecha.style.transform = `rotate(${visible ? 0 : 180}deg)`;
        flecha.style.transition = "transform 0.3s ease";
      }
    }
  }

  setVisible(visible) {
    this.style.display = visible ? "block" : "none";
  }
}

customElements.define("intro-screen2", IntroScreen2);
