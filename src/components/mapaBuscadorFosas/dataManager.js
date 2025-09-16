/**
 * Gestiona los datos, filtrado y búsqueda de fosas
 */
export class DataManager {
  constructor(component) {
    this.component = component;
  }

  // Filtra las fosas según los criterios seleccionados
  getFosasFiltradas() {
    let fosas = this.component.fosas;

    // Aplicar filtros de estado
    if (this.component.estadosSeleccionados.length === 0) {
      console.log(
        "🚫 Sin filtros de estado seleccionados, devolviendo array vacío"
      );
      return [];
    }

    if (!this.component.estadosSeleccionados.includes("todos")) {
      fosas = fosas.filter((f) => {
        const estadoNormalizado = this._normalizeStatus(f.status);
        const estadosDeseados = this._mapSelectedStates();
        return estadosDeseados.includes(estadoNormalizado);
      });
    }

    // Aplicar filtro de texto
    const busqueda = (this.component.busquedaTexto || "").trim().toLowerCase();
    if (busqueda) {
      fosas = fosas.filter((f) => this._matchesSearchText(f, busqueda));
    }

    return fosas;
  }

  // Normaliza el estado de una fosa para comparación
  _normalizeStatus(status) {
    const s = String(status || "")
      .toLowerCase()
      .trim();
    if (!s) return "";

    if (s.includes("trasladad") || s.includes("cuelgamuros"))
      return "trasladada";
    if (s.replaceAll(" ", "").startsWith("noexhumad")) return "no exhumada";
    if (s.includes("exhumad")) return "exhumada";

    return s;
  }

  // Mapea los estados seleccionados a estados normalizados
  _mapSelectedStates() {
    return this.component.estadosSeleccionados.map((sel) => {
      switch (sel) {
        case "exhumados":
          return "exhumada";
        case "no-exhumados":
          return "no exhumada";
        case "trasladada":
          return "trasladada";
        default:
          return sel;
      }
    });
  }

  // Verifica si una fosa coincide con el texto de búsqueda
  _matchesSearchText(fosa, busqueda) {
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
  }

  // Sincroniza el contador de resultados y la capa del mapa
  syncResultadosYMapa(fosasFiltradas) {
    this._actualizarContadorResultados(fosasFiltradas);
    this._actualizarCapaMapa(fosasFiltradas);
    this._actualizarListaFosas();
    this._actualizarPanelMovil(fosasFiltradas);
  }

  _actualizarContadorResultados(fosasFiltradas) {
    const resultados = this.component.querySelector("#resultados");
    if (!resultados) return;

    if (
      fosasFiltradas.length === 0 &&
      this.component.estadosSeleccionados.length === 0
    ) {
      resultados.innerHTML = `<strong>Sin filtros seleccionados</strong> - Selecciona al menos un estado`;
    } else if (fosasFiltradas.length === 0) {
      resultados.innerHTML = `<strong>0 resultados</strong> - No hay fosas con los filtros aplicados`;
    } else {
      resultados.innerHTML = `Se muestran <strong>${fosasFiltradas.length}</strong> resultados`;
    }
  }

  _actualizarCapaMapa(fosasFiltradas) {
    const mapa = this.component.querySelector("mapa-fosas");
    if (mapa && typeof mapa.setFilteredFosas === "function") {
      mapa.setFilteredFosas(fosasFiltradas);
    }
  }

  _actualizarListaFosas() {
    if (this.component.listaVisible) {
      this.component.actualizarListaFosas();
    }
  }

  _actualizarPanelMovil(fosasFiltradas) {
    // Actualizar panel móvil si está activo
    if (this.component.mobileSheetManager && this.component.mobileSheetManager.isActive()) {
      console.log("📱 Actualizando panel móvil automáticamente con", fosasFiltradas.length, "fosas");
      this.component.mobileSheetManager.updateContent(fosasFiltradas);
    }
  }

  // Genera descripción adaptativa para una fosa
  getDescripcionFosa(fosa) {
    if (fosa.detalle_linea_narrativa?.trim()) {
      return fosa.detalle_linea_narrativa.trim();
    }

    if (fosa.linea_narrativa?.trim() && fosa.linea_narrativa !== "null") {
      return `Línea narrativa: ${fosa.linea_narrativa.trim()}`;
    }

    if (fosa.deposit_type?.trim()) {
      return `Tipo de depósito: ${fosa.deposit_type.trim()}`;
    }

    if (fosa.event_date) {
      return `Fecha del evento: ${fosa.event_date}`;
    }

    return "Información detallada disponible en la ficha";
  }

  // Renderiza la lista de fosas para el componente lista-fosas-completa
  renderListaFosas(lista) {
    if (!Array.isArray(lista) || lista.length === 0) {
      return '<p class="no-resultados">No hay fosas para mostrar</p>';
    }

    return lista
      .map((fosa) => this._renderFosaItem(fosa))
      .filter(Boolean)
      .join("");
  }

  _renderFosaItem(fosa) {
    if (!fosa || !fosa.id) {
      console.warn("⚠️ Fosa sin ID válido:", fosa);
      return "";
    }

    const ubicacion = [fosa.municipio, fosa.provincia]
      .filter(Boolean)
      .join(" / ");

    const titulo =
      fosa.title?.trim() ||
      `Fosa en ${fosa.municipio || "ubicación desconocida"}`;

    const descripcion = this.getDescripcionFosa(fosa);

    return `
      <div class="fosa" data-id="${fosa.id}">
        <div class="fosa__img">
            <img src="https://fotografias.larazon.es/clipping/cmsimages02/2024/11/15/93DFFB09-1D04-4088-99A5-94DC549EE9EC/hallada-fosa-comun-cementerio-val-51-victimas-franquismo_98.jpg?crop=1200,675,x0,y113&width=1900&height=1069&optimize=low&format=webply" alt="Fosa">
        </div>
        <div class="info">
          <p class="ubicacion ${fosa.status}"><span> ${fosa.municipio}  </span>/   ${fosa.provincia} </p>
          <h3>${titulo}</h3>
        </div>
      </div>
    `;
  }
}
