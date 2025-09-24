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
      "La primera alcaldesa democrática en España defendió que algún día hombres y mujeres tendrían los mismos derechos. Sus restos se exhumaron en una fosa del municipio zaragozano Fuendejalón, 85 años después de su asesinato.",
    nombre: "María Domínguez Remón",
    edad: " 54 años",
    historia:
      '"Si sucumbimos en el transcurso de la lucha, las que nos sigan ocuparán la brecha que nosotras dejemos, pero nosotras caeremos con la conciencia tranquila y llenas de satisfacción por haber cumplido con un sagrado deber", escribió Domínguez en su libro de conferencias Opiniones de mujeres, en el que relataba los malos tratos de su primer marido y su formación autodidacta.',
    contexto:
      "Se estima que un 3 % de los cuerpos recuperados de las fosas son femeninos. Las mujeres sufrieron otro tipo de represión, con violaciones, torturas y humillaciones públicas. Tras la guerra, el franquismo terminó de un plumazo con los avances hacia la igualdad. ",
  },
  lugares: {
    svg: "6.png",
    categoria: "LUGARES",
    titulo:
      'Fue arrojado a 50 metros de profundidad en el pozo Tenoya, en Gran Canaria; allí se hallaron en 2018 su cuerpo y los de otras 13 personas. Era hojalatero y tesorero de una agrupación socialista local. Su hija Pino prometió a su madre que lo encontraría: "Yo sabía que estaban ahí abajo". ',
    nombre: "José Sosa",
    edad: "31 años",
    historia:
      "A Pino Sosa le costó décadas lograr que se intervinieran los ‘pozos del olvido’ en Arucas. \"Cuando me enfado digo: 'quieren terminar con los viejitos, con los que sabemos algo para ya olvidar esto'. Pero esto no se puede olvidar\". ",
    contexto:
      "Las fosas se abrieron en las cunetas y, sobre todo, en los cementerios. Pero también se usaron pozos, minas o simas para intentar ocultar el crimen para siempre. Sin embargo, con las técnicas y los medios de hoy en día es posible inspeccionar esos lugares y recuperar los restos. En otros casos, como el de Les Candases, los cuerpos fueron arrojados al mar.",
  },
  personajes: {
    svg: "7.png",
    categoria: "NOMBRES PROPIOS",
    titulo:
      '"La Pasionaria mallorquina" era costurera, dirigente comunista y sindicalista. Fue asesinada junto con otras mujeres, apodadas las "Rojas del Molinar", aunque a la familia le dijeron que había sido liberada. Su cuerpo fue recuperado en 2022 en el cementerio de Son Coletes.',
    nombre: "Aurora Picornell",
    edad: "24 años",
    historia:
      '"Reúne todas las condiciones para ser un símbolo. Fue una mujer muy destacada en la época, muy avanzada, joven, autodidacta, que escribía muchísimo, a la que podemos encontrar en la prensa de la época, muy conocida en toda la isla de Mallorca y fuera también", explica Maria Antonia Oliver, presidenta de la asociación Memòria de Mallorca.',
    contexto:
      "Otros personajes de la vida social, política y cultural española acabaron en una fosa común durante la guerra o el franquismo. Lorca, Blas Infante, Pedro Muñoz Seca, el artista oscense Ramón Acín o el sacerdote y escritor vasco Aitzol son algunos de ellos. Muchos permanecen desaparecidos.",
  },
  objetos: {
    svg: "8.png",
    categoria: "OBJETOS",
    titulo:
      "Su nombre apareció en un papel dentro de una botella en una de las fosas de Paterna. Concejal de Unión Republicana en Utiel, intentó proteger a los vecinos derechistas. Al terminar la guerra entregó las llaves del ayuntamiento a las tropas franquistas. Fue detenido y fusilado en 1941.",
    nombre: "Germán Pérez",
    edad: "51 años",
    historia:
      "Araceli Pérez Sancho, nieta y última descendiente de Germán, donó su ADN para confirmar la identificación, pero no vivió para conocer el resultado. En el cementerio de la localidad valenciana de Paterna hay 154 fosas. En total se han exhumado unos 1.500 cuerpos, de los que solo se ha logrado identificar 200.",
    contexto:
      "En las fosas suelen encontrarse todo tipo de objetos, desde munición a efectos personales o incluso cartas, que ayudan a identificar los restos, a la vez que establecen un vínculo emocional entre las víctimas y sus familiares.",
  },
  represion: {
    svg: "9.png",
    categoria: "REPRESALIADOS",
    titulo:
      "Pese a ser católico, retiró los crucifijos de la escuela donde era maestro para cumplir con la laicidad republicana. Fue asesinado y arrojado junto a su hijo Alfonso y otras 17 personas a una fosa en la localidad granadina de Nigüelas.",
    nombre: "Ángel Matarán",
    edad: "49 años",
    historia:
      'Los restos de padre e hijo fueron identificados en marzo de 2025, pero para entonces los otros hijos de Ángel habían fallecido. Fueron los nietos quienes recibieron los restos en un homenaje. "No fue solo a mi abuelo, fue a miles de maestros. El franquismo y los fascistas odiaban la cultura, que la gente dejara atrás el analfabetismo, aprendiera y progresara".',
    contexto:
      "Los maestros fueron uno de los objetivos de la represión por parte de los sublevados, junto con los miembros de partidos políticos y sindicatos y los funcionarios de la República. En la retaguardia republicana, además de ciudadanos considerados de derechas y posibles partidarios del golpe, fueron asesinados casi 7.000 miembros de la Iglesia Católica.",
  },
  Exhumaciones: {
    svg: "10.png",
    categoria: "EXHUMACIONES TEMPRANAS",
    titulo:
      "Los restos de Jesús fueron exhumados por sus propios familiares a finales de los 70, aún en plena Transición. Este vecino de la localidad navarra de Sartaguda era labrador y militante de la UGT. Fue asesinado en 1936, según su nieta mientras plantaba alubias en el campo. ",
    nombre: "Jesús Moreno Sádaba",
    edad: "41 años",
    historia:
      'El otro abuelo de Lucía Moreno, Agapito Garatea Sádaba, también fue fusilado. Sartaguda fue la localidad navarra más castigada por la represión, pese a que el golpe triunfó desde el primer momento en la región. Fueron asesinados 84 hombres, más de la mitad de la población masculina entre 16 y 50 años, por lo que Sartaguda es conocido como "el pueblo de las viudas". ',
    contexto:
      'A finales de los 70, en Navarra y La Rioja, pero también en Extremadura, Murcia o Andalucía, tuvieron lugar lo que se ha dado en llamar "exhumaciones tempranas", llevadas a cabo por los propios familiares y vecinos, a mano y sin criterios científicos, pero con la convicción de que había que dar a las víctimas una sepultura digna.',
  },
};
