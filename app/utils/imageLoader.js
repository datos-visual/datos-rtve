// Loader personalizado para imágenes según el entorno
// Este archivo será usado por Next.js cuando loader: 'custom' esté configurado

/**
 * Loader personalizado para imágenes de Next.js
 * @param {Object} params - Parámetros del loader
 * @param {string} params.src - Ruta de la imagen
 * @param {number} params.width - Ancho solicitado
 * @param {number} params.quality - Calidad solicitada (1-100)
 * @returns {string} URL optimizada de la imagen
 */
export default function imageLoader({ src, width, quality }) {
  const env = process.env.APP_ENV || process.env.NODE_ENV;

  // Si es una URL absoluta, devolverla tal como está
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  // Configurar el dominio base según el entorno
  let baseUrl;
  switch (env) {
    case "preproduction":
      baseUrl = "https://img-pre.rtve.es";
      break;
    case "production":
      baseUrl = "https://img.rtve.es";
      break;
    default:
      // En desarrollo, usar el servidor local
      return `http://localhost:3000${src}?w=${width}&q=${quality || 75}`;
  }

  // Remover el slash inicial si existe
  const cleanSrc = src.startsWith("/") ? src.slice(1) : src;

  // Construir la URL final
  return `${baseUrl}/${cleanSrc}?w=${width}&q=${quality || 75}`;
}
