/**
 * Gestiona el toggle de mostrar/ocultar lista de fosas
 */
export class ToggleManager {
  constructor(component) {
    this.component = component;
  }

  // Actualiza estado del botón toggle
  actualizarBotonToggle(toggleBtn) {
    if (!toggleBtn) return;
    
    const label = this.component.listaVisible ? "Ocultar lista de fosas" : "Mostrar lista de fosas";
    
    toggleBtn.setAttribute("aria-label", label);
    toggleBtn.setAttribute("aria-pressed", this.component.listaVisible.toString());
    toggleBtn.classList.toggle("active", this.component.listaVisible);
    
    console.log(`🔘 Botón toggle actualizado: ${label}`);
  }

  // Verifica y corrige estado del toggle al inicializar
  verificarEstadoToggle() {
    const contenedorTexto = this.component.querySelector(".mapa-fosas_search");
    const contenedorFigura = this.component.querySelector(".mapa-fosas_map");
    const toggleBtn = this.component.querySelector("#toggle-busqueda");
    
    if (!contenedorTexto || !contenedorFigura || !toggleBtn) {
      console.warn("⚠️ Elementos del toggle no encontrados en verificación inicial");
      console.log("🔍 Elementos encontrados:", {
        contenedorTexto: !!contenedorTexto,
        contenedorFigura: !!contenedorFigura,
        toggleBtn: !!toggleBtn
      });
      return;
    }
    
    const tieneVistaCompleta = contenedorTexto.classList.contains("vista-completa");
    const tieneListaComponent = !!contenedorTexto.querySelector("lista-fosas-completa");
    
    let estadoCorrectoSegunDOM = false;
    
    if (!tieneVistaCompleta && tieneListaComponent) {
      estadoCorrectoSegunDOM = true;
    } else if (tieneVistaCompleta && !tieneListaComponent) {
      estadoCorrectoSegunDOM = false;
    }
    
    if (this.component.listaVisible !== estadoCorrectoSegunDOM) {
      console.log(`🔧 Corrección inicial: estado interno (${this.component.listaVisible ? 'visible' : 'oculta'}) vs DOM (${estadoCorrectoSegunDOM ? 'visible' : 'oculta'})`);
      this.component.listaVisible = estadoCorrectoSegunDOM;
    }
    
    this.actualizarBotonToggle(toggleBtn);
    console.log(`🔍 Estado toggle verificado: lista ${this.component.listaVisible ? 'visible' : 'oculta'}`);
  }

  // Configura el event listener del toggle
  configurarEventListener() {
    const toggleListaBtn = this.component.querySelector("#toggle-busqueda");
    if (toggleListaBtn) {
      toggleListaBtn.addEventListener("click", (e) => this._handleToggleClick(e));
      this.actualizarBotonToggle(toggleListaBtn);
    }
  }

  _handleToggleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log(`🔄 Toggle clicked. Estado antes: lista ${this.component.listaVisible ? 'visible' : 'oculta'}`);
    
    const contenedorTexto = this.component.querySelector(".mapa-fosas_search");
    const contenedorFigura = this.component.querySelector(".mapa-fosas_map");
  
    
    // Verificar y corregir desincronización
    this._corregirDesincronizacion(contenedorTexto);
    
    const nuevoEstado = !this.component.listaVisible;
    console.log(`🎯 Cambiando a: lista ${nuevoEstado ? 'visible' : 'oculta'}`);
    
    // Guardar posición del mapa
    const posicionActual = this._guardarPosicionMapa();
    
    // Aplicar cambios de layout
    if (nuevoEstado) {
      this._mostrarLista(contenedorTexto, contenedorFigura);
    } else {
      this._ocultarLista(contenedorTexto, contenedorFigura);
    }
    
    this.component.listaVisible = nuevoEstado;
    
    // Restaurar posición del mapa
    this._restaurarPosicionMapa(posicionActual);
    
    // Actualizar botón
    const toggleBtn = this.component.querySelector("#toggle-busqueda");
    this.actualizarBotonToggle(toggleBtn);
    
    console.log(`✅ Toggle completado. Estado final: lista ${this.component.listaVisible ? 'visible' : 'oculta'}`);
  }

  _corregirDesincronizacion(contenedorTexto) {
    const tieneVistaCompleta = contenedorTexto.classList.contains("vista-completa");
    const tieneListaComponent = !!contenedorTexto.querySelector("lista-fosas-completa");
    
    if (this.component.listaVisible && tieneVistaCompleta) {
      console.log("🔧 Corrección: estado interno dice visible pero DOM está en vista completa");
      this.component.listaVisible = false;
    } else if (!this.component.listaVisible && !tieneVistaCompleta && tieneListaComponent) {
      console.log("🔧 Corrección: estado interno dice oculta pero DOM muestra lista");
      this.component.listaVisible = true;
    }
  }

  _guardarPosicionMapa() {
    const mapa = this.component.querySelector("mapa-fosas");
    if (mapa && mapa.map) {
      try {
        const posicion = {
          center: mapa.map.getCenter(),
          zoom: mapa.map.getZoom(),
        };
        console.log("💾 Posición del mapa guardada:", posicion);
        return posicion;
      } catch (error) {
        console.warn("⚠️ No se pudo guardar posición del mapa:", error);
      }
    }
    return null;
  }

  _mostrarLista(contenedorTexto, contenedorFigura) {
    // Estado abierto: agregar 'open' al contenedor principal y quitar 'vista-completa' del search
    const contenedorPrincipal = this.component.querySelector(".mapa-fosas_content");
    if (contenedorPrincipal) {
      contenedorPrincipal.classList.add("open");
    }
    
    contenedorTexto.classList.remove("vista-completa");
    contenedorFigura.classList.remove("vista-completa");

    let listaExistente = contenedorTexto.querySelector("lista-fosas-completa");
    if (!listaExistente) {
      console.log("📋 Creando nuevo componente lista-fosas-completa");
      const listaComponent = document.createElement("lista-fosas-completa");
      contenedorTexto.appendChild(listaComponent);

      listaComponent.addEventListener("item-click", (e) => {
        this.component.abrirModalFosa(e.detail.id);
      });
      
      listaExistente = listaComponent;
    }
    
    if (this.component.datosListos) {
      this.component.actualizarListaFosas();
    }
    
    console.log("✅ Lista mostrada");
  }

  _ocultarLista(contenedorTexto, contenedorFigura) {
    // Estado cerrado: quitar todas las clases adicionales
    const contenedorPrincipal = this.component.querySelector(".mapa-fosas_content");
    if (contenedorPrincipal) {
      contenedorPrincipal.classList.remove("open");
    }
    
    // No agregar vista-completa, mantener limpio
    contenedorTexto.classList.remove("vista-completa");
    contenedorFigura.classList.remove("vista-completa");

    const listaExistente = contenedorTexto.querySelector("lista-fosas-completa");
    if (listaExistente) {
      listaExistente.remove();
      console.log("🗑️ Componente lista-fosas-completa removido");
    }
    
    console.log("✅ Lista ocultada");
  }

  _restaurarPosicionMapa(posicionActual) {
    if (!posicionActual) return;
    
    const mapa = this.component.querySelector("mapa-fosas");
    if (mapa && mapa.map) {
      try {
        mapa.map.resize();
        mapa.map.setCenter(posicionActual.center);
        mapa.map.setZoom(posicionActual.zoom);
        console.log("🗺️ Posición del mapa restaurada");
      } catch (error) {
        console.warn("⚠️ Error al restaurar posición del mapa:", error);
      }
    }
  }
}
