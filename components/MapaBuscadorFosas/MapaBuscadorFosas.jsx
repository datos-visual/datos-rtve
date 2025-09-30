"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { cargarFosas } from "../../app/lib/datos.js";
import MapaFosas from "../mapa/MapaFosas";
import FichaFosa from "../FichaFosa/FichaFosa.jsx";
import ListaFosasCompleta from "../ListaFosasCompleta/ListaFosasCompleta.jsx";
import CheckIcon from "../common/CheckIcon";
import { useResponsive } from "../../app/hooks/useResponsive";
import { useMobileSheetManager } from "../../app/hooks/useMobileSheetManager";
import { useMapaBuscador } from "../../app/hooks/useMapaBuscador";
import "../../app/styles/_mapaBuscadorFosas.scss";
import "../../app/styles/_mobileSheet.scss";
import "../../app/styles/_infiniteScroll.scss";

export default function MapaBuscadorFosas({
  ccaa,
  provincia,
  municipio,
  fosa: fosaProp,
  fosas: fosasProp = null,
}) {
  const { isMobile, isDesktop } = useResponsive();
  const mobileSheet = useMobileSheetManager(isMobile);

  // Estado de datos
  const [fosas, setFosas] = useState(fosasProp || []);
  const [fosasVisiblesEnMapa, setFosasVisiblesEnMapa] = useState([]);

  // Hook consolidado para toda la lógica
  const {
    loading,
    setLoading,
    selectedFosa,
    error,
    setError,
    listaVisible,
    busquedaTexto,
    estadosSeleccionados,
    statusPanelExpanded,
    fosasFiltradas,
    fosasVisibles,
    mapaRef,
    loadingTriggerRef,
    handleBusquedaChange,
    handleFormSubmit,
    handleToggleClick,
    handleFosaSelect,
    handleCloseFosa,
    handleEstadoChange,
    handleToggleStatusPanel,
    loadMoreItems,
    aplicarFiltroUbicacion,
    totalFiltradas,
    loadingInfo,
    isLoadingMore
  } = useMapaBuscador(fosas, isMobile);

  // === FUNCIONES MEMOIZADAS ===
  
  const handleFosaClick = useCallback((event) => {
    const { id } = event.detail;
    const fosa = fosasFiltradas.find((f) => f.id === id);
    if (fosa) {
      handleFosaSelect(fosa);
    }
  }, [fosasFiltradas, handleFosaSelect]);

  const handleMobileLoadMore = useCallback((event) => {
    if (isMobile && !isLoadingMore && loadingInfo.hasMore) {
      loadMoreItems();
    }
  }, [isMobile, isLoadingMore, loadingInfo.hasMore, loadMoreItems]);

  // === EFECTOS PRINCIPALES ===

  // Actualizar mobile sheet cuando cambien las fosas visibles
  useEffect(() => {
    if (isMobile && mobileSheet.updateContent) {
      mobileSheet.updateContent(fosasVisibles, loadingInfo, isLoadingMore);
    }
  }, [fosasVisibles, loadingInfo, isLoadingMore, isMobile, mobileSheet]);

  // === TRACKEAR FOSAS VISIBLES DEL MAPA ===
  useEffect(() => {
    const interval = setInterval(() => {
      if (mapaRef.current?.fosasVisibles) {
        setFosasVisiblesEnMapa(mapaRef.current.fosasVisibles);
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  // Event listeners optimizados
  useEffect(() => {
    document.addEventListener("fosa-click", handleFosaClick);
    document.addEventListener("mobile-load-more", handleMobileLoadMore);
    
    return () => {
      document.removeEventListener("fosa-click", handleFosaClick);
      document.removeEventListener("mobile-load-more", handleMobileLoadMore);
    };
  }, [handleFosaClick, handleMobileLoadMore]);

  // Sistema de scroll optimizado
  useEffect(() => {
    if (typeof window === 'undefined' || !loadingInfo.hasMore) return;

    let listaContainer = document.querySelector('.lista-narrativas');
    
    if (!listaContainer) {
      const retryTimeout = setTimeout(() => {
        listaContainer = document.querySelector('.lista-narrativas');
        if (listaContainer) setupScrollListener(listaContainer);
      }, 500);
      return () => clearTimeout(retryTimeout);
    }
    
    const setupScrollListener = (container) => {
      let scrollTimeout = null;

      const handleScroll = () => {
        if (isLoadingMore || !loadingInfo.hasMore) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

        if (isNearBottom && !isLoadingMore) {
          if (scrollTimeout) clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => loadMoreItems(), 300);
        }
      };

      container.addEventListener('scroll', handleScroll, { passive: true });

      let observer = null;
      if (loadingTriggerRef.current) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting && !isLoadingMore) {
                loadMoreItems();
              }
            });
          },
          { threshold: 0.1, rootMargin: '0px' }
        );
        observer.observe(loadingTriggerRef.current);
      }

      return () => {
        container.removeEventListener('scroll', handleScroll);
        if (scrollTimeout) clearTimeout(scrollTimeout);
        if (observer && loadingTriggerRef.current) {
          observer.unobserve(loadingTriggerRef.current);
        }
      };
    };
    
    return setupScrollListener(listaContainer);
  }, [loadMoreItems, loadingInfo.hasMore, isLoadingMore]);

  // === COMPONENTES MEMOIZADOS ===
  
  const SearchForm = useMemo(() => (
    <div className="search-form-container">
      <form
        role="search"
        aria-label="Buscador de fosas"
        className="mapa-fosas-searcher__form"
        onSubmit={handleFormSubmit}
      >
        <label htmlFor="busqueda" className="sr-only">
          Buscar por Comunidad, Localidad...
        </label>
        <input
          type="search"
          id="busqueda"
          name="busqueda"
          placeholder="Buscar por Comunidad, Localidad..."
          className="mapa-fosas-searcher__input"
          value={busquedaTexto}
          onChange={handleBusquedaChange}
        />
        <button
          type="submit"
          aria-label="Buscar"
          className="mapa-fosas-searcher__button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
            <path fillRule="evenodd" clipRule="evenodd" d="M4 11C4 7.13401 7.13401 4 11 4C14.866 4 18 7.13401 18 11C18 12.8859 17.2542 14.5977 16.0414 15.8563C16.0072 15.8827 15.9743 15.9115 15.9429 15.9429C15.9115 15.9743 15.8827 16.0072 15.8563 16.0414C14.5977 17.2542 12.8859 18 11 18C7.13401 18 4 14.866 4 11ZM16.6177 18.0319C15.078 19.2635 13.125 20 11 20C6.02944 20 2 15.9706 2 11C2 6.02944 6.02944 2 11 2C15.9706 2 20 6.02944 20 11C20 13.125 19.2635 15.078 18.0319 16.6177L21.7071 20.2929C22.0976 20.6834 22.0976 21.3166 21.7071 21.7071C21.3166 22.0976 20.6834 22.0976 20.2929 21.7071L16.6177 18.0319Z" fill="#7B7B7B" />
          </svg>
        </button>
      </form>
      <button
        type="button"
        id="toggle-busqueda"
        className="mapa-fosas-searcher__btnFilter"
        aria-label={listaVisible ? "Ocultar lista de fosas" : "Mostrar lista de fosas"}
        aria-pressed={listaVisible}
        onClick={handleToggleClick}
      >
        <svg width="26" height="22" viewBox="0 0 26 22" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" className="icon-arrows">
          <path d="M13.4697 21.8872C13.8169 21.8872 14.1128 21.7552 14.3546 21.5169L24.245 11.9829C24.5443 11.6917 24.6948 11.3738 24.6948 10.9956C24.6913 10.614 24.5345 10.2738 24.237 9.99238L14.3466 0.458396C14.1066 0.218359 13.8204 0.0898438 13.4697 0.0898438C12.7566 0.0898438 12.2031 0.641596 12.2031 1.3494C12.2031 1.6824 12.3439 2.01013 12.5802 2.25896L22.2488 11.5517V10.4165L12.5802 19.7226C12.3456 19.9652 12.2031 20.2814 12.2031 20.6339C12.2031 21.3337 12.7566 21.8872 13.4697 21.8872Z" fill="white" />
          <path d="M2.20995 21.8872C2.55721 21.8872 2.85311 21.7552 3.0949 21.5169L12.9854 11.9829C13.2846 11.6917 13.4352 11.3738 13.4352 10.9956C13.4334 10.614 13.2748 10.2738 12.9774 9.99238L3.0869 0.458396C2.84686 0.218359 2.56073 0.0898438 2.20995 0.0898438C1.49863 0.0898438 0.943359 0.641596 0.943359 1.3494C0.943359 1.6824 1.08418 2.01013 1.3205 2.25896L10.9891 11.5517V10.4165L1.3205 19.7226C1.08594 19.9652 0.943359 20.2814 0.943359 20.6339C0.943359 21.3337 1.49863 21.8872 2.20995 21.8872Z" fill="white" />
        </svg>
      </button>
    </div>
  ), [busquedaTexto, handleBusquedaChange, handleFormSubmit, listaVisible, handleToggleClick]);

  const StatusFilters = useMemo(() => {
    const statusOptions = [
      { key: "todos", label: "Todos" },
      { key: "exhumados", label: "Exhumados" },
      { key: "no-exhumados", label: "No exhumados" },
      { key: "trasladada", label: "Trasladada a Cuelgamuros" }
    ];

    return (
      <section aria-labelledby="filtros-titulo" className="mapa-fosas-searcher__statusGraves">
        <h3 id="filtros-heading" className="mapa-fosas-searcher__statusTitle">
          <button
            type="button"
            id="btn-status-fosas"
            className={`mapa-fosas-searcher__statusTitleBtn ${statusPanelExpanded ? "active" : ""}`}
            aria-expanded={statusPanelExpanded}
            aria-controls="panel-status-fosas"
            onClick={handleToggleStatusPanel}
          >
            <span>Status de las fosas</span>
            <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
              <path fillRule="evenodd" clipRule="evenodd" d="M13.7071 0.292893C14.0976 0.683418 14.0976 1.31658 13.7071 1.70711L7.70711 7.70711C7.31658 8.09763 6.68342 8.09763 6.29289 7.70711L0.292893 1.70711C-0.0976315 1.31658 -0.0976315 0.683417 0.292893 0.292893C0.683417 -0.0976317 1.31658 -0.0976317 1.70711 0.292893L7 5.58579L12.2929 0.292893C12.6834 -0.0976312 13.3166 -0.0976311 13.7071 0.292893Z" fill="#333333" />
            </svg>
          </button>
        </h3>
        <form
          id="panel-status-fosas"
          className="mapa-fosas-searcher__statusForm"
          style={{ display: statusPanelExpanded ? "block" : "none" }}
        >
          <fieldset>
            <legend className="sr-only">Filtrar por estado de las fosas</legend>
            {statusOptions.map(({ key, label }) => (
              <div key={key} className="mapa-fosas-searcher__statusItem">
                <div className="mapa-fosas-searcher__statusCheck" onClick={() => handleEstadoChange(key)}>
                  {estadosSeleccionados.includes(key) && <CheckIcon />}
                </div>
                <label className="mapa-fosas-searcher__statusLabel" onClick={() => handleEstadoChange(key)}>
                  {label}
                </label>
              </div>
            ))}
          </fieldset>
          {!listaVisible && (
            <button type="button" id="aplicar-filtros" className="mapa-fosas-searcher__statusBtn" onClick={handleToggleClick}>
              Ver detalles
            </button>
          )}
        </form>
      </section>
    );
  }, [statusPanelExpanded, handleToggleStatusPanel, estadosSeleccionados, handleEstadoChange, listaVisible, handleToggleClick]);

  const LoadingTrigger = useMemo(() => {
    if (!loadingInfo.hasMore) {
      return loadingInfo.isComplete && totalFiltradas > 0 ? (
        <div className="completion-message">
          <p>Se han cargado todas las fosas disponibles ({totalFiltradas} elementos)</p>
        </div>
      ) : null;
    }

    return (
      <div ref={loadingTriggerRef} className="loading-trigger">
        <div className="loading-content">
          <p>Desplázate hacia abajo para cargar más</p>
          <p className="loading-details">({loadingInfo.itemsRemaining} fosas restantes)</p>
          <button onClick={loadMoreItems} disabled={isLoadingMore} className="load-more-btn">
            {isLoadingMore ? 'Cargando...' : 'Cargar 50 más'}
          </button>
        </div>
      </div>
    );
  }, [loadingInfo, totalFiltradas, loadingTriggerRef, loadMoreItems, isLoadingMore]);

  // Cargar datos
  useEffect(() => {
    if (fosasProp) {
      setFosas(fosasProp);
      setLoading(false);
      setError(null);
    } else {
      const cargar = async () => {
        try {
          setLoading(true);
          setError(null);
          const todasLasFosas = await cargarFosas();
          setFosas(todasLasFosas);
        } catch (error) {
          setError(error);
        } finally {
          setLoading(false);
        }
      };
      cargar();
    }
  }, [fosasProp, setLoading, setError]);

  // Aplicar filtros de ubicación cuando cambien los datos
  useEffect(() => {
    if (fosas.length > 0 && (ccaa || provincia || municipio || fosaProp)) {
      const fosasFiltradasUbicacion = aplicarFiltroUbicacion(
        fosas,
        ccaa,
        provincia,
        municipio,
        fosaProp
      );

      if (fosasFiltradasUbicacion.length > 0) {
        const fosaConCoordenadas = fosasFiltradasUbicacion.find(
          (f) => f.lat && f.lon
        );
        if (fosaConCoordenadas && mapaRef.current?.map) {
          const zoom = fosaProp ? 15 : 12;
          mapaRef.current.map.flyTo({
            center: [fosaConCoordenadas.lon, fosaConCoordenadas.lat],
            zoom: zoom,
          });

          if (fosaProp && fosasFiltradasUbicacion.length === 1) {
            setTimeout(() => handleFosaSelect(fosaConCoordenadas), 1000);
          }
        }
      }
    }
  }, [
    fosas,
    ccaa,
    provincia,
    municipio,
    fosaProp,
    aplicarFiltroUbicacion,
    handleFosaSelect,
  ]);

  if (loading) {
    return (
      <div className="mapa-fosas loading">
        <div className="loading-message">
          <h2>Cargando mapa de fosas...</h2>
          <p>Por favor, espera mientras cargamos los datos.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mapa-fosas error">
        <div className="error-message">
          <h2>Error al cargar el mapa</h2>
          <p>No se pudieron cargar los datos. Por favor, recarga la página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mapa-fosas">
      <div
        className={`mapa-fosas_content buscador-layout ${
          listaVisible ? "open" : ""
        }`}
      >
        {/* Panel de búsqueda - Desktop y Mobile */}
        <div
          className={`mapa-fosas_search ${
            !listaVisible ? "vista-completa" : ""
          } ${isMobile ? "mobile" : ""}`}
        >
          {selectedFosa ? (
            <FichaFosa fosa={selectedFosa} onClose={handleCloseFosa} />
          ) : (
            <div className="mapa-fosas-searcher">
              <h2 className="mapa-fosas-searcher__title">Buscar en el mapa de fosas</h2>
              {SearchForm}
              <div id="resultados" aria-live="polite" className="mapa-fosas-searcher__result only_desktop">
                Se muestran <strong>{loadingInfo.loadedItems}</strong> de <strong>{totalFiltradas}</strong> resultados
              </div>
              {StatusFilters}

              {/* Lista con scroll infinito en desktop */}
              {listaVisible && isDesktop && (
                <>
                  <ListaFosasCompleta
                    contexto="mapaBuscadorFosas"
                    lista={fosasVisibles}
                    descripcion={`Página ${loadingInfo.currentPage} de ${loadingInfo.totalPages} - Mostrando ${loadingInfo.loadedItems} de ${totalFiltradas} fosas`}
                    onItemClick={handleFosaSelect}
                    modoSimple={true}
                    // Habilitar filtro por viewport con toggle
                    map={mapaRef.current?.map}
                    filtrarPorViewport={true}
                    permitirCambioViewport={true}
                    // Usar fosas visibles desde useMapaRecuento para consistencia
                    fosasVisiblesExternas={fosasVisiblesEnMapa}
                  />
                  {LoadingTrigger}
                </>
              )}
            </div>
          )}
        </div>

        {/* Mapa */}
        <div
          ref={mobileSheet.mapContainerRef}
          className={`mapa-fosas_map ${!listaVisible ? "vista-completa" : ""}`}
        >
          <MapaFosas
            ref={mapaRef}
            sinGeocoder={true}
            onFosaSelect={handleFosaSelect}
            fosasFiltradas={fosasFiltradas}
          />
        </div>
      </div>
    </div>
  );
}