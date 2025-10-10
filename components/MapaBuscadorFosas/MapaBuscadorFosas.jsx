"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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

  // Estado para autocompletar
  const [sugerencias, setSugerencias] = useState([]);
  const [sugerenciasVisibles, setSugerenciasVisibles] = useState(false);
  const [indiceSugerencia, setIndiceSugerencia] = useState(-1);
  
  // Ref para el contenedor de lista (lazy loading)
  const listContainerRef = useRef(null);

  // Hook consolidado
  const {
    loading,
    setLoading,
    selectedFosa,
    error,
    setError,
    listaVisible,
    busquedaTexto,
    busquedaInput,
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
    aplicarFiltroUbicacion,
    zoomAZonaBuscada,
    totalFiltradas,
    setBusquedaTexto,
    setBusquedaInput,
    fosasConDestacado,
    cargandoDestacados,
  } = useMapaBuscador(fosas, isMobile);

  // Índice geográfico para coincidencias jerárquicas
  const indiceGeografico = useMemo(() => {
    const slugify = (str) =>
      (str || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const ccaaMap = new Map();
    const provMap = new Map();
    const munMap = new Map();

    for (const f of fosas) {
      const ccaaSlug = slugify(f.ccaa_seo || f.ccaa);
      const provSlug = slugify(f.provincia_seo || f.provincia);
      const munSlug = slugify(f.municipio_seo || f.municipio);

      if (ccaaSlug && !ccaaMap.has(ccaaSlug))
        ccaaMap.set(ccaaSlug, {
          slug: ccaaSlug,
          nombre: f.ccaa_seo || f.ccaa,
          tipo: "ccaa",
        });
      if (provSlug && !provMap.has(provSlug))
        provMap.set(provSlug, {
          slug: provSlug,
          nombre: f.provincia_seo || f.provincia,
          ccaaSlug,
          ccaaNombre: f.ccaa_seo || f.ccaa,
          tipo: "provincia",
        });
      if (munSlug && !munMap.has(munSlug))
        munMap.set(munSlug, {
          slug: munSlug,
          nombre: f.municipio_seo || f.municipio,
          provSlug,
          ccaaSlug,
          provNombre: f.provincia_seo || f.provincia,
          ccaaNombre: f.ccaa_seo || f.ccaa,
          tipo: "municipio",
        });
    }
    return { slugify, ccaaMap, provMap, munMap };
  }, [fosas]);

  // Generar sugerencias basadas en el texto de entrada
  const generarSugerencias = useCallback(
    (texto) => {
      if (!texto || texto.length < 2) {
        setSugerencias([]);
        setSugerenciasVisibles(false);
        return;
      }

      const { ccaaMap, provMap, munMap } = indiceGeografico;
      const textoLower = texto.toLowerCase();
      const sugerenciasEncontradas = [];

      // Buscar en CCAs
      for (const [slug, data] of ccaaMap) {
        if (
          data.nombre.toLowerCase().includes(textoLower) ||
          slug.includes(textoLower)
        ) {
          sugerenciasEncontradas.push({
            ...data,
            coincidencia: data.nombre,
            url: `/${slug}`,
          });
        }
      }

      // Buscar en provincias
      for (const [slug, data] of provMap) {
        if (
          data.nombre.toLowerCase().includes(textoLower) ||
          slug.includes(textoLower)
        ) {
          sugerenciasEncontradas.push({
            ...data,
            coincidencia: `${data.nombre}, ${data.ccaaNombre}`,
            url: `/${data.ccaaSlug}/${slug}`,
          });
        }
      }

      // Buscar en municipios
      for (const [slug, data] of munMap) {
        if (
          data.nombre.toLowerCase().includes(textoLower) ||
          slug.includes(textoLower)
        ) {
          sugerenciasEncontradas.push({
            ...data,
            coincidencia: `${data.nombre}, ${data.provNombre}`,
            url: `/${data.ccaaSlug}/${data.provSlug}/${slug}/`,
          });
        }
      }

      // Limitar a 8 sugerencias y ordenar por relevancia
      const sugerenciasLimitadas = sugerenciasEncontradas
        .sort((a, b) => {
          // Priorizar coincidencias exactas al inicio
          const aExacta = a.nombre.toLowerCase() === textoLower;
          const bExacta = b.nombre.toLowerCase() === textoLower;
          if (aExacta && !bExacta) return -1;
          if (!aExacta && bExacta) return 1;

          // Luego por tipo (ccaa > provincia > municipio)
          const ordenTipo = { ccaa: 0, provincia: 1, municipio: 2 };
          return ordenTipo[a.tipo] - ordenTipo[b.tipo];
        })
        .slice(0, 8);

      setSugerencias(sugerenciasLimitadas);
      setSugerenciasVisibles(sugerenciasLimitadas.length > 0);
    },
    [indiceGeografico]
  );

  // Manejar el cambio en el input con sugerencias
  const handleBusquedaChangeConSugerencias = useCallback(
    (e) => {
      const valor = e.target.value;
      handleBusquedaChange(e);
      generarSugerencias(valor);
      setIndiceSugerencia(-1);
    },
    [handleBusquedaChange, generarSugerencias]
  );

  // Manejar navegación con teclado en sugerencias
  const handleKeyDown = useCallback(
    (e) => {
      if (!sugerenciasVisibles || sugerencias.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setIndiceSugerencia((prev) =>
            prev < sugerencias.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setIndiceSugerencia((prev) =>
            prev > 0 ? prev - 1 : sugerencias.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (indiceSugerencia >= 0 && sugerencias[indiceSugerencia]) {
            seleccionarSugerencia(sugerencias[indiceSugerencia]);
          } else {
            handleFormSubmit(e);
          }
          break;
        case "Escape":
          setSugerenciasVisibles(false);
          setIndiceSugerencia(-1);
          break;
      }
    },
    [sugerenciasVisibles, sugerencias, indiceSugerencia, handleFormSubmit]
  );

  // Seleccionar una sugerencia
  const seleccionarSugerencia = useCallback(
    (sugerencia) => {
      setBusquedaInput(sugerencia.nombre);
      setBusquedaTexto(sugerencia.nombre);
      setSugerenciasVisibles(false);
      setIndiceSugerencia(-1);

      // Navegar a la URL correspondiente
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", sugerencia.url);
      }

      // Hacer zoom a la zona después de un pequeño delay para asegurar que las fosas se actualicen
      setTimeout(() => {
        zoomAZonaBuscada();
      }, 100);
    },
    [setBusquedaInput, setBusquedaTexto, zoomAZonaBuscada]
  );

  // Cerrar sugerencias al hacer clic fuera
  const cerrarSugerencias = useCallback(() => {
    setSugerenciasVisibles(false);
    setIndiceSugerencia(-1);
  }, []);

  // Sincronizar URL jerárquicamente según la búsqueda aplicada
  useEffect(() => {
    if (!busquedaTexto) return; // Nada que reflejar
    if (selectedFosa) return; // No interferir con selección de fosa abierta

    const { slugify, ccaaMap, provMap, munMap } = indiceGeografico;
    const termSlug = slugify(busquedaTexto);
    if (!termSlug) return;

    let nuevaUrl = null;

    // Preferencias: CCAA exacta > Provincia exacta > Municipio exacto (pero para "madrid" queremos provincia path)
    if (ccaaMap.has(termSlug)) {
      nuevaUrl = `/${termSlug}`;
    } else if (provMap.has(termSlug)) {
      const prov = provMap.get(termSlug);
      nuevaUrl = `/${prov.ccaaSlug}/${prov.slug}`;
    } else if (munMap.has(termSlug)) {
      const mun = munMap.get(termSlug);
      const prov = provMap.get(mun.provSlug);
      nuevaUrl = `/${mun.ccaaSlug}/${prov.slug}/${mun.slug}/`;
    } else {
      // Coincidencias parciales: municipio > provincia > ccaa
      for (const [slug, mun] of munMap) {
        if (slug.includes(termSlug) || termSlug.includes(slug)) {
          const prov = provMap.get(mun.provSlug);
          nuevaUrl = `/${mun.ccaaSlug}/${prov.slug}/${mun.slug}/`;
          break;
        }
      }
      if (!nuevaUrl) {
        for (const [slug, prov] of provMap) {
          if (slug.includes(termSlug) || termSlug.includes(slug)) {
            nuevaUrl = `/${prov.ccaaSlug}/${prov.slug}`;
            break;
          }
        }
      }
      if (!nuevaUrl) {
        for (const [slug] of ccaaMap) {
          if (slug.includes(termSlug) || termSlug.includes(slug)) {
            nuevaUrl = `/${slug}`;
            break;
          }
        }
      }
    }

    if (
      nuevaUrl &&
      typeof window !== "undefined" &&
      window.location.pathname !== nuevaUrl
    ) {
      window.history.replaceState({}, "", nuevaUrl);
    }
  }, [busquedaTexto, selectedFosa, indiceGeografico]);

  // === FUNCIONES MEMOIZADAS ===

  const handleFosaClick = useCallback(
    (event) => {
      const { id } = event.detail;
      const fosa = fosasFiltradas.find((f) => f.id === id);
      if (fosa) {
        handleFosaSelect(fosa);
      }
    },
    [fosasFiltradas, handleFosaSelect]
  );

  // Eliminado handleMobileLoadMore - No hay scroll infinito

  // === EFECTOS PRINCIPALES ===

  // Actualizar mobile sheet cuando cambien las fosas visibles
  useEffect(() => {
    if (isMobile && mobileSheet.updateContent) {
      mobileSheet.updateContent(fosasVisibles);
    }
  }, [fosasVisibles, isMobile, mobileSheet]);

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

    return () => {
      document.removeEventListener("fosa-click", handleFosaClick);
    };
  }, [handleFosaClick]);

  // Eliminado sistema de scroll infinito - Carga todo de una vez

  // === COMPONENTES MEMOIZADOS ===

  const SearchForm = useMemo(
    () => (
      <div className="search-form-container" style={{ position: "relative" }}>
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
            value={busquedaInput}
            onChange={handleBusquedaChangeConSugerencias}
            onKeyDown={handleKeyDown}
            onBlur={cerrarSugerencias}
            autoComplete="off"
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

        {/* Panel de sugerencias */}
        {sugerenciasVisibles && sugerencias.length > 0 && (
          <div
            className="autocomplete-suggestions"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              backgroundColor: "white",
              border: "1px solid #ddd",
              borderRadius: "4px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              zIndex: 1000,
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            {sugerencias.map((sugerencia, index) => (
              <div
                key={`${sugerencia.tipo}-${sugerencia.slug}`}
                className={`autocomplete-item ${
                  index === indiceSugerencia ? "highlighted" : ""
                }`}
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  borderBottom:
                    index < sugerencias.length - 1 ? "1px solid #eee" : "none",
                  backgroundColor:
                    index === indiceSugerencia ? "#f5f5f5" : "white",
                }}
                onMouseDown={(e) => {
                  e.preventDefault(); // Evita que onBlur se dispare antes
                  seleccionarSugerencia(sugerencia);
                }}
                onMouseEnter={() => setIndiceSugerencia(index)}
              >
                <div style={{ fontWeight: "500", color: "#333" }}>
                  {sugerencia.nombre}
                </div>
                <div style={{ fontSize: "0.85em", color: "#666" }}>
                  {sugerencia.tipo === "ccaa" && "Comunidad Autónoma"}
                  {sugerencia.tipo === "provincia" &&
                    `Provincia, ${sugerencia.ccaaNombre}`}
                  {sugerencia.tipo === "municipio" &&
                    `Municipio, ${sugerencia.provNombre}`}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          id="toggle-busqueda"
          className="mapa-fosas-searcher__btnFilter"
          aria-label={
            listaVisible ? "Ocultar lista de fosas" : "Mostrar lista de fosas"
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
    ),
    [
      busquedaInput,
      handleBusquedaChangeConSugerencias,
      handleFormSubmit,
      handleKeyDown,
      cerrarSugerencias,
      sugerenciasVisibles,
      sugerencias,
      indiceSugerencia,
      seleccionarSugerencia,
      listaVisible,
      handleToggleClick,
    ]
  );

  const StatusFilters = useMemo(() => {
    const statusOptions = [
      { key: "todos", label: "Todos" },
      { key: "exhumados", label: "Exhumados" },
      { key: "no-exhumados", label: "No exhumados" },
      { key: "trasladada", label: "Trasladada a Cuelgamuros" },
    ];

    return (
      <section
        aria-labelledby="filtros-titulo"
        className="mapa-fosas-searcher__statusGraves"
      >
        <h3 id="filtros-heading" className="mapa-fosas-searcher__statusTitle">
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
            <legend className="sr-only">Filtrar por estado de las fosas</legend>
            {statusOptions.map(({ key, label }) => (
              <div key={key} className="mapa-fosas-searcher__statusItem">
                <div
                  className="mapa-fosas-searcher__statusCheck"
                  onClick={() => handleEstadoChange(key)}
                >
                  {estadosSeleccionados.includes(key) && <CheckIcon />}
                </div>
                <label
                  className="mapa-fosas-searcher__statusLabel"
                  onClick={() => handleEstadoChange(key)}
                >
                  {label}
                </label>
              </div>
            ))}
          </fieldset>
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
    );
  }, [
    statusPanelExpanded,
    handleToggleStatusPanel,
    estadosSeleccionados,
    handleEstadoChange,
    listaVisible,
    handleToggleClick,
  ]);

  // Eliminado LoadingTrigger - No hay scroll infinito

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
          listaVisible || selectedFosa ? "open" : ""
        }`}
      >
        {/* Panel de búsqueda - Desktop y Mobile */}
        <div
          className={`mapa-fosas_search ${
            !listaVisible && !selectedFosa ? "vista-completa" : ""
          } ${isMobile ? "mobile" : ""}`}
        >
          {selectedFosa ? (
            <FichaFosa fosa={selectedFosa} onClose={handleCloseFosa} />
          ) : (
            <div className="mapa-fosas-searcher">
              <h2 className="mapa-fosas-searcher__title">
                Buscar en el mapa de fosas
              </h2>
              {SearchForm}
              <div
                id="resultados"
                aria-live="polite"
                className="mapa-fosas-searcher__result"
              >
                {(() => {
                  const visible = Array.isArray(fosasVisiblesEnMapa)
                    ? fosasVisiblesEnMapa.length
                    : 0;
                  const total = visible > 0 ? visible : totalFiltradas;
                  return (
                    <>
                      Se muestran <strong>{total}</strong> resultados
                    </>
                  );
                })()}
              </div>
              {StatusFilters}

              {/* Lista completa en desktop */}
              {listaVisible && isDesktop && (
                <div ref={listContainerRef} style={{ overflowY: 'auto', flex: 1 }}>
                  <ListaFosasCompleta
                    contexto="mapaBuscadorFosas"
                    lista={fosasVisibles}
                    onItemClick={handleFosaSelect}
                    modoSimple={true}
                    totalFiltradas={totalFiltradas}
                    map={mapaRef.current?.map}
                    filtrarPorViewport={true}
                    permitirCambioViewport={false}
                    fosasVisiblesExternas={fosasVisiblesEnMapa}
                    imagenesDestacadas={fosasConDestacado}
                    listContainerRef={listContainerRef}
                  />
                </div>
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
