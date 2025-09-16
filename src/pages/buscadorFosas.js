import "../components/common/menuSwitch";
import "../components/hamburgerMenu";
import "../components/mapaBuscadorFosas";
import "../styles/_buscadorFosas.scss";
import "../components/common/creditos";
import "../components/common/listadoSEO";
import "../components/common/moduloReportajes";
import "../components/common/moduloNoticias";
import "../components/common/sobreProyecto";
import "../components/videoScroll";
import video from "../assets/videos/VersionDesktop.mp4";
import videoMobile from "../assets/videos/VersionMobile.mp4";

class MapaSection extends HTMLElement {
  async connectedCallback() {
    await import("../components/hamburgerMenu");

    this.innerHTML = `
      <section class="buscador-mapa-fosas"> 
        <video-scroll 
          src-desktop="${video}"
          src-mobile="${videoMobile}"
          pixels-per-second="200">
        </video-scroll>
       

        <menu-switch style="z-index: 999"></menu-switch>
        <hamburger-menu></hamburger-menu>
        <mapa-fosas-new></mapa-fosas-new>

        <div class="buscador-intro" style="z-index: 999">
          <h2 class="buscador-intro__title">Buscador de fosas</h2>
          <p class="buscador-intro__text">
           La Guerra Civil y el franquismo convirtieron a España en una gran fosa común. En las últimas décadas se han exhumado los restos de más de 18.000 víctimas. Se estima que más de 20.000 siguen en cementerios, cunetas, pozos y otros lugares donde los responsables de sus asesinatos intentaron ocultar los cuerpos o enterrarlos sin dignidad, para prolongar el castigo a ellos y a sus familias.
          </p>
          <p class="buscador-intro__text">
           Además de los muertos en combate o a causa de los bombardeos, 100.000 personas fueron asesinadas por los sublevados y 55.000 por los republicanos durante la guerra. Después y hasta 1946, la dictadura mató a otras 50.000 personas, a menudo tras juicios sumarísimos sin garantías.
          </p>
          <p class="buscador-intro__text">
           Este es el primer mapa audiovisual de las fosas de la Guerra Civil y el franquismo, donde puedes descubrir las 6.000 fosas de España y recuperar la memoria de algunas de las víctimas. Una parte de la historia que yace aún en la tierra.
            <br><br>
            1. No importa la coordenada: en España no es posible estar a más de X kilómetros de una fosa común. Algunas contienen los restos de miles de personas; otras son enterramientos individuales. 
            <br/>
            2. Uno de cada XX municipios españoles tiene en su terreno al menos una fosa de la Guerra Civil o el franquismo. Se han exhumado 1.300 de las 6.000 registradas actualmente. 
            <br/>
            3. La exhumación en Priaranza del Bierzo (León) en el año 2000 marcó un hito en la preservación de la memoria democrática. Desde entonces se han recuperado los restos de más de 18.000 personas, de las cuales solo se han podido identificar unas 700. 
            <br/>
            4. A medida que continúan las prospecciones, el número de fosas sigue aumentando. Es probable que algunos de los desaparecidos no se lleguen a encontrar nunca.
          </p>
        </div>

        
        <modulo-reportajes style="z-index: 999"></modulo-reportajes>
        <modulo-noticias style="z-index: 999"></modulo-noticias>
        <sobre-proyecto style="z-index: 999"></sobre-proyecto>
        <creditos-section style="z-index: 999"></creditos-section>
        <listado-seo style="z-index: 999"></listado-seo>
      </section>
    `;

    this.addMenuListeners();
  }

  addMenuListeners() {
    const menu = this.querySelector("menu-switch");
    const hamburger = this.querySelector("hamburger-menu");

    if (!menu || !hamburger) return;

    menu.addEventListener("open-menu", () => {
      hamburger.open();
    });

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

customElements.define("mapa-section", MapaSection);
