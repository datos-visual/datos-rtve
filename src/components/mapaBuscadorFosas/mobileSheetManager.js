import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

/**
 * Manager para el panel móvil deslizable (bottom sheet) en mapa-fosas-new
 * Basado en la implementación de introScreen3.js pero adaptado para el contexto de fosas
 */
export class MobileSheetManager {
  constructor(component) {
    this.component = component;
    this.sheet = null;
    this.handle = null;
    this.draggable = null;
    this.isOpen = false;
    this.peek = 80; // Altura visible cuando está cerrado
    this.containerHeight = 0; // Se calculará dinámicamente
    this.maxHeight = 0; // Se calculará dinámicamente
    this.closedY = 0; // Se calculará dinámicamente
    this.lastFosasFiltradas = []; // Mantener estado de las fosas filtradas
  }

  /**
   * Inicializa el panel móvil solo en dispositivos móviles
   */
  init() {
    // Solo activar en móvil
    if (window.innerWidth > 768) {
      return;
    }

    this.createSheet();
    this.setupAnimations();
    this.attachEvents();
  }

  /**
   * Crea la estructura HTML del panel móvil
   */
  createSheet() {
    // Buscar específicamente el contenedor del mapa
    const mapContainer = this.component.querySelector('.mapa-fosas_map');
    if (!mapContainer) return;

    // Asegurar que el contenedor del mapa tenga posición relativa
    mapContainer.style.position = 'relative';
    mapContainer.style.overflow = 'hidden';

    // Crear el panel si no existe
    let existingSheet = mapContainer.querySelector('.mobile-fosas-sheet');
    if (existingSheet) {
      existingSheet.remove();
    }

    const sheetHTML = `
      <div class="mobile-fosas-sheet">
        <div class="sheet-handle">
          <div class="handle-bar"></div>
          <div class="sheet-header">
            <h3 class="sheet-title">Resultados de búsqueda</h3>
            <span class="sheet-counter">0 fosas</span>
          </div>
        </div>
        <div class="sheet-content">
          <div class="sheet-lista-container">
            <!-- Aquí se insertará el contenido de lista-fosas-completa -->
          </div>
        </div>
      </div>
    `;

    mapContainer.insertAdjacentHTML('beforeend', sheetHTML);
    
    this.sheet = mapContainer.querySelector('.mobile-fosas-sheet');
    this.handle = this.sheet.querySelector('.sheet-handle');
    this.contentContainer = this.sheet.querySelector('.sheet-lista-container');
  }

  /**
   * Configura las animaciones GSAP y el comportamiento draggable
   */
  setupAnimations() {
    if (!this.sheet || !this.handle) return;

    // Calcular dimensiones basadas en el contenedor padre
    this.calculateDimensions();

    // Configurar altura y posición inicial
    this.sheet.style.height = `${this.maxHeight}px`;
    gsap.set(this.sheet, { y: this.closedY });

    // Crear draggable
    this.draggable = Draggable.create(this.sheet, {
      type: 'y',
      bounds: { minY: 0, maxY: this.closedY },
      inertia: true,
      onDrag: () => {
        this.updateSheetState();
      },
      onDragEnd: () => {
        this.snapToPosition();
      }
    })[0];
  }

  /**
   * Calcula las dimensiones del panel basándose en el contenedor del mapa
   */
  calculateDimensions() {
    const mapContainer = this.component.querySelector('.mapa-fosas_map');
    if (!mapContainer) return;

    this.containerHeight = mapContainer.offsetHeight;
    // El panel ocupa máximo el 85% del contenedor del mapa, mínimo 200px
    this.maxHeight = Math.max(200, Math.min(this.containerHeight * 0.85, 600));
    this.closedY = this.maxHeight - this.peek;
  }

  /**
   * Adjunta los event listeners
   */
  attachEvents() {
    if (!this.handle) return;

    // Click en el handle para toggle
    this.handle.addEventListener('click', (e) => {
      // Evitar que el click se propague si es en el contenido
      if (e.target.closest('.sheet-content')) return;
      
      this.toggle();
    });

    // Escuchar cambios en el tamaño de ventana
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  /**
   * Actualiza el contenido del panel con los datos de fosas
   * Usa exactamente el mismo contenido que lista-fosas-completa pero adaptado para móvil
   */
  updateContent(fosasFiltradas = []) {
    if (!this.sheet) return;

    // Guardar las fosas filtradas para mantener el estado
    this.lastFosasFiltradas = fosasFiltradas;

    // Actualizar contador en el header
    const counter = this.sheet.querySelector('.sheet-counter');
    if (counter) {
      counter.textContent = `${fosasFiltradas.length} fosas`;
    }

    // Crear una instancia temporal de lista-fosas-completa para obtener el contenido exacto
    if (this.contentContainer && this.component.dataManager) {
      // Obtener la descripción personalizada del filtrosManager
      const descripcionPersonalizada = this.component.filtrosManager.getDescripcionBusqueda(fosasFiltradas.length);
      
      // Generar el contenido exacto de lista-fosas-completa pero adaptado para móvil
      const listaContent = this.generateMobileListContent(fosasFiltradas, descripcionPersonalizada);
      
      this.contentContainer.innerHTML = listaContent;

      // Adjuntar eventos de click a las fosas
      this.attachFosaEvents();
      this.attachToggleEvents();
    }
  }

  /**
   * Genera el contenido de la lista móvil basado en lista-fosas-completa
   */
  generateMobileListContent(fosasFiltradas, descripcion) {
    const config = {
      tipoContenido: "fosas",
      mostrarCategoria: false,
      mostrarEstado: true
    };

    const mensajeContador = `Se muestran ${fosasFiltradas.length} ${config.tipoContenido}`;
    
    return `
      <div class="mobile-lista-fosas-completa" data-contexto="mapaBuscadorFosas">
        <div class="mobile-contador">
          <p class="contador-text">${mensajeContador}</p>
        </div>
        
        <div class="mobile-intro-fosas visible">
          <h4 class="intro-fosas__title">Información de búsqueda</h4>
          <p class="intro-fosas__text">${descripcion || "Resultados de la búsqueda en el mapa de fosas."}</p>
          <div class="mobile-hide-button">
            <button class="mobile-toggle-intro">
              <span>Menos información</span>
              <svg class="chevron-icon" width="12" height="12" viewBox="0 0 12 12">
                <path d="M6 4l4 4H2l4-4z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="mobile-lista-narrativas">
          ${fosasFiltradas.length > 0 
            ? this.component.dataManager.renderListaFosas(fosasFiltradas)
            : '<p class="no-resultados">No se encontraron fosas con los filtros aplicados</p>'
          }
        </div>
      </div>
    `;
  }

  /**
   * Adjunta eventos de click a los elementos de fosa
   */
  attachFosaEvents() {
    const fosaElements = this.contentContainer.querySelectorAll('.fosa');
    fosaElements.forEach(fosaEl => {
      fosaEl.addEventListener('click', () => {
        const id = fosaEl.dataset.id;
        // NO cerrar el panel, solo minimizarlo
        this.close();
        // Emitir evento para que el componente principal maneje la apertura del modal
        this.component.abrirModalFosa(id);
      });
    });
  }

  /**
   * Adjunta eventos para el toggle de información (igual que lista-fosas-completa)
   */
  attachToggleEvents() {
    const btnToggle = this.contentContainer.querySelector('.mobile-toggle-intro');
    if (btnToggle) {
      btnToggle.addEventListener('click', () => {
        const introSection = this.contentContainer.querySelector('.mobile-intro-fosas');
        const isVisible = introSection.classList.contains('visible');
        
        if (isVisible) {
          introSection.classList.remove('visible');
          introSection.classList.add('oculto');
          btnToggle.innerHTML = `
            <span>Más información</span>
            <svg class="chevron-icon" width="12" height="12" viewBox="0 0 12 12">
              <path d="M6 8L2 4h8l-4 4z" fill="currentColor"/>
            </svg>
          `;
        } else {
          introSection.classList.remove('oculto');
          introSection.classList.add('visible');
          btnToggle.innerHTML = `
            <span>Menos información</span>
            <svg class="chevron-icon" width="12" height="12" viewBox="0 0 12 12">
              <path d="M6 4l4 4H2l4-4z" fill="currentColor"/>
            </svg>
          `;
        }
      });
    }
  }

  /**
   * Abre el panel
   */
  open() {
    if (!this.sheet || !this.draggable) return;
    
    this.isOpen = true;
    this.sheet.classList.add('sheet-open');
    gsap.to(this.sheet, { y: 0, duration: 0.4, ease: "power2.out" });
    
    // Restaurar contenido si existe
    this.restoreContent();
  }

  /**
   * Cierra el panel
   */
  close() {
    if (!this.sheet || !this.draggable) return;
    
    this.isOpen = false;
    this.sheet.classList.remove('sheet-open');
    gsap.to(this.sheet, { y: this.closedY, duration: 0.4, ease: "power2.out" });
  }

  /**
   * Restaura el contenido del panel con los últimos datos filtrados
   */
  restoreContent() {
    if (this.lastFosasFiltradas.length > 0) {
      this.updateContent(this.lastFosasFiltradas);
    }
  }

  /**
   * Toggle del panel
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Actualiza el estado visual basado en la posición actual
   */
  updateSheetState() {
    if (!this.sheet) return;

    const currentY = gsap.getProperty(this.sheet, 'y');
    const progress = 1 - (currentY / this.closedY);
    
    // Actualizar opacidad del contenido basado en el progreso
    const content = this.sheet.querySelector('.sheet-content');
    if (content) {
      gsap.set(content, { opacity: Math.max(0.3, progress) });
    }
  }

  /**
   * Ajusta la posición del panel al punto más cercano
   */
  snapToPosition() {
    if (!this.sheet) return;

    const currentY = gsap.getProperty(this.sheet, 'y');
    const threshold = this.closedY * 0.4; // 40% del recorrido

    if (currentY < threshold) {
      this.open();
    } else {
      this.close();
    }
  }

  /**
   * Maneja el redimensionado de la ventana
   */
  handleResize() {
    // Recalcular dimensiones basadas en el contenedor
    this.calculateDimensions();

    if (this.sheet) {
      this.sheet.style.height = `${this.maxHeight}px`;
      
      // Reposicionar según el estado actual
      if (this.isOpen) {
        gsap.set(this.sheet, { y: 0 });
      } else {
        gsap.set(this.sheet, { y: this.closedY });
      }

      // Actualizar bounds del draggable
      if (this.draggable) {
        this.draggable.applyBounds({ minY: 0, maxY: this.closedY });
      }
    }

    // Si cambiamos a desktop, destruir el panel
    if (window.innerWidth > 768) {
      this.destroy();
    }
  }

  /**
   * Verifica si el panel está activo (solo en móvil)
   */
  isActive() {
    return window.innerWidth <= 768 && this.sheet;
  }

  /**
   * Destruye el panel y limpia los recursos
   */
  destroy() {
    if (this.draggable) {
      this.draggable.kill();
      this.draggable = null;
    }

    if (this.sheet) {
      this.sheet.remove();
      this.sheet = null;
      this.handle = null;
      this.contentContainer = null;
    }

    this.isOpen = false;
  }

  /**
   * Reinicia el manager (útil para cambios de orientación)
   */
  reset() {
    this.destroy();
    this.init();
  }
}
