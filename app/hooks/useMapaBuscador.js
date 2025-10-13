/**
 * Hook para gestión de estado del buscador de fosas
 * VERSIÓN SIMPLIFICADA - Sin scroll infinito, carga todo de una vez
 */
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { getFosasData } from "../services/fosasService";

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

      try {
        // Usar el servicio centralizado para obtener todos los datos de una vez
        const { imagenesDestacadas } = await getFosasData(fosas);
        
        // Actualizar estado con todas las imágenes destacadas
        setFosasConDestacado(imagenesDestacadas || {});
      } catch (error) {
        console.warn('Error al cargar destacados:', error);
        setFosasConDestacado({});
      } finally {
        setCargandoDestacados(false);
      }
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
    },
    [busquedaInput]
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
    setEstadosSeleccionados((prev) => {
      if (estado === "todos") return ["todos"];
      const nuevos = prev.filter((e) => e !== "todos");
      return nuevos.includes(estado)
        ? nuevos.filter((e) => e !== estado)
        : [...nuevos, estado];
    });
  }, []);

  // === EFECTOS ===
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
