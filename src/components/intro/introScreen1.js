import "../../styles/intro/_introScreen1.scss";
import "../scrollButton.js";
import barraIntro from "../../assets/barra-intro.svg";

class IntroScreen1 extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="intro-screen" id="screen1" aria-label="Introducción">
        <div class="intro-sticky">
          <div class="intro-overlay">
            <h1>El país de las 6.000 fosas</h1>
            <img class="intro-divider-img" src="${barraIntro}" alt="" aria-hidden="true"/>
            <p class="intro-sub">AQUÍ YACE LA HISTORIA</p>
          </div>
          <scroll-button
            label="Conoce las historias"
            animated="true"
            icon="mouse">
          </scroll-button>
        </div>
      </section>
    `;

    this.addEventListener('scroll-button-click', () => {
      this.dispatchEvent(new CustomEvent('intro-navigation', {
        detail: { action: 'next-screen' },
        bubbles: true
      }));
    });
  }

  setVisible(visible) {
    this.style.display = visible ? 'block' : 'none';
  }
}

customElements.define("intro-screen1", IntroScreen1);
