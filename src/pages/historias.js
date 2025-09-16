import "../components/mapaHistorias";
import "../components/common/sobreProyecto";
import "../components/common/creditos";
import "../components/common/listadoSEO";
import "../components/common/moduloReportajes";
import "../components/common/moduloNoticias";
import "../components/common/menuSwitch";
import "../components/hamburgerMenu";

class HistoriasSection extends HTMLElement {
  async connectedCallback() {
    const categoriaAttr = this.getAttribute("categoria") || "";

    this.innerHTML = `
      <section class="historias">
        <menu-switch></menu-switch>
        <hamburger-menu></hamburger-menu>

        <mapa-historias ${
          categoriaAttr ? `categoria="${categoriaAttr}"` : ""
        }></mapa-historias>

        <div class="historias-intro">
          <h2 class="historias-intro__title">Historias</h2>
          <p class="historias-intro__text">
            Lorem Ipsum is that it has a more-or-less normal distribution of there, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as etters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing package and web page editors now use Lorem Ipsum as their default model te.
            Search for 'lorem ipsum' will uncover many web sites al distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites
          </p>
        </div>
        

        <modulo-reportajes></modulo-reportajes>

        <modulo-noticias></modulo-noticias>

        <sobre-proyecto></sobre-proyecto>

        <creditos-section></creditos-section>

        <listado-seo></listado-seo>
      </section>
    `;
    this.addMenuListeners();
  }
  addMenuListeners() {
    const menu = this.querySelector("menu-switch");
    const hamburger = this.querySelector("hamburger-menu");

    if (!menu || !hamburger) return;

    // evento para abrir menú hamburguesa
    menu.addEventListener("open-menu", () => {
      hamburger.open();
    });

    // evento de navegación
    menu.addEventListener("navigate", (e) => {
      const { page } = e.detail;

      if (page === "historias") {
        window.location.href = "/historias";
      } else if (page === "fosas") {
        window.location.href = "/mapa";
      }
    });
  }
}

customElements.define("historias-section", HistoriasSection);
