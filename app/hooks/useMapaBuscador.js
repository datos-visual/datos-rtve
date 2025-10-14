/**
 * Hook para gestión de estado del buscador de fosas
 * VERSIÓN SIMPLIFICADA - Sin scroll infinito, carga todo de una vez
 */
import { useState, useRef, useEffect, useCallback, useMemo } from "react";

// Mapeo de estados
const STATUS_MAPPING = {
  exhumados: "exhumada",
  "no-exhumados": "no exhumada",
  trasladada: "trasladada",
};

export function useMapaBuscador(fosas = [], isMobile = false) {
  // === ESTADO BÁSICO ===
  const [loading, setLoading] = useState(true);
  const [selectedFosa, setSelectedFosa] = useState(null);
  const [error, setError] = useState(null);
  // El panel debe estar oculto por defecto en la primera carga
  const [listaVisible, setListaVisible] = useState(false);
  const [busquedaInput, setBusquedaInput] = useState("");
  const [busquedaTexto, setBusquedaTexto] = useState("");
  const [estadosSeleccionados, setEstadosSeleccionados] = useState(["todos"]);
  const [statusPanelExpanded, setStatusPanelExpanded] = useState(true);

  // === DESTACADOS ===
  const [fosasConDestacado, setFosasConDestacado] = useState({});
  const [cargandoDestacados, setCargandoDestacados] = useState(false);

  // === REFS ===
  const mapaRef = useRef(null);

  // Índice de orden original para mantener la posición relativa del resto
  const ordenOriginal = useMemo(() => {
    const indexById = new Map();
    fosas.forEach((fosa, index) => {
      // Usar id como clave estable
      indexById.set(fosa?.id, index);
    });
    return indexById;
  }, [fosas]);

  // === FUNCIONES AUXILIARES ===
  const normalizeStatus = useCallback((status) => {
    const s = String(status || "")
      .toLowerCase()
      .trim();
    if (!s) return "";
    if (s.includes("trasladad") || s.includes("cuelgamuros"))
      return "trasladada";
    if (s.replaceAll(" ", "").startsWith("noexhumad")) return "no exhumada";
    if (s.includes("exhumad")) return "exhumada";
    return s;
  }, []);

  const matchesSearchText = useCallback((fosa, busqueda) => {
    const campos = [
      fosa.title,
      fosa.municipio,
      fosa.provincia,
      fosa.ccaa,
      fosa.ccaa_seo,
      fosa.municipio_seo,
      fosa.provincia_seo,
      fosa.codigo_postal,
    ];
    return campos
      .filter(Boolean)
      .some((campo) => String(campo).toLowerCase().includes(busqueda));
  }, []);

  // === FILTRADO Y ORDENAMIENTO ===
  const fosasFiltradas = useMemo(() => {
    let filtradas = [];
    
    if (estadosSeleccionados.includes("todos") && !busquedaTexto.trim()) {
      filtradas = fosas;
    } else {
      filtradas = fosas.filter((fosa) => {
        // Filtros de estado
        if (!estadosSeleccionados.includes("todos")) {
          const estadoNormalizado = normalizeStatus(fosa.status);
          const estadosDeseados = estadosSeleccionados.map(
            (sel) => STATUS_MAPPING[sel] || sel
          );
          if (!estadosDeseados.includes(estadoNormalizado)) return false;
        }

        // Filtro de texto
        const busqueda = busquedaTexto.trim().toLowerCase();
        return !busqueda || matchesSearchText(fosa, busqueda);
      });
    }

    // ORDENAR: Destacados primero (con fallback provisional), el resto mantiene su orden original
    return filtradas.sort((a, b) => {
      const aHasLn = !!(a?.linea_narrativa && String(a.linea_narrativa).toLowerCase() !== "null");
      const bHasLn = !!(b?.linea_narrativa && String(b.linea_narrativa).toLowerCase() !== "null");

      const aScore = fosasConDestacado[a?.id]
        ? 2
        : (a?.section_id || a?.isInDedalo || aHasLn ? 1 : 0);
      const bScore = fosasConDestacado[b?.id]
        ? 2
        : (b?.section_id || b?.isInDedalo || bHasLn ? 1 : 0);
      if (aScore !== bScore) return bScore - aScore;

      // Desempatar con el orden original para no alterar la lista existente
      const ia = ordenOriginal.get(a?.id) ?? 0;
      const ib = ordenOriginal.get(b?.id) ?? 0;
      return ia - ib;
    });
  }, [
    fosas,
    busquedaTexto,
    estadosSeleccionados,
    normalizeStatus,
    matchesSearchText,
    fosasConDestacado,
    ordenOriginal,
  ]);

  // === TODAS LAS FOSAS VISIBLES ===
  // Para primera carga y consistencia con lista-narrativas, exponer el array completo ya ordenado
  const fosasVisibles = fosasFiltradas;

  // === CARGAR DESTACADOS EN BACKGROUND ===
  useEffect(() => {
    const cargarDestacados = async () => {
      if (fosas.length === 0 || cargandoDestacados) return;

      setCargandoDestacados(true);

      // Filtrar fosas con potencial de tener destacados
      const fosasConPotencial = fosas.filter(f => f.section_id || f.isInDedalo);
      
      if (fosasConPotencial.length === 0) {
        setCargandoDestacados(false);
        return;
      }

      // Cargar en lotes de 20
      const BATCH_SIZE = 20;
      const imagenesDestacadas = {};
      
      for (let i = 0; i < fosasConPotencial.length; i += BATCH_SIZE) {
        const lote = fosasConPotencial.slice(i, i + BATCH_SIZE);
        
        await Promise.all(
          lote.map(async (fosa) => {
            try {
              const id = fosa.id_datos || fosa.id;
              const idFormateado = String(id).padStart(5, '0');
              
              const response = await fetch(
                `https://www.rtve.es/datos-repo/test-fosas/v3/fichas/${idFormateado}.json`
              );
              
              if (response.ok) {
                const data = await response.json();
                const contenidos = data.contenidos || [];
                const destacado = contenidos.find(c => c.destacado === true);
                
                if (destacado) {
                  const { tipo, id: contentId, url } = destacado;
                  let thumbnail = null;
                  
                  if (tipo === "video") {
                    thumbnail = `https://img.rtve.es/v/${contentId}?w=400`;
                  } else if (tipo === "audio") {
                    thumbnail = `https://img.rtve.es/a/${contentId}?w=400`;
                  } else if (tipo === "foto") {
                    thumbnail = url;
                  }
                  
                  if (thumbnail) {
                    imagenesDestacadas[fosa.id] = thumbnail;
                  }
                }
              }
            } catch (error) {
              // Silenciar errores individuales
            }
          })
        );
        
        // Actualizar progresivamente cada 5 lotes (100 fosas)
        if ((i / BATCH_SIZE) % 5 === 4) {
          setFosasConDestacado(prev => ({ ...prev, ...imagenesDestacadas }));
        }
      }
      
      // Actualización final
      setFosasConDestacado(prev => ({ ...prev, ...imagenesDestacadas }));
      setCargandoDestacados(false);
    };

    cargarDestacados();
  }, [fosas]);

  // === HANDLERS ===
  const handleBusquedaChange = useCallback((e) => {
    setBusquedaInput(e.target.value);
  }, []);

  const handleFormSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setBusquedaTexto(busquedaInput.trim());
      // Abrir el panel de resultados si hay búsqueda y está cerrado
      if (busquedaInput.trim() && !listaVisible) {
        setListaVisible(true);
      }
    },
    [busquedaInput, listaVisible]
  );

  const handleToggleClick = useCallback(() => {
    // Guardar posición actual del mapa (como en infografiasRTVE)
    let posicionActual = null;
    if (mapaRef.current?.map) {
      try {
        posicionActual = {
          center: mapaRef.current.map.getCenter(),
          zoom: mapaRef.current.map.getZoom(),
        };
      } catch (error) {
        // Error al guardar posición
      }
    }

    // Cambiar estado
    setListaVisible((prev) => !prev);

    // Forzar resize del mapa (exactamente como en infografiasRTVE)
    if (mapaRef.current?.map) {
      try {
        // Resize inmediato
        mapaRef.current.map.resize();
        
        // Segundo resize después de 50ms
        setTimeout(() => {
          if (mapaRef.current?.map) {
            mapaRef.current.map.resize();
          }
        }, 50);
        
        // Tercer resize después de 100ms + restaurar posición
        setTimeout(() => {
          if (mapaRef.current?.map) {
            mapaRef.current.map.resize();
            if (posicionActual) {
              mapaRef.current.map.setCenter(posicionActual.center);
              mapaRef.current.map.setZoom(posicionActual.zoom);
            }
          }
        }, 100);
        
      } catch (error) {
        console.warn("Error al redimensionar el mapa:", error);
      }
    }
  }, []);

  const handleFosaSelect = useCallback((fosa) => {
    setSelectedFosa(fosa);
    mapaRef.current?.focusFosa?.(fosa.id);
  }, []);

  const handleCloseFosa = useCallback(() => setSelectedFosa(null), []);
  
  const handleToggleStatusPanel = useCallback(
    () => setStatusPanelExpanded((prev) => !prev),
    []
  );

  const handleEstadoChange = useCallback((estado) => {
    // Solo permitir un filtro activo a la vez
    // Si ya está seleccionado, no hacer nada (siempre debe haber uno activo)
    setEstadosSeleccionados((prev) => {
      // Si intenta clickear el que ya está activo, no hacer nada
      if (prev.includes(estado)) {
        return prev;
      }
      // Cambiar al nuevo estado seleccionado (solo uno a la vez)
      return [estado];
    });
  }, []);

  // === EFECTOS ===
  
  // Redimensionar mapa cuando cambie la visibilidad del panel
  useEffect(() => {
    if (!mapaRef.current?.map) return;

    // Esperar a que el DOM se actualice con la nueva clase CSS
    const resizeMap = () => {
      try {
        // Primera pasada de resize (inmediata)
        mapaRef.current.map.resize();
        
        // Segunda pasada durante la transición CSS (150ms de 300ms)
        setTimeout(() => {
          if (mapaRef.current?.map) {
            mapaRef.current.map.resize();
          }
        }, 150);

        // Tercera pasada después de completar la transición CSS (300ms + margen)
        setTimeout(() => {
          if (mapaRef.current?.map) {
            mapaRef.current.map.resize();
          }
        }, 350);

        // Cuarta pasada para asegurar (por si hay reflows lentos)
        setTimeout(() => {
          if (mapaRef.current?.map) {
            mapaRef.current.map.resize();
          }
        }, 500);
      } catch (error) {
        console.warn("Error al redimensionar el mapa:", error);
      }
    };

    // Usar requestAnimationFrame para asegurar que el DOM se haya actualizado
    requestAnimationFrame(() => {
      requestAnimationFrame(resizeMap);
    });
  }, [listaVisible]); // Se ejecuta cada vez que cambia listaVisible

  useEffect(() => {
    if (mapaRef.current?.setFilteredFosas) {
      mapaRef.current.setFilteredFosas(fosasFiltradas);
    }
  }, [fosasFiltradas]);

  // === FILTRADO POR UBICACIÓN ===
  const aplicarFiltroUbicacion = useCallback(
    (fosasData, ccaa, provincia, municipio, fosaProp) => {
      if (!fosasData.length) return [];

      const normalizar = (str) =>
        (str || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]/g, "")
          .trim();

      return fosasData.filter((fosa) => {
        const checks = [
          [ccaa, fosa.ccaa_seo || fosa.ccaa],
          [provincia, fosa.provincia_seo || fosa.provincia],
          [municipio, fosa.municipio_seo || fosa.municipio],
          [fosaProp, fosa.title_seo || fosa.title],
        ];

        return checks.every(
          ([filtro, valor]) =>
            !filtro || normalizar(valor).includes(normalizar(filtro))
        );
      });
    },
    []
  );

  // === ZOOM A ZONA BUSCADA ===
  const zoomAZonaBuscada = useCallback(() => {
    if (!mapaRef.current?.map || !busquedaTexto.trim() || !fosasFiltradas.length) return;

    const fosaConCoordenadas = fosasFiltradas.find((f) => f.lat && f.lon);
    if (fosaConCoordenadas) {
      mapaRef.current.map.flyTo({
        center: [fosaConCoordenadas.lon, fosaConCoordenadas.lat],
        zoom: 12,
      });
    }
  }, [busquedaTexto, fosasFiltradas]);

  return {
    // Estado
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

    // Handlers
    handleBusquedaChange,
    handleFormSubmit,
    handleToggleClick,
    handleFosaSelect,
    handleCloseFosa,
    handleEstadoChange,
    handleToggleStatusPanel,
    setBusquedaTexto,
    setBusquedaInput,

    // Utilidades
    aplicarFiltroUbicacion,
    zoomAZonaBuscada,
    totalFosas: fosas.length,
    totalFiltradas: fosasFiltradas.length,
    hayFiltrosActivos:
      (estadosSeleccionados.length > 0 &&
        !estadosSeleccionados.includes("todos")) ||
      busquedaTexto.trim(),
    
    // Destacados
    fosasConDestacado,
    cargandoDestacados,
  };
}
