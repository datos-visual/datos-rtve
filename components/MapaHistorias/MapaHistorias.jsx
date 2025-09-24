"use client";

import { useState, useEffect, useMemo } from "react";
import "../../app/styles/_mapaHistorias.scss";
import MapaFosas from "../mapa/MapaFosas";
import FichaFosa from "../FichaFosa/FichaFosa";
import BotonesCategorias from "../BotonesCategorias/BotonesCategorias";
import ListaFosasCompleta from "../ListaFosasCompleta/ListaFosasCompleta";
import { cargarFosas } from "../mapa/js/datos.js";
import pinLineaNarrativa from "../../app/assets/pinUbicacionLineaNarrativa.svg";
import mapIconButton from "../../app/assets/mapIconButton.svg";
import listIconButton from "../../app/assets/listIconButton.svg";

const CATEGORIAS = [
  "todas",
  "mujeres",
  "lugares",
  "personajes",
  "objetos",
  "represion",
  "Exhumaciones",
];

const ESTADOS = [
  { value: "todos", label: "Todos" },
  { value: "exhumados", label: "Exhumados" },
  { value: "no-exhumados", label: "No exhumados" },
  { value: "cuelgamuros", label: "Trasladados a Cuelgamuros" },
];

const TEXTOS_CATEGORIA = {
  todas: "Seleccionar una línea narrativa para explorar.",

  mujeres:
    "Un 3% de los cuerpos recuperados en las fosas son de mujeres. Algunas fueron asesinadas por sus ideas o acciones –como María Domínguez, alcaldesa de Gallur y feminista– y otras, simplemente, por ser esposas, madres, hijas o hermanas de hombres cercanos al bando republicano. Aunque la proporción de asesinadas fue menor, los golpistas a menudo ejercieron contra ellas un tipo de violencia específica, que incluía agresiones sexuales y humillaciones, y que durante décadas permaneció oculta.",

  lugares:
    "La mayoría de las fosas comunes no se encuentran en cunetas, sino dentro de los cementerios o junto a sus tapias, donde a menudo los fusilaban. Algunas víctimas acabaron en pozos, como el de Tenoya, en Canarias, donde fue arrojado el cuerpo de José Sosa Déniz junto al de otros represaliados. Minas, simas, cuevas y hasta tubos volcánicos fueron también utilizados. Otros cuerpos fueron arrojados al mar, con la intención de hacerlos desaparecer para siempre.",

  objetos:
    "Munición, una alianza, un sonajero o las últimas cartas de un condenado a muerte. Los objetos que aparecen en las fosas ayudan a identificar a las víctimas, como ocurrió con la botella que contenía el nombre de Germán Pérez, concejal de Unión Republicana en Utiel (Granada). En ocasiones, además, estos hallazgos sirven para esclarecer las circunstancias de los asesinatos.",

  personajes:
    "Lorca, Blas Infante, Ramón Acín, Aitzol, Pedro Muñoz Seca… Destacados representantes de la vida política o cultural fueron asesinados y arrojados a fosas comunes. Algunos continúan desaparecidos.",

  represion:
    "Los sublevados señalaron para su eliminación a los representantes políticos de la República, a miembros de partidos y sindicatos y a colectivos como el de los maestros, como Ángel Matarán. Terminada la guerra, la dictadura siguió persiguiendo a opositores políticos y guerrilleros. En la retaguardia republicana fueron asesinados casi 7.000 miembros del clero.", // Rellenar si corresponde

  Exhumaciones:
    "La mayoría de los asesinados en la retaguardia republicana fueron exhumados tras la guerra. En cambio, los familiares de los represaliados por los sublevados tuvieron que recuperar sus cuerpos a escondidas, o esperaron a la llegada de la transición para excavar la tierra con sus propias manos y darles un entierro digno. A Jesús Moreno Sádaba, fusilado en 1936, su familia le pudo desenterrar en 1979, en una de los grandes hallazgos de las exhumaciones tempranas en Navarra.",
};

export default function MapaHistorias({
  initialCategoria = "todas",
  initialSelectedFosa = null,
}) {
  const [fosas, setFosas] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState(initialCategoria);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("todos");
  const [introVisible, setIntroVisible] = useState(false);
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [selectedFosa, setSelectedFosa] = useState(initialSelectedFosa);

  // Cargar datos
  useEffect(() => {
    const cargar = async () => {
      try {
        const todas = await cargarFosas();
        const filtradas = todas.filter(
          (f) =>
            typeof f.linea_narrativa === "string" &&
            f.linea_narrativa.trim() &&
            f.linea_narrativa.trim().toLowerCase() !== "null"
        );
        setFosas(filtradas);

        // Si nos pasan una fosa inicial pero aún no está en state, fijarla
        if (initialSelectedFosa) {
          const encontrada = filtradas.find(
            (f) => f.id === initialSelectedFosa.id
          );
          if (encontrada) setSelectedFosa(encontrada);
        }
      } catch (err) {
        console.error("Error al cargar fosas:", err);
      }
    };
    cargar();
  }, [initialSelectedFosa]);

  // Descripción de categoría
  const descripcionCategoria = useMemo(
    () =>
      categoriaSeleccionada in TEXTOS_CATEGORIA
        ? TEXTOS_CATEGORIA[categoriaSeleccionada]
        : TEXTOS_CATEGORIA["todas"],
    [categoriaSeleccionada]
  );

  // Filtrado de fosas
  const fosasFiltradas = useMemo(() => {
    let res = fosas;
    if (categoriaSeleccionada !== "todas") {
      res = res.filter((f) =>
        f.linea_narrativa
          ?.toLowerCase()
          .includes(categoriaSeleccionada.toLowerCase())
      );
    }
    if (estadoSeleccionado !== "todos") {
      const filtroEstado = {
        exhumados: "exhumada",
        "no-exhumados": "no exhumada",
        cuelgamuros: "trasladada",
      }[estadoSeleccionado];
      res = res.filter((f) => f.status?.toLowerCase() === filtroEstado);
    }
    return res;
  }, [fosas, categoriaSeleccionada, estadoSeleccionado]);

  const toggleVista = () => setMostrarMapa((prev) => !prev);
  const abrirModalFosa = (fosa) => setSelectedFosa(fosa);
  const cerrarModalFosa = () => setSelectedFosa(null);

  // Evita crash en build (no hay window)
  const isMobile =
    typeof window !== "undefined" ? window.innerWidth <= 768 : false;

  return (
    <div className="vista-figura">
      <div className={`contenido ${isMobile ? "mobile" : "desktop"}`}>
        <div
          className="mitad-texto"
          style={{ display: isMobile && mostrarMapa ? "none" : undefined }}
        >
          {selectedFosa ? (
            <FichaFosa fosa={selectedFosa} onClose={cerrarModalFosa} />
          ) : (
            <>
              <p className="mitad-texto__intro">
                Seleccionar una línea narrativa para explorar
              </p>
              <BotonesCategorias
                categorias={CATEGORIAS}
                seleccionada={categoriaSeleccionada}
                onChange={setCategoriaSeleccionada}
              />
              <ListaFosasCompleta
                contexto="mapaHistorias"
                lista={fosasFiltradas}
                descripcion={descripcionCategoria}
                introVisibleDefault={introVisible}
                onItemClick={abrirModalFosa}
              />
            </>
          )}
        </div>

        <div
          className="mitad-figura"
          style={{ display: isMobile && !mostrarMapa ? "none" : undefined }}
        >
          <MapaFosas
            soloNarrativas
            categoria={categoriaSeleccionada}
            selectedFosa={selectedFosa}
          />
        </div>

        {isMobile && (
          <button
            id="toggle-vista"
            className="toggle-btn"
            onClick={toggleVista}
          >
            <img
              src={mostrarMapa ? listIconButton : mapIconButton}
              alt="Icono"
            />
            {mostrarMapa ? "Mostrar lista" : "Mostrar mapa"}
          </button>
        )}
      </div>
    </div>
  );
}
