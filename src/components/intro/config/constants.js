// Configuración global del intro
export const INTRO_CONFIG = {
  breakpoints: { mobile: 600, tablet: 768 },
  categories: ["mujeres", "lugares", "personajes", "objetos", "represion", "Exhumaciones"]
};

// Alias para compatibilidad
export const CATEGORIES = INTRO_CONFIG.categories;

// Helper para cache de elementos DOM - patrón común en todos los screens
export const createElementCache = (root, selectors) => {
  const cache = {};
  Object.entries(selectors).forEach(([key, selector]) => {
    cache[key] = typeof selector === 'string' ? root.querySelector(selector) : selector;
  });
  return cache;
};

// Datos de personajes por categoría - contenido dinámico para Screen3
export const PERSONAJES_DATA = {
  mujeres: {
    svg: "5.png",
    categoria: "MUJERES",
    titulo: "\"La mataron por ser mujer\": del sueño de la igualdad a la pesadilla de la represión",
    nombre: "Antonia García Bermúdez",
    edad: "72 años",
    historia: "Antonia fue sacada de su casa en un pequeño pueblo de Soria. Viuda, madre de tres hijos y conocida por su labor como curandera, era una figura querida en la comunidad. Su detención fue abrupta, sin juicio ni explicación.",
    contexto: "Fue una de las mujeres que fueron represaliadas por su independencia, su visibilidad y su papel dentro de la comunidad. Su historia forma parte de la sección Mujeres, que recoge los casos silenciados de aquellas que también fueron víctimas de la represión."
  },
  lugares: {
    svg: "6.png",
    categoria: "LUGARES DESTACADOS",
    titulo: "Espacios de memoria: donde el silencio guarda la historia",
    nombre: "Cementerio de San José",
    edad: "Fundado en 1898",
    historia: "Un lugar que guarda la memoria de cientos de víctimas. Este cementerio se convirtió en testigo silencioso de los acontecimientos más oscuros de nuestra historia reciente.",
    contexto: "Los lugares de memoria nos ayudan a entender el contexto histórico y geográfico de los acontecimientos. Cada ubicación cuenta una historia diferente pero conectada."
  },
  personajes: {
    svg: "7.png",
    categoria: "PERSONAJES",
    titulo: "Voces del pasado: historias que no debemos olvidar",
    nombre: "Miguel Hernández",
    edad: "31 años",
    historia: "Poeta y dramaturgo español, conocido por su compromiso social y político. Su obra refleja la realidad de su tiempo y su lucha por la justicia.",
    contexto: "Los personajes destacados nos permiten conocer historias individuales que representan a miles de víctimas anónimas."
  },
  objetos: {
    svg: "8.png",
    categoria: "OBJETOS",
    titulo: "Testimonios silenciosos: objetos que cuentan historias",
    nombre: "Carta de despedida",
    edad: "Escrita en 1939",
    historia: "Una carta encontrada entre los efectos personales de una víctima. Las palabras finales que nunca llegaron a su destinatario.",
    contexto: "Los objetos personales nos acercan de manera íntima a las historias humanas detrás de los datos estadísticos."
  },
  represion: {
    svg: "9.png",
    categoria: "REPRESIÓN",
    titulo: "El terror sistemático: anatomía de la represión franquista",
    nombre: "Tribunal Militar",
    edad: "Activo 1936-1975",
    historia: "Los tribunales militares fueron instrumentos de represión sistemática durante la Guerra Civil y la dictadura franquista.",
    contexto: "La represión fue sistemática y organizada, afectando a miles de personas por sus ideas políticas, sociales o simplemente por estar en el lugar equivocado."
  },
  Exhumaciones: {
    svg: "10.png",
    categoria: "EXHUMACIONES TEMPRANAS",
    titulo: "Devolver la dignidad: el camino hacia la verdad",
    nombre: "Primera exhumación",
    edad: "Año 2000",
    historia: "El inicio de un proceso de recuperación de la memoria histórica a través de la búsqueda y exhumación de fosas comunes.",
    contexto: "Las exhumaciones representan el esfuerzo por devolver la dignidad a las víctimas y ofrecer respuestas a las familias."
  }
};
