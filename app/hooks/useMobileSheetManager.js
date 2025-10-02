/**
 * Hook simplificado para panel móvil deslizable (bottom sheet) con GSAP Draggable
 */
import { useState, useRef, useEffect, useCallback } from 'react';

// Configuración y utilidades
const CONFIG = {
  HEIGHT: '80vh',
  MAX_HEIGHT: '520px',
  PEEK_HEIGHT: 60,
  ANIMATION_DURATION: 0.2,
  RETRY_DELAY: 200,
  INIT_DELAY: 50,
  SCROLL_THRESHOLD: 100,
  DEBOUNCE_DELAY: 150
};

// Utilidades extraídas
const UTILS = {
  // Generar skeleton HTML
  skeletonHTML: () => `
    <div class="mobile-loading-cards">
      ${Array.from({ length: 3 }, () => `
        <div class="loading-skeleton">
          <div class="skeleton-img"></div>
          <div class="skeleton-content">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line long"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `,

  // Generar contador HTML
  contadorHTML: (loadedItems, totalFosas, hasMore) => `
    <p class="contador-text">Se muestran ${loadedItems} de ${totalFosas} fosas</p>
    ${hasMore ? 
      `<p class="loading-info-mobile">Desplázate hacia abajo para cargar más (${totalFosas - loadedItems} restantes)...</p>` : 
      `<p class="loading-info-mobile">✅ Todas las fosas cargadas (${totalFosas} elementos)</p>`
    }
  `,

  // Generar evento de carga
  createLoadEvent: (source) => new CustomEvent('mobile-load-more', { 
    detail: { source }, 
    bubbles: true 
  }),

  // Generar evento de click de fosa
  createFosaClickEvent: (id) => new CustomEvent('fosa-click', { 
    detail: { id }, 
    bubbles: true 
  }),

  // Animar items
  animateItems: (container) => {
    setTimeout(() => {
      const items = container.querySelectorAll('.scroll-item');
      items.forEach((item, index) => {
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, index * 20);
      });
    }, 50);
  }
};

export function useMobileSheetManager(isEnabled = false) {
  const [isOpen, setIsOpen] = useState(false);
  const [fosasFiltradas, setFosasFiltradas] = useState([]);
  
  const sheetRef = useRef(null);
  const mapContainerRef = useRef(null);
  const draggableRef = useRef(null);
  const gsapRef = useRef(null);
  
  // Inicializar GSAP de forma simplificada
  useEffect(() => {
    if (!isEnabled || typeof window === 'undefined' || window.innerWidth > 768) {
      return;
    }

    const initMobileSheet = async () => {
      try {
        // Esperar a que el contenedor esté disponible
        await waitForContainer();
        
        // Cargar GSAP
        const { gsap, Draggable } = await loadGSAP();
        gsapRef.current = gsap;
        
        createMobileSheet(gsap, Draggable);
      } catch (error) {
        // Error inicializando mobile sheet
      }
    };

    const timeoutId = setTimeout(initMobileSheet, CONFIG.INIT_DELAY);

    return () => {
      clearTimeout(timeoutId);
      cleanup();
    };
  }, [isEnabled]);

  // Función simplificada para esperar el contenedor
  const waitForContainer = useCallback(async () => {
    let attempts = 0;
    while (!mapContainerRef.current && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
      attempts++;
    }
    return mapContainerRef.current;
  }, []);

  // Función simplificada para cargar GSAP
  const loadGSAP = useCallback(async () => {
    const [gsapModule, draggableModule] = await Promise.all([
      import('gsap'),
      import('gsap/Draggable')
    ]);
    
    const gsap = gsapModule.gsap;
    const Draggable = draggableModule.Draggable;
    gsap.registerPlugin(Draggable);
    
    return { gsap, Draggable };
  }, []);

  // Función simplificada para cleanup
  const cleanup = useCallback(() => {
    if (draggableRef.current) {
      draggableRef.current.kill();
      draggableRef.current = null;
    }
    gsapRef.current = null;
    const panel = mapContainerRef.current?.querySelector('.mobile-fosas-sheet');
    if (panel) panel.remove();
  }, []);

  // Función simplificada para crear el mobile sheet
  const createMobileSheet = useCallback((gsap, Draggable) => {
    if (!mapContainerRef.current) return;

    const mapContainer = mapContainerRef.current;
    
    // Limpiar panel existente
    const existingPanel = mapContainer.querySelector('.mobile-fosas-sheet');
    if (existingPanel) existingPanel.remove();

    // Crear el HTML del panel
    const sheetHTML = `
      <div class="mobile-fosas-sheet">
        <div class="sheet-handle">
          <div class="handle-bar"></div>
        </div>
        <div class="sheet-content">
          <div class="sheet-lista-container"></div>
        </div>
      </div>
    `;

    mapContainer.insertAdjacentHTML('beforeend', sheetHTML);
    const sheet = mapContainer.querySelector('.mobile-fosas-sheet');
    if (!sheet) return;

    // Configurar dimensiones y posición inicial
    sheet.style.height = CONFIG.HEIGHT;
    sheet.style.maxHeight = CONFIG.MAX_HEIGHT;
    const closedY = sheet.offsetHeight - CONFIG.PEEK_HEIGHT;
    gsap.set(sheet, { y: closedY });

    // Crear Draggable simplificado
    draggableRef.current = Draggable.create(sheet, {
      type: 'y',
      bounds: { minY: 0, maxY: closedY },
      inertia: true,
      onDrag: function() {
        const progress = 1 - (this.y / closedY);
        const opacity = Math.max(0.3, progress);
        const content = sheet.querySelector('.sheet-content');
        if (content) {
          gsap.set(content, { opacity, willChange: 'opacity' });
        }
      },
      onDragEnd: function() {
        const threshold = closedY * 0.4;
        const isOpening = this.y < threshold;
        const targetY = isOpening ? 0 : closedY;
        
        gsap.to(sheet, { 
          y: targetY, 
          duration: CONFIG.ANIMATION_DURATION,
          ease: "power2.out",
          onComplete: () => setIsOpen(isOpening)
        });
      }
    })[0];

    // Configurar handle click
    const handle = sheet.querySelector('.sheet-handle');
    if (handle) {
      handle.addEventListener('click', (e) => {
        e.preventDefault();
        if (draggableRef.current) {
          const currentY = gsap.getProperty(sheet, 'y');
          const isOpening = currentY > closedY * 0.5;
          const targetY = isOpening ? 0 : closedY;
          
          gsap.to(sheet, { 
            y: targetY, 
            duration: CONFIG.ANIMATION_DURATION, 
            ease: "power2.out" 
          });
          setIsOpen(isOpening);
        }
      });
    }

    sheetRef.current = sheet;
  }, []);

  // Función ultra-simplificada para renderizar item de fosa
  const renderFosaItem = useCallback((fosa, index) => {
    if (!fosa?.id) return "";

    const defaultImage = "https://fotografias.larazon.es/clipping/cmsimages02/2024/11/15/93DFFB09-1D04-4088-99A5-94DC549EE9EC/hallada-fosa-comun-cementerio-val-51-victimas-franquismo_98.jpg?crop=1200,675,x0,y113&width=1900&height=1069&optimize=low&format=webply";
    const titulo = fosa.title?.trim() || `Fosa en ${fosa.municipio || "ubicación desconocida"}`;
    
    // Usar imagenDestacada si existe, sino foto, sino imagen, sino default
    const imagenUrl = fosa.imagenDestacada || fosa.foto || fosa.imagen || defaultImage;
    
    // Solo mostrar imagen si hay imagenDestacada o foto
    const mostrarImagen = fosa.imagenDestacada || fosa.foto;

    return `
      <div class="fosa scroll-item" data-id="${fosa.id}" data-index="${index}" style="opacity: 0; transform: translateY(20px); transition: opacity 0.4s ease-out, transform 0.4s ease-out; transition-delay: ${(index % 20) * 50}ms;">
        ${mostrarImagen ? `
          <div class="fosa__img">
            <img src="${imagenUrl}" alt="Fosa" loading="lazy" decoding="async">
          </div>
        ` : ''}
        <div class="info">
          <p class="ubicacion ${fosa.status}">
            <span>${fosa.municipio || ''}</span>${fosa.provincia ? ' / ' + fosa.provincia : ''}
          </p>
          <h3>${titulo}</h3>
        </div>
      </div>
    `;
  }, []);

  // Función ultra-simplificada para agregar nuevas fosas
  const addNewFosas = useCallback((fosas = []) => {
    if (!sheetRef.current || !isEnabled) return;
    
    const mobileLista = sheetRef.current.querySelector('.mobile-lista-narrativas');
    if (!mobileLista) return;
    
    const existingFosas = Array.from(mobileLista.querySelectorAll('.fosa'))
      .map(el => el.getAttribute('data-id'));
    const newFosas = fosas.filter(fosa => !existingFosas.includes(fosa.id));
    
    if (newFosas.length > 0) {
      mobileLista.querySelector('.mobile-loading-cards')?.remove();
      const newFosasHTML = newFosas
        .map((fosa, index) => renderFosaItem(fosa, fosas.indexOf(fosa)))
        .join('');
      mobileLista.insertAdjacentHTML('beforeend', newFosasHTML);
      UTILS.animateItems(mobileLista);
    }
  }, [isEnabled, renderFosaItem]);

  // Función ultra-simplificada para generar HTML del contenedor
  const generateContainerHTML = useCallback((fosas, loadingInfo, isLoadingMore) => {
    const totalFosas = loadingInfo?.totalItems || fosas.length;
    const loadedItems = loadingInfo?.loadedItems || fosas.length;
    const hasMore = loadingInfo?.hasMore || false;
    
    return `
      <div class="mobile-contador">
        ${UTILS.contadorHTML(loadedItems, totalFosas, hasMore)}
      </div>
      
      <div class="mobile-lista-narrativas">
        ${isLoadingMore ? UTILS.skeletonHTML() : ''}
        ${fosas.map((fosa, index) => renderFosaItem(fosa, index)).join('')}
      </div>
    `;
  }, [renderFosaItem]);

  // Función ultra-simplificada para actualizar contenido
  const updateContent = useCallback((fosas = [], loadingInfo = null, isLoadingMore = false) => {
    if (!sheetRef.current || !isEnabled) return;
    if (JSON.stringify(fosas) === JSON.stringify(fosasFiltradas) && !isLoadingMore) return;

    setFosasFiltradas(fosas);
    const fosasList = sheetRef.current.querySelector('.sheet-lista-container');
    if (!fosasList) return;

    if (fosas.length === 0) {
      fosasList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No se encontraron fosas</p>';
      return;
    }

    const totalFosas = loadingInfo?.totalItems || fosas.length;
    const loadedItems = loadingInfo?.loadedItems || fosas.length;
    const hasMore = loadingInfo?.hasMore || false;
    const existingContainer = fosasList.querySelector('.mobile-lista-fosas-completa');
    
    if (existingContainer) {
      if (isLoadingMore) {
        updateContador(existingContainer, loadedItems, totalFosas, hasMore);
        addSkeletonIfNeeded(existingContainer);
      } else {
        addNewFosas(fosas);
        updateContador(existingContainer, loadedItems, totalFosas, hasMore);
      }
      return;
    }

    createNewContainer(fosasList, fosas, loadingInfo, isLoadingMore);
    attachEventListeners(fosasList);
    attachMobileInfiniteScroll();
  }, [isEnabled, fosasFiltradas, addNewFosas]);

  // Funciones ultra-simplificadas
  const updateContador = useCallback((container, loadedItems, totalFosas, hasMore) => {
    const contador = container.querySelector('.mobile-contador');
    if (contador) contador.innerHTML = UTILS.contadorHTML(loadedItems, totalFosas, hasMore);
  }, []);

  const addSkeletonIfNeeded = useCallback((container) => {
    const mobileLista = container.querySelector('.mobile-lista-narrativas');
    if (mobileLista && !mobileLista.querySelector('.mobile-loading-cards')) {
      mobileLista.insertAdjacentHTML('beforeend', UTILS.skeletonHTML());
    }
  }, []);

  const createNewContainer = useCallback((fosasList, fosas, loadingInfo, isLoadingMore) => {
    const container = document.createElement('div');
    container.className = 'mobile-lista-fosas-completa';
    container.setAttribute('data-contexto', 'mapaBuscadorFosas');
    container.innerHTML = generateContainerHTML(fosas, loadingInfo, isLoadingMore);

    fosasList.innerHTML = '';
    fosasList.appendChild(container);
    UTILS.animateItems(fosasList);
  }, [generateContainerHTML]);

  // Función ultra-simplificada para adjuntar event listeners
  const attachEventListeners = useCallback((fosasList) => {
    // Toggle intro
    const toggleBtn = fosasList.querySelector('.mobile-toggle-intro');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const introSection = fosasList.querySelector('.mobile-intro-fosas');
        const isVisible = introSection.classList.contains('visible');
        
        if (isVisible) {
          introSection.classList.remove('visible');
          introSection.classList.add('oculto');
          toggleBtn.innerHTML = `<span>Más información</span><svg class="chevron-icon" width="12" height="12" viewBox="0 0 12 12"><path d="M6 8L2 4h8l-4 4z" fill="currentColor"/></svg>`;
        } else {
          introSection.classList.remove('oculto');
          introSection.classList.add('visible');
          toggleBtn.innerHTML = `<span>Menos información</span><svg class="chevron-icon" width="12" height="12" viewBox="0 0 12 12"><path d="M6 4l4 4H2l4-4z" fill="currentColor"/></svg>`;
        }
      });
    }

    // Event delegation para fosas
    const handleFosaClick = (e) => {
      const fosaItem = e.target.closest('.fosa');
      if (!fosaItem) return;
      
      // Cerrar panel
      if (sheetRef.current && draggableRef.current && gsapRef.current) {
        const closedY = sheetRef.current.offsetHeight - CONFIG.PEEK_HEIGHT;
        gsapRef.current.to(sheetRef.current, { 
          y: closedY, 
          duration: CONFIG.ANIMATION_DURATION,
          ease: "power2.out",
          onComplete: () => setIsOpen(false)
        });
      }
      
      document.dispatchEvent(UTILS.createFosaClickEvent(fosaItem.dataset.id));
    };

    fosasList.removeEventListener('click', handleFosaClick);
    fosasList.addEventListener('click', handleFosaClick);
  }, []);

  // Función ultra-simplificada para scroll infinito móvil
  const attachMobileInfiniteScroll = useCallback(() => {
    const mobileListContainer = document.querySelector('.mobile-lista-narrativas');
    if (!mobileListContainer) return;

    let scrollTimeout = null;

    const handleMobileScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = mobileListContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < CONFIG.SCROLL_THRESHOLD;

      if (isNearBottom) {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          document.dispatchEvent(UTILS.createLoadEvent('mobile-scroll'));
        }, CONFIG.DEBOUNCE_DELAY);
      }
    };

    mobileListContainer.addEventListener('scroll', handleMobileScroll, { passive: true });

    // Intersection Observer como respaldo
    const loadMoreTrigger = document.querySelector('.mobile-loading-trigger');
    if (loadMoreTrigger) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              document.dispatchEvent(UTILS.createLoadEvent('mobile-intersection'));
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px' }
      );
      
      observer.observe(loadMoreTrigger);
    }

    return () => {
      mobileListContainer.removeEventListener('scroll', handleMobileScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  return {
    mapContainerRef,
    updateContent,
    isOpen,
    fosasFiltradas
  };
}