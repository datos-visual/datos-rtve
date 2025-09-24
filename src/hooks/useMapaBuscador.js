/**
 * Hook optimizado para MapaBuscadorFosas - Versión minimalista
 * Solo lo esencial para máximo rendimiento
 */
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

export function useMapaBuscador(fosas = [], isMobile = false) {
  // === ESTADO MÍNIMO ===
  const [loading, setLoading] = useState(true);
  const [selectedFosa, setSelectedFosa] = useState(null);
  const [error, setError] = useState(null);
  const [listaVisible, setListaVisible] = useState(false);
  const [busquedaTexto, setBusquedaTexto] = useState("");
  const [estadosSeleccionados, setEstadosSeleccionados] = useState(["todos"]);
  const [statusPanelExpanded, setStatusPanelExpanded] = useState(true);
  
  // === PAGINACIÓN PARA RENDIMIENTO ===
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50; // Elementos por página

  // === REFS MÍNIMOS ===
  const mapaRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // === FUNCIONES AUXILIARES OPTIMIZADAS ===
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

  // === FILTRADO ULTRA-OPTIMIZADO ===
  const fosasFiltradas = useMemo(() => {
    // Si no hay filtros activos, devolver todas las fosas
    if (estadosSeleccionados.includes("todos") && !busquedaTexto.trim()) {
      return fosas;
    }

    return fosas.filter((fosa) => {
      // Filtros de estado (solo si no es "todos")
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

      // Filtro de texto (solo si hay búsqueda)
      const busqueda = busquedaTexto.trim().toLowerCase();
      if (busqueda && !matchesSearchText(fosa, busqueda)) return false;

      return true;
    });
  }, [fosas, busquedaTexto, estadosSeleccionados, normalizeStatus, matchesSearchText]);

  // === PAGINACIÓN DE FOSAS FILTRADAS ===
  const fosasPaginadas = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return fosasFiltradas.slice(startIndex, endIndex);
  }, [fosasFiltradas, currentPage, ITEMS_PER_PAGE]);

  // === INFORMACIÓN DE PAGINACIÓN ===
  const paginationInfo = useMemo(() => {
    const totalPages = Math.ceil(fosasFiltradas.length / ITEMS_PER_PAGE);
    const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, fosasFiltradas.length);
    
    return {
      currentPage,
      totalPages,
      startItem,
      endItem,
      totalItems: fosasFiltradas.length,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [currentPage, fosasFiltradas.length, ITEMS_PER_PAGE]);

  // === HANDLERS OPTIMIZADOS ===
  const handleBusquedaChange = useCallback((e) => {
    const value = e.target.value;
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => setBusquedaTexto(value), 150);
  }, []);

  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    const input = e.target.querySelector('input[name="busqueda"]');
    if (input) setBusquedaTexto(input.value);
  }, []);

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
    
    // Resetear zoom del mapa a la vista inicial usando el método específico
    if (mapaRef.current && mapaRef.current.resetZoom) {
      mapaRef.current.resetZoom();
    }
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

  // === HANDLERS DE PAGINACIÓN ===
  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(fosasFiltradas.length / ITEMS_PER_PAGE)));
  }, [fosasFiltradas.length, ITEMS_PER_PAGE]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleGoToPage = useCallback((page) => {
    const totalPages = Math.ceil(fosasFiltradas.length / ITEMS_PER_PAGE);
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [fosasFiltradas.length, ITEMS_PER_PAGE]);

  // Reset página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [busquedaTexto, estadosSeleccionados]);

  // === FUNCIÓN DE FILTRADO POR UBICACIÓN SIMPLIFICADA ===
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

  // === EFECTOS ===
  // Actualizar mapa cuando cambien las fosas filtradas
  useEffect(() => {
    if (mapaRef.current?.setFilteredFosas) {
      mapaRef.current.setFilteredFosas(fosasFiltradas);
    }
  }, [fosasFiltradas]);

  // Cleanup del debounce
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // === RETURN DEL HOOK ===
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
    fosasPaginadas, // Fosas paginadas para renderizado
    
    // Refs
    mapaRef,
    
    // Handlers
    handleBusquedaChange,
    handleFormSubmit,
    handleToggleClick,
    handleFosaSelect,
    handleCloseFosa,
    handleEstadoChange,
    handleToggleStatusPanel,
    
    // Handlers de paginación
    handleNextPage,
    handlePrevPage,
    handleGoToPage,
    
    // Utilidades
    aplicarFiltroUbicacion,
    totalFosas: fosas.length,
    totalFiltradas: fosasFiltradas.length,
    hayFiltrosActivos: estadosSeleccionados.length > 0 && !estadosSeleccionados.includes('todos') || busquedaTexto.trim(),
    
    // Información de paginación
    paginationInfo
  };
}