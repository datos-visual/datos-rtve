import "../styles/_fichaFosa.scss";
import iconFiltro from "../assets/iconFiltro.svg";
import iconExhumados from "../assets/iconFiltroExhumados.svg";
import iconLugares from "../assets/iconFiltroLugares.svg";
import iconMujeres from "../assets/iconFiltroMujeres.svg";
import iconObjetos from "../assets/iconFiltroObjetos.svg";
import iconPersonajes from "../assets/iconFiltroPersonajes.svg";
import iconRepresion from "../assets/iconFiltroRepresion.svg";
import pointIcon from "../assets/pointIcon.svg";
import iconClose from "../assets/icon-close.svg";
import "./common/modalCarrousel.js";

const iconosCategorias = {
  todas: iconFiltro,
  mujeres: iconMujeres,
  lugares: iconLugares,
  personajes: iconPersonajes,
  objetos: iconObjetos,
  represion: iconRepresion,
  Exhumaciones: iconExhumados,
};

class FichaFosa extends HTMLElement {
  constructor() {
    super();
    this._fosa = null;
    this._fichaExtra = null;
  }

  async setFosaData(data) {
    this._fosa = data;
    this._fichaExtra = null;
    if (data && data.id_datos) {
      try {
        const resp = await fetch(
          `https://www.rtve.es/datos-repo/test-fosas/fichas/${data.id_datos}.json`
        );
        if (resp.ok) {
          this._fichaExtra = await resp.json();
        }
      } catch (e) {
        console.error("Error fetching ficha extra:", e);
      }
    }
    if (this.isConnected) this.render();
  }

  set fosa(data) {
    this.setFosaData(data);
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (!this._fosa) return;

    // Datos de la fosa principal
    const {
      ccaa,
      municipio,
      provincia,
      title,
      event_date,
      status,
      n_buried,
      linea_narrativa,
      fuente_info,
      fuente_enlace,
      foto,
      video,
      audio,
    } = this._fosa;

    // Datos extra de la ficha (si existen)
    const fichaExtra = this._fichaExtra || {};
    const descripcion =
      fichaExtra.descripcion || linea_narrativa || "Sin descripción disponible";
    const fuenteInfo = fichaExtra.fuente_info || fuente_info;
    const fuenteEnlace = fichaExtra.fuente_enlace || fuente_enlace;

    const claveCategoria = (linea_narrativa || "todas").toLowerCase();

    const textoCategoria =
      claveCategoria === "exhumaciones"
        ? "Exhumados"
        : claveCategoria.charAt(0).toUpperCase() + claveCategoria.slice(1);

    const iconoCategoria = iconosCategorias[claveCategoria] || iconFiltro;

    const fotos = Array.isArray(foto) ? foto : foto ? [foto] : [];
    const videos = Array.isArray(video) ? video : video ? [video] : [];
    const audios = Array.isArray(audio) ? audio : audio ? [audio] : [];

    this.innerHTML = `
      <div class="ficha-fosa inline">
        <button class="cerrar"><img src=${iconClose} alt=""/></button>
        <div class="ficha-contenido">
          <div class="cabecera">
            <div class="info">
              <div class="info-cabecera">
                <div class="info-ubicacion">
                  <p class="ubicacion"><img src=${pointIcon} alt="Point icon"/><strong>${municipio}</strong> / ${provincia} / ${ccaa}</p>
                  <h2 class="info-ubicacion__name">${title || "Sin título"}</h2>
                </div>
                <div class="info-category">
                  <div class="category-item">
                    <img src="${iconoCategoria}" />
                    <span class="category-item__name">${textoCategoria}</span>
                  </div>
                </div>
              </div>
              
              <ul class="datos">
                <li class="datos__item"><label class="datos__label">FECHA DE LA FOSA</label><span class="datos__value">${
                  event_date || "-"
                }</span></li>
                <li class="datos__item"><label class="datos__label">ESTADO DE LA FOSA</label><span class="datos__value">${
                  status || "-"
                }</span></li>
                <li class="datos__item"><label class="datos__label">NÚMERO DE INHUMADOS</label><span class="datos__value">${
                  n_buried || "-"
                }</span></li>
              </ul>
            </div>

            <div class="foto" id="abrir-modal-btn">
              <img src="${
                foto ||
                "https://fotografias.larazon.es/clipping/cmsimages02/2024/11/15/93DFFB09-1D04-4088-99A5-94DC549EE9EC/hallada-fosa-comun-cementerio-val-51-victimas-franquismo_98.jpg?crop=1200,675,x0,y113&width=1900&height=1069&optimize=low&format=webply"
              }" />
            </div>

            <!-- modal-carrousel -->
            <modal-carrousel></modal-carrousel>
          </div>

          <div class="resumen">
            <div class="resumen-datos">
              <h3>Resumen / Descripción / Label</h3>
              <p>${descripcion}</p>
              ${
                fuenteInfo
                  ? `<h4>FUENTES</h4>
                  <a href="${fuenteEnlace}" target="_blank">${fuenteInfo} 🔗</a>`
                  : ""
              }

              <h4 style="margin-top: 62.5px" >NOTAS RELACIONADAS</h4>
              <ul>
                <li><a href="#">Lo que quedó no se ve, pero pesa</a></li>
                <li><a href="#">Escribir para no perder lo que nunca se encontró</a></li>
              </ul>
            </div>
          </div>
          <div class="multimedia">
              <h3>MATERIAL MULTIMEDIA</h3>
              <div class="multimedia-tabs">
                <button class="tab-btn active" data-tab="imagenes">
                  Imágenes <span class="badge">${fotos.length}</span>
                </button>
                <button class="tab-btn" data-tab="videos">
                  Videos <span class="badge">${videos.length}</span>
                </button>
                <button class="tab-btn" data-tab="audios">
                  Voces <span class="badge">${audios.length}</span>
                </button>
              </div>
              <div class="multimedia-content">
                <div class="tab-content active" id="imagenes">
                  ${
                    fotos.length
                      ? fotos
                          .map((f) => `<img src="${f}" alt="Imagen" />`)
                          .join("")
                      : "<p>No hay imágenes disponibles.</p>"
                  }
                </div>
                <div class="tab-content" id="videos">
                  ${
                    videos.length
                      ? videos
                          .map(
                            (v) =>
                              `<video controls src="${v}" width="100%"></video>`
                          )
                          .join("")
                      : "<p>No hay videos disponibles.</p>"
                  }
                </div>
                <div class="tab-content" id="audios">
                  ${
                    audios.length
                      ? audios
                          .map((a) => `<audio controls src="${a}"></audio>`)
                          .join("")
                      : "<p>No hay audios disponibles.</p>"
                  }
                </div>
              </div>
        </div>
      </div>
    `;

    // Lógica de abrir modal-carrousel
    const modal = this.querySelector("modal-carrousel");
    modal.imagenes = fotos.length
      ? fotos
      : [
          "https://fotografias.larazon.es/clipping/cmsimages02/2024/11/15/93DFFB09-1D04-4088-99A5-94DC549EE9EC/hallada-fosa-comun-cementerio-val-51-victimas-franquismo_98.jpg",
        ];
    const abrirBtn = this.querySelector("#abrir-modal-btn");
    abrirBtn.addEventListener("click", () => modal.open(0));

    // Cerrar ficha
    this.querySelector(".cerrar").addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("cerrar-modal", { bubbles: true }));
    });

    // Eventos de pestañas multimedia
    this.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        this.querySelectorAll(".tab-btn").forEach((b) =>
          b.classList.remove("active")
        );
        btn.classList.add("active");

        this.querySelectorAll(".tab-content").forEach((content) =>
          content.classList.remove("active")
        );
        this.querySelector(`#${tab}`).classList.add("active");
      });
    });
  }
}

customElements.define("ficha-fosa", FichaFosa);
