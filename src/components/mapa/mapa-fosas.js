import mapboxgl from "mapbox-gl";
import { createMap, createGeocoder } from "../mapa/js/initMap.js";
import { cargarFosas } from "../mapa/js/datos.js";
import { montarCapaFosas, actualizarDatosFosas } from "../mapa/js/layers.js";
import { abrirFicha } from "../mapa/js/overlay.js";
import { getParam, normId } from "../mapa/js/utils.js";
import { MAPBOX_TOKEN } from "../mapa/js/config.js";
import "./css/estilos.css";

// Función para normalizar nombres para la URL
function slugify(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

class MapaFosas extends HTMLElement {
  static get observedAttributes() {
    return ["categoria"];
  }

  constructor() {
    super();
    this.map = null;
    this.fosas = [];
    this._allFosas = [];
    this.categoria = "todas";
    this.capaMontada = false;
  }

  async connectedCallback() {
    this.render();

    mapboxgl.accessToken = MAPBOX_TOKEN;
    this.map = createMap(this.querySelector("#map"));

    try {
      this._allFosas = await cargarFosas();
      this.fosas = this._allFosas;
      if (this.hasAttribute("solo-narrativas")) {
        this.fosas = this.fosas.filter((f) => {
          const ln = f.linea_narrativa;
          return (
            typeof ln === "string" && ln.trim() && ln.toLowerCase() !== "null"
          );
        });
      }
    } catch (error) {
      console.error("Error al cargar fosas:", error);
      return;
    }

    this.map.once("load", () => {
      // Si había un subconjunto pendiente (por filtros externos), aplícalo primero
      if (this._pendingSubset) {
        const subset = this._pendingSubset;
        delete this._pendingSubset;
        this.setFilteredFosas(subset);
      } else {
        // Siempre usamos puntos (círculos), el color cambia según sea narrativas o no
        this.filtrarPorCategoria(this.getAttribute("categoria") || "todas");
      }

      // Expone métodos para padre (vista-figura)
      this.localGeocoder = this.localGeocoder.bind(this);

      // Solo si no se usará geocoder externo
      if (!this.hasAttribute("sin-geocoder")) {
        createGeocoder(this.map, this.localGeocoder);
      }

      // 🔍 Si hay una ficha por URL
      const idBuscado = normId(getParam("ficha"));
      if (idBuscado) {
        const f = this.fosas.find((x) => x.id === idBuscado);
        if (!f) {
          console.warn("ID no encontrado:", idBuscado);
        } else if (Number.isFinite(f.lat) && Number.isFinite(f.lon)) {
          this.map.flyTo({ center: [f.lon, f.lat], zoom: 14 });
          this.map.once("moveend", () =>
            abrirFicha(f.id, f.lat, f.lon, 14, f.url_ficha)
          );
        } else {
          const query = [f.municipio, f.codigo_postal]
            .filter(Boolean)
            .join(" ");
          if (query) {
            this.geocodeFallback(query, f.id);
          } else {
            console.warn("Sin coordenadas ni datos para geocodificar:", f.id);
          }
        }
      }

      // (ya aplicado arriba si existía)

      // Clic en marcador
      this.map.on("openficha", (e) => {
        const fosa = this.fosas.find((f) => f.id === normId(e.id));
        if (fosa) {
          // Actualiza la URL con /:ccaa/:prov/:mun/
          const ccaa = slugify(fosa.ccaa_seo);
          const prov = slugify(fosa.provincia_seo);
          const mun = slugify(fosa.municipio_seo);
          const nuevaUrl = `/${ccaa}/${prov}/${mun}/`;
          window.history.pushState({}, "", nuevaUrl);

          // Actualiza el listadoSEO con la fosa seleccionada
          const listadoSEO = document.querySelector("listado-seo");
          if (listadoSEO) listadoSEO.seleccionada = fosa;

          if (fosa.url_ficha) {
            abrirFicha(
              normId(e.id),
              e.lat,
              e.lon,
              this.map.getZoom(),
              fosa.url_ficha
            );
          } else {
            new mapboxgl.Popup({ closeButton: true, offset: [0, -10] })
              .setLngLat([e.lon, e.lat])
              .setHTML(
                `
                <div class="popup-fosa">
                  <strong>${fosa?.title || "Sin título"}</strong><br/>
                  ${[fosa?.municipio, fosa?.provincia]
                    .filter(Boolean)
                    .join(" / ")}
                </div>
              `
              )
              .addTo(this.map);
          }
        }
      });
    });
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === "categoria" && this.map && newVal !== oldVal) {
      this.filtrarPorCategoria(newVal);
    }
  }

  filtrarPorCategoria(cat) {
    this.categoria = cat;
    let fosasFiltradas = this.fosas;

    if (cat !== "todas") {
      fosasFiltradas = this.fosas.filter((f) =>
        f.linea_narrativa?.toLowerCase().includes(cat.toLowerCase())
      );
    }

    const conXY = fosasFiltradas.filter((f) => f.lat && f.lon);

    const soloNarrativas = this.hasAttribute("solo-narrativas");

    if (!this.capaMontada) {
      montarCapaFosas(this.map, conXY, soloNarrativas);
      this.capaMontada = true;
    } else {
      actualizarDatosFosas(this.map, conXY);
    }
  }

  // Actualizar el mapa con un subconjunto filtrado desde fuera
  setFilteredFosas(fosasSubset) {
    // Si el componente aún no cargó el mapa, retrasar la aplicación
    if (!this.map || (this.map && !this.map.isStyleLoaded())) {
      // Guardar y reintentar al cargar
      this._pendingSubset = fosasSubset;
      return;
    }
    this.fosas = Array.isArray(fosasSubset) ? fosasSubset : [];
    const conXY = this.fosas.filter((f) => f.lat && f.lon);
    if (!this.capaMontada) {
      montarCapaFosas(this.map, conXY, this.hasAttribute('solo-narrativas'));
      this.capaMontada = true;
    } else {
      actualizarDatosFosas(this.map, conXY);
    }
  }

  render() {
    this.innerHTML = `
      <div id="map" style="width: 100%; height: 100%;"></div>
      <div id="ficha-overlay" hidden>
        <div id="modal-content">
          <button id="ficha-close" class="cerrar-x" title="Cerrar">×</button>
          <iframe id="ficha-iframe"></iframe>
        </div>
      </div>
    `;

    this.querySelector("#ficha-close").addEventListener("click", () => {
      this.querySelector("#ficha-overlay").hidden = true;
      this.querySelector("#ficha-iframe").src = "";
    });
  }

  localGeocoder(q) {
    const txt = q.toLowerCase();
    return this.fosas
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
  }

  geocodeFallback(query, id) {
    const geocoderUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${MAPBOX_TOKEN}`;

    fetch(geocoderUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data.features?.length > 0) {
          const [lon, lat] = data.features[0].center;
          this.map.flyTo({ center: [lon, lat], zoom: 12 });
          this.map.once("moveend", () => abrirFicha(id, lat, lon, 12));
        } else {
          alert("No se pudo localizar el municipio o código postal.");
        }
      })
      .catch((err) => {
        console.error("Error al geocodificar:", err);
        alert("Error en la geocodificación.");
      });
  }
}

customElements.define("mapa-fosas", MapaFosas);
