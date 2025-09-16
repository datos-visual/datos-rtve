import "../../styles/intro/_introScreen3.scss";
import "../scrollButton.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { PERSONAJES_DATA, INTRO_CONFIG } from "./config/constants.js";
import flechaVolver from "../../assets/flecha-volver.svg";

gsap.registerPlugin(ScrollTrigger, Draggable);

class IntroScreen3 extends HTMLElement {
  constructor() {
    super();
    this.categoria = "mujeres";
    this.animations = {};
  }

  static get observedAttributes() { return ["categoria"]; }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === "categoria" && newVal !== oldVal) {
      this.categoria = newVal || "mujeres";
      this.updateContent();
    }
  }

  connectedCallback() {
    this.render();
    this.initAnimations();
  }

  render() {
    const data = PERSONAJES_DATA[this.categoria];
    if (!data) return;

    this.innerHTML = `
      <section class="personaje-screen" id="screen3">
        <div class="personaje-container">
          <a href="/" class="btn-volver">
            <img src="${flechaVolver}" alt="" />
            <span>Volver a inicio</span>
          </a>
          
          <div class="row">
            <div class="mitad-izquierda">
              <p class="categoria-label">${data.categoria}</p>
              <h2 class="titulo-destacado">${data.titulo}</h2>
              <p class="personaje-resumen">${data.nombre} / ${data.edad}</p>
              
              <div class="continuar-historias">
                <scroll-button 
                  label="Conoce más historias" 
                  icon="mouse"
                  animated="true"
                  data-categoria="${this.categoria}">
                </scroll-button>
              </div>
              
              <div class="personaje-historia">
                <div class="sheet-handle"></div>
                <div class="historia-content">
                  <div class="mobile-header">
                    <p class="personaje-resumen-mobile">${data.nombre} / ${data.edad}</p>
                    <h2 class="titulo-destacado-mobile">${data.titulo}</h2>
                  </div>
                  <p class="historia-principal">${data.historia}</p>
                  <p class="historia-contexto">${data.contexto}</p>
                </div>
              </div>
            </div>
            
            <div class="mitad-derecha">
              <div class="personaje-visual">
                <img src="/src/assets/personajes/${data.svg}" alt="${data.nombre}" class="personaje-img" />
              </div>
              <div class="categoria-mobile">${data.categoria}</div>
              <div class="texto-flotante-mobile">${data.categoria}</div>
            </div>
          </div>
        </div>
      </section>
    `;

    this.addEventListener('scroll-button-click', () => {
      this.dispatchEvent(new CustomEvent('intro-navigation', {
        detail: { action: 'go-to-historias', data: { categoria: this.categoria } },
        bubbles: true
      }));
    });
  }

  initAnimations() {
    // Desktop reveal
    if (window.innerWidth > INTRO_CONFIG.breakpoints.tablet) {
      const content = this.querySelector('.historia-content');
      if (content) {
        gsap.set(content, { opacity: 0, y: 20 });
        this.animations.reveal = ScrollTrigger.create({
          trigger: this.querySelector('#screen3'),
          start: 'top top',
          end: '+=40%',
          pin: true,
          scrub: true,
          onUpdate: (self) => {
            const progress = Math.max(0, Math.min(1, self.progress));
            gsap.to(content, {
              opacity: progress,
              y: 20 * (1 - progress),
              duration: 0.1,
              ease: 'power2.out'
            });
          }
        });
      }
    }

    // Mobile sheet
    if (window.innerWidth <= INTRO_CONFIG.breakpoints.mobile) {
      const sheet = this.querySelector('.personaje-historia');
      const handle = this.querySelector('.sheet-handle');
      if (sheet && handle) {
        const peek = 80;
        const height = Math.min(window.innerHeight * 0.9, window.innerHeight - 50);
        const closedY = height - peek;
        
        sheet.style.height = `${height}px`;
        gsap.set(sheet, { y: closedY });

        this.animations.draggable = Draggable.create(sheet, {
          type: 'y',
          bounds: { minY: 0, maxY: closedY },
          inertia: true,
          onDragEnd: () => {
            const y = gsap.getProperty(sheet, 'y');
            const target = y < closedY / 2 ? 0 : closedY;
            gsap.to(sheet, { y: target, duration: 0.3, ease: 'power2.out' });
          }
        })[0];

        handle.addEventListener('click', () => {
          const currentY = gsap.getProperty(sheet, 'y');
          const target = currentY < closedY / 2 ? closedY : 0;
          gsap.to(sheet, { y: target, duration: 0.3, ease: 'power2.out' });
        });
      }
    }
  }

  updateContent() {
    this.cleanup();
    this.render();
    this.initAnimations();
  }

  cleanup() {
    Object.values(this.animations).forEach(animation => {
      if (animation?.kill) animation.kill();
    });
    this.animations = {};
  }

  setVisible(visible) {
    this.style.display = visible ? 'block' : 'none';
    if (!visible) this.cleanup();
  }
}

customElements.define("intro-screen3", IntroScreen3);
