/**
 * @fileoverview Módulo para la carga y procesamiento de datos de fosas
 * Incluye validación geoespacial y normalización de datos
 */

import apiClient from "./axios.js";
import {
  GEO_CONFIG,
  NARRATIVE_MAPPINGS,
  REQUIRED_FIELDS,
  LOG_CONFIG,
  DATA_ERROR_MESSAGES,
  DEFAULT_STATS,
} from "./constants.js";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point, polygon } from "@turf/helpers";
import { JSON_URL } from "../../components/mapa/js/config.js";
import { normId } from "../../components/mapa/js/utils.js";

/**
 * Normaliza las líneas narrativas desde texto separado por comas
 * @param {string} texto - Texto con líneas narrativas separadas por comas
 * @returns {string[]} Array de líneas narrativas normalizadas
 */
const normalizarLineasNarrativas = (texto) => {
  if (!texto) return [];

  return String(texto)
    .toLowerCase()
    .split(",")
    .map((linea) => linea.trim())
    .map((linea) => NARRATIVE_MAPPINGS[linea] || linea)
    .filter(Boolean);
};

/**
 * Valida si las coordenadas están dentro de España
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 * @returns {boolean} True si está dentro de España
 */
const esCoordenadasValidas = (lat, lon) => {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return false;
  }

  const spain = polygon([GEO_CONFIG.SPAIN_BOUNDS]);
  const punto = point([lon, lat]);

  return booleanPointInPolygon(punto, spain);
};

/**
 * Normaliza coordenadas reemplazando comas por puntos
 * @param {string|number} coord - Coordenada a normalizar
 * @returns {number} Coordenada normalizada o NaN si es inválida
 */
const normalizarCoordenada = (coord) => {
  if (coord == null) return NaN;
  return Number(String(coord).replace(",", "."));
};

/**
 * Crea el objeto base de una fosa con todas las propiedades necesarias
 * @param {Object} rawData - Datos crudos de la fosa
 * @returns {Object} Objeto fosa normalizado
 */
const crearObjetoFosa = (rawData) => {
  const id = normId(rawData.id_datos);
  const municipio = rawData.municipio ? String(rawData.municipio).trim() : null;

  if (!id || !municipio) {
    return null; // Datos insuficientes
  }

  return {
    id,
    municipio,
    municipio_seo: rawData.municipioSeo ?? null,
    provincia: rawData.provincia ? String(rawData.provincia).trim() : null,
    provincia_seo: rawData.provinciaSeo ?? null,
    ccaa: rawData.ccaa ? String(rawData.ccaa).trim() : null,
    ccaa_seo: rawData.ccaaSeo ?? null,
    denominacion: rawData.titulo ? String(rawData.titulo).trim() : null,
    title: rawData.titulo ? String(rawData.titulo).trim() : null,
    title_seo: rawData.tituloSeo ?? null,
    fosa_seo: rawData.tituloSeo ?? null,
    event_date: rawData.event_date ?? null,
    event_date_end: rawData.event_date_end ?? null,
    status: rawData.status_filtro ? String(rawData.status_filtro).trim() : null,
    linea_narrativa: rawData.linea_narrativa ? String(rawData.linea_narrativa).trim() : null,
    lineas: normalizarLineasNarrativas(rawData.linea_narrativa),
    n_buried: rawData.n_buried ?? null,
    detalle_linea_narrativa: rawData.detalle_linea_narrativa ?? null,
    fuente_info: rawData.fuente_info ?? null,
    fuente_enlace: rawData.fuente_enlace ?? null,
    url_ficha: "",
    isInDedalo: Boolean(rawData.isInDedalo),
    section_id: rawData.section_id ?? null,
    deposit_type: rawData.deposit_type ?? null,
    cod_ine: rawData.cod_ine ?? null,
    destacado: rawData.destacado ?? null,
    vitaminada: Boolean(rawData.vitaminada),
  };
};

/**
 * Procesa una fila de datos y añade coordenadas si son válidas
 * @param {Object} rawFosa - Datos crudos de una fosa
 * @returns {Object|null} Objeto fosa procesado o null si es inválido
 */
const procesarFosa = (rawFosa) => {
  const fosaSin = crearObjetoFosa(rawFosa);

  if (!fosaSin) {
    return null; // Datos insuficientes
  }

  const lat = normalizarCoordenada(rawFosa.lat);
  const lon = normalizarCoordenada(rawFosa.lon);

  // Si las coordenadas son válidas y están en España, las añadimos
  if (esCoordenadasValidas(lat, lon)) {
    return { ...fosaSin, lat, lon };
  }

  return fosaSin; // Devolver sin coordenadas si no son válidas
};

/**
 * Valida la estructura del JSON recibido
 * @param {Object} data - Datos recibidos del API
 * @throws {Error} Si la estructura es inválida
 */
const validarEstructuraJSON = (data) => {
  const { arrayOfArrays, propertiesMapping } = data || {};

  if (!Array.isArray(arrayOfArrays) || !Array.isArray(propertiesMapping)) {
    throw new Error(DATA_ERROR_MESSAGES.INVALID_STRUCTURE);
  }

  if (arrayOfArrays.length === 0) {
    // Array vacío
  }

  if (propertiesMapping.length === 0) {
    throw new Error(DATA_ERROR_MESSAGES.EMPTY_MAPPING);
  }
};

/**
 * Convierte el formato optimizado (array de arrays) a objetos
 * @param {Array[]} arrayOfArrays - Array de arrays con los datos
 * @param {string[]} propertiesMapping - Mapeo de propiedades
 * @returns {Object[]} Array de objetos con las propiedades mapeadas
 */
const convertirArraysAObjetos = (arrayOfArrays, propertiesMapping) => {
  return arrayOfArrays.map((fila) => {
    const objeto = {};
    propertiesMapping.forEach((propiedad, indice) => {
      objeto[propiedad] = fila[indice] ?? null;
    });
    return objeto;
  });
};

/**
 * Calcula estadísticas del procesamiento
 * @param {Object[]} fosasProcesadas - Array de fosas procesadas
 * @returns {Object} Estadísticas del procesamiento
 */
const calcularEstadisticas = (fosasProcesadas) => {
  const fosasConCoordenadas = fosasProcesadas.filter(
    (fosa) => fosa.lat && fosa.lon
  ).length;
  const fosasSinCoordenadas = fosasProcesadas.length - fosasConCoordenadas;

  return {
    total: fosasProcesadas.length,
    conCoordenadas: fosasConCoordenadas,
    sinCoordenadas: fosasSinCoordenadas,
    procesados: fosasProcesadas.length,
    descartados: 0, // Se calcula en el proceso
  };
};

/**
 * Logger condicional basado en configuración
 */
const logger = {
  processing: (...args) => {
    // Processing logs disabled
  },

  performance: (...args) => {
    // Performance logs disabled
  },

  error: (...args) => {
    // Error logs disabled
  },

  warn: (...args) => {
    // Warning logs disabled
  },
};

/**
 * Función principal para cargar y procesar los datos de fosas
 * @returns {Promise<Object[]>} Array de objetos fosa procesados
 * @throws {Error} Si hay error en la carga o procesamiento
 */
export async function cargarFosas() {
  const startTime = performance.now();

  try {
    logger.processing("🚀 Iniciando carga de datos de fosas...");

    const response = await apiClient.get(JSON_URL);
    const rawData = response.data;

    // Validar estructura
    validarEstructuraJSON(rawData);

    // Extraer datos
    const { arrayOfArrays, propertiesMapping } = rawData;

    // Convertir a objetos
    const fosasRaw = convertirArraysAObjetos(arrayOfArrays, propertiesMapping);

    logger.processing(`📊 Procesando ${fosasRaw.length} registros de fosas...`);

    // Procesar cada fosa
    const fosasProcesadas = fosasRaw.map(procesarFosa).filter(Boolean); // Eliminar nulos

    // Calcular estadísticas
    const stats = calcularEstadisticas(fosasProcesadas);
    const endTime = performance.now();
    const processingTime = (endTime - startTime).toFixed(2);

    logger.performance(
      `✅ Procesamiento completado en ${processingTime}ms:`,
      stats
    );

    return fosasProcesadas;
  } catch (error) {
    logger.error("❌ Error al cargar fosas:", error);

    // Re-lanzar con contexto adicional
    const detailedError = new Error(
      `Error al cargar datos de fosas: ${error.message}`
    );
    detailedError.originalError = error;
    detailedError.url = JSON_URL;

    throw detailedError;
  }
}
