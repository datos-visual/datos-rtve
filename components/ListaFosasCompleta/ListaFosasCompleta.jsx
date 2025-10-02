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
  // Nuevas props para filtro por viewport
  map,
  filtrarPorViewport = false,
  permitirCambioViewport = false, // Nueva prop para habilitar el toggle
  fosasVisiblesExternas = null, // Para recibir fosas visibles desde useMapaRecuento
}) {
  const configBase =
    CONFIGURACIONES_CONTEXTO[contexto] ||
    CONFIGURACIONES_CONTEXTO.mapaHistorias;

  // === ESTADO PARA FILTRO POR VIEWPORT ===
  const [fosasEnViewport, setFosasEnViewport] = useState([]);
  
  // === CACHE PARA IMAGENES DESTACADAS ===
  const [imagenesDestacadas, setImagenesDestacadas] = useState({});
  
  // Función para generar thumbnail según tipo de contenido
  const generarThumbnail = useCallback((contenido, size = 400) => {
    const { tipo, id, url } = contenido;
    
    if (tipo === "video") {
      return `https://img.rtve.es/v/${id}?w=${size}`;
    } else if (tipo === "audio") {
      return `https://img.rtve.es/a/${id}?w=${size}`;
    } else if (tipo === "foto") {
      return url;
    }
    return null;
  }, []);

  // Necesitamos mover este useEffect después de que itemsBase esté definido
  // Por ahora lo comentamos y lo moveremos más abajo

  const [mapaListo, setMapaListo] = useState(false);
  const [modoViewportActivo, setModoViewportActivo] =
    useState(filtrarPorViewport);
  const [fosasExternas, setFosasExternas] = useState([]);
  const actualizandoViewportRef = useRef(false);

  // usar `lista` si viene, sino `fosas` (compat)
  const itemsBase = useMemo(() => {
    const result = Array.isArray(lista)
      ? lista
      : Array.isArray(fosas)
      ? fosas
      : [];
    console.log("📋 ListaFosasCompleta recibe:", {
      contexto,
      totalItems: result.length,
      categoria,
      filtrarPorViewport,
      ejemplos: result.slice(0, 2).map((item) => ({
        id: item?.id,
        municipio: item?.municipio,
        narrativa: item?.linea_narrativa,
      })),
    });
    return result;
  }, [lista, fosas, contexto, categoria, filtrarPorViewport]);

  // === SINCRONIZAR FOSAS EXTERNAS ===
  useEffect(() => {
    if (fosasVisiblesExternas && Array.isArray(fosasVisiblesExternas)) {
      console.log(
        "🔄 Actualizando fosas externas:",
        fosasVisiblesExternas.length
      );
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
      console.log("🚫 No actualizando viewport:", {
        modoViewportActivo,
        map: !!map,
        mapaListo,
        itemsBaseLength: itemsBase.length,
        actualizando: actualizandoViewportRef.current,
      });
      return;
    }

    try {
      actualizandoViewportRef.current = true;
      const bounds = map.getBounds();

      if (!bounds) {
        console.warn("No se pudieron obtener los bounds del mapa");
        return;
      }

      // Debug: revisar algunos datos de muestra
      console.log("🔍 Datos de muestra antes del filtro:", {
        totalFosas: itemsBase.length,
        primeras3Fosas: itemsBase.slice(0, 3).map((fosa) => ({
          id: fosa.id,
          lat: fosa.lat,
          lon: fosa.lon,
          latType: typeof fosa.lat,
          lonType: typeof fosa.lon,
          municipio: fosa.municipio,
          latParsed: parseFloat(fosa.lat),
          lonParsed: parseFloat(fosa.lon),
          latValid: !isNaN(parseFloat(fosa.lat)),
          lonValid: !isNaN(parseFloat(fosa.lon)),
          latNumber: typeof fosa.lat === "number" ? fosa.lat : "not number",
          lonNumber: typeof fosa.lon === "number" ? fosa.lon : "not number",
        })),
        bounds: {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        },
      });

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

      console.log("🗺️ Actualizando viewport:", {
        totalFosas: itemsBase.length,
        fosasConCoordenadasValidas: itemsBase.filter((f) => {
          const lat = typeof f.lat === "number" ? f.lat : parseFloat(f.lat);
          const lon = typeof f.lon === "number" ? f.lon : parseFloat(f.lon);
          return !isNaN(lat) && !isNaN(lon);
        }).length,
        fosasVisibles: visibles.length,
        bounds: {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        },
        algunasFosasVisibles: visibles.slice(0, 3).map((f) => ({
          id: f.id,
          lat: f.lat,
          lon: f.lon,
          municipio: f.municipio,
        })),
      });

      setFosasEnViewport(visibles);
    } catch (error) {
      console.error("Error al actualizar fosas en viewport:", error);
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
      console.log("🗺️ Mapa listo para filtro por viewport");
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
  const items = useMemo(() => {
    console.log("🔄 Calculando items a mostrar:", {
      modoViewportActivo,
      mapaListo,
      fosasExternas: fosasExternas.length,
      fosasEnViewport: fosasEnViewport.length,
      itemsBase: itemsBase.length,
    });

    // Si tenemos fosas visibles externas (desde useMapaRecuento), usarlas cuando el viewport esté activo
    if (modoViewportActivo && fosasExternas.length > 0) {
      console.log("📦 Usando fosas visibles externas:", fosasExternas.length);
      return fosasExternas;
    }
    // Si no, usar nuestra lógica interna
    if (modoViewportActivo && mapaListo) {
      console.log("🔧 Usando lógica interna:", fosasEnViewport.length);
      return fosasEnViewport;
    }

    console.log("📋 Usando items base:", itemsBase.length);
    return itemsBase;
  }, [
    modoViewportActivo,
    mapaListo,
    fosasEnViewport,
    itemsBase,
    fosasExternas,
  ]);

  // === CARGAR IMAGENES DESTACADAS ===
  useEffect(() => {
    const cargarImagenesDestacadas = async () => {
      const nuevasImagenes = {};
      
      // Solo cargar las primeras 20 fosas para no saturar
      const fosasACargar = items.slice(0, 20);
      console.log('🖼️ Cargando imágenes destacadas para', fosasACargar.length, 'fosas');

      for (const fosa of fosasACargar) {
        // Solo intentar cargar si la fosa tiene section_id o isInDedalo
        if (fosa.section_id || fosa.isInDedalo) {
          // Usar id_datos si existe, sino usar id
          const id = fosa.id_datos || fosa.id;
          const idFormateado = String(id).padStart(5, '0');
          
          console.log('🔍 Cargando destacado para fosa:', {
            id: fosa.id,
            id_datos: fosa.id_datos,
            idFormateado,
            municipio: fosa.municipio
          });
          
          try {
            const response = await fetch(
              `https://www.rtve.es/datos-repo/test-fosas/v2/fichas/${idFormateado}.json`
            );
            
            if (response.ok) {
              const data = await response.json();
              const contenidos = data.contenidos || [];
              
              // Buscar primer contenido destacado
              const destacado = contenidos.find(c => c.destacado === true);
              
              if (destacado) {
                const thumbnail = generarThumbnail(destacado, 400);
                nuevasImagenes[fosa.id] = thumbnail;
                console.log('✅ Imagen destacada encontrada:', {
                  fosaId: fosa.id,
                  thumbnail,
                  tipo: destacado.tipo
                });
              } else {
                console.log('ℹ️ Sin destacado para fosa:', fosa.id);
              }
            }
          } catch (error) {
            console.log('⚠️ Error cargando fosa:', fosa.id, error.message);
          }
        }
      }

      if (Object.keys(nuevasImagenes).length > 0) {
        console.log('💾 Guardando', Object.keys(nuevasImagenes).length, 'imágenes destacadas');
        setImagenesDestacadas(prev => ({...prev, ...nuevasImagenes}));
      }
    };

    if (items.length > 0) {
      cargarImagenesDestacadas();
    }
  }, [items, generarThumbnail]);

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
    const tipoContenido = config.tipoContenido || "elementos";
    let mensaje = `Se muestran ${items.length} ${tipoContenido}`;

    if (modoViewportActivo) {
      if (fosasVisiblesExternas) {
        mensaje += ` visibles en el mapa`;
        if (itemsBase.length !== items.length) {
          mensaje += ` de ${itemsBase.length} total`;
        }
      } else if (mapaListo) {
        mensaje += ` visibles en el mapa`;
        if (itemsBase.length !== items.length) {
          mensaje += ` de ${itemsBase.length} total`;
        }
      } else {
        mensaje += ` (cargando filtro de mapa...)`;
      }
    } else if (config.mostrarCategoria && categoria && categoria !== "todas") {
      mensaje += ` de ${categoria[0].toUpperCase() + categoria.slice(1)}`;
    }

    return mensaje;
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

  console.log("🎨 ListaFosasCompleta renderizando:", {
    contexto,
    totalItems: items.length,
    totalBase: itemsBase.length,
    fosasEnViewport: fosasEnViewport.length,
    fosasExternas: fosasExternas.length,
    fosasVisiblesExternas: fosasVisiblesExternas?.length || "no disponibles",
    modoViewportActivo,
    mapaListo,
    introVisible,
    config: config.tipoContenido,
    mensajeVacio,
    ejemplosItems: items.slice(0, 2).map((item) => ({
      id: item?.id,
      lat: item?.lat,
      lon: item?.lon,
      municipio: item?.municipio,
    })),
  });

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
    
    console.log("🎯 Hover sobre fosa:", fosa.id, fosa.title);
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

    return listaItems.map((fosa) => {
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
  };

  return (
    <>
      <div className="contador-container">
        <p
          className="contador"
          dangerouslySetInnerHTML={{ __html: mensajeContador }}
        />
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
                console.log("🔧 Usando renderListaFosas personalizada");
                const result = renderListaFosas(items, onItemClick);
                console.log(
                  "🔧 Resultado de renderListaFosas:",
                  typeof result,
                  result
                );
                // Si es string HTML, convertir a JSX usando dangerouslySetInnerHTML
                if (typeof result === "string") {
                  return <div dangerouslySetInnerHTML={{ __html: result }} />;
                }
                return result;
              })()
            ) : (
              (() => {
                console.log("🔧 Usando defaultRender");
                return defaultRender(items, onItemClick);
              })()
            )
          ) : (
            <p className="no-resultados">{mensajeVacio}</p>
          )}
        </div>
      </div>
    </>
  );
});

export default ListaFosasCompleta;
