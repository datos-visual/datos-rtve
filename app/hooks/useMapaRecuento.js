/**
 * Hook para calcular fosas visibles en el viewport del mapa
 * Basado en la funcionalidad del proyecto infografiasRTVE-mapa-fosas
 */
import { useState, useEffect, useCallback } from "react";

export function useMapaRecuento(
  map,
  fosasFiltradas,
  onFosasVisiblesChange = null
) {
  const [fosasVisibles, setFosasVisibles] = useState([]);

  // Función para actualizar el recuento de fosas visibles
  const actualizarRecuento = useCallback(() => {
    if (!map || !fosasFiltradas.length) {
      setFosasVisibles([]);
      return;
    }

    const bounds = map.getBounds();

    // Solo fosas dentro del viewport
    const visibles = fosasFiltradas.filter((f) => {
      return (
        f.lat >= bounds.getSouth() &&
        f.lat <= bounds.getNorth() &&
        f.lon >= bounds.getWest() &&
        f.lon <= bounds.getEast()
      );
    });

    setFosasVisibles(visibles);

    // Notificar cambios a componente padre si hay callback
    if (onFosasVisiblesChange && typeof onFosasVisiblesChange === "function") {
      onFosasVisiblesChange(visibles);
    }
  }, [map, fosasFiltradas, onFosasVisiblesChange]);

  // Event listeners del mapa
  useEffect(() => {
    if (!map) return;

    const handleMapEvents = () => {
      actualizarRecuento();
    };

    map.on("moveend", handleMapEvents);
    map.on("zoomend", handleMapEvents);
    map.on("resize", handleMapEvents);

    // Actualizar después del primer render
    map.once("idle", actualizarRecuento);

    return () => {
      map.off("moveend", handleMapEvents);
      map.off("zoomend", handleMapEvents);
      map.off("resize", handleMapEvents);
    };
  }, [map, actualizarRecuento, onFosasVisiblesChange]);

  // Actualizar cuando cambien las fosas filtradas
  useEffect(() => {
    actualizarRecuento();
  }, [actualizarRecuento]);

  return {
    fosasVisibles,
    actualizarRecuento,
  };
}
