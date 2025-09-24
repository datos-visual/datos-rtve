/**
 * Componente de templates para el buscador de fosas
 * Migra toda la funcionalidad de templates.js del proyecto Vite
 */
import React from 'react';

// Iconos SVG específicos del proyecto
const SearchIcon = () => (
  <svg
    width="24" height="24" viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M4 11C4 7.13401 7.13401 4 11 4C14.866 4 18 7.13401 18 11C18 12.8859 17.2542 14.5977 16.0414 15.8563C16.0072 15.8827 15.9743 15.9115 15.9429 15.9429C15.9115 15.9743 15.8827 16.0072 15.8563 16.0414C14.5977 17.2542 12.8859 18 11 18C7.13401 18 4 14.866 4 11ZM16.6177 18.0319C15.078 19.2635 13.125 20 11 20C6.02944 20 2 15.9706 2 11C2 6.02944 6.02944 2 11 2C15.9706 2 20 6.02944 20 11C20 13.125 19.2635 15.078 18.0319 16.6177L21.7071 20.2929C22.0976 20.6834 22.0976 21.3166 21.7071 21.7071C21.3166 22.0976 20.6834 22.0976 20.2929 21.7071L16.6177 18.0319Z" fill="#7B7B7B"/>
  </svg>
);

const ArrowsIcon = () => (
  <svg
    width="26" height="22" viewBox="0 0 26 22"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    className="icon-arrows"
  >
    <path d="M13.4697 21.8872C13.8169 21.8872 14.1128 21.7552 14.3546 21.5169L24.245 11.9829C24.5443 11.6917 24.6948 11.3738 24.6948 10.9956C24.6913 10.614 24.5345 10.2738 24.237 9.99238L14.3466 0.458396C14.1066 0.218359 13.8204 0.0898438 13.4697 0.0898438C12.7566 0.0898438 12.2031 0.641596 12.2031 1.3494C12.2031 1.6824 12.3439 2.01013 12.5802 2.25896L22.2488 11.5517V10.4165L12.5802 19.7226C12.3456 19.9652 12.2031 20.2814 12.2031 20.6339C12.2031 21.3337 12.7566 21.8872 13.4697 21.8872Z" fill="white"/>
    <path d="M2.20995 21.8872C2.55721 21.8872 2.85311 21.7552 3.0949 21.5169L12.9854 11.9829C13.2846 11.6917 13.4352 11.3738 13.4352 10.9956C13.4334 10.614 13.2748 10.2738 12.9774 9.99238L3.0869 0.458396C2.84686 0.218359 2.56073 0.0898438 2.20995 0.0898438C1.49863 0.0898438 0.943359 0.641596 0.943359 1.3494C0.943359 1.6824 1.08418 2.01013 1.3205 2.25896L10.9891 11.5517V10.4165L1.3205 19.7226C1.08594 19.9652 0.943359 20.2814 0.943359 20.6339C0.943359 21.3337 1.49863 21.8872 2.20995 21.8872Z" fill="white"/>
  </svg>
);

const ChevronIcon = () => (
  <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path fillRule="evenodd" clipRule="evenodd" d="M13.7071 0.292893C14.0976 0.683418 14.0976 1.31658 13.7071 1.70711L7.70711 7.70711C7.31658 8.09763 6.68342 8.09763 6.29289 7.70711L0.292893 1.70711C-0.0976315 1.31658 -0.0976315 0.683417 0.292893 0.292893C0.683417 -0.0976317 1.31658 -0.0976317 1.70711 0.292893L7 5.58579L12.2929 0.292893C12.6834 -0.0976312 13.3166 -0.0976311 13.7071 0.292893Z" fill="#333333"/>
  </svg>
);

// Componente de header
export const HeaderTemplate = () => (
  <h2 className="mapa-fosas-searcher__title">Buscar en el mapa de fosas</h2>
);

// Componente de buscador con formulario
export const BuscadorTemplate = ({ 
  busquedaTexto, 
  onBusquedaChange, 
  onFormSubmit,
  formRef,
  inputRef 
}) => (
  <div className="search-form-container">
    <form 
      ref={formRef}
      role="search" 
      aria-label="Buscador de fosas" 
      className="mapa-fosas-searcher__form"
      onSubmit={onFormSubmit}
    >
      <label htmlFor="busqueda" className="sr-only">Buscar por Comunidad, Localidad...</label>
      <input
        ref={inputRef}
        type="search"
        id="busqueda"
        name="busqueda"
        placeholder="Buscar por Comunidad, Localidad..."
        className="mapa-fosas-searcher__input"
        value={busquedaTexto}
        onChange={onBusquedaChange}
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="mapa-fosas-searcher__button"
      >
        <SearchIcon />
      </button>
    </form>
  </div>
);

// Componente de botón toggle
export const ToggleButtonTemplate = ({ 
  listaVisible, 
  onToggleClick, 
  toggleBtnRef 
}) => (
  <button
    ref={toggleBtnRef}
    type="button"
    id="toggle-busqueda"
    className="mapa-fosas-searcher__btnFilter"
    aria-label={listaVisible ? "Ocultar lista de fosas" : "Mostrar lista de fosas"}
    aria-pressed={listaVisible}
    onClick={onToggleClick}
  >
    <ArrowsIcon />
  </button>
);

// Componente de resultados
export const ResultadosTemplate = ({ fosasFiltradas }) => (
  <div id="resultados" aria-live="polite" className="mapa-fosas-searcher__result">
    Se muestran <strong>{fosasFiltradas.length}</strong> resultados
  </div>
);

// Componente de filtros con panel expandible
export const FiltrosTemplate = ({ 
  estadosSeleccionados,
  onEstadoChange,
  statusPanelExpanded,
  onToggleStatusPanel,
  statusToggleBtnRef,
  panelRef
}) => {
  const checkboxes = [
    { id: "todos", value: "todos", label: "Todos" },
    { id: "exhumados", value: "exhumados", label: "Exhumados" },
    { id: "no-exhumados", value: "no-exhumados", label: "No exhumados" },
    { id: "trasladada", value: "trasladada", label: "Trasladada a Cuelgamuros" }
  ];

  return (
    <section aria-labelledby="filtros-titulo" className="mapa-fosas-searcher__statusGraves">
      <h3 id="filtros-heading" className="mapa-fosas-searcher__statusTitle">
        <button
          ref={statusToggleBtnRef}
          type="button"
          id="btn-status-fosas"
          className={`mapa-fosas-searcher__statusTitleBtn ${statusPanelExpanded ? "active" : ""}`}
          aria-expanded={statusPanelExpanded}
          aria-controls="panel-status-fosas"
          onClick={onToggleStatusPanel}
        >
          <span>Status de las fosas</span>
          <ChevronIcon />
        </button>
      </h3>
      <form 
        ref={panelRef}
        id="panel-status-fosas" 
        className="mapa-fosas-searcher__statusForm" 
        style={{ display: statusPanelExpanded ? 'block' : 'none' }}
      >
        <fieldset>
          <legend className="sr-only">Filtrar por estado de las fosas</legend>
          {checkboxes.map(checkbox => (
            <div key={checkbox.id} className="mapa-fosas-searcher__statusItem">
              <input
                type="checkbox"
                id={checkbox.id}
                name="status"
                value={checkbox.value}
                className="mapa-fosas-searcher__statusCheck"
                checked={estadosSeleccionados.includes(checkbox.value)}
                onChange={() => onEstadoChange(checkbox.value)}
              />
              <label className="mapa-fosas-searcher__statusLabel" htmlFor={checkbox.id}>
                {checkbox.label}
              </label>
            </div>
          ))}
        </fieldset>
        <button
          type="button"
          id="aplicar-filtros"
          className="mapa-fosas-searcher__statusBtn"
        >
          Ver detalles
        </button>
      </form>
    </section>
  );
};

// Componente de loading
export const LoadingTemplate = () => (
  <div className="loading-message">
    <p>⏳ Cargando datos...</p>
  </div>
);

// Componente de error
export const ErrorTemplate = () => (
  <div className="error-message">
    <p>❌ Error al cargar los datos. Por favor, recarga la página.</p>
  </div>
);

// Componente principal del searcher
export const SearcherTemplate = ({
  busquedaTexto,
  onBusquedaChange,
  onFormSubmit,
  fosasFiltradas,
  estadosSeleccionados,
  onEstadoChange,
  statusPanelExpanded,
  onToggleStatusPanel,
  listaVisible,
  onToggleClick,
  loading,
  error,
  // Refs
  formRef,
  inputRef,
  statusToggleBtnRef,
  panelRef,
  toggleBtnRef
}) => {
  if (loading) {
    return (
      <div className="mapa-fosas-searcher">
        <HeaderTemplate />
        <LoadingTemplate />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mapa-fosas-searcher">
        <HeaderTemplate />
        <ErrorTemplate />
      </div>
    );
  }

  return (
    <div className="mapa-fosas-searcher">
      <HeaderTemplate />
      <BuscadorTemplate 
        busquedaTexto={busquedaTexto}
        onBusquedaChange={onBusquedaChange}
        onFormSubmit={onFormSubmit}
        formRef={formRef}
        inputRef={inputRef}
      />
      <ToggleButtonTemplate 
        listaVisible={listaVisible}
        onToggleClick={onToggleClick}
        toggleBtnRef={toggleBtnRef}
      />
      <ResultadosTemplate fosasFiltradas={fosasFiltradas} />
      <FiltrosTemplate 
        estadosSeleccionados={estadosSeleccionados}
        onEstadoChange={onEstadoChange}
        statusPanelExpanded={statusPanelExpanded}
        onToggleStatusPanel={onToggleStatusPanel}
        statusToggleBtnRef={statusToggleBtnRef}
        panelRef={panelRef}
      />
    </div>
  );
};

// Componente de panel de búsqueda completo
export const PanelBusquedaTemplate = ({
  listaVisible,
  children,
  contenedorTextoRef,
  contenedorPrincipalRef
}) => (
  <div 
    ref={contenedorTextoRef}
    className={`mapa-fosas_search ${!listaVisible ? "vista-completa" : ""}`}
  >
    <div ref={contenedorPrincipalRef} className="mapa-fosas_content">
      {children}
    </div>
  </div>
);

// Componente de contenedor del mapa
export const MapaContainerTemplate = ({ 
  listaVisible, 
  children,
  contenedorFiguraRef 
}) => (
  <div 
    ref={contenedorFiguraRef}
    className={`mapa-fosas_map ${!listaVisible ? "vista-completa" : ""}`}
  >
    {children}
  </div>
);

// Componente de layout principal
export const LayoutTemplate = ({
  children,
  contenedorPrincipalRef
}) => (
  <div className="mapa-fosas">
    <div ref={contenedorPrincipalRef} className="mapa-fosas_content buscador-layout">
      {children}
    </div>
  </div>
);

export default {
  HeaderTemplate,
  BuscadorTemplate,
  ToggleButtonTemplate,
  ResultadosTemplate,
  FiltrosTemplate,
  LoadingTemplate,
  ErrorTemplate,
  SearcherTemplate,
  PanelBusquedaTemplate,
  MapaContainerTemplate,
  LayoutTemplate
};
