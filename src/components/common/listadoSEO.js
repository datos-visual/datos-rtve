import "../../styles/_listadoSEO.scss";

// Utilidad para obtener valores únicos de un campo
function getUnicos(arr, key) {
  return [...new Set(arr.map((item) => item[key]).filter(Boolean))];
}

// Extrae /ccaa/prov/mun/ de la URL
function getURLParts() {
  const match = window.location.pathname.match(
    /^\/([^\/]+)\/([^\/]+)\/([^\/]+)\/?$/
  );
  if (match) {
    return {
      ccaa: match[1].replace(/-/g, " "),
      municipio: match[3].replace(/-/g, " "),
      provincia: match[2].replace(/-/g, " "),
    };
  }
  return null;
}

class ListadoSEO extends HTMLElement {
  constructor() {
    super();
    this.fosaSeleccionada = null;
    this.fosas = [];
  }

  set seleccionada(fosa) {
    this.fosaSeleccionada = fosa;
    this.render();
  }

  set listado(fosas) {
    this.fosas = fosas;
    this.render();
  }

  connectedCallback() {
    this.render();
    window.addEventListener("popstate", () => this.render());
  }

  render() {
    let ccaaList = [];
    let municipioList = [];
    let provinciaList = [];

    if (this.fosaSeleccionada) {
      ccaaList = [this.fosaSeleccionada.ccaa].filter(Boolean);
      municipioList = [this.fosaSeleccionada.municipio].filter(Boolean);
      provinciaList = [this.fosaSeleccionada.provincia].filter(Boolean);
    } else {
      // Si la URL tiene /ccaa/prov/mun/, mostrar esos valores
      const urlParts = getURLParts();
      if (urlParts) {
        ccaaList = [urlParts.ccaa];
        municipioList = [urlParts.municipio];
        provinciaList = [urlParts.provincia];
      } else if (this.fosas && this.fosas.length) {
        ccaaList = getUnicos(this.fosas, "ccaa");
        municipioList = getUnicos(this.fosas, "municipio");
        provinciaList = getUnicos(this.fosas, "provincia");
      }
    }

    this.innerHTML = `
      <section class="listado-seo">
        <div class="listado-seo-wrapper">
            <h3 class="listado-seo__title">Listado de <strong>Comunidades</strong>, <strong>Municipios</strong> y <strong>Provincias</strong></h3>
            <p class="listado-seo__text">
               ${ccaaList.length ? ccaaList.join(" / ") : "-"} / 
               ${municipioList.length ? municipioList.join(" / ") : "-"} / 
               ${provinciaList.length ? provinciaList.join(" / ") : "-"}
            </p>

        </div>
      </section>
    `;
  }
}

customElements.define("listado-seo", ListadoSEO);
