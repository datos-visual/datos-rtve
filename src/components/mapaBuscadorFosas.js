import "../styles/_mapaHistorias.scss";
import "./mapa/mapa-fosas.js";
import "./fichaFosa.js";
import "./botonesCategorias.js";
import "./listaFosasCompleta.js";
import { cargarFosas } from "./mapa/js/datos.js";
import { FiltrosManager, ToggleManager, Templates, DataManager, MobileSheetManager } from "./mapaBuscadorFosas/index.js";

// Los iconos ahora se manejan dentro del componente botones-categorias

const urlParams = new URLSearchParams(window.location.search);

class MapaFosasNew extends HTMLElement {
  static get observedAttributes() {
    return ["categoria"];
  }

  constructor() {
    super();
    this.fosas = [];
    this.datosListos = false;
    
    const attrCategoria = this.getAttribute("categoria");
    this.categoriaSeleccionada = attrCategoria || urlParams.get("categoria") || "todas";
    this.estadosSeleccionados = ["todos"];
    this.introVisible = true;
    this.busquedaTexto = "";
    this.listaVisible = false;
    
    // Inicializar managers
    this.filtrosManager = new FiltrosManager(this);
    this.toggleManager = new ToggleManager(this);
    this.dataManager = new DataManager(this);
    this.mobileSheetManager = new MobileSheetManager(this);
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
    this.renderBase();

    try {
      const todas = await cargarFosas();
      console.log("📦 Datos cargados:", Array.isArray(todas) ? `${todas.length} elementos` : todas);
      
      this.fosas = Array.isArray(todas) ? todas : [];
      this.datosListos = true;

      // Actualizar configuración de categoría
      const attrCategoria = this.getAttribute("categoria");
      const urlParamCat = new URLSearchParams(window.location.search).get("categoria");
      this.categoriaSeleccionada = attrCategoria || urlParamCat || this.categoriaSeleccionada || "todas";

      this.render();
    } catch (err) {
      console.error("❌ Error al cargar fosas:", err);
      this.datosListos = false;
      this.mostrarError();
    }
  }

  // Delegación a managers
  getFosasFiltradas() {
    return this.dataManager.getFosasFiltradas();
  }

  syncResultadosYMapa(fosasFiltradas) {
    this.dataManager.syncResultadosYMapa(fosasFiltradas);
  }

  addEventListeners() {
    // Configurar event listeners usando managers
    this.filtrosManager.configurarEventListeners();
    this.toggleManager.configurarEventListener();

    // Event listener para el componente lista-fosas-completa
    const listaComponent = this.querySelector("lista-fosas-completa");
    if (listaComponent) {
      listaComponent.addEventListener("item-click", (e) => {
        this.abrirModalFosa(e.detail.id);
      });
    }

    // Inicializar panel móvil
    this.mobileSheetManager.init();
  }

  abrirModalFosa(id) {
    const fosa = this.fosas.find((f) => f.id === id);
    if (!fosa) return;
    const contenedor = this.querySelector(".mapa-fosas_search");
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



  // Actualiza el componente lista-fosas-completa con los datos filtrados
  actualizarListaFosas() {
    if (!this.datosListos) {
      console.log("⏳ Datos aún no están listos, saltando actualización de lista");
      return;
    }

    const fosasFiltradas = this.getFosasFiltradas();

    // Actualizar lista desktop si existe
    const listaComponent = this.querySelector("lista-fosas-completa");
    if (listaComponent) {
      console.log("📋 Actualizando lista desktop con", fosasFiltradas.length, "fosas");

      const descripcionPersonalizada = this.filtrosManager.getDescripcionBusqueda(fosasFiltradas.length);

      listaComponent.setup(
        "mapaBuscadorFosas",
        fosasFiltradas,
        this.dataManager.renderListaFosas.bind(this.dataManager),
        {
          descripcion: descripcionPersonalizada,
          categoria: this.categoriaSeleccionada,
        }
      );

      console.log("✅ Lista desktop configurada automáticamente:", listaComponent.getDebugInfo());
    }

    // Actualizar panel móvil si está activo
    if (this.mobileSheetManager.isActive()) {
      console.log("📱 Actualizando panel móvil con", fosasFiltradas.length, "fosas");
      this.mobileSheetManager.updateContent(fosasFiltradas);
    }
  }

  renderBase() {
    this.innerHTML = Templates.renderBase(this.listaVisible);
  }

  mostrarError() {
    const loadingMsg = this.querySelector(".loading-message");
    if (loadingMsg) {
      loadingMsg.innerHTML = Templates.renderError();
    }
  }

  render() {
    if (!this.datosListos) {
      console.log("⏳ Renderizando sin datos aún...");
      return;
    }

    const fosasFiltradas = this.getFosasFiltradas();
    this.innerHTML = Templates.renderMain(this, fosasFiltradas);

    this.addEventListeners();

    // Inicializar estado usando managers
    this.filtrosManager.actualizarEstadoCheckboxes();
    this.toggleManager.verificarEstadoToggle();

    // Configurar lista y sincronizar mapa
    if (this.datosListos) {
      this.actualizarListaFosas();
      this.syncResultadosYMapa(fosasFiltradas);
    }
  }
}

customElements.define("mapa-fosas-new", MapaFosasNew);
