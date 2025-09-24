/**
 * Hook para panel móvil deslizable (bottom sheet) con GSAP Draggable
 * Optimizado para mejor rendimiento
 */
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

export function useMobileSheetManager(isEnabled = false) {
  const [isOpen, setIsOpen] = useState(false);
  const [fosasFiltradas, setFosasFiltradas] = useState([]);
  
  const sheetRef = useRef(null);
  const mapContainerRef = useRef(null);
  const draggableRef = useRef(null);
  const isInitializedRef = useRef(false);
  const animationFrameRef = useRef(null);
  const gsapRef = useRef(null);
  
  // Cargar GSAP dinámicamente con optimizaciones
  useEffect(() => {
    console.log('🚀 useMobileSheetManager useEffect:', {
      isEnabled,
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'N/A',
      shouldInit: isEnabled && typeof window !== 'undefined' && window.innerWidth <= 768
    });
    
    if (!isEnabled || typeof window === 'undefined' || window.innerWidth > 768) {
      console.log('⏭️ useMobileSheetManager cancelado - condiciones no cumplidas');
      return;
    }

    let gsap, Draggable;
    
    const initMobileSheet = async () => {
      try {
        console.log('🔧 Iniciando mobile sheet...');
        
        // Esperar a que el mapContainerRef esté disponible
        let attempts = 0;
        const maxAttempts = 20; // Aumentar intentos
        
        while (!mapContainerRef.current && attempts < maxAttempts) {
          console.log(`⏳ Esperando mapContainerRef... intento ${attempts + 1}/${maxAttempts}`);
          await new Promise(resolve => setTimeout(resolve, 200)); // Aumentar delay
          attempts++;
        }
        
        if (!mapContainerRef.current) {
          console.error('❌ mapContainerRef no disponible después de', maxAttempts, 'intentos');
          return;
        }
        
        console.log('✅ mapContainerRef disponible:', mapContainerRef.current);

        // Cargar GSAP dinámicamente solo una vez
        const gsapModule = await import('gsap');
        const draggableModule = await import('gsap/Draggable');
        gsap = gsapModule.gsap;
        Draggable = draggableModule.Draggable;
        gsap.registerPlugin(Draggable);

        // Almacenar gsap en ref para uso posterior
        gsapRef.current = gsap;
        
        // Crear el panel móvil
        createMobileSheet(gsap, Draggable);
        isInitializedRef.current = true;
      } catch (error) {
        console.error('Error cargando GSAP:', error);
      }
    };

    // Inicializar con un pequeño delay para asegurar que el DOM esté listo
    const timeoutId = setTimeout(initMobileSheet, 100);

    return () => {
      // Cleanup optimizado
      clearTimeout(timeoutId);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (draggableRef.current) {
        draggableRef.current.kill();
        draggableRef.current = null;
      }
      gsapRef.current = null;
      const panel = mapContainerRef.current?.querySelector('.mobile-fosas-sheet');
      if (panel) {
        panel.remove();
      }
      isInitializedRef.current = false;
    };
  }, [isEnabled]);

  const createMobileSheet = (gsap, Draggable) => {
    console.log('🔧 Creando mobile sheet...', {
      mapContainerRef: mapContainerRef.current,
      isEnabled,
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'N/A',
      isInitialized: isInitializedRef.current
    });
    
    if (!mapContainerRef.current) {
      console.warn('⚠️ mapContainerRef.current no está disponible');
      return;
    }

    const mapContainer = mapContainerRef.current;
    
    // Limpiar panel existente
    const existingPanel = mapContainer.querySelector('.mobile-fosas-sheet');
    if (existingPanel) {
      existingPanel.remove();
    }

    // Crear el HTML del panel (exactamente como en el proyecto original)
    const sheetHTML = `
      <div class="mobile-fosas-sheet">
        <div class="sheet-handle">
          <div class="handle-bar"></div>
        </div>
        <div class="sheet-content">
          <div class="sheet-lista-container">
            <!-- Aquí se insertará el contenido de lista-fosas-completa -->
          </div>
        </div>
      </div>
    `;

    mapContainer.insertAdjacentHTML('beforeend', sheetHTML);
    
    const sheet = mapContainer.querySelector('.mobile-fosas-sheet');
    if (!sheet) return;

    // Los estilos se aplican automáticamente desde _mobileSheet.scss
    // Solo configuramos las dimensiones específicas
    sheet.style.height = '80vh';
    sheet.style.maxHeight = '520px';

    // Configurar posición inicial (cerrado)
    const peekHeight = 60; // Altura visible cuando está cerrado
    const closedY = sheet.offsetHeight - peekHeight;
    
    gsap.set(sheet, { y: closedY });

    // Crear Draggable con optimizaciones de rendimiento
    draggableRef.current = Draggable.create(sheet, {
      type: 'y',
      bounds: { minY: 0, maxY: closedY },
      inertia: true,
      // Usar requestAnimationFrame para mejor rendimiento
      onDrag: function() {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        animationFrameRef.current = requestAnimationFrame(() => {
          const progress = 1 - (this.y / closedY);
          const opacity = Math.max(0.3, progress);
          const content = sheet.querySelector('.sheet-content');
          if (content) {
            // Usar transform en lugar de opacity para mejor rendimiento
            gsap.set(content, { 
              opacity: opacity,
              willChange: 'opacity'
            });
          }
        });
      },
      onDragEnd: function() {
        // Limpiar animation frame
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        const threshold = closedY * 0.4;
        if (this.y < threshold) {
          // Abrir con animación optimizada
          gsap.to(sheet, { 
            y: 0, 
            duration: 0.3, 
            ease: "power2.out",
            onComplete: () => setIsOpen(true)
          });
        } else {
          // Cerrar con animación optimizada
          gsap.to(sheet, { 
            y: closedY, 
            duration: 0.3, 
            ease: "power2.out",
            onComplete: () => setIsOpen(false)
          });
        }
      }
    })[0];

    // Click en handle para toggle
    const handle = sheet.querySelector('.sheet-handle');
    if (handle) {
      handle.addEventListener('click', (e) => {
        e.preventDefault();
        if (draggableRef.current) {
          const currentY = gsap.getProperty(sheet, 'y');
          if (currentY > closedY * 0.5) {
            // Abrir
            gsap.to(sheet, { y: 0, duration: 0.3, ease: "power2.out" });
            setIsOpen(true);
          } else {
            // Cerrar
            gsap.to(sheet, { y: closedY, duration: 0.3, ease: "power2.out" });
            setIsOpen(false);
          }
        }
      });
    }

    sheetRef.current = sheet;
    console.log('✅ Mobile sheet creado exitosamente:', {
      sheet: sheet,
      draggable: draggableRef.current,
      isOpen: isOpen
    });
  };

  // Función para renderizar item de fosa optimizada
  const renderFosaItem = useCallback((fosa, index) => {
    if (!fosa || !fosa.id) {
      console.warn("⚠️ Fosa sin ID válido:", fosa);
      return "";
    }

    // Lazy loading de imágenes para mejorar rendimiento
    const imageUrl = fosa.imagen || "https://fotografias.larazon.es/clipping/cmsimages02/2024/11/15/93DFFB09-1D04-4088-99A5-94DC549EE9EC/hallada-fosa-comun-cementerio-val-51-victimas-franquismo_98.jpg?crop=1200,675,x0,y113&width=1900&height=1069&optimize=low&format=webply";
    
    const ubicacion = [fosa.municipio, fosa.provincia]
      .filter(Boolean)
      .join(" / ");

    const titulo = fosa.title?.trim() || `Fosa en ${fosa.municipio || "ubicación desconocida"}`;

    return `
      <div class="fosa" data-id="${fosa.id}" data-index="${index}" style="contain: layout style paint;">
        <div class="fosa__img">
          <img 
            src="${imageUrl}" 
            alt="Fosa"
            loading="lazy"
            decoding="async"
            style="will-change: transform;">
        </div>
        <div class="info">
          <p class="ubicacion ${fosa.status}">
            <span>${fosa.municipio || ''}</span>
            ${fosa.provincia ? ' / ' + fosa.provincia : ''}
          </p>
          <h3>${titulo}</h3>
        </div>
      </div>
    `;
  }, []);

  // Función para actualizar contenido con optimizaciones y paginación
  const updateContent = useCallback((fosas = [], paginationInfo = null) => {
    console.log('🔄 updateContent llamado:', {
      fosas: fosas.length,
      paginationInfo,
      sheetRef: !!sheetRef.current,
      isEnabled,
      isOpen
    });
    
    if (!sheetRef.current || !isEnabled) {
      console.log('❌ updateContent cancelado:', {
        sheetRef: !!sheetRef.current,
        isEnabled
      });
      return;
    }

    // Evitar actualizaciones innecesarias
    if (JSON.stringify(fosas) === JSON.stringify(fosasFiltradas)) {
      console.log('⏭️ updateContent saltado - sin cambios');
      return;
    }

    setFosasFiltradas(fosas);
    
    const fosasList = sheetRef.current.querySelector('.sheet-lista-container');
    if (!fosasList) return;

    if (fosas.length === 0) {
      fosasList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No se encontraron fosas</p>';
      return;
    }

    // USAR PAGINACIÓN EN LUGAR DE LÍMITE FIJO
    const fosasToShow = paginationInfo ? fosas : fosas; // Si hay paginación, usar todas las fosas de la página
    const totalFosas = paginationInfo ? paginationInfo.totalItems : fosas.length;
    const currentPage = paginationInfo ? paginationInfo.currentPage : 1;
    const totalPages = paginationInfo ? paginationInfo.totalPages : 1;

    // Usar DocumentFragment para mejor rendimiento DOM
    const fragment = document.createDocumentFragment();
    const container = document.createElement('div');
    container.className = 'mobile-lista-fosas-completa';
    container.setAttribute('data-contexto', 'mapaBuscadorFosas');
    
    // Generar HTML de forma optimizada con paginación
    container.innerHTML = `
      <div class="mobile-contador">
        <p class="contador-text">Se muestran ${paginationInfo ? `${paginationInfo.startItem}-${paginationInfo.endItem}` : fosasToShow.length} de ${totalFosas} fosas</p>
        ${paginationInfo && paginationInfo.totalPages > 1 ? 
          `<p class="pagination-info-mobile">Página ${currentPage} de ${totalPages}</p>` : 
          ''
        }
      </div>
      
      <div class="mobile-intro-fosas visible">
        <h4 class="intro-fosas__title">Información de búsqueda</h4>
        <p class="intro-fosas__text">Resultados de la búsqueda en el mapa de fosas.</p>
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
        ${fosasToShow.map((fosa, index) => renderFosaItem(fosa, index)).filter(Boolean).join('')}
      </div>
      
      ${paginationInfo && paginationInfo.totalPages > 1 ? `
        <div class="mobile-pagination-controls">
          <button class="mobile-pagination-btn prev" ${!paginationInfo.hasPrevPage ? 'disabled' : ''} data-action="prev">
            ← Anterior
          </button>
          <span class="mobile-pagination-info">
            ${currentPage} / ${totalPages}
          </span>
          <button class="mobile-pagination-btn next" ${!paginationInfo.hasNextPage ? 'disabled' : ''} data-action="next">
            Siguiente →
          </button>
        </div>
      ` : ''}
    `;

    fragment.appendChild(container);
    fosasList.innerHTML = '';
    fosasList.appendChild(fragment);

    // Los estilos se aplican automáticamente desde _mobileSheet.scss
    // No necesitamos aplicar estilos inline

    // Adjuntar eventos para el toggle de información
    const toggleBtn = fosasList.querySelector('.mobile-toggle-intro');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const introSection = fosasList.querySelector('.mobile-intro-fosas');
        const isVisible = introSection.classList.contains('visible');
        
        if (isVisible) {
          introSection.classList.remove('visible');
          introSection.classList.add('oculto');
          toggleBtn.innerHTML = `
            <span>Más información</span>
            <svg class="chevron-icon" width="12" height="12" viewBox="0 0 12 12">
              <path d="M6 8L2 4h8l-4 4z" fill="currentColor"/>
            </svg>
          `;
        } else {
          introSection.classList.remove('oculto');
          introSection.classList.add('visible');
          toggleBtn.innerHTML = `
            <span>Menos información</span>
            <svg class="chevron-icon" width="12" height="12" viewBox="0 0 12 12">
              <path d="M6 4l4 4H2l4-4z" fill="currentColor"/>
            </svg>
          `;
        }
      });
    }

    // Usar event delegation para mejor rendimiento
    const handleFosaClick = (e) => {
      const fosaItem = e.target.closest('.fosa');
      if (!fosaItem) return;
      
      const fosaId = fosaItem.dataset.id;
      
      // Cerrar panel con animación optimizada
      if (sheetRef.current && draggableRef.current && gsapRef.current) {
        const peekHeight = 60;
        const closedY = sheetRef.current.offsetHeight - peekHeight;
        gsapRef.current.to(sheetRef.current, { 
          y: closedY, 
          duration: 0.3, 
          ease: "power2.out",
          onComplete: () => setIsOpen(false)
        });
      }
      
      // Emitir evento para que el componente padre maneje la selección
      const event = new CustomEvent('fosa-click', { 
        detail: { id: fosaId },
        bubbles: true 
      });
      document.dispatchEvent(event);
    };

    // Usar event delegation en lugar de múltiples event listeners
    fosasList.removeEventListener('click', handleFosaClick);
    fosasList.addEventListener('click', handleFosaClick);
    
    // AGREGAR EVENT LISTENERS PARA PAGINACIÓN MÓVIL
    attachMobilePaginationEvents();
  }, [isEnabled, renderFosaItem, fosasFiltradas]);

  // FUNCIÓN PARA MANEJAR EVENTOS DE PAGINACIÓN MÓVIL
  const attachMobilePaginationEvents = useCallback(() => {
    const paginationButtons = document.querySelectorAll('.mobile-pagination-btn');
    
    paginationButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = btn.dataset.action;
        
        // Emitir evento personalizado para que el componente padre maneje la paginación
        const event = new CustomEvent('mobile-pagination', { 
          detail: { action },
          bubbles: true 
        });
        document.dispatchEvent(event);
      });
    });
  }, []);

  return {
    mapContainerRef,
    updateContent,
    isOpen,
    fosasFiltradas
  };
}