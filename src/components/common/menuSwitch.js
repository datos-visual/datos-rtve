import "../../styles/_menuSwitch.scss";
import IconMenu from "../../assets/icon-menu.svg"; // icono del marcador
import IconShare from "../../assets/icon-share.svg";
import IconSocialFacebook from "../../assets/icon-social-facebook.svg";
import IconSocialX from "../../assets/icon-social-x.svg";
import IconSocialWhatsApp from "../../assets/icon-social-whats.svg";
import IconSocialBluesky from "../../assets/icon-social-bluesky.svg";
import IconSocialLink from "../../assets/icon-social-link.svg";

class MenuSwitch extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <nav class="menu-switch">
        <button class="btn-menu">
          <img src="${IconMenu}" alt="Menú" />
          <span>MENÚ</span>
        </button>

        <div class="switch">
          <button class="switch-btn active" data-page="historias">HISTORIAS</button>
          <button class="switch-btn" data-page="fosas">BUSCADOR DE FOSAS</button>
        </div>
        
        <div class="social-dropdown">
            <button class="btn-share"><img src="${IconShare}" alt="Compartir" /><span>Compartir</span></button>
            <div class="social-menu-container">
                <ul class="social-menu">
                    <li>
                        <a class="social-menu__btn" href="#">
                            <img src="${IconSocialFacebook}" alt="Facebook" />
                            <span>Facebook</span>
                        </a>
                    </li>
                    <li>
                        <a class="social-menu__btn" href="#">
                            <img src="${IconSocialX}" alt="X-Twitter" />
                            <span>X - Twitter</span>
                        </a>
                    </li>
                    <li>
                        <a class="social-menu__btn" href="#">
                            <img src="${IconSocialWhatsApp}" alt="WhatsApp" />
                            <span>WhatsApp</span>
                        </a>
                    </li>
                    <li>
                        <a class="social-menu__btn" href="#">
                            <img src="${IconSocialBluesky}" alt="Bluesky" />
                            <span>Bluesky</span>
                        </a>
                    </li>
                    <li>
                        <a class="social-menu__btn" href="#">
                            <img src="${IconSocialLink}" alt="Enlace" />
                            <span>Enlace</span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
      </nav>
    `;

    this.highlightActivePage();
    this.addListeners();
  }

  highlightActivePage() {
    const currentPath = window.location.pathname;
    const buttons = this.querySelectorAll(".switch-btn");

    buttons.forEach((btn) => {
      const page = btn.dataset.page;
      btn.classList.remove("active");

      if (
        (page === "historias" && currentPath.includes("/historias")) ||
        (page === "fosas" && currentPath.includes("/mapa"))
      ) {
        btn.classList.add("active");
      }
    });
  }

  addListeners() {
    const indiceBtn = this.querySelector(".btn-menu");
    const switchBtns = this.querySelectorAll(".switch-btn");

    // Abrir menú hamburguesa
    indiceBtn.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("open-menu", { bubbles: true }));
    });

    // Switch entre páginas
    switchBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        // remover activo de todos
        switchBtns.forEach((b) => b.classList.remove("active"));
        // activar el clickeado
        btn.classList.add("active");

        // enviar evento de navegación
        this.dispatchEvent(
          new CustomEvent("navigate", {
            detail: { page: btn.dataset.page },
            bubbles: true,
          })
        );
      });
    });
  }
}

customElements.define("menu-switch", MenuSwitch);
