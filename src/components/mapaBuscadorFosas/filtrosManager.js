/**
 * Gestiona los filtros y checkboxes del buscador de fosas
 */
export class FiltrosManager {
  constructor(component) {
    this.component = component;
    this.statusPanelExpanded = false;
  }

  // Actualiza visualmente los checkboxes según el estado interno
  actualizarEstadoCheckboxes() {
    const checkboxes = this.component.querySelectorAll(".mapa-fosas-searcher__statusCheck");
    
    checkboxes.forEach((chk) => {
      if (chk.value === "todos") {
        chk.checked = this.component.estadosSeleccionados.includes("todos");
      } else {
        chk.checked = this.component.estadosSeleccionados.includes(chk.value);
      }
    });
    
    console.log("🔄 Checkboxes actualizados. Estados:", this.component.estadosSeleccionados);
  }

  // Configura los event listeners de los filtros
  configurarEventListeners() {
    this._configurarCheckboxes();
    this._configurarBuscadorTexto();
    this._configurarToggleStatus();
    this._configurarBotonAplicar();
  }

  _configurarCheckboxes() {
    const checkboxes = this.component.querySelectorAll(".mapa-fosas-searcher__statusCheck");

    checkboxes.forEach((chk) => {
      chk.addEventListener("change", (e) => {
        const { value, checked } = e.target;

        console.log(`🔘 Checkbox ${value} ${checked ? 'marcado' : 'desmarcado'}`);

        if (value === "todos") {
          if (checked) {
            this.component.estadosSeleccionados = ["todos"];
            checkboxes.forEach((c) => {
              c.checked = c.value === "todos";
            });
            console.log("✅ Todos seleccionado, otros desmarcados");
          } else {
            this.component.estadosSeleccionados = [];
            console.log("❌ Todos deseleccionado, sin filtros activos");
          }
        } else {
          const todosChk = this.component.querySelector("#todos");

          if (checked) {
            this.component.estadosSeleccionados = this.component.estadosSeleccionados.filter(
              (v) => v !== "todos"
            );
            if (!this.component.estadosSeleccionados.includes(value)) {
              this.component.estadosSeleccionados.push(value);
            }
            if (todosChk) todosChk.checked = false;
            console.log(`✅ ${value} agregado. Estados actuales:`, this.component.estadosSeleccionados);
          } else {
            this.component.estadosSeleccionados = this.component.estadosSeleccionados.filter(
              (v) => v !== value
            );
            console.log(`❌ ${value} removido. Estados actuales:`, this.component.estadosSeleccionados);
          }
        }

        this.actualizarEstadoCheckboxes();
        const fosasFiltradas = this.component.getFosasFiltradas();
        this.component.syncResultadosYMapa(fosasFiltradas);
      });
    });
  }

  _configurarBuscadorTexto() {
    const form = this.component.querySelector(".mapa-fosas-searcher__form");
    const input = this.component.querySelector("#busqueda");
    
    if (form && input) {
      form.addEventListener("submit", (ev) => {
        ev.preventDefault();
        this.component.busquedaTexto = input.value || "";
        this.component.render();
      });
      
      input.addEventListener("input", () => {
        this.component.busquedaTexto = input.value || "";
        const fosasFiltradas = this.component.getFosasFiltradas();
        this.component.syncResultadosYMapa(fosasFiltradas);
      });
    }
  }

  _configurarToggleStatus() {
    const statusToggleBtn = this.component.querySelector("#btn-status-fosas");
    const panel = this.component.querySelector("#panel-status-fosas");
    
    if (statusToggleBtn && panel) {
      const expanded = statusToggleBtn.getAttribute("aria-expanded") === "true";
      panel.hidden = !expanded;

      statusToggleBtn.addEventListener("click", () => {
        this.statusPanelExpanded = !this.statusPanelExpanded;
        panel.hidden = !this.statusPanelExpanded;
        statusToggleBtn.setAttribute("aria-expanded", this.statusPanelExpanded);
        statusToggleBtn.classList.toggle("active", this.statusPanelExpanded);
        
        // Cerrar panel móvil cuando se abren los filtros desktop
        if (this.statusPanelExpanded && this.component.mobileSheetManager && this.component.mobileSheetManager.isActive()) {
          this.component.mobileSheetManager.close();
        }
      });
    }
  }

  _configurarBotonAplicar() {
    const btnAplicar = this.component.querySelector("#aplicar-filtros");
    if (btnAplicar) {
      btnAplicar.addEventListener("click", () => {
        const fosasFiltradas = this.component.getFosasFiltradas();
        this.component.syncResultadosYMapa(fosasFiltradas);
      });
    }
  }

  // Genera descripción dinámica de búsqueda
  getDescripcionBusqueda(totalResultados) {
    if (this.component.estadosSeleccionados.length === 0) {
      return "Sin filtros de estado seleccionados. Marca al menos una opción para ver resultados.";
    }

    let descripcion = "Resultados de la búsqueda en el mapa de fosas.";

    if (this.component.busquedaTexto) {
      descripcion += ` Búsqueda: "${this.component.busquedaTexto}".`;
    }

    if (!this.component.estadosSeleccionados.includes("todos") && this.component.estadosSeleccionados.length > 0) {
      const estadosLegibles = this.component.estadosSeleccionados.map(estado => {
        switch(estado) {
          case 'exhumados': return 'Exhumados';
          case 'no-exhumados': return 'No exhumados';
          case 'trasladada': return 'Trasladados a Cuelgamuros';
          default: return estado;
        }
      });
      descripcion += ` Filtrado por: ${estadosLegibles.join(", ")}.`;
    } else if (this.component.estadosSeleccionados.includes("todos")) {
      descripcion += " Mostrando todos los estados.";
    }

    if (totalResultados === 0) {
      descripcion += " No se encontraron fosas con los filtros aplicados.";
    } else {
      descripcion += " Utiliza los filtros para refinar tu búsqueda.";
    }

    return descripcion;
  }
}
