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

    // ORDENAR: Fosas con destacado primero
    return filtradas.sort((a, b) => {
      const aHasDestacado = fosasConDestacado[a.id] ? 1 : 0;
      const bHasDestacado = fosasConDestacado[b.id] ? 1 : 0;
      return bHasDestacado - aHasDestacado;
    });
  }, [
    fosas,
    busquedaTexto,
    estadosSeleccionados,
    normalizeStatus,
    matchesSearchText,
    fosasConDestacado,
  ]);

  // === TODAS LAS FOSAS VISIBLES (SIN PAGINACIÓN) ===
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
                `https://www.rtve.es/datos-repo/test-fosas/v2/fichas/${idFormateado}.json`
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
    },
    [busquedaInput]
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
