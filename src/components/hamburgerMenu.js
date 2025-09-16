import menuArrow from "../assets/menuArrow.svg";
import closeMenu from "../assets/CierreMenu.svg";
import closeMenuHover from "../assets/CierreMenuHover.svg";
import facebookIcon from "../assets/facebookIcon.svg";
import xIcon from "../assets/xIcon.svg";
import whatsappIcon from "../assets/whatsappIcon.svg";
import linkIcon from "../assets/linkIcon.svg";

class HamburgerMenu extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
        <div class="hamburger-menu">
          <div class="close-menu">
            <img src=${closeMenu} alt="Cerrar menú" class="img--static" />
            <img src=${closeMenuHover} alt="Cerrar menú" class="img--hover" />
          </div>
          <div class="hamburger-title">
            <p class="hamburger-title__text">El país de las 6.000 fosas</p>
            <span class="hamburger-title__slogan">AQUÍ YACE LA HISTORIA</span>
          </div>
          <div class="menu-itens">
            <div class="menu-item">
                <a class="menu-item__btn" href="/" data-link>Inicio
                    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill="" d="M17.7316 6.99639C17.7316 6.80124 17.6521 6.62055 17.4931 6.46877L11.2845 0.252969C11.0966 0.0650491 10.9231 0 10.7352 0C10.3449 0 10.0413 0.289107 10.0413 0.679402C10.0413 0.867325 10.1064 1.04802 10.2365 1.17811L12.7662 3.74393L16.1415 6.85907L16.3077 6.44709L13.4672 6.29531H1.10792C0.70317 6.29531 0.414062 6.58441 0.414062 6.99639C0.414062 7.40114 0.70317 7.69748 1.10792 7.69748H13.4672L16.3077 7.53843L16.1415 7.13372L12.7662 10.2489L10.2365 12.8075C10.1136 12.9376 10.0413 13.1255 10.0413 13.3134C10.0413 13.7037 10.3449 13.9927 10.7352 13.9927C10.9231 13.9927 11.0893 13.9205 11.2484 13.776L17.4931 7.51675C17.6521 7.37223 17.7316 7.19154 17.7316 6.99639Z"/>
                    </svg>
                </a>
            </div>
            <div class="menu-item">
                <a class="menu-item__btn" href="/historias" data-link>Historias 
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill="" d="M17.7316 6.99639C17.7316 6.80124 17.6521 6.62055 17.4931 6.46877L11.2845 0.252969C11.0966 0.0650491 10.9231 0 10.7352 0C10.3449 0 10.0413 0.289107 10.0413 0.679402C10.0413 0.867325 10.1064 1.04802 10.2365 1.17811L12.7662 3.74393L16.1415 6.85907L16.3077 6.44709L13.4672 6.29531H1.10792C0.70317 6.29531 0.414062 6.58441 0.414062 6.99639C0.414062 7.40114 0.70317 7.69748 1.10792 7.69748H13.4672L16.3077 7.53843L16.1415 7.13372L12.7662 10.2489L10.2365 12.8075C10.1136 12.9376 10.0413 13.1255 10.0413 13.3134C10.0413 13.7037 10.3449 13.9927 10.7352 13.9927C10.9231 13.9927 11.0893 13.9205 11.2484 13.776L17.4931 7.51675C17.6521 7.37223 17.7316 7.19154 17.7316 6.99639Z"/>
                </svg>
                </a>
            </div>
            <div class="menu-item">
                <a class="menu-item__btn" href="/mapa" data-link>Buscador de Fosas 
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill="" d="M17.7316 6.99639C17.7316 6.80124 17.6521 6.62055 17.4931 6.46877L11.2845 0.252969C11.0966 0.0650491 10.9231 0 10.7352 0C10.3449 0 10.0413 0.289107 10.0413 0.679402C10.0413 0.867325 10.1064 1.04802 10.2365 1.17811L12.7662 3.74393L16.1415 6.85907L16.3077 6.44709L13.4672 6.29531H1.10792C0.70317 6.29531 0.414062 6.58441 0.414062 6.99639C0.414062 7.40114 0.70317 7.69748 1.10792 7.69748H13.4672L16.3077 7.53843L16.1415 7.13372L12.7662 10.2489L10.2365 12.8075C10.1136 12.9376 10.0413 13.1255 10.0413 13.3134C10.0413 13.7037 10.3449 13.9927 10.7352 13.9927C10.9231 13.9927 11.0893 13.9205 11.2484 13.776L17.4931 7.51675C17.6521 7.37223 17.7316 7.19154 17.7316 6.99639Z"/>
                </svg>
                </a>
            </div>
            <div class="menu-item">
                <a class="menu-item__btn" href="/mapa" data-link>Reportajes 
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill="" d="M17.7316 6.99639C17.7316 6.80124 17.6521 6.62055 17.4931 6.46877L11.2845 0.252969C11.0966 0.0650491 10.9231 0 10.7352 0C10.3449 0 10.0413 0.289107 10.0413 0.679402C10.0413 0.867325 10.1064 1.04802 10.2365 1.17811L12.7662 3.74393L16.1415 6.85907L16.3077 6.44709L13.4672 6.29531H1.10792C0.70317 6.29531 0.414062 6.58441 0.414062 6.99639C0.414062 7.40114 0.70317 7.69748 1.10792 7.69748H13.4672L16.3077 7.53843L16.1415 7.13372L12.7662 10.2489L10.2365 12.8075C10.1136 12.9376 10.0413 13.1255 10.0413 13.3134C10.0413 13.7037 10.3449 13.9927 10.7352 13.9927C10.9231 13.9927 11.0893 13.9205 11.2484 13.776L17.4931 7.51675C17.6521 7.37223 17.7316 7.19154 17.7316 6.99639Z"/>
                </svg>
                </a>
            </div>
            <div class="menu-item">
                <a class="menu-item__btn" href="/mapa" data-link>Personajes 
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill="" d="M17.7316 6.99639C17.7316 6.80124 17.6521 6.62055 17.4931 6.46877L11.2845 0.252969C11.0966 0.0650491 10.9231 0 10.7352 0C10.3449 0 10.0413 0.289107 10.0413 0.679402C10.0413 0.867325 10.1064 1.04802 10.2365 1.17811L12.7662 3.74393L16.1415 6.85907L16.3077 6.44709L13.4672 6.29531H1.10792C0.70317 6.29531 0.414062 6.58441 0.414062 6.99639C0.414062 7.40114 0.70317 7.69748 1.10792 7.69748H13.4672L16.3077 7.53843L16.1415 7.13372L12.7662 10.2489L10.2365 12.8075C10.1136 12.9376 10.0413 13.1255 10.0413 13.3134C10.0413 13.7037 10.3449 13.9927 10.7352 13.9927C10.9231 13.9927 11.0893 13.9205 11.2484 13.776L17.4931 7.51675C17.6521 7.37223 17.7316 7.19154 17.7316 6.99639Z"/>
                </svg>
                </a>
            </div>
            <div class="menu-item">
                <a class="menu-item__btn" href="/mapa" data-link>Sobre el proyecto 
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill="" d="M17.7316 6.99639C17.7316 6.80124 17.6521 6.62055 17.4931 6.46877L11.2845 0.252969C11.0966 0.0650491 10.9231 0 10.7352 0C10.3449 0 10.0413 0.289107 10.0413 0.679402C10.0413 0.867325 10.1064 1.04802 10.2365 1.17811L12.7662 3.74393L16.1415 6.85907L16.3077 6.44709L13.4672 6.29531H1.10792C0.70317 6.29531 0.414062 6.58441 0.414062 6.99639C0.414062 7.40114 0.70317 7.69748 1.10792 7.69748H13.4672L16.3077 7.53843L16.1415 7.13372L12.7662 10.2489L10.2365 12.8075C10.1136 12.9376 10.0413 13.1255 10.0413 13.3134C10.0413 13.7037 10.3449 13.9927 10.7352 13.9927C10.9231 13.9927 11.0893 13.9205 11.2484 13.776L17.4931 7.51675C17.6521 7.37223 17.7316 7.19154 17.7316 6.99639Z"/>
                </svg>
                </a>
            </div>
          </div>
        </div>
      <div class="menu-overlay"></div>
    `;

    this.menu = this.querySelector(".hamburger-menu");
    this.closeBtn = this.querySelector(".close-menu");

    // cerrar con botón ✖
    this.closeBtn.addEventListener("click", () => this.close());

    // interceptar navegación SPA + cerrar menú
    this.querySelectorAll("a[data-link]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const href = link.getAttribute("href");
        window.history.pushState({}, "", href);
        import("../router.js").then(({ router }) => router(href));
        this.close();
      });
    });
  }

  // 👇 Métodos públicos
  open() {
    this.menu.classList.add("active");
  }

  close() {
    this.menu.classList.remove("active");
  }

  toggle() {
    this.menu.classList.toggle("active");
  }
}

customElements.define("hamburger-menu", HamburgerMenu);
