/* lib/axios.js - Configuración centralizada de Axios */
import axios from "axios";

// Crear una instancia personalizada de Axios
const apiClient = axios.create({
  timeout: 30000, // 30 segundos de timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor para requests (opcional - para logging, auth, etc.)
apiClient.interceptors.request.use(
  (config) => {
    // Log de requests en desarrollo
    if (process.env.NODE_ENV === "development") {
      console.log(`📡 Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
apiClient.interceptors.response.use(
  (response) => {
    // Log de responses exitosos en desarrollo
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Manejo centralizado de errores
    console.error("❌ Response error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });

    // Crear mensajes de error más amigables
    let errorMessage = "Error al cargar los datos";

    if (error.code === "ECONNABORTED") {
      errorMessage =
        "Tiempo de espera agotado. Verifica tu conexión a internet.";
    } else if (error.response?.status === 404) {
      errorMessage = "Los datos solicitados no fueron encontrados.";
    } else if (error.response?.status >= 500) {
      errorMessage = "Error del servidor. Intenta nuevamente más tarde.";
    } else if (!navigator.onLine) {
      errorMessage = "Sin conexión a internet. Verifica tu conectividad.";
    }

    // Crear error personalizado con mensaje amigable
    const customError = new Error(errorMessage);
    customError.originalError = error;
    customError.status = error.response?.status;

    return Promise.reject(customError);
  }
);

export default apiClient;
