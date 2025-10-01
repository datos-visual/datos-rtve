/**
 * Hook para gestión de estado del buscador de fosas con filtrado, scroll infinito y paginación
 */
import { useState, useRef, useEffect, useCallback, useMemo } from "react";

// Configuración centralizada
const CONFIG = {
  ITEMS_PER_BATCH: 50,
  INITIAL_ITEMS: 50,
  DEBOUNCE_DELAY: 2000,
  LOAD_DELAY: 1000,
  DEFAULT_STATES: ["todos"],
};

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
  // busquedaInput: lo que el usuario está escribiendo ahora.
  // busquedaTexto: término de búsqueda aplicado (solo cambia al enviar el formulario)
  const [busquedaInput, setBusquedaInput] = useState("");
  const [busquedaTexto, setBusquedaTexto] = useState("");
  const [estadosSeleccionados, setEstadosSeleccionados] = useState(
    CONFIG.DEFAULT_STATES
  );
  const [statusPanelExpanded, setStatusPanelExpanded] = useState(true);

  // === SCROLL INFINITO CON PAGINACIÓN ===
  const [loadedItems, setLoadedItems] = useState(CONFIG.INITIAL_ITEMS);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // === REFS ===
  const mapaRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const loadingTriggerRef = useRef(null);
  const lastLoadTimeRef = useRef(0);
  const isLoadingRef = useRef(false);
  const loadAttemptRef = useRef(0);

  // === FUNCIONES AUXILIARES SIMPLIFICADAS ===
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

  // === FILTRADO SIMPLIFICADO ===
  const fosasFiltradas = useMemo(() => {
    if (estadosSeleccionados.includes("todos") && !busquedaTexto.trim())
      return fosas;

    return fosas.filter((fosa) => {
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
  }, [
    fosas,
    busquedaTexto,
    estadosSeleccionados,
    normalizeStatus,
    matchesSearchText,
  ]);

  // === ITEMS VISIBLES ===
  const fosasVisibles = useMemo(() => {
    return fosasFiltradas.slice(0, loadedItems);
  }, [fosasFiltradas, loadedItems]);

  // === INFORMACIÓN DE CARGA SIMPLIFICADA ===
  const loadingInfo = useMemo(() => {
    const totalItems = fosasFiltradas.length;
    const hasMore = loadedItems < totalItems;
    const itemsRemaining = Math.max(0, totalItems - loadedItems);
    const currentPage = Math.ceil(loadedItems / CONFIG.ITEMS_PER_BATCH);
    const totalPages = Math.ceil(totalItems / CONFIG.ITEMS_PER_BATCH);

    return {
      loadedItems,
      totalItems,
      hasMore,
      itemsRemaining,
      currentPage,
      totalPages,
      isComplete: !hasMore && totalItems > 0,
    };
  }, [loadedItems, fosasFiltradas.length]);

  // === HANDLERS SIMPLIFICADOS ===
  const resetScrollState = useCallback(() => {
    setLoadedItems(CONFIG.INITIAL_ITEMS);
    setIsLoadingMore(false);
    isLoadingRef.current = false;
    lastLoadTimeRef.current = 0;
    loadAttemptRef.current = 0;
  }, []);

  // Al cambiar el input NO aplicamos aún la búsqueda; solo actualizamos el valor del campo.
  const handleBusquedaChange = useCallback((e) => {
    setBusquedaInput(e.target.value);
  }, []);

  const handleFormSubmit = useCallback(
    (e) => {
      e.preventDefault();
      // Aplicar término escrito
      setBusquedaTexto(busquedaInput.trim());
      resetScrollState();
    },
    [busquedaInput, resetScrollState]
  );

  const handleToggleClick = useCallback(() => {
    setListaVisible((prev) => !prev);
    mapaRef.current?.map && setTimeout(() => mapaRef.current.map.resize(), 100);
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

  // === SCROLL INFINITO SIMPLIFICADO ===
  const loadMoreItems = useCallback(() => {
    if (isLoadingRef.current || loadedItems >= fosasFiltradas.length)
      return false;

    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimeRef.current;

    // Debounce: evitar cargas muy rápidas
    if (timeSinceLastLoad < CONFIG.DEBOUNCE_DELAY) return false;

    loadAttemptRef.current += 1;

    // Marcar como cargando
    isLoadingRef.current = true;
    lastLoadTimeRef.current = now;
    setIsLoadingMore(true);

    // Simular carga asíncrona
    setTimeout(() => {
      setLoadedItems((prev) => {
        const nuevoTotal = Math.min(
          prev + CONFIG.ITEMS_PER_BATCH,
          fosasFiltradas.length
        );

        // Marcar como terminado
        isLoadingRef.current = false;
        setIsLoadingMore(false);

        return nuevoTotal;
      });
    }, CONFIG.LOAD_DELAY);

    return true;
  }, [loadedItems, fosasFiltradas.length]);

  // Reset cuando cambien los filtros
  useEffect(() => {
    resetScrollState();
  }, [busquedaTexto, estadosSeleccionados, resetScrollState]);

  // Inicialización al cargar los datos
  useEffect(() => {
    if (fosas.length > 0 && !loading) {
      resetScrollState();
    }
  }, [fosas.length, loading, resetScrollState]);

  // === EFECTOS ===
  useEffect(() => {
    if (mapaRef.current?.setFilteredFosas) {
      mapaRef.current.setFilteredFosas(fosasFiltradas);
    }
  }, [fosasFiltradas]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // === FILTRADO POR UBICACIÓN SIMPLIFICADO ===
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

  // === FUNCIÓN DE ZOOM A ZONA BUSCADA ===
  const zoomAZonaBuscada = useCallback(() => {
    if (!mapaRef.current?.map || !busquedaTexto.trim() || !fosasFiltradas.length) return;

    // Filtrar fosas con coordenadas válidas
    const fosasConCoordenadas = fosasFiltradas.filter(
      (fosa) => fosa.lat && fosa.lon && 
      !isNaN(parseFloat(fosa.lat)) && !isNaN(parseFloat(fosa.lon))
    );

    if (fosasConCoordenadas.length === 0) return;

    const map = mapaRef.current.map;

    if (fosasConCoordenadas.length === 1) {
      // Una sola fosa: zoom a ella
      const fosa = fosasConCoordenadas[0];
      map.flyTo({
        center: [parseFloat(fosa.lon), parseFloat(fosa.lat)],
        zoom: 12,
        duration: 1500
      });
    } else {
      // Múltiples fosas: calcular bounds y ajustar vista
      const coords = fosasConCoordenadas.map(fosa => [
        parseFloat(fosa.lon), 
        parseFloat(fosa.lat)
      ]);

      // Calcular bounding box
      const lons = coords.map(coord => coord[0]);
      const lats = coords.map(coord => coord[1]);
      
      const minLon = Math.min(...lons);
      const maxLon = Math.max(...lons);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);

      // Crear bounds con un pequeño padding
      const bounds = [
        [minLon - 0.01, minLat - 0.01], // suroeste
        [maxLon + 0.01, maxLat + 0.01]  // noreste
      ];

      map.fitBounds(bounds, {
        padding: 50,
        duration: 1500,
        maxZoom: 14
      });
    }
  }, [busquedaTexto, fosasFiltradas]);

  // Efecto para hacer zoom cuando cambia la búsqueda aplicada
  useEffect(() => {
    if (busquedaTexto.trim()) {
      // Pequeño delay para asegurar que el mapa y las fosas estén actualizadas
      const timeoutId = setTimeout(() => {
        zoomAZonaBuscada();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [busquedaTexto, zoomAZonaBuscada]);

  // === RETURN ===
  return {
    // Estado
    loading,
    setLoading,
    selectedFosa,
    setSelectedFosa,
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

    // Handlers
    handleBusquedaChange,
    handleFormSubmit,
    handleToggleClick,
    handleFosaSelect,
    handleCloseFosa,
    handleEstadoChange,
    handleToggleStatusPanel,
    loadMoreItems,
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
    loadingInfo,
    isLoadingMore,
  };
}
