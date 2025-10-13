// Configuración global del intro
export const INTRO_CONFIG = {
  breakpoints: { mobile: 600, tablet: 768 },
  categories: [
    "mujeres",
    "lugares",
    "personajes",
    "objetos",
    "represion",
    "Exhumaciones",
  ],
};

// Alias para compatibilidad
export const CATEGORIES = INTRO_CONFIG.categories;

// Helper para cache de elementos DOM - patrón común en todos los screens
export const createElementCache = (root, selectors) => {
  const cache = {};
  Object.entries(selectors).forEach(([key, selector]) => {
    cache[key] =
      typeof selector === "string" ? root.querySelector(selector) : selector;
  });
  return cache;
};

// Datos de personajes por categoría - contenido dinámico para Screen3
export const PERSONAJES_DATA = {
  mujeres: {
    svg: "5.png",
    categoria: "MUJERES",
    titulo:
      "La primera alcaldesa democrática en España defendió que algún día hombres y mujeres vivirían en igualdad. Sus restos se recuperaron 85 años después en una fosa de Fuendejalón.",
    nombre: "María Domínguez Remón",
    edad: " 54 años",
    historia:
      "“Si sucumbimos en el transcurso de la lucha, las que nos sigan ocuparán la brecha que nosotras dejemos, pero caeremos con la conciencia tranquila”, escribió Domínguez.",
    contexto:
      "Un 3 % de los cuerpos recuperados de las fosas son femeninos. Las mujeres sufrieron otro tipo de represión, con violaciones, torturas y humillaciones públicas. Tras la guerra, el franquismo deshizo los avances hacia la igualdad.",
  },
  lugares: {
    svg: "6.png",
    categoria: "LUGARES",
    titulo:
      "Fue arrojado a 50 metros en el pozo Tenoya, en Gran Canaria, junto con otras 13 personas. Su hija Pino prometió a su madre que lo encontraría: “Sabía que estaban ahí abajo”.",
    nombre: "José Sosa",
    edad: "31 años",
    historia:
      "A Pino Sosa le costó décadas lograr que se intervinieran los ‘pozos del olvido’ en Arucas.  Por fin, en 2018, pudo recuperar los restos de su padre, hojalatero de profesión y tesorero de una agrupación socialista.",
    contexto:
      "Las fosas se abrieron en cunetas y, sobre todo, en cementerios. También se usaron minas o simas para intentar ocultar el crimen, aunque con las técnicas y los medios de hoy en día es posible inspeccionar esos lugares y recuperar los restos. En otros casos los cuerpos fueron arrojados al mar, perdidos para siempre.",
  },
  personajes: {
    svg: "7.png",
    categoria: "NOMBRES PROPIOS",
    titulo:
      "‘La Pasionaria mallorquina’ era costurera, dirigente comunista y sindicalista. Dijeron que había sido liberada, pero sus restos aparecieron en 2022 en el cementerio de Son Coletes.",
    nombre: "Aurora Picornell",
    edad: "24 años",
    historia:
      "“Fue una mujer muy destacada en la época, avanzada, autodidacta, que escribía muchísimo, muy conocida en toda la isla y también fuera”, explica Maria Antonia Oliver, de la asociación Memòria de Mallorca.",
    contexto:
      "Otros personajes de la vida social, política y cultural española acabaron en una fosa común durante la guerra o el franquismo. Lorca, Blas Infante, Pedro Muñoz Seca, el artista oscense Ramón Acín o el sacerdote y escritor vasco Aitzol son algunos de ellos. Muchos permanecen desaparecidos.",
  },
  objetos: {
    svg: "8.png",
    categoria: "OBJETOS",
    titulo:
      "Su nombre apareció en una botella en el cementerio de Paterna. Concejal republicano en Utiel, intentó proteger a todos los vecinos. Al terminar la guerra fue detenido y finalmente fusilado en 1941.",
    nombre: "Germán Pérez",
    edad: "51 años",
    historia:
      "Su nieta, Araceli Pérez Sancho, donó su ADN pero no vivió para confirmar la identificación. En la localidad valenciana de Paterna hay 154 fosas. En total se han exhumado unos 1.500 cuerpos, de los que solo se ha logrado identificar 200.",
    contexto:
      "En las fosas suelen encontrarse todo tipo de objetos, desde munición a efectos personales o incluso cartas, que ayudan a identificar los restos, a la vez que establecen un vínculo emocional entre las víctimas y sus familiares.",
  },
  represion: {
    svg: "9.png",
    categoria: "REPRESALIADOS",
    titulo:
      "Este maestro católico retiró los crucifijos de la escuela para cumplir con la laicidad republicana. Fue asesinado junto a su hijo y otras 17 personas en la localidad granadina de Nigüelas.",
    nombre: "Ángel Matarán",
    edad: "49 años",
    historia:
      'Los restos de padre e hijo fueron identificados en marzo de 2025, y entregados a los nietos de Ángel. "No fue solo mi abuelo, sino miles de maestros. El franquismo y los fascistas odiaban la cultura".',
    contexto:
      "Los maestros fueron uno de los objetivos de la represión por parte de los sublevados, junto con los miembros de partidos políticos y sindicatos y los partidarios de la República, tanto durante la guerra como después.",
  },
  Exhumaciones: {
    svg: "10.png",
    categoria: "EXHUMACIONES TEMPRANAS",
    titulo:
      "Sus restos fueron exhumados por sus  familiares en 1979, aún en plena Transición. Era labrador y militante de la UGT cuando fue asesinado en 1936.",
    nombre: "Jesús Moreno Sádaba",
    edad: "41 años",
    historia:
      "En la localidad navarra de Sartaguda, ‘el pueblo de las viudas’, fueron asesinados 84 hombres, más de la mitad de la población masculina de entre 16 y 50 años.",
    contexto:
      "A finales de los 70, en Navarra, La Rioja, Extremadura, Murcia o Andalucía hubo ‘exhumaciones tempranas’, llevadas a cabo por los propios familiares y vecinos a mano y sin criterios científicos para dar sepultura digna a las víctimas.",
  },
};
