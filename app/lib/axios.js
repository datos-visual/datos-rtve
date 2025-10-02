/**
 * @fileoverview Configuración centralizada de Axios para la aplicación
 * Incluye interceptors para logging, manejo de errores y timeouts
 */

import axios from "axios";

// Constantes de configuración
const CONFIG = {
  TIMEOUT: 30000, // 30 segundos
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
};

// Mensajes de error amigables
const ERROR_MESSAGES = {
  TIMEOUT: "Tiempo de espera agotado. Verifica tu conexión a internet.",
  NOT_FOUND: "Los datos solicitados no fueron encontrados.",
  SERVER_ERROR: "Error del servidor. Intenta nuevamente más tarde.",
  OFFLINE: "Sin conexión a internet. Verifica tu conectividad.",
  DEFAULT: "Error al cargar los datos",
};

/**
 * Determina el mensaje de error apropiado basado en el tipo de error
 * @param {Error} error - El error recibido
 * @returns {string} Mensaje de error amigable
 */
const getErrorMessage = (error) => {
  if (error.code === "ECONNABORTED") {
    return ERROR_MESSAGES.TIMEOUT;
  }
  
  if (error.response?.status === 404) {
    return ERROR_MESSAGES.NOT_FOUND;
  }
  
  if (error.response?.status >= 500) {
    return ERROR_MESSAGES.SERVER_ERROR;
  }
  
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return ERROR_MESSAGES.OFFLINE;
  }
  
  return ERROR_MESSAGES.DEFAULT;
};

/**
 * Logger para desarrollo
 */
const devLogger = {
  request: (config) => {
    // Request logging disabled
  },
  
  response: (response) => {
    // Response logging disabled
  },
  
  error: (error) => {
    // Error logging disabled
  },
};

/**
 * Crea una instancia personalizada de Axios con configuración optimizada
 * @returns {import('axios').AxiosInstance} Instancia configurada de Axios
 */
const createApiClient = () => {
  const client = axios.create({
    timeout: CONFIG.TIMEOUT,
    headers: CONFIG.DEFAULT_HEADERS,
  });

  // Interceptor para requests
  client.interceptors.request.use(
    (config) => {
      if (process.env.NODE_ENV === "development") {
        devLogger.request(config);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor para responses
  client.interceptors.response.use(
    (response) => {
      if (process.env.NODE_ENV === "development") {
        devLogger.response(response);
      }
      return response;
    },
    (error) => {
      if (process.env.NODE_ENV === "development") {
        devLogger.error(error);
      }

      // Crear error personalizado con mensaje amigable
      const customError = new Error(getErrorMessage(error));
      customError.originalError = error;
      customError.status = error.response?.status;

      return Promise.reject(customError);
    }
  );

  return client;
};

// Exportar la instancia configurada
export default createApiClient();
