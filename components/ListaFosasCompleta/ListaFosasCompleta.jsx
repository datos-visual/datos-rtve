"use client";

import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import Image from "next/image";
import "../../app/styles/_listaFosasCompleta.scss";

import upChevron from "../../app/assets/icon-up-chevron.svg";
import downChevron from "../../app/assets/icon-down-chevron.svg";
import pinLineaNarrativa from "../../app/assets/pinUbicacionLineaNarrativa.svg";

const CONFIGURACIONES_CONTEXTO = {
  mapaHistorias: {
    modoSimple: false,
    introVisible: true,
    mostrarCategoria: true,
    mostrarEstado: false,
    tipoContenido: "historias",
    descripcionDefault: "Seleccionar una línea narrativa para explorar.",
  },
};

const ListaFosasCompleta = React.memo(function ListaFosasCompleta({
  contexto = "mapaHistorias",
  lista,
  fosas, // compatibilidad
  renderListaFosas,
  categoria = "todas",
  descripcion,
  modoSimple,
  introVisibleDefault,
  onItemClick,
  onIntroToggle,
  totalFiltradas, // Total de fosas filtradas desde el padre
  // Nuevas props para filtro por viewport
  map,
  filtrarPorViewport = false,
  permitirCambioViewport = false, // Nueva prop para habilitar el toggle
  fosasVisiblesExternas = null, // Para recibir fosas visibles desde useMapaRecuento
  imagenesDestacadas = {}, // Imágenes destacadas cargadas en el padre
}) {
  const configBase =
    CONFIGURACIONES_CONTEXTO[contexto] ||
    CONFIGURACIONES_CONTEXTO.mapaHistorias;

  // === ESTADO PARA FILTRO POR VIEWPORT ===
  const [fosasEnViewport, setFosasEnViewport] = useState([]);
  
  // === RECIBIR IMAGENES DESTACADAS DESDE EL PADRE ===
  // (Ya no se cargan aquí, vienen como prop)

  // Necesitamos mover este useEffect después de que itemsBase esté definido
  // Por ahora lo comentamos y lo moveremos más abajo

  const [mapaListo, setMapaListo] = useState(false);
  const [modoViewportActivo, setModoViewportActivo] =
    useState(filtrarPorViewport);
  const [fosasExternas, setFosasExternas] = useState([]);
  const actualizandoViewportRef = useRef(false);
  
  // === LAZY LOADING POR LOTES PARA LISTA (desktop y móvil) ===
  const BATCH_SIZE = 50;
  const INITIAL_ITEMS = 60;
  const [loadedCount, setLoadedCount] = useState(INITIAL_ITEMS);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef(null);

  // usar `lista` si viene, sino `fosas` (compat)
  const itemsBase = useMemo(() => {
    const result = Array.isArray(lista)
      ? lista
      : Array.isArray(fosas)
      ? fosas
      : [];
    return result;
  }, [lista, fosas, contexto, categoria, filtrarPorViewport]);

  // === SINCRONIZAR FOSAS EXTERNAS ===
  useEffect(() => {
    if (fosasVisiblesExternas && Array.isArray(fosasVisiblesExternas)) {
      setFosasExternas(fosasVisiblesExternas);
    }
  }, [fosasVisiblesExternas]);

  // === FUNCIÓN PARA FILTRAR POR VIEWPORT ===
  const actualizarFosasViewport = useCallback(() => {
    if (
      !modoViewportActivo ||
      !map ||
      !mapaListo ||
      !itemsBase.length ||
      actualizandoViewportRef.current
    ) {
      return;
    }

    try {
      actualizandoViewportRef.current = true;
      const bounds = map.getBounds();

      if (!bounds) {
        return;
      }

      // Filtrar fosas que están dentro del viewport
      const visibles = itemsBase.filter((fosa) => {
        // Manejar coordenadas tanto como números como strings
        let lat, lon;

        if (typeof fosa.lat === "number" && typeof fosa.lon === "number") {
          // Coordenadas ya son números
          lat = fosa.lat;
          lon = fosa.lon;
        } else {
          // Coordenadas son strings, necesitan parsing
          lat = parseFloat(fosa.lat);
          lon = parseFloat(fosa.lon);
        }

        // Verificar que las coordenadas sean válidas
        if (isNaN(lat) || isNaN(lon)) {
          return false;
        }

        const dentroDelBounds =
          lat >= bounds.getSouth() &&
          lat <= bounds.getNorth() &&
          lon >= bounds.getWest() &&
          lon <= bounds.getEast();

        return dentroDelBounds;
      });

      setFosasEnViewport(visibles);
    } catch (error) {
      // Error al actualizar fosas en viewport
    } finally {
      actualizandoViewportRef.current = false;
    }
  }, [modoViewportActivo, map, mapaListo, itemsBase]);

  // === EFECTO PARA EVENTOS DEL MAPA ===
  useEffect(() => {
    if (!modoViewportActivo || !map) {
      setFosasEnViewport([]);
      setMapaListo(false);
      return;
    }

    const handleMapEvents = () => {
      // Usar requestAnimationFrame para optimizar rendimiento
      requestAnimationFrame(() => {
        actualizarFosasViewport();
      });
    };

    const handleMapReady = () => {
      setMapaListo(true);
      setTimeout(() => {
        actualizarFosasViewport();
      }, 100);
    };

    // Verificar si el mapa ya está cargado
    if (map.loaded && map.loaded()) {
      handleMapReady();
    } else {
      map.once("load", handleMapReady);
    }

    // Escuchar eventos del mapa
    map.on("moveend", handleMapEvents);
    map.on("zoomend", handleMapEvents);
    map.on("resize", handleMapEvents);

    // Actualización inicial cuando el mapa esté listo
    map.once("idle", handleMapReady);

    return () => {
      if (map.off) {
        map.off("load", handleMapReady);
        map.off("idle", handleMapReady);
        map.off("moveend", handleMapEvents);
        map.off("zoomend", handleMapEvents);
        map.off("resize", handleMapEvents);
      }
    };
  }, [modoViewportActivo, map, actualizarFosasViewport]);

  // === ACTUALIZAR CUANDO CAMBIEN LAS FOSAS BASE ===
  useEffect(() => {
    if (modoViewportActivo && map && mapaListo) {
      actualizarFosasViewport();
    }
  }, [modoViewportActivo, map, mapaListo, actualizarFosasViewport]);

  // === DETERMINAR QUÉ ITEMS MOSTRAR ===
  // Ya vienen ordenados desde el padre (useMapaBuscador)
  const items = useMemo(() => {
    // Mantener SIEMPRE el orden del listado base (itemsBase),
    // aplicando solo un filtrado por viewport cuando esté activo.
    if (modoViewportActivo) {
      // Priorizar ids de fosasExternas si existen
      if (Array.isArray(fosasExternas) && fosasExternas.length > 0) {
        const idSet = new Set(
          fosasExternas.map((f) => String(f?.id))
        );
        return itemsBase.filter((f) => idSet.has(String(f?.id)));
      }
      // Si no hay externas pero el mapa está listo, usar las calculadas internamente
      if (mapaListo && Array.isArray(fosasEnViewport)) {
        const idSet = new Set(
          fosasEnViewport.map((f) => String(f?.id))
        );
        return itemsBase.filter((f) => idSet.has(String(f?.id)));
      }
    }
    // Fallback: devolver el listado tal cual
    return itemsBase;
  }, [
    modoViewportActivo,
    mapaListo,
    fosasEnViewport,
    itemsBase,
    fosasExternas,
  ]);

  // Reset del lazy loading cuando cambie la fuente de items
  useEffect(() => {
    setLoadedCount(Math.min(INITIAL_ITEMS, items.length || 0));
    setIsLoadingMore(false);
  }, [items]);

  // Cargar más items cuando el sentinel entra en viewport
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    if (!el) return;

    const onIntersect = (entries) => {
      const entry = entries[0];
      if (!entry || !entry.isIntersecting) return;
      if (isLoadingMore) return;
      if (loadedCount >= items.length) return;

      setIsLoadingMore(true);
      // Pequeño delay para permitir pintar placeholders
      setTimeout(() => {
        setLoadedCount((prev) => Math.min(prev + BATCH_SIZE, items.length));
        setIsLoadingMore(false);
      }, 100);
    };

    const io = new IntersectionObserver(onIntersect, {
      root: null,
      rootMargin: "200px 0px",
      threshold: 0.01,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [items.length, loadedCount, isLoadingMore]);

  // === TODA LA CARGA SE HACE EN useMapaBuscador.js ===
  // Este componente solo recibe imagenesDestacadas como prop

  const config = {
    ...configBase,
    modoSimple: modoSimple ?? configBase.modoSimple,
    descripcionDefault: descripcion || configBase.descripcionDefault,
  };

  const [introVisible, setIntroVisible] = useState(
    introVisibleDefault ?? configBase.introVisible
  );

  useEffect(() => {
    // si el padre controla el introVisible por prop (introVisibleDefault)
    setIntroVisible(introVisibleDefault ?? configBase.introVisible);
  }, [introVisibleDefault, configBase.introVisible]);

  const tituloSeccion = "Resumen de la categoría";

  const mensajeContador = (() => {
    // Mostrar el total actual (igual que cabecera): visibles si hay filtro por mapa, sino total de la lista
    const total = items.length;
    return `Se muestran ${total.toLocaleString('es-ES')} resultados`;
  })();

  const mensajeVacio = (() => {
    if (items.length === 0) {
      if (modoViewportActivo && mapaListo) {
        return "No hay fosas visibles en esta área del mapa. Haz zoom out o mueve el mapa para ver más fosas.";
      }
      return "No se encontraron historias para esta categoría.";
    }
    return "";
  })();

  // === HANDLERS ===
  const toggleIntro = () => {
    const nuevo = !introVisible;
    setIntroVisible(nuevo);
    onIntroToggle?.(nuevo);
  };

  const toggleModoViewport = () => {
    setModoViewportActivo((prev) => !prev);
  };

  // === HANDLERS DE HOVER ===
  const handleItemHover = useCallback((fosa) => {
    if (!map) return;
    
    // Activar highlight en el mapa
    map.setFilter("fosaHighlight", ["==", "id", String(fosa.id)]);
  }, [map]);

  const handleItemLeave = useCallback(() => {
    if (!map) return;
    
    // Limpiar highlight en el mapa
    map.setFilter("fosaHighlight", ["==", "id", ""]);
  }, [map]);

  // renderer por defecto — devuelve JSX
  const defaultRender = (listaItems = [], callback) => {
    if (!Array.isArray(listaItems) || listaItems.length === 0)
      return <p className="no-resultados">{mensajeVacio}</p>;

    const visible = listaItems.slice(0, loadedCount);
    const placeholdersCount = Math.max(0, loadedCount - visible.length);

    const rendered = visible.map((fosa, index) => {
      // seguridad: garantizar id
      const key = fosa?.id ?? Math.random().toString(36).slice(2, 9);
      const ubicacion = [fosa.municipio, fosa.provincia]
        .filter(Boolean)
        .join(" / ");
      const titulo =
        (fosa.title && fosa.title.trim()) ||
        `Historia en ${fosa.municipio || "ubicación desconocida"}`;
      const descripcionItem =
        (fosa.detalle_linea_narrativa && fosa.detalle_linea_narrativa.trim()) ||
        (fosa.status && `Estado: ${fosa.status.trim()}`) ||
        (fosa.event_date && `Fecha: ${fosa.event_date}`) ||
        "Historia con línea narrativa disponible";

      return (
        <div
          className="fosa"
          data-id={fosa.id}
          key={key}
          onClick={() => callback?.(fosa)}
          onMouseEnter={() => handleItemHover(fosa)}
          onMouseLeave={handleItemLeave}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") callback?.(fosa);
          }}
        >
          {/* Solo mostrar imagen si hay destacado o foto base */}
          {(imagenesDestacadas[fosa.id] || fosa.foto) && (
            <div className="fosa__img">
              <img
                src={
                  imagenesDestacadas[fosa.id] ||
                  fosa.foto ||
                  "https://fotografias.larazon.es/clipping/cmsimages02/2024/11/15/93DFFB09-1D04-4088-99A5-94DC549EE9EC/hallada-fosa-comun-cementerio-val-51-victimas-franquismo_98.jpg?crop=1200,675,x0,y113&width=1900&height=1069&optimize=low&format=webply"
                }
                alt={titulo}
              />
            </div>
          )}
          <div className="info">
            <p className="ubicacion">
              <strong>{fosa.municipio}</strong> / {fosa.provincia}
            </p>
            <p className="descripcion">{titulo}</p>
          </div>
        </div>
      );
    });

    // Placeholders invisibles para reservar espacio durante la carga
    const placeholders = Array.from({ length: placeholdersCount }).map((_, i) => (
      <div
        key={`ph-${i}`}
        className="fosa placeholder"
        aria-hidden="true"
        style={{ opacity: 0, pointerEvents: "none" }}
      >
        <div className="fosa__img" />
        <div className="info">
          <p className="ubicacion">&nbsp;</p>
          <p className="descripcion">&nbsp;</p>
        </div>
      </div>
    ));

    return [...rendered, ...placeholders];
  };

  return (
    <>
      <div className="contador-container">
        <p
          className="contador"
          dangerouslySetInnerHTML={{ __html: mensajeContador }}
        />

        <p  className="contador_txt">Desplázate hacia abajo para ver más</p>
      </div>
      <div className="lista-fosas" data-contexto={contexto}>
        {!config.modoSimple && (
          <>
            {contexto === "mapaHistorias" && (
              <div
                className={`intro-fosas ${introVisible ? "visible" : "oculto"}`}
              >
                <h4 className="intro-fosas__title">{tituloSeccion}</h4>
                <p className="intro-fosas__text">{config.descripcionDefault}</p>
                <div className="hide-button">
                  <button className="toggle-intro" onClick={toggleIntro}>
                    <span>
                      {introVisible ? "Menos información" : "Más información"}
                    </span>
                    <Image
                      src={introVisible ? upChevron : downChevron}
                      alt=""
                      width={18}
                      height={18}
                    />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <div className="lista-narrativas">
          {items.length > 0 ? (
            // si se pasó renderListaFosas usarla, sino fallback
            renderListaFosas ? (
              (() => {
                const result = renderListaFosas(items, onItemClick);
                // Si es string HTML, convertir a JSX usando dangerouslySetInnerHTML
                if (typeof result === "string") {
                  return <div dangerouslySetInnerHTML={{ __html: result }} />;
                }
                return result;
              })()
            ) : (
              defaultRender(items, onItemClick)
            )
          ) : (
            <p className="no-resultados">{mensajeVacio}</p>
          )}
          {/* Sentinel para lazy loading */}
          <div ref={sentinelRef} style={{ height: 1 }} />
        </div>
      </div>
    </>
  );
});

export default ListaFosasCompleta;
