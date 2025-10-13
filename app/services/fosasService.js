import axios from 'axios';

// Configuración base de axios
const apiClient = axios.create({
  baseURL: 'https://www.rtve.es/datos-repo/test-fosas/v3/fichas/',
  timeout: 10000, // 10 segundos timeout
  headers: {
    'Accept': 'application/json',
  }
});

// Cache para evitar peticiones duplicadas
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene datos de múltiples fosas en una sola petición
 * @param {Array} fosas - Array de fosas con sus IDs
 * @returns {Promise<Object>} - Objeto con los datos de las fosas indexados por ID
 */
export const getFosasData = async (fosas) => {
  if (!fosas || fosas.length === 0) return {};

  // Filtrar fosas con potencial de tener datos (section_id o isInDedalo)
  const fosasConPotencial = fosas.filter(f => f.section_id || f.isInDedalo);
  
  if (fosasConPotencial.length === 0) return {};

  // Verificar cache primero
  const cacheKey = fosasConPotencial.map(f => f.id).sort().join(',');
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // Crear array de promesas para todas las peticiones
    const promises = fosasConPotencial.map(async (fosa) => {
      const id = fosa.id_datos || fosa.id;
      const idFormateado = String(id).padStart(5, '0');
      
      try {
        const response = await apiClient.get(`${idFormateado}.json`);
        return {
          id: fosa.id,
          data: response.data
        };
      } catch (error) {
        // Silenciar errores individuales (404, CORS, etc.)
        return {
          id: fosa.id,
          data: null
        };
      }
    });

    // Ejecutar todas las peticiones en paralelo
    const results = await Promise.all(promises);
    
    // Procesar resultados y extraer imágenes destacadas
    const fosasData = {};
    const imagenesDestacadas = {};

    results.forEach(({ id, data }) => {
      if (data) {
        fosasData[id] = data;
        
        // Extraer imagen destacada si existe
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
            imagenesDestacadas[id] = thumbnail;
          }
        }
      }
    });

    const result = {
      fosasData,
      imagenesDestacadas
    };

    // Guardar en cache
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;

  } catch (error) {
    console.warn('Error al cargar datos de fosas:', error);
    return {};
  }
};

/**
 * Obtiene datos de una sola fosa
 * @param {string|number} fosaId - ID de la fosa
 * @returns {Promise<Object|null>} - Datos de la fosa o null si no se encuentra
 */
export const getFosaData = async (fosaId) => {
  if (!fosaId) return null;

  const idFormateado = String(fosaId).padStart(5, '0');
  const cacheKey = `single_${idFormateado}`;
  
  // Verificar cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await apiClient.get(`${idFormateado}.json`);
    
    // Guardar en cache
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });

    return response.data;
  } catch (error) {
    // Silenciar errores (404, CORS, etc.)
    return null;
  }
};

/**
 * Limpia el cache
 */
export const clearCache = () => {
  cache.clear();
};

/**
 * Obtiene estadísticas del cache
 */
export const getCacheStats = () => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  };
};
