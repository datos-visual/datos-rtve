import check from "../assets/Check.svg";
import "../styles/_listaFosasCompleta.scss";
import upChevron from "../assets/icon-up-chevron.svg";
import downChevron from "../assets/icon-down-chevron.svg";

// Configuraciones predefinidas por contexto
const CONFIGURACIONES_CONTEXTO = {
  mapaHistorias: {
    modoSimple: false,
    introVisible: true,
    mostrarCategoria: true,
    mostrarEstado: false,
    tipoContenido: "historias",
    descripcionDefault: "Seleccionar una línea narrativa para explorar.",
  },
  mapaBuscadorFosas: {
    modoSimple: false,
    introVisible: true,
    mostrarCategoria: false,
    mostrarEstado: true,
    tipoContenido: "fosas",
    descripcionDefault:
      "Resultados de la búsqueda en el mapa de fosas. Utiliza los filtros para refinar tu búsqueda por estado de exhumación o ubicación específica.",
  },
};

export default class ListaFosasCompleta extends HTMLElement {
  constructor() {
    super();
    this._lista = [];
    this._categoria = "todas";
    this._descripcion = "";
    this._introVisible = true;
    this._renderListaFosas = null;
    this._modoSimple = false;
    this._contexto = null; // Nuevo: contexto de uso
    this._configuracion = null; // Nuevo: configuración activa
    this._isConfigured = false; // Nuevo: flag de configuración
  }

  connectedCallback() {
    this.render();
  }

  // MÉTODO PRINCIPAL: Configurar automáticamente según contexto
  configureForContext(contexto, opciones = {}) {
    console.log(
      `🔧 Configurando lista-fosas-completa para contexto: ${contexto}`
    );

    if (!CONFIGURACIONES_CONTEXTO[contexto]) {
      console.warn(
        `⚠️ Contexto desconocido: ${contexto}. Usando configuración por defecto.`
      );
      contexto = "mapaBuscadorFosas"; // Fallback
    }

    this._contexto = contexto;
    this._configuracion = {
      ...CONFIGURACIONES_CONTEXTO[contexto],
      ...opciones,
    };

    // Aplicar configuración automáticamente
    this._modoSimple = this._configuracion.modoSimple;
    this._introVisible = this._configuracion.introVisible;
    this._descripcion =
      opciones.descripcion || this._configuracion.descripcionDefault;

    this._isConfigured = true;

    // No renderizar aún, esperar a que se configure la función de renderizado y los datos
    console.log(`✅ Configuración aplicada:`, this._configuracion);

    return this; // Para encadenamiento
  }

  // MÉTODO SIMPLIFICADO: Configurar todo de una vez
  setup(contexto, datos, funcionRender, opciones = {}) {
    console.log(
      `🚀 Setup completo para ${contexto} con ${datos?.length || 0} elementos`
    );

    try {
      // Validaciones básicas
      if (!funcionRender || typeof funcionRender !== "function") {
        console.error(
          "❌ Error en setup: funcionRender debe ser una función válida"
        );
        return this;
      }

      if (!Array.isArray(datos)) {
        console.warn(
          "⚠️ Warning en setup: datos no es un array, usando array vacío"
        );
        datos = [];
      }

      return this.configureForContext(contexto, opciones)
        .setRenderListaFosas(funcionRender)
        .setLista(datos);
    } catch (error) {
      console.error("❌ Error en setup de lista-fosas-completa:", error);
      return this;
    }
  }

  // Setters para controlar el componente desde el padre (con encadenamiento)
  setLista(lista) {
    const nuevaLista = Array.isArray(lista) ? lista : [];
    if (JSON.stringify(this._lista) !== JSON.stringify(nuevaLista)) {
      this._lista = nuevaLista;
      this.render();
    }
    return this; // Para encadenamiento
  }

  setCategoria(categoria) {
    const nuevaCategoria = categoria || "todas";
    if (this._categoria !== nuevaCategoria) {
      this._categoria = nuevaCategoria;
      this._needsRender = true;
    }
    return this; // Para encadenamiento
  }

  setDescripcion(descripcion) {
    const nuevaDescripcion = descripcion || "";
    if (this._descripcion !== nuevaDescripcion) {
      this._descripcion = nuevaDescripcion;
      this._needsRender = true;
    }
    return this; // Para encadenamiento
  }

  setIntroVisible(visible) {
    const nuevoVisible = Boolean(visible);
    if (this._introVisible !== nuevoVisible) {
      this._introVisible = nuevoVisible;
      this._needsRender = true;
    }
    return this; // Para encadenamiento
  }

  setRenderListaFosas(renderFn) {
    if (this._renderListaFosas !== renderFn) {
      this._renderListaFosas = renderFn;
      this._needsRender = true;
    }
    return this; // Para encadenamiento
  }

  setModoSimple(simple) {
    const nuevoModo = Boolean(simple);
    if (this._modoSimple !== nuevoModo) {
      this._modoSimple = nuevoModo;
      this._needsRender = true;
    }
    return this; // Para encadenamiento
  }

  // Método para forzar el render después de configurar múltiples propiedades
  forceRender() {
    if (this._needsRender) {
      this.render();
      this._needsRender = false;
    }
    return this; // Para encadenamiento
  }

  render() {
    // Validar que tenemos datos para renderizar
    if (!this._renderListaFosas) {
      console.warn(
        "⚠️ No hay función de renderizado definida para lista-fosas-completa"
      );
      return;
    }

    // Usar configuración del contexto si está disponible
    const config = this._configuracion || {};
    const tipoContenido = config.tipoContenido || "elementos";
    const tituloSeccion = this.getTituloSeccion();
    const mensajeContador = this.getMensajeContador();

    this.innerHTML = `
    <div class="lista-fosas" data-contexto="${this._contexto || "default"}">
      ${
        !this._modoSimple
          ? `
          <p class="contador">
            ${mensajeContador}
          </p>
          <div class="intro-fosas ${this._introVisible ? "visible" : "oculto"}">
            <h4 class="intro-fosas__title">${tituloSeccion}</h4>
            <p class="intro-fosas__text">${
              this._descripcion || "No hay descripción disponible"
            }</p>
            <div class="hide-button">
              <button class="toggle-intro">
                ${
                  this._introVisible
                    ? `<span>Menos información</span> <img src=${upChevron} alt="" class="" />`
                    : `<span>Más información</span> <img src=${downChevron} alt="" class="" />`
                }
              </button>
            </div>
          </div>
          
        `
          : `
          <p class="contador-simple">
          Se muestran
            ${this._descripcion || `${this._lista.length} resultados`}
          </p>
        `
      }
      <div class="lista-narrativas">
        ${
          this._lista.length > 0
            ? this._renderListaFosas(this._lista)
            : this.getMensajeVacio()
        }
      </div>
    </div>
  `;

    this.attachEvents();
  }

  // Métodos helper para mensajes dinámicos según contexto
  getTituloSeccion() {
    if (this._contexto === "mapaHistorias") {
      return "Resumen de la categoría";
    } else if (this._contexto === "mapaBuscadorFosas") {
      return "Información de búsqueda";
    }
    return "Resumen de la categoría";
  }

  getMensajeContador() {
    const config = this._configuracion || {};
    const tipoContenido = config.tipoContenido || "elementos";

    let mensaje = `Se muestran ${this._lista.length} ${tipoContenido}`;

    if (
      config.mostrarCategoria &&
      this._categoria &&
      this._categoria !== "todas"
    ) {
      mensaje += ` de <strong>${
        this._categoria[0].toUpperCase() + this._categoria.slice(1)
      }</strong>`;
    }

    return mensaje;
  }

  getMensajeVacio() {
    const config = this._configuracion || {};
    const tipoContenido = config.tipoContenido || "elementos";

    if (this._contexto === "mapaHistorias") {
      return '<p class="no-resultados">No hay historias para mostrar en esta categoría</p>';
    } else if (this._contexto === "mapaBuscadorFosas") {
      return '<p class="no-resultados">No se encontraron fosas con los filtros aplicados</p>';
    }

    return `<p class="no-resultados">No se encontraron ${tipoContenido}</p>`;
  }

  // Método para validar configuración
  isValidConfiguration() {
    return this._isConfigured && this._renderListaFosas && this._configuracion;
  }

  // Método para obtener información de debug
  getDebugInfo() {
    return {
      contexto: this._contexto,
      configuracion: this._configuracion,
      isConfigured: this._isConfigured,
      lista: this._lista.length,
      renderFunction: !!this._renderListaFosas,
    };
  }

  attachEvents() {
    // Toggle intro
    const btnIntro = this.querySelector(".toggle-intro");
    if (btnIntro) {
      btnIntro.addEventListener("click", () => {
        this._introVisible = !this._introVisible;
        this.querySelector(".intro-fosas").classList.toggle("visible");
        this.querySelector(".intro-fosas").classList.toggle("oculto");
        btnIntro.innerHTML = this._introVisible
          ? `<span>Menos información</span> <img src=${upChevron} alt="" class="" />`
          : `<span>Más información</span> <img src=${downChevron} alt="" class="" />`;

        // Emitir evento para que el padre pueda sincronizar su estado
        this.dispatchEvent(
          new CustomEvent("intro-toggle", {
            detail: { introVisible: this._introVisible },
          })
        );
      });
    }

    // Clicks en fosas
    this.querySelectorAll(".fosa").forEach((fosaEl) => {
      fosaEl.addEventListener("click", () => {
        const id = fosaEl.dataset.id;
        this.dispatchEvent(new CustomEvent("item-click", { detail: { id } }));
      });
    });
  }
}

customElements.define("lista-fosas-completa", ListaFosasCompleta);
