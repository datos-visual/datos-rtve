/**
 * Hook para manejar el contador de fosas visibles y la lista lateral
 * Basado en la funcionalidad del proyecto infografiasRTVE-mapa-fosas
 */
import { useState, useEffect, useCallback, useRef } from "react";

export function useMapaRecuento(
  map,
  fosasFiltradas,
  onFosasVisiblesChange = null
) {
  const [fosasVisibles, setFosasVisibles] = useState([]);
  const [contadorVisible, setContadorVisible] = useState(false);
  const contadorRef = useRef(null);
  const listaRef = useRef(null);
  const ulRef = useRef(null);

  // Función para actualizar el recuento de fosas visibles
  const actualizarRecuento = useCallback(() => {
    if (!map || !fosasFiltradas.length) {
      setFosasVisibles([]);
      setContadorVisible(false);
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
    setContadorVisible(true);

    // Notificar cambios a componente padre si hay callback
    if (onFosasVisiblesChange && typeof onFosasVisiblesChange === "function") {
      onFosasVisiblesChange(visibles);
    }

    // Actualizar contador en DOM
    if (contadorRef.current) {
      contadorRef.current.textContent = `Fosas visibles: ${visibles.length}`;
    }

    // Actualizar lista lateral
    if (ulRef.current) {
      if (visibles.length === 0) {
        if (listaRef.current) {
          listaRef.current.hidden = true;
        }
        return;
      }

      const datosOrdenados = visibles
        .slice()
        .sort((a, b) => (a.title || "").localeCompare(b.title || ""));

      ulRef.current.innerHTML = ""; // limpia

      datosOrdenados.forEach((f) => {
        const li = document.createElement("li");
        li.textContent = `${f.title || "(Sin título)"}`;
        li.dataset.id = f.id;

        // Click: igual que un punto
        li.onclick = () => {
          const [lon, lat] = [f.lon, f.lat];
          li.scrollIntoView({ behavior: "smooth", block: "center" });

          map.flyTo({ center: [lon, lat], zoom: 14 });
          map.once("moveend", () => {
            map.fire("openficha", {
              id: f.id,
              lat,
              lon,
              title: f.title,
              municipio: f.municipio,
              provincia: f.provincia,
              url_ficha: f.url_ficha,
            });
          });
        };

        // Hover: resalta punto y entrada
        li.onmouseenter = () => {
          map.setFilter("fosaHighlight", ["==", "id", f.id]);
          document
            .querySelectorAll(".fosas-laterales li")
            .forEach((el) => el.classList.remove("highlight"));
          li.classList.add("highlight");
        };

        li.onmouseleave = () => {
          map.setFilter("fosaHighlight", ["==", "id", ""]);
          li.classList.remove("highlight");
        };

        ulRef.current.appendChild(li);
      });

      if (listaRef.current) {
        listaRef.current.hidden = false;
      }
    }
  }, [map, fosasFiltradas]);

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
    contadorVisible,
    contadorRef,
    listaRef,
    ulRef,
    actualizarRecuento,
  };
}
