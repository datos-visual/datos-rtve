"use client";

import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import mapboxgl from "mapbox-gl";
import { createMap, createGeocoder } from "./js/initMap.js";
import { cargarFosas } from "./js/datos.js";
import { montarCapaFosas, actualizarDatosFosas } from "./js/layers.js";
import { abrirFicha } from "./js/overlay.js";
import { getParam, normId } from "./js/utils.js";
import { MAPBOX_TOKEN } from "./js/config.js";
import "./css/estilos.css";

// Normalizar nombres para la URL
const slugify = (str) =>
  (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const MapaFosas = forwardRef(
  (
    {
      categoria: initialCategoria = "todas",
      soloNarrativas = false,
      sinGeocoder = true,
      onFosaSelect,
      fosasFiltradas,
    },
    ref
  ) => {
    const mapContainer = useRef(null);
    const [map, setMap] = useState(null);
    const [fosas, setFosas] = useState([]);
    const [allFosas, setAllFosas] = useState([]);
    const [capaMontada, setCapaMontada] = useState(false);
    const [pendingSubset, setPendingSubset] = useState(null);

  // Exponer métodos para el componente padre
  useImperativeHandle(ref, () => ({
    setFilteredFosas: (fosasSubset) => {
      if (!map || !map.isStyleLoaded()) {
        setPendingSubset(fosasSubset);
        return;
      }
      const newFosas = Array.isArray(fosasSubset) ? fosasSubset : [];
      setFosas(newFosas);
    },
    filtrarPorCategoria: (cat) => {
      if (cat === "todas") {
        setFosas(allFosas);
      } else {
        const filtradas = allFosas.filter((f) =>
          f.linea_narrativa?.toLowerCase().includes(cat.toLowerCase())
        );
        setFosas(filtradas);
      }
    },
    localGeocoder: (q) => {
      const txt = q.toLowerCase();
      return fosas
        .filter(
          (f) =>
            (f.id || "").toLowerCase().includes(txt) ||
            (f.title || "").toLowerCase().includes(txt) ||
            (f.municipio || "").toLowerCase().includes(txt)
        )
        .slice(0, 10)
        .map((f) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [f.lon || 0, f.lat || 0] },
          place_name: `Fosa: ${f.title || f.id} — ${f.municipio}`,
          place_type: ["fosa"],
          center: [f.lon || 0, f.lat || 0],
          properties: { id: f.id },
        }));
    },
    focusFosa: (fosaId) => {
      if (!map) return;
      
      const fosa = fosas.find(f => f.id === fosaId);
      if (fosa && fosa.lon && fosa.lat) {
        map.flyTo({
          center: [fosa.lon, fosa.lat],
          zoom: 15
        });
      }
    },
    map: map, // Exponer la instancia del mapa directamente
  }), [map, fosas, allFosas]);

    // Cargar fosas y crear mapa
    useEffect(() => {
      if (!mapContainer.current) return;

      mapboxgl.accessToken = MAPBOX_TOKEN;
      const mapa = createMap(mapContainer.current);
      setMap(mapa);

      let mounted = true;

      cargarFosas()
        .then((data) => {
          if (!mounted) return;
          let fosasData = Array.isArray(data) ? data : [];
          if (soloNarrativas) {
            fosasData = fosasData.filter(
              (f) =>
                f.linea_narrativa && f.linea_narrativa.toLowerCase() !== "null"
            );
          }
          setAllFosas(fosasData);
          setFosas(fosasData);
        })
        .catch((err) => console.error("Error al cargar fosas:", err));

      return () => {
        mounted = false;
        if (mapa) mapa.remove();
      };
    }, [soloNarrativas]);

    // Actualizar fosas cuando cambie fosasFiltradas
    useEffect(() => {
      if (fosasFiltradas && Array.isArray(fosasFiltradas)) {
        setFosas(fosasFiltradas);
      }
    }, [fosasFiltradas]);

    // Manejar subconjunto pendiente
    useEffect(() => {
      if (!map || !map.isStyleLoaded() || !pendingSubset) return;
      const subset = pendingSubset;
      setPendingSubset(null);
      const newFosas = Array.isArray(subset) ? subset : [];
      setFosas(newFosas);
    }, [map, pendingSubset]);

    // Montar capa de fosas cuando cambie mapa o fosas
    useEffect(() => {
      if (!map) return;

      const conXY = fosas.filter((f) => f.lat && f.lon);

      // Verificar que el estilo del mapa esté cargado antes de añadir capas
      if (!map.isStyleLoaded()) {
        const handleStyleLoad = () => {
          if (!capaMontada) {
            montarCapaFosas(map, conXY, soloNarrativas);
            setCapaMontada(true);
          } else {
            actualizarDatosFosas(map, conXY);
          }
        };

        map.once("styledata", handleStyleLoad);
        return () => {
          map.off("styledata", handleStyleLoad);
        };
      } else {
        // El estilo ya está cargado
        if (!capaMontada) {
          montarCapaFosas(map, conXY, soloNarrativas);
          setCapaMontada(true);
        } else {
          actualizarDatosFosas(map, conXY);
        }
      }
    }, [map, fosas, soloNarrativas, capaMontada]);

    // Filtrar por categoría
    useEffect(() => {
      if (!allFosas.length) return;
      if (initialCategoria === "todas") {
        setFosas(allFosas);
      } else {
        const filtradas = allFosas.filter((f) =>
          f.linea_narrativa
            ?.toLowerCase()
            .includes(initialCategoria.toLowerCase())
        );
        setFosas(filtradas);
      }
    }, [initialCategoria, allFosas]);

    // Crear geocoder
    useEffect(() => {
      if (!map || sinGeocoder) return;
      createGeocoder(map, (q) => {
        const txt = q.toLowerCase();
        return fosas
          .filter(
            (f) =>
              (f.id || "").toLowerCase().includes(txt) ||
              (f.title || "").toLowerCase().includes(txt) ||
              (f.municipio || "").toLowerCase().includes(txt)
          )
          .slice(0, 10)
          .map((f) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [f.lon || 0, f.lat || 0] },
            place_name: `Fosa: ${f.title || f.id} — ${f.municipio}`,
            place_type: ["fosa"],
            center: [f.lon || 0, f.lat || 0],
            properties: { id: f.id },
          }));
      });
    }, [map, fosas, sinGeocoder]);

    // Geocoder fallback para casos sin coordenadas
    const geocodeFallback = (query, id) => {
      const geocoderUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?access_token=${MAPBOX_TOKEN}`;

      fetch(geocoderUrl)
        .then((res) => res.json())
        .then((data) => {
          if (data.features?.length > 0) {
            const [lon, lat] = data.features[0].center;
            map.flyTo({ center: [lon, lat], zoom: 12 });
            map.once("moveend", () => abrirFicha(id, lat, lon, 12));
          } else {
            alert("No se pudo localizar el municipio o código postal.");
          }
        })
        .catch((err) => {
          console.error("Error al geocodificar:", err);
          alert("Error en la geocodificación.");
        });
    };

    // Cargar ficha por URL al inicializar
    useEffect(() => {
      if (!map || fosas.length === 0) return;

      const idBuscado = normId(getParam("ficha"));
      if (!idBuscado) return;

      const f = fosas.find((x) => x.id === idBuscado);
      if (!f) {
        console.warn("ID no encontrado:", idBuscado);
        return;
      }

      if (Number.isFinite(f.lat) && Number.isFinite(f.lon)) {
        map.flyTo({ center: [f.lon, f.lat], zoom: 14 });
        map.once("moveend", () =>
          abrirFicha(f.id, f.lat, f.lon, 14, f.url_ficha)
        );
      } else {
        const query = [f.municipio, f.codigo_postal].filter(Boolean).join(" ");
        if (query) {
          geocodeFallback(query, f.id);
        } else {
          console.warn("Sin coordenadas ni datos para geocodificar:", f.id);
        }
      }
    }, [map, fosas]);

    // Clic en marcador (simula "openficha" custom event)
    useEffect(() => {
      if (!map) return;

      const handleOpenFicha = (e) => {
        const fosa = fosas.find((f) => f.id === normId(e.id));
        if (!fosa) return;

        // Actualiza la URL con /:ccaa/:prov/:mun/:fosa/ usando Next.js router
        const ccaa = slugify(fosa.ccaa_seo);
        const prov = slugify(fosa.provincia_seo);
        const mun = slugify(fosa.municipio_seo);
        const fosaSeo = slugify(fosa.title_seo);
        const nuevaUrl = `/${ccaa}/${prov}/${mun}/${fosaSeo}/`;
        
        // Usar window.history para actualizar URL sin recargar página
        window.history.pushState({}, "", nuevaUrl);

        // Actualiza el listadoSEO con la fosa seleccionada
        const listadoSEO = document.querySelector("listado-seo");
        if (listadoSEO) listadoSEO.seleccionada = fosa;

        // Si el padre quiere manejar la selección, notificamos y salimos
        if (typeof onFosaSelect === "function") {
          onFosaSelect(fosa);
          return;
        }

        // Comportamiento por defecto: overlay o popup interno
        if (fosa.url_ficha) {
          abrirFicha(normId(e.id), e.lat, e.lon, map.getZoom(), fosa.url_ficha);
        } else {
          new mapboxgl.Popup({ closeButton: true, offset: [0, -10] })
            .setLngLat([e.lon, e.lat])
            .setHTML(
              `
            <div class="popup-fosa">
              <strong>${fosa?.title || "Sin título"}</strong><br/>
              ${[fosa?.municipio, fosa?.provincia].filter(Boolean).join(" / ")}
            </div>
          `
            )
            .addTo(map);
        }
      };

      map.on("openficha", handleOpenFicha);
      return () => {
        map.off("openficha", handleOpenFicha);
      };
    }, [map, fosas]);

    return (
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
        <div id="ficha-overlay" hidden>
          <div id="modal-content">
            <button
              id="ficha-close"
              className="cerrar-x"
              title="Cerrar"
              onClick={() => {
                const overlay = document.getElementById("ficha-overlay");
                const iframe = document.getElementById("ficha-iframe");
                if (overlay) overlay.hidden = true;
                if (iframe) iframe.src = "";
              }}
            >
              ×
            </button>
            <iframe id="ficha-iframe" />
          </div>
        </div>
      </div>
    );
  }
);

MapaFosas.displayName = "MapaFosas";

export default MapaFosas;
