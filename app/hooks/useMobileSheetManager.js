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
  
  // Cargar GSAP dinámicamente
  useEffect(() => {
    if (!isEnabled || typeof window === 'undefined' || window.innerWidth > 768) {
      return;
    }

    let gsap, Draggable;
    
    const initMobileSheet = async () => {
      try {
        // Esperar a que el mapContainerRef esté disponible
        let attempts = 0;
        while (!mapContainerRef.current && attempts < 20) {
          await new Promise(resolve => setTimeout(resolve, 200));
          attempts++;
        }
        
        if (!mapContainerRef.current) {
          console.error('mapContainerRef no disponible');
          return;
        }

        // Cargar GSAP
        const gsapModule = await import('gsap');
        const draggableModule = await import('gsap/Draggable');
        gsap = gsapModule.gsap;
        Draggable = draggableModule.Draggable;
        gsap.registerPlugin(Draggable);
        gsapRef.current = gsap;
        
        createMobileSheet(gsap, Draggable);
        isInitializedRef.current = true;
      } catch (error) {
        console.error('Error cargando GSAP:', error);
      }
    };

    // Inicializar con un pequeño delay para asegurar que el DOM esté listo
    const timeoutId = setTimeout(initMobileSheet, 50);

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
    sheet.style.height = '80vh';
    sheet.style.maxHeight = '520px';
    const peekHeight = 60;
    const closedY = sheet.offsetHeight - peekHeight;
    gsap.set(sheet, { y: closedY });

    // Crear Draggable
    draggableRef.current = Draggable.create(sheet, {
      type: 'y',
      bounds: { minY: 0, maxY: closedY },
      inertia: true,
      onDrag: function() {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        animationFrameRef.current = requestAnimationFrame(() => {
          const progress = 1 - (this.y / closedY);
          const opacity = Math.max(0.3, progress);
          const content = sheet.querySelector('.sheet-content');
          if (content) {
            gsap.set(content, { opacity: opacity, willChange: 'opacity' });
          }
        });
      },
      onDragEnd: function() {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        const threshold = closedY * 0.4;
        const isOpening = this.y < threshold;
        const targetY = isOpening ? 0 : closedY;
        
        gsap.to(sheet, { 
          y: targetY, 
          duration: 0.2,
          ease: "power2.out",
          onComplete: () => setIsOpen(isOpening)
        });
      }
    })[0];

    // Click en handle para toggle
    const handle = sheet.querySelector('.sheet-handle');
    if (handle) {
      handle.addEventListener('click', (e) => {
        e.preventDefault();
        if (draggableRef.current) {
          const currentY = gsap.getProperty(sheet, 'y');
          const isOpening = currentY > closedY * 0.5;
          const targetY = isOpening ? 0 : closedY;
          
          gsap.to(sheet, { y: targetY, duration: 0.2, ease: "power2.out" });
          setIsOpen(isOpening);
        }
      });
    }

    sheetRef.current = sheet;
  };

  // Función para renderizar item de fosa
  const renderFosaItem = useCallback((fosa, index) => {
    if (!fosa || !fosa.id) return "";

    const imageUrl = fosa.imagen || "https://fotografias.larazon.es/clipping/cmsimages02/2024/11/15/93DFFB09-1D04-4088-99A5-94DC549EE9EC/hallada-fosa-comun-cementerio-val-51-victimas-franquismo_98.jpg?crop=1200,675,x0,y113&width=1900&height=1069&optimize=low&format=webply";
    const ubicacion = [fosa.municipio, fosa.provincia].filter(Boolean).join(" / ");
    const titulo = fosa.title?.trim() || `Fosa en ${fosa.municipio || "ubicación desconocida"}`;

    return `
      <div class="fosa scroll-item" data-id="${fosa.id}" data-index="${index}" style="
        contain: layout style paint;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.4s ease-out, transform 0.4s ease-out;
        transition-delay: ${(index % 20) * 50}ms;
      ">
        <div class="fosa__img">
          <img src="${imageUrl}" alt="Fosa" loading="lazy" decoding="async" style="will-change: transform;">
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

  // Función para agregar nuevas fosas
  const addNewFosas = useCallback((fosas = []) => {
    if (!sheetRef.current || !isEnabled) return;
    
    const fosasList = sheetRef.current.querySelector('.sheet-lista-container');
    const existingContainer = fosasList?.querySelector('.mobile-lista-fosas-completa');
    const mobileLista = existingContainer?.querySelector('.mobile-lista-narrativas');
    
    if (!mobileLista) return;
    
    // Obtener fosas existentes y nuevas
    const existingFosas = Array.from(mobileLista.querySelectorAll('.fosa')).map(el => el.getAttribute('data-id'));
    const newFosas = fosas.filter(fosa => !existingFosas.includes(fosa.id));
    
    if (newFosas.length > 0) {
      // Remover skeleton y agregar nuevas fosas
      const skeleton = mobileLista.querySelector('.mobile-loading-cards');
      if (skeleton) skeleton.remove();
      
      const newFosasHTML = newFosas.map((fosa, index) => renderFosaItem(fosa, fosas.indexOf(fosa))).filter(Boolean).join('');
      mobileLista.insertAdjacentHTML('beforeend', newFosasHTML);
      
      // Animar nuevas fosas
      setTimeout(() => {
        const newItems = mobileLista.querySelectorAll('.scroll-item:not([style*="opacity: 1"])');
        newItems.forEach((item, index) => {
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, index * 20);
        });
      }, 50);
    }
  }, [isEnabled, renderFosaItem]);

  // Función para actualizar contenido
  const updateContent = useCallback((fosas = [], loadingInfo = null, isLoadingMore = false) => {
    if (!sheetRef.current || !isEnabled) return;

    // Evitar actualizaciones innecesarias
    if (JSON.stringify(fosas) === JSON.stringify(fosasFiltradas) && !isLoadingMore) {
      return;
    }

    setFosasFiltradas(fosas);
    
    const fosasList = sheetRef.current.querySelector('.sheet-lista-container');
    if (!fosasList) return;

    if (fosas.length === 0) {
      fosasList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No se encontraron fosas</p>';
      return;
    }

    // Datos para scroll infinito
    const totalFosas = loadingInfo ? loadingInfo.totalItems : fosas.length;
    const loadedItems = loadingInfo ? loadingInfo.loadedItems : fosas.length;
    const hasMore = loadingInfo ? loadingInfo.hasMore : false;

    // Generar HTML del contenedor
    const generateContainerHTML = () => {
      const skeletonHTML = isLoadingMore ? `
        <div class="mobile-loading-cards">
          <div class="loading-skeleton">
            <div class="skeleton-img"></div>
            <div class="skeleton-content">
              <div class="skeleton-line short"></div>
              <div class="skeleton-line long"></div>
            </div>
          </div>
          <div class="loading-skeleton">
            <div class="skeleton-img"></div>
            <div class="skeleton-content">
              <div class="skeleton-line short"></div>
              <div class="skeleton-line long"></div>
            </div>
          </div>
          <div class="loading-skeleton">
            <div class="skeleton-img"></div>
            <div class="skeleton-content">
              <div class="skeleton-line short"></div>
              <div class="skeleton-line long"></div>
            </div>
          </div>
        </div>
      ` : '';
      
      return `
        <div class="mobile-contador">
          <p class="contador-text">Se muestran ${loadedItems} de ${totalFosas} fosas</p>
          ${hasMore ? 
            `<p class="loading-info-mobile">Desplázate hacia abajo para cargar más (${totalFosas - loadedItems} restantes)...</p>` : 
            `<p class="loading-info-mobile">Todas las fosas cargadas (${totalFosas} elementos)</p>`
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
          ${skeletonHTML}
          ${fosas.map((fosa, index) => renderFosaItem(fosa, index)).filter(Boolean).join('')}
        </div>
      `;
    };

    // Manejar actualizaciones según el estado de carga
    const existingContainer = fosasList.querySelector('.mobile-lista-fosas-completa');
    
    if (existingContainer) {
      if (isLoadingMore) {
        // Solo actualizar contador y agregar skeleton
        const contador = existingContainer.querySelector('.mobile-contador');
        if (contador) {
          contador.innerHTML = `
            <p class="contador-text">Se muestran ${loadedItems} de ${totalFosas} fosas</p>
            ${hasMore ? 
              `<p class="loading-info-mobile">Desplázate hacia abajo para cargar más (${totalFosas - loadedItems} restantes)...</p>` : 
              `<p class="loading-info-mobile">✅ Todas las fosas cargadas (${totalFosas} elementos)</p>`
            }
          `;
        }

        // Agregar skeleton si no existe
        const mobileLista = existingContainer.querySelector('.mobile-lista-narrativas');
        if (mobileLista && !mobileLista.querySelector('.mobile-loading-cards')) {
          const skeletonHTML = `
            <div class="mobile-loading-cards">
              <div class="loading-skeleton">
                <div class="skeleton-img"></div>
                <div class="skeleton-content">
                  <div class="skeleton-line short"></div>
                  <div class="skeleton-line long"></div>
                </div>
              </div>
              <div class="loading-skeleton">
                <div class="skeleton-img"></div>
                <div class="skeleton-content">
                  <div class="skeleton-line short"></div>
                  <div class="skeleton-line long"></div>
                </div>
              </div>
              <div class="loading-skeleton">
                <div class="skeleton-img"></div>
                <div class="skeleton-content">
                  <div class="skeleton-line short"></div>
                  <div class="skeleton-line long"></div>
                </div>
              </div>
            </div>
          `;
          mobileLista.insertAdjacentHTML('beforeend', skeletonHTML);
        }
        return;
      } else {
        // Agregar nuevas fosas y actualizar contador
        addNewFosas(fosas, loadingInfo);
        
        const contador = existingContainer.querySelector('.mobile-contador');
        if (contador) {
          contador.innerHTML = `
            <p class="contador-text">Se muestran ${loadedItems} de ${totalFosas} fosas</p>
            ${hasMore ? 
              `<p class="loading-info-mobile">Desplázate hacia abajo para cargar más (${totalFosas - loadedItems} restantes)...</p>` : 
              `<p class="loading-info-mobile">Todas las fosas cargadas (${totalFosas} elementos)</p>`
            }
          `;
        }
        return;
      }
    }

    // Crear contenedor completo
    const fragment = document.createDocumentFragment();
    const container = document.createElement('div');
    container.className = 'mobile-lista-fosas-completa';
    container.setAttribute('data-contexto', 'mapaBuscadorFosas');
    container.innerHTML = generateContainerHTML();

    fragment.appendChild(container);
    fosasList.innerHTML = '';
    fosasList.appendChild(fragment);

    // Animar items
    setTimeout(() => {
      const items = fosasList.querySelectorAll('.scroll-item');
      items.forEach((item, index) => {
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, index * 20);
      });
    }, 50);

    // Adjuntar eventos
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

    // Event delegation para fosas
    const handleFosaClick = (e) => {
      const fosaItem = e.target.closest('.fosa');
      if (!fosaItem) return;
      
      const fosaId = fosaItem.dataset.id;
      
      // Cerrar panel
      if (sheetRef.current && draggableRef.current && gsapRef.current) {
        const peekHeight = 60;
        const closedY = sheetRef.current.offsetHeight - peekHeight;
        gsapRef.current.to(sheetRef.current, { 
          y: closedY, 
          duration: 0.2,
          ease: "power2.out",
          onComplete: () => setIsOpen(false)
        });
      }
      
      // Emitir evento
      const event = new CustomEvent('fosa-click', { 
        detail: { id: fosaId },
        bubbles: true 
      });
      document.dispatchEvent(event);
    };

    // Event listeners
    fosasList.removeEventListener('click', handleFosaClick);
    fosasList.addEventListener('click', handleFosaClick);
    
    attachMobileInfiniteScroll();
  }, [isEnabled, renderFosaItem, fosasFiltradas]);

  // Función para scroll infinito móvil
  const attachMobileInfiniteScroll = useCallback(() => {
    const mobileListContainer = document.querySelector('.mobile-lista-narrativas');
    if (!mobileListContainer) return;

    let scrollTimeout = null;

    const handleMobileScroll = () => {
      const scrollTop = mobileListContainer.scrollTop;
      const scrollHeight = mobileListContainer.scrollHeight;
      const clientHeight = mobileListContainer.clientHeight;
      
      // Verificar si está cerca del final
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

      if (isNearBottom) {
        // Debounce
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          const event = new CustomEvent('mobile-load-more', { 
            detail: { source: 'mobile-scroll' },
            bubbles: true 
          });
          document.dispatchEvent(event);
        }, 150);
      }
    };

    // Agregar listeners
    mobileListContainer.addEventListener('scroll', handleMobileScroll, { passive: true });

    // Intersection Observer como respaldo
    const loadMoreTrigger = document.querySelector('.mobile-loading-trigger');
    if (loadMoreTrigger) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const event = new CustomEvent('mobile-load-more', { 
                detail: { source: 'mobile-intersection' },
                bubbles: true 
              });
              document.dispatchEvent(event);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px' }
      );
      
      observer.observe(loadMoreTrigger);
    }

    // Cleanup
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