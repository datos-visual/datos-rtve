import "../styles/_mapaHistorias.scss";
import check from "../assets/Check.svg";
import iconFiltro from "../assets/iconFiltro.svg";
import "./mapa/mapa-fosas.js";
import "./fichaFosa.js";
import "./botonesCategorias.js";
import "./listaFosasCompleta.js";
import { cargarFosas } from "./mapa/js/datos.js";
import iconExhumados from "../assets/iconFiltroExhumados.svg";
import iconLugares from "../assets/iconFiltroLugares.svg";
import iconMujeres from "../assets/iconFiltroMujeres.svg";
import iconObjetos from "../assets/iconFiltroObjetos.svg";
import iconPersonajes from "../assets/iconFiltroPersonajes.svg";
import iconRepresion from "../assets/iconFiltroRepresion.svg";
import pinLineaNarrativa from "../assets/pinUbicacionLineaNarrativa.svg";
import mapIconButton from "../assets/mapIconButton.svg";
import listIconButton from "../assets/listIconButton.svg";

const CATEGORIAS = [
  "todas",
  "mujeres",
  "lugares",
  "personajes",
  "objetos",
  "represion",
  "Exhumaciones",
];

const ESTADOS = [
  { value: "todos", label: "Todos" },
  { value: "exhumados", label: "Exhumados" },
  { value: "no-exhumados", label: "No exhumados" },
  { value: "cuelgamuros", label: "Trasladados a Cuelgamuros" },
];

const TEXTOS_CATEGORIA = {
  todas: "Seleccionar una línea narrativa para explorar.",

  mujeres:
    "Un 3% de los cuerpos recuperados en las fosas son de mujeres. Algunas fueron asesinadas por sus ideas o acciones –como María Domínguez, alcaldesa de Gallur y feminista– y otras, simplemente, por ser esposas, madres, hijas o hermanas de hombres cercanos al bando republicano. Aunque la proporción de asesinadas fue menor, los golpistas a menudo ejercieron contra ellas un tipo de violencia específica, que incluía agresiones sexuales y humillaciones, y que durante décadas permaneció oculta.",

  lugares:
    "La mayoría de las fosas comunes no se encuentran en cunetas, sino dentro de los cementerios o junto a sus tapias, donde a menudo los fusilaban. Algunas víctimas acabaron en pozos, como el de Tenoya, en Canarias, donde fue arrojado el cuerpo de José Sosa Déniz junto al de otros represaliados. Minas, simas, cuevas y hasta tubos volcánicos fueron también utilizados. Otros cuerpos fueron arrojados al mar, con la intención de hacerlos desaparecer para siempre.",

  objetos:
    "Munición, una alianza, un sonajero o las últimas cartas de un condenado a muerte. Los objetos que aparecen en las fosas ayudan a identificar a las víctimas, como ocurrió con la botella que contenía el nombre de Germán Pérez, concejal de Unión Republicana en Utiel (Granada). En ocasiones, además, estos hallazgos sirven para esclarecer las circunstancias de los asesinatos.",

  personajes:
    "Lorca, Blas Infante, Ramón Acín, Aitzol, Pedro Muñoz Seca… Destacados representantes de la vida política o cultural fueron asesinados y arrojados a fosas comunes. Algunos continúan desaparecidos.",

  represion:
    "Los sublevados señalaron para su eliminación a los representantes políticos de la República, a miembros de partidos y sindicatos y a colectivos como el de los maestros, como Ángel Matarán. Terminada la guerra, la dictadura siguió persiguiendo a opositores políticos y guerrilleros. En la retaguardia republicana fueron asesinados casi 7.000 miembros del clero.", // Rellenar si corresponde

  Exhumaciones:
    "La mayoría de los asesinados en la retaguardia republicana fueron exhumados tras la guerra. En cambio, los familiares de los represaliados por los sublevados tuvieron que recuperar sus cuerpos a escondidas, o esperaron a la llegada de la transición para excavar la tierra con sus propias manos y darles un entierro digno. A Jesús Moreno Sádaba, fusilado en 1936, su familia le pudo desenterrar en 1979, en una de los grandes hallazgos de las exhumaciones tempranas en Navarra.",
};

function getDescripcionCategoria(categoria) {
  const key = categoria in TEXTOS_CATEGORIA ? categoria : "todas";
  return TEXTOS_CATEGORIA[key];
}

const urlParams = new URLSearchParams(window.location.search);

class MapaHistorias extends HTMLElement {
  static get observedAttributes() {
    return ["categoria"];
  }

  constructor() {
    super();
    this.fosas = [];
    const attrCategoria = this.getAttribute("categoria");
    this.categoriaSeleccionada =
      attrCategoria || urlParams.get("categoria") || "todas";
    this.estadoSeleccionado = "todos";
    this.introVisible = false;
    this.mostrarMapa = false; // estado inicial no mobile
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === "categoria" && newVal && newVal !== oldVal) {
      this.categoriaSeleccionada = newVal;
      if (this.isConnected) {
        this.render();
      }
    }
  }

  async connectedCallback() {
    try {
      const todas = await cargarFosas();
      this.fosas = todas.filter(
        (f) =>
          typeof f.linea_narrativa === "string" &&
          f.linea_narrativa.trim() &&
          f.linea_narrativa.trim().toLowerCase() !== "null"
      );
    } catch (err) {
      console.error("❌ Error al cargar fosas:", err);
    }

    const attrCategoria = this.getAttribute("categoria");
    const urlParamCat = new URLSearchParams(window.location.search).get(
      "categoria"
    );
    this.categoriaSeleccionada =
      attrCategoria || urlParamCat || this.categoriaSeleccionada || "todas";

    this.render();
  }

  getFosasFiltradas() {
    let fosas = this.fosas;

    if (this.categoriaSeleccionada !== "todas") {
      fosas = fosas.filter((f) =>
        f.linea_narrativa
          ?.toLowerCase()
          .includes(this.categoriaSeleccionada.toLowerCase())
      );
    }

    if (this.estadoSeleccionado !== "todos") {
      const filtroEstado = {
        exhumados: "exhumada",
        "no-exhumados": "no exhumada",
        cuelgamuros: "trasladada",
      }[this.estadoSeleccionado];

      fosas = fosas.filter((f) => f.status?.toLowerCase() === filtroEstado);
    }

    return fosas;
  }

  render() {
    const fosasFiltradas = this.getFosasFiltradas();
    const descripcion = getDescripcionCategoria(this.categoriaSeleccionada);

    const isMobile = window.innerWidth <= 768;

    this.innerHTML = `
      <div class="vista-figura">
        <div class="contenido ${isMobile ? "mobile" : "desktop"}">

          <div class="mitad-texto" style="${
            isMobile && this.mostrarMapa ? "display:none" : ""
          }">
            <p class="mitad-texto__intro">Seleccionar una línea narrativa para explorar</p>
            <botones-categorias
              categorias='${JSON.stringify(CATEGORIAS)}'
              seleccionada="${this.categoriaSeleccionada}">
            </botones-categorias>
            <lista-fosas-completa></lista-fosas-completa>
          </div>

          <div class="mitad-figura" style="${
            isMobile && !this.mostrarMapa ? "display:none" : ""
          }">
            <mapa-fosas solo-narrativas categoria="${
              this.categoriaSeleccionada
            }" 
              style="width: 100%; height: 100%"></mapa-fosas>
          </div>

          ${
            isMobile
              ? `<button id="toggle-vista" class="toggle-btn">
                  <img src="${
                    this.mostrarMapa ? listIconButton : mapIconButton
                  }" alt="Icono" />
                   ${this.mostrarMapa ? "Mostrar lista" : "Mostrar mapa"}
                 </button>`
              : ""
          }
        </div>
      </div>
    `;

    const listaComponent = this.querySelector("lista-fosas-completa");
    if (listaComponent) {
      listaComponent.setup(
        "mapaHistorias",
        fosasFiltradas,
        this.renderListaFosas.bind(this),
        {
          descripcion: descripcion,
          categoria: this.categoriaSeleccionada,
          introVisible: this.introVisible,
        }
      );
    }

    this.addEventListeners();

    const toggleBtn = this.querySelector("#toggle-vista");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        this.mostrarMapa = !this.mostrarMapa;
        this.render();
      });
    }
  }

  renderListaFosas(lista) {
    if (!Array.isArray(lista) || lista.length === 0) {
      return '<p class="no-resultados">No hay historias para mostrar en esta categoría</p>';
    }

    return lista
      .map((fosa) => {
        if (!fosa || !fosa.id) {
          return "";
        }
        const ubicacion = [fosa.municipio, fosa.provincia]
          .filter(Boolean)
          .join(" / ");
        const titulo =
          fosa.title?.trim() ||
          `Historia en ${fosa.municipio || "ubicación desconocida"}`;
        const descripcion = this.getDescripcionHistoria(fosa);

        return `
        <div class="fosa" data-id="${fosa.id}">
          <div class="fosa__img">
          <img src="https://fotografias.larazon.es/clipping/cmsimages02/2024/11/15/93DFFB09-1D04-4088-99A5-94DC549EE9EC/hallada-fosa-comun-cementerio-val-51-victimas-franquismo_98.jpg?crop=1200,675,x0,y113&width=1900&height=1069&optimize=low&format=webply" alt="Historia" class="">
</div>
          <div class="info">
            <p class="ubicacion"><img src="${pinLineaNarrativa}"/> <strong>${fosa.municipio}</strong> / ${fosa.provincia}</p>
            <p class="descripcion">${fosa.title}</p>
          </div>
        </div>
      `;
      })
      .filter(Boolean)
      .join("");
  }

  getDescripcionHistoria(fosa) {
    if (fosa.detalle_linea_narrativa?.trim()) {
      return fosa.detalle_linea_narrativa.trim();
    }
    if (fosa.status?.trim()) {
      return `Estado: ${fosa.status.trim()}`;
    }
    if (fosa.event_date) {
      return `Fecha: ${fosa.event_date}`;
    }
    return "Historia con línea narrativa disponible";
  }

  addEventListeners() {
    const listaComponent = this.querySelector("lista-fosas-completa");
    if (listaComponent) {
      listaComponent.addEventListener("item-click", (e) => {
        this.abrirModalFosa(e.detail.id);
      });

      listaComponent.addEventListener("intro-toggle", (e) => {
        this.introVisible = e.detail.introVisible;
      });
    }

    this.querySelector("botones-categorias")?.addEventListener(
      "categoria-cambiada",
      (e) => {
        const nuevaCat = e.detail;
        this.categoriaSeleccionada = nuevaCat;

        const url = new URL(window.location);
        url.searchParams.set("categoria", nuevaCat);
        window.history.replaceState({}, "", url);

        this.render();
      }
    );
  }

  abrirModalFosa(id) {
    const fosa = this.fosas.find((f) => f.id === id);
    if (!fosa) return;
    const contenedor = this.querySelector(".mitad-texto");
    this._vistaAnterior = contenedor.innerHTML;
    const modal = document.createElement("ficha-fosa");
    modal.fosa = fosa;
    modal.addEventListener("cerrar-modal", () => {
      contenedor.innerHTML = this._vistaAnterior;
      this.addEventListeners();
    });
    contenedor.innerHTML = "";
    contenedor.appendChild(modal);
  }
}

customElements.define("mapa-historias", MapaHistorias);
