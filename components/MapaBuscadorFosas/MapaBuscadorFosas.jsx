"use client";

import { useState, useEffect } from "react";
import { cargarFosas } from "../mapa/js/datos.js";
import MapaFosas from "../mapa/MapaFosas";
import FichaFosa from "../FichaFosa/FichaFosa.jsx";
import ListaFosasCompleta from "../ListaFosasCompleta/ListaFosasCompleta.jsx";
import { useResponsive } from "../../src/hooks/useResponsive";
import { useMobileSheetManager } from "../../src/hooks/useMobileSheetManager";
import { useMapaBuscador } from "../../src/hooks/useMapaBuscador";
import "../../app/styles/_mapaBuscadorFosas.scss";
import "../../app/styles/_mobileSheet.scss";
import "../../app/styles/_pagination.scss";
import "../../app/styles/_mobilePagination.scss";

export default function MapaBuscadorFosas({
  ccaa,
  provincia,
  municipio,
  fosa: fosaProp,
  fosas: fosasProp = null,
  initialCategoria = "todas",
}) {
  const { isMobile, isDesktop } = useResponsive();
  const mobileSheet = useMobileSheetManager(isMobile);

  // Estado de datos
  const [fosas, setFosas] = useState(fosasProp || []);

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
    fosasPaginadas, // Fosas paginadas
    mapaRef,
    handleBusquedaChange,
    handleFormSubmit,
    handleToggleClick,
    handleFosaSelect,
    handleCloseFosa,
    handleEstadoChange,
    handleToggleStatusPanel,
    handleNextPage, // Paginación
    handlePrevPage,
    handleGoToPage,
    aplicarFiltroUbicacion,
    totalFosas,
    totalFiltradas,
    hayFiltrosActivos,
    paginationInfo, // Info de paginación
  } = useMapaBuscador(fosas, isMobile);

  // === EFECTOS PRINCIPALES ===

  // Actualizar mobile sheet cuando cambien las fosas filtradas
  useEffect(() => {
    if (isMobile && mobileSheet.updateContent) {
      // En móvil también usar paginación, pero con más elementos por página
      mobileSheet.updateContent(fosasPaginadas, paginationInfo);
    }
  }, [fosasPaginadas, paginationInfo, isMobile, mobileSheet]);

  // Listener para clicks en fosas desde mobile sheet
  useEffect(() => {
    const handleFosaClick = (event) => {
      const { id } = event.detail;
      const fosa = fosasFiltradas.find((f) => f.id === id);
      if (fosa) {
        handleFosaSelect(fosa);
      }
    };

    document.addEventListener("fosa-click", handleFosaClick);
    return () => document.removeEventListener("fosa-click", handleFosaClick);
  }, [fosasFiltradas, handleFosaSelect]);

  // Listener para paginación móvil
  useEffect(() => {
    const handleMobilePagination = (event) => {
      const { action } = event.detail;

      if (action === "next" && paginationInfo.hasNextPage) {
        handleNextPage();
      } else if (action === "prev" && paginationInfo.hasPrevPage) {
        handlePrevPage();
      }
    };

    document.addEventListener("mobile-pagination", handleMobilePagination);
    return () =>
      document.removeEventListener("mobile-pagination", handleMobilePagination);
  }, [handleNextPage, handlePrevPage, paginationInfo]);

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
          console.error("Error cargando fosas:", error);
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
              <h2 className="mapa-fosas-searcher__title">
                Buscar en el mapa de fosas
              </h2>

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
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4 11C4 7.13401 7.13401 4 11 4C14.866 4 18 7.13401 18 11C18 12.8859 17.2542 14.5977 16.0414 15.8563C16.0072 15.8827 15.9743 15.9115 15.9429 15.9429C15.9115 15.9743 15.8827 16.0072 15.8563 16.0414C14.5977 17.2542 12.8859 18 11 18C7.13401 18 4 14.866 4 11ZM16.6177 18.0319C15.078 19.2635 13.125 20 11 20C6.02944 20 2 15.9706 2 11C2 6.02944 6.02944 2 11 2C15.9706 2 20 6.02944 20 11C20 13.125 19.2635 15.078 18.0319 16.6177L21.7071 20.2929C22.0976 20.6834 22.0976 21.3166 21.7071 21.7071C21.3166 22.0976 20.6834 22.0976 20.2929 21.7071L16.6177 18.0319Z"
                        fill="#7B7B7B"
                      />
                    </svg>
                  </button>
                </form>

                <button
                  type="button"
                  id="toggle-busqueda"
                  className="mapa-fosas-searcher__btnFilter"
                  aria-label={
                    listaVisible
                      ? "Ocultar lista de fosas"
                      : "Mostrar lista de fosas"
                  }
                  aria-pressed={listaVisible}
                  onClick={handleToggleClick}
                >
                  <svg
                    width="26"
                    height="22"
                    viewBox="0 0 26 22"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    focusable="false"
                    className="icon-arrows"
                  >
                    <path
                      d="M13.4697 21.8872C13.8169 21.8872 14.1128 21.7552 14.3546 21.5169L24.245 11.9829C24.5443 11.6917 24.6948 11.3738 24.6948 10.9956C24.6913 10.614 24.5345 10.2738 24.237 9.99238L14.3466 0.458396C14.1066 0.218359 13.8204 0.0898438 13.4697 0.0898438C12.7566 0.0898438 12.2031 0.641596 12.2031 1.3494C12.2031 1.6824 12.3439 2.01013 12.5802 2.25896L22.2488 11.5517V10.4165L12.5802 19.7226C12.3456 19.9652 12.2031 20.2814 12.2031 20.6339C12.2031 21.3337 12.7566 21.8872 13.4697 21.8872Z"
                      fill="white"
                    />
                    <path
                      d="M2.20995 21.8872C2.55721 21.8872 2.85311 21.7552 3.0949 21.5169L12.9854 11.9829C13.2846 11.6917 13.4352 11.3738 13.4352 10.9956C13.4334 10.614 13.2748 10.2738 12.9774 9.99238L3.0869 0.458396C2.84686 0.218359 2.56073 0.0898438 2.20995 0.0898438C1.49863 0.0898438 0.943359 0.641596 0.943359 1.3494C0.943359 1.6824 1.08418 2.01013 1.3205 2.25896L10.9891 11.5517V10.4165L1.3205 19.7226C1.08594 19.9652 0.943359 20.2814 0.943359 20.6339C0.943359 21.3337 1.49863 21.8872 2.20995 21.8872Z"
                      fill="white"
                    />
                  </svg>
                </button>
              </div>

              <div
                id="resultados"
                aria-live="polite"
                className="mapa-fosas-searcher__result"
              >
                Se muestran{" "}
                <strong>
                  {paginationInfo.startItem}-{paginationInfo.endItem}
                </strong>{" "}
                de <strong>{totalFiltradas}</strong> resultados
                {paginationInfo.totalPages > 1 && (
                  <span className="pagination-info">
                    (Página {paginationInfo.currentPage} de{" "}
                    {paginationInfo.totalPages})
                  </span>
                )}
              </div>

              {/* Filtros de estado - Estructura completa del proyecto original */}
              <section
                aria-labelledby="filtros-titulo"
                className="mapa-fosas-searcher__statusGraves"
              >
                <h3
                  id="filtros-heading"
                  className="mapa-fosas-searcher__statusTitle"
                >
                  <button
                    type="button"
                    id="btn-status-fosas"
                    className={`mapa-fosas-searcher__statusTitleBtn ${
                      statusPanelExpanded ? "active" : ""
                    }`}
                    aria-expanded={statusPanelExpanded}
                    aria-controls="panel-status-fosas"
                    onClick={handleToggleStatusPanel}
                  >
                    <span>Status de las fosas</span>
                    <svg
                      width="14"
                      height="8"
                      viewBox="0 0 14 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M13.7071 0.292893C14.0976 0.683418 14.0976 1.31658 13.7071 1.70711L7.70711 7.70711C7.31658 8.09763 6.68342 8.09763 6.29289 7.70711L0.292893 1.70711C-0.0976315 1.31658 -0.0976315 0.683417 0.292893 0.292893C0.683417 -0.0976317 1.31658 -0.0976317 1.70711 0.292893L7 5.58579L12.2929 0.292893C12.6834 -0.0976312 13.3166 -0.0976311 13.7071 0.292893Z"
                        fill="#333333"
                      />
                    </svg>
                  </button>
                </h3>
                <form
                  id="panel-status-fosas"
                  className="mapa-fosas-searcher__statusForm"
                  style={{ display: statusPanelExpanded ? "block" : "none" }}
                >
                  <fieldset>
                    <legend className="sr-only">
                      Filtrar por estado de las fosas
                    </legend>
                    <div className="mapa-fosas-searcher__statusItem">
                      <input
                        type="checkbox"
                        id="todos"
                        name="status"
                        value="todos"
                        className="mapa-fosas-searcher__statusCheck"
                        checked={estadosSeleccionados.includes("todos")}
                        onChange={() => handleEstadoChange("todos")}
                      />
                      <label
                        className="mapa-fosas-searcher__statusLabel"
                        htmlFor="todos"
                      >
                        Todos
                      </label>
                    </div>
                    <div className="mapa-fosas-searcher__statusItem">
                      <input
                        type="checkbox"
                        id="exhumados"
                        name="status"
                        value="exhumados"
                        className="mapa-fosas-searcher__statusCheck"
                        checked={estadosSeleccionados.includes("exhumados")}
                        onChange={() => handleEstadoChange("exhumados")}
                      />
                      <label
                        className="mapa-fosas-searcher__statusLabel"
                        htmlFor="exhumados"
                      >
                        Exhumados
                      </label>
                    </div>
                    <div className="mapa-fosas-searcher__statusItem">
                      <input
                        type="checkbox"
                        id="no-exhumados"
                        name="status"
                        value="no-exhumados"
                        className="mapa-fosas-searcher__statusCheck"
                        checked={estadosSeleccionados.includes("no-exhumados")}
                        onChange={() => handleEstadoChange("no-exhumados")}
                      />
                      <label
                        className="mapa-fosas-searcher__statusLabel"
                        htmlFor="no-exhumados"
                      >
                        No exhumados
                      </label>
                    </div>
                    <div className="mapa-fosas-searcher__statusItem">
                      <input
                        type="checkbox"
                        id="trasladada"
                        name="status"
                        value="trasladada"
                        className="mapa-fosas-searcher__statusCheck"
                        checked={estadosSeleccionados.includes("trasladada")}
                        onChange={() => handleEstadoChange("trasladada")}
                      />
                      <label
                        className="mapa-fosas-searcher__statusLabel"
                        htmlFor="trasladada"
                      >
                        Trasladada a Cuelgamuros
                      </label>
                    </div>
                  </fieldset>
                  {/* Solo mostrar botón "Ver detalles" cuando la lista NO esté visible */}
                  {!listaVisible && (
                    <button
                      type="button"
                      id="aplicar-filtros"
                      className="mapa-fosas-searcher__statusBtn"
                      onClick={handleToggleClick}
                    >
                      Ver detalles
                    </button>
                  )}
                </form>
              </section>

              {/* Solo mostrar ListaFosasCompleta en desktop */}
              {listaVisible && isDesktop && (
                <>
                  <ListaFosasCompleta
                    contexto="mapaBuscadorFosas"
                    lista={fosasPaginadas} // Usar fosas paginadas en lugar de todas
                    descripcion={`Se muestran ${paginationInfo.startItem}-${paginationInfo.endItem} de ${totalFiltradas} fosas encontradas`}
                    onItemClick={handleFosaSelect}
                  />

                  {/* CONTROLES DE PAGINACIÓN */}
                  {paginationInfo.totalPages > 1 && (
                    <div className="pagination-controls">
                      <button
                        onClick={handlePrevPage}
                        disabled={!paginationInfo.hasPrevPage}
                        className="pagination-btn prev"
                        aria-label="Página anterior"
                      >
                        ← Anterior
                      </button>

                      <div className="pagination-info-detailed">
                        <span>
                          Página {paginationInfo.currentPage} de{" "}
                          {paginationInfo.totalPages}
                        </span>
                        <span className="items-info">
                          {paginationInfo.startItem}-{paginationInfo.endItem} de{" "}
                          {paginationInfo.totalItems}
                        </span>
                      </div>

                      <button
                        onClick={handleNextPage}
                        disabled={!paginationInfo.hasNextPage}
                        className="pagination-btn next"
                        aria-label="Página siguiente"
                      >
                        Siguiente →
                      </button>
                    </div>
                  )}
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