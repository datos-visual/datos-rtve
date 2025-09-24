/**
 * Hook simplificado para MapaBuscadorFosas - Scroll infinito limpio
 */
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

export function useMapaBuscador(fosas = [], isMobile = false) {
  // === ESTADO BÁSICO ===
  const [loading, setLoading] = useState(true);
  const [selectedFosa, setSelectedFosa] = useState(null);
  const [error, setError] = useState(null);
  const [listaVisible, setListaVisible] = useState(false);
  const [busquedaTexto, setBusquedaTexto] = useState("");
  const [estadosSeleccionados, setEstadosSeleccionados] = useState(["todos"]);
  const [statusPanelExpanded, setStatusPanelExpanded] = useState(true);

  
  // === SCROLL INFINITO CON PAGINACIÓN DE 50 ===
  const [loadedItems, setLoadedItems] = useState(50);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const ITEMS_PER_BATCH = 50; // Cargar de 50 en 50 tanto móvil como desktop
  const INITIAL_ITEMS = 50;

  // === REFS ===
  const mapaRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const loadingTriggerRef = useRef(null);
  const lastLoadTimeRef = useRef(0);
  const isLoadingRef = useRef(false);
  const loadAttemptRef = useRef(0);

  // === FUNCIONES AUXILIARES ===
  const normalizeStatus = useCallback((status) => {
    const s = String(status || "").toLowerCase().trim();
    if (!s) return "";
    if (s.includes("trasladad") || s.includes("cuelgamuros")) return "trasladada";
    if (s.replaceAll(" ", "").startsWith("noexhumad")) return "no exhumada";
    if (s.includes("exhumad")) return "exhumada";
    return s;
  }, []);

  const matchesSearchText = useCallback((fosa, busqueda) => {
    const campos = [fosa.title, fosa.municipio, fosa.provincia, fosa.ccaa, fosa.ccaa_seo, fosa.municipio_seo, fosa.provincia_seo, fosa.codigo_postal];
    return campos.filter(Boolean).some((campo) => String(campo).toLowerCase().includes(busqueda));
  }, []);

  // === FILTRADO ===
  const fosasFiltradas = useMemo(() => {
    // Sin filtros activos
    if (estadosSeleccionados.includes("todos") && !busquedaTexto.trim()) {
      return fosas;
    }

    return fosas.filter((fosa) => {
      // Filtros de estado
      if (!estadosSeleccionados.includes("todos")) {
        const estadoNormalizado = normalizeStatus(fosa.status);
        const estadosDeseados = estadosSeleccionados.map((sel) => {
          switch (sel) {
            case "exhumados": return "exhumada";
            case "no-exhumados": return "no exhumada";
            case "trasladada": return "trasladada";
            default: return sel;
          }
        });
        if (!estadosDeseados.includes(estadoNormalizado)) return false;
      }

      // Filtro de texto
      const busqueda = busquedaTexto.trim().toLowerCase();
      if (busqueda && !matchesSearchText(fosa, busqueda)) return false;

      return true;
    });
  }, [fosas, busquedaTexto, estadosSeleccionados, normalizeStatus, matchesSearchText]);

  // === ITEMS VISIBLES ===
  const fosasVisibles = useMemo(() => {
    return fosasFiltradas.slice(0, loadedItems);
  }, [fosasFiltradas, loadedItems]);

  // === INFORMACIÓN DE CARGA ===
  const loadingInfo = useMemo(() => {
    const totalItems = fosasFiltradas.length;
    const hasMore = loadedItems < totalItems;
    const itemsRemaining = Math.max(0, totalItems - loadedItems);
    const currentPage = Math.ceil(loadedItems / ITEMS_PER_BATCH);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_BATCH);
    
    return {
      loadedItems,
      totalItems,
      hasMore,
      itemsRemaining,
      currentPage,
      totalPages,
      isComplete: !hasMore && totalItems > 0
    };
  }, [loadedItems, fosasFiltradas.length, ITEMS_PER_BATCH]);

  // === HANDLERS SIMPLES ===
  const handleBusquedaChange = useCallback((e) => {
    const value = e.target.value;
    
    setBusquedaTexto(value);
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Resetear items cargados cuando se busca
    setLoadedItems(INITIAL_ITEMS);
    setIsLoadingMore(false);
    isLoadingRef.current = false;
    lastLoadTimeRef.current = 0;
    loadAttemptRef.current = 0;
  }, [INITIAL_ITEMS]);

  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    const input = e.target.querySelector('input[name="busqueda"]');
    if (input) {
      const value = input.value;
      setBusquedaTexto(value);
      
      // Resetear items cargados
      setLoadedItems(INITIAL_ITEMS);
      setIsLoadingMore(false);
      isLoadingRef.current = false;
      lastLoadTimeRef.current = 0;
      loadAttemptRef.current = 0;
    }
  }, [INITIAL_ITEMS]);

  const handleToggleClick = useCallback(() => {
    setListaVisible((prev) => !prev);
    if (mapaRef.current?.map) {
      setTimeout(() => mapaRef.current.map.resize(), 100);
    }
  }, []);

  const handleFosaSelect = useCallback((fosa) => {
    setSelectedFosa(fosa);
    if (mapaRef.current?.focusFosa) {
      mapaRef.current.focusFosa(fosa.id);
    }
  }, []);

  const handleCloseFosa = useCallback(() => {
    setSelectedFosa(null);
  }, []);

  const handleEstadoChange = useCallback((estado) => {
    setEstadosSeleccionados((prev) => {
      if (estado === "todos") return ["todos"];
      const nuevos = prev.filter((e) => e !== "todos");
      if (nuevos.includes(estado)) {
        return nuevos.filter((e) => e !== estado);
      } else {
        return [...nuevos, estado];
      }
    });
  }, []);

  const handleToggleStatusPanel = useCallback(() => {
    setStatusPanelExpanded((prev) => !prev);
  }, []);

  // === SCROLL INFINITO ===
  const loadMoreItems = useCallback(() => {
    if (isLoadingRef.current || loadedItems >= fosasFiltradas.length) {
      return false;
    }
    
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimeRef.current;
    
    // Debounce: evitar cargas muy rápidas
    if (timeSinceLastLoad < 2000) {
      return false;
    }
    
    loadAttemptRef.current += 1;
    
    // Marcar como cargando
    isLoadingRef.current = true;
    lastLoadTimeRef.current = now;
    setIsLoadingMore(true);
    
    // Simular carga asíncrona
    setTimeout(() => {
      setLoadedItems(prev => {
        const nuevoTotal = Math.min(prev + ITEMS_PER_BATCH, fosasFiltradas.length);
        
        // Marcar como terminado
        isLoadingRef.current = false;
        setIsLoadingMore(false);
        
        return nuevoTotal;
      });
    }, 1000);
    
    return true;
  }, [loadedItems, fosasFiltradas.length, ITEMS_PER_BATCH]);

  // Reset cuando cambien los filtros
  useEffect(() => {
    setLoadedItems(INITIAL_ITEMS);
    setIsLoadingMore(false);
    isLoadingRef.current = false;
    lastLoadTimeRef.current = 0;
    loadAttemptRef.current = 0;
  }, [busquedaTexto, estadosSeleccionados, INITIAL_ITEMS]);

  // Inicialización al cargar los datos
  useEffect(() => {
    if (fosas.length > 0 && !loading) {
      setLoadedItems(INITIAL_ITEMS);
      setIsLoadingMore(false);
      isLoadingRef.current = false;
      lastLoadTimeRef.current = 0;
      loadAttemptRef.current = 0;
    }
  }, [fosas.length, loading, INITIAL_ITEMS]);

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

  // === FILTRADO POR UBICACIÓN ===
  const aplicarFiltroUbicacion = useCallback((fosasData, ccaa, provincia, municipio, fosaProp) => {
    if (!fosasData.length) return [];

    const normalizar = (str) => (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim();

    return fosasData.filter((fosa) => {
      if (ccaa && !normalizar(fosa.ccaa_seo || fosa.ccaa).includes(normalizar(ccaa))) return false;
      if (provincia && !normalizar(fosa.provincia_seo || fosa.provincia).includes(normalizar(provincia))) return false;
      if (municipio && !normalizar(fosa.municipio_seo || fosa.municipio).includes(normalizar(municipio))) return false;
      if (fosaProp && !normalizar(fosa.title_seo || fosa.title).includes(normalizar(fosaProp))) return false;
      return true;
    });
  }, []);

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
    
    // Utilidades
    aplicarFiltroUbicacion,
    totalFosas: fosas.length,
    totalFiltradas: fosasFiltradas.length,
    hayFiltrosActivos: estadosSeleccionados.length > 0 && !estadosSeleccionados.includes('todos') || busquedaTexto.trim(),
    loadingInfo,
    isLoadingMore
  };
}