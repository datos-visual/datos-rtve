import "../../styles/_moduloNoticias.scss";
import noticia1 from "../../assets/noticias1.png";
import noticia2 from "../../assets/noticias2.png";
import noticia3 from "../../assets/noticias3.png";
import noticia4 from "../../assets/noticias4.png";
import noticia5 from "../../assets/noticias5.png";

class ModuloNoticias extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="modulo-noticias">
        <div class="modulo-noticias-wrapper">
          <div class="modulo-header">
            <h3 class="modulo-header__title">Título para módulo de Noticias</h3>
            <div class="nav-arrows">
              <button class="prev-btn">‹</button>
              <button class="next-btn">›</button>
            </div>
          </div>
          
          <div class="noticias-carousel">
            <div class="noticia-card">
              <div class="imagen-noticia">
                <img src=${noticia1} alt="noticia 1" />
              </div>
              <h4>La tierra no olvida los nombres que el tiempo quiso borrar</h4>
              <p class="autor">Firma del autor</p>
            </div>
            <div class="noticia-card">
              <div class="imagen-noticia">
                <img src=${noticia2} alt="noticia 2" />
              </div>
              <h4>La tierra no olvida los nombres que el tiempo quiso borrar</h4>
              <p class="autor">Firma del autor</p>
            </div>
            <div class="noticia-card">
              <div class="imagen-noticia">
                <img src=${noticia3} alt="noticia 3" />
              </div>
              <h4>La tierra no olvida los nombres que el tiempo quiso borrar</h4>
              <p class="autor">Firma del autor</p>
            </div>
            <div class="noticia-card">
              <div class="imagen-noticia">
                <img src=${noticia4} alt="noticia 4" />
              </div>
              <h4>La tierra no olvida los nombres que el tiempo quiso borrar</h4>
              <p class="autor">Firma del autor</p>
            </div>
            <div class="noticia-card">
              <div class="imagen-noticia">
                <img src=${noticia5} alt="noticia 5" />
              </div>
              <h4>La tierra no olvida los nombres que el tiempo quiso borrar</h4>
              <p class="autor">Firma del autor</p>
            </div>
          </div>

          <ul class="carousel-dots">
            <li class="active"></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
          </ul>
        </div>
      </section>
    `;

    this.initCarousel();
  }

  initCarousel() {
    const container = this.querySelector(".noticias-carousel");
    const prevBtn = this.querySelector(".prev-btn");
    const nextBtn = this.querySelector(".next-btn");

    let scrollAmount = 0;
    const scrollStep = 300; // px por click

    prevBtn.addEventListener("click", () => {
      container.scrollBy({ left: -scrollStep, behavior: "smooth" });
    });

    nextBtn.addEventListener("click", () => {
      container.scrollBy({ left: scrollStep, behavior: "smooth" });
    });
  }
}

customElements.define("modulo-noticias", ModuloNoticias);
