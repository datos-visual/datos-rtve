/**
 * @fileoverview Constantes y configuraciones para el módulo de datos
 */

// Configuración de validación geográfica
export const GEO_CONFIG = {
  // Polígono simplificado de España para validación
  SPAIN_BOUNDS: [
    [-9.392, 43.791], // Noroeste
    [3.339, 43.757], // Noreste
    [4.361, 36.0], // Sureste
    [-8.684, 35.941], // Suroeste
    [-9.392, 43.791], // Cierre del polígono
  ],
};

// Mapeo de líneas narrativas
export const NARRATIVE_MAPPINGS = {
  exhumación: "exhumación temprana",
  exhumaciones: "exhumación temprana",
  represaliado: "represión",
  represaliados: "represión",
  lugares: "lugares",
  objetos: "objetos",
  mujeres: "mujeres",
  personajes: "personajes",
};

// Campos requeridos para validación
export const REQUIRED_FIELDS = {
  ID: ["id_datos", "code"],
  MUNICIPALITY: ["municipio", "municipality"],
};

// Configuración de logging
export const LOG_CONFIG = {
  ENABLE_PROCESSING_LOGS: true,
  ENABLE_PERFORMANCE_LOGS: true,
};

// Mensajes de error específicos para datos
export const DATA_ERROR_MESSAGES = {
  INVALID_STRUCTURE:
    "Formato inesperado en guia-optimizado.json: estructura inválida",
  EMPTY_ARRAYS: "No se encontraron datos en arrayOfArrays",
  EMPTY_MAPPING: "propertiesMapping está vacío",
  INSUFFICIENT_DATA: "Datos insuficientes para crear objeto fosa",
};

// Estadísticas por defecto
export const DEFAULT_STATS = {
  total: 0,
  conCoordenadas: 0,
  sinCoordenadas: 0,
  procesados: 0,
  descartados: 0,
};
