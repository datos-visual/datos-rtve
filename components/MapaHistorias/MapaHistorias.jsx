"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import "../../app/styles/_mapaHistorias.scss";
import MapaFosas from "../mapa/MapaFosas";
import FichaFosa from "../FichaFosa/FichaFosa";
import BotonesCategorias from "../BotonesCategorias/BotonesCategorias";
import ListaFosasCompleta from "../ListaFosasCompleta/ListaFosasCompleta";
import { cargarFosas } from "../../app/lib/datos.js";
import { useResponsive } from "../../app/hooks/useResponsive";
import pinLineaNarrativa from "../../app/assets/pinUbicacionLineaNarrativa.svg";
import mapIconButton from "../../app/assets/mapIconButton.svg";
import listIconButton from "../../app/assets/listIconButton.svg";

const CATEGORIAS = [
  "todas", // TODOS
  "represion", // REPRESALIADOS
  "mujeres", // MUJERES
  "lugares", // LUGARES
  "objetos", // OBJETOS
  "personajes", // NOMBRES PROPIOS
  "Exhumaciones", // EXHUMACIONES TEMPRANAS
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
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState(initialCategoria);

  // Actualizar categoría cuando cambie la prop initialCategoria
  useEffect(() => {
    setCategoriaSeleccionada(initialCategoria);
  }, [initialCategoria]);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("todos");
  const [introVisible, setIntroVisible] = useState(false);
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [selectedFosa, setSelectedFosa] = useState(initialSelectedFosa);
  const [mapaInstance, setMapaInstance] = useState(null);
  const mapaRef = useRef(null);
  const cargaIniciadaRef = useRef(false);
  const { isMobile, isHydrated } = useResponsive();
  // Destacados
  const [fosasConDestacado, setFosasConDestacado] = useState({});
  const [cargandoDestacados, setCargandoDestacados] = useState(false);
  // Visibles en mapa para sincronizar contador/viewport
  const [fosasVisiblesEnMapa, setFosasVisiblesEnMapa] = useState([]);

  // Obtener instancia del mapa cuando esté disponible
  useEffect(() => {
    const checkMapa = () => {
      if (mapaRef.current?.map) {
        setMapaInstance(mapaRef.current.map);
      }
    };

    // Verificar inmediatamente
    checkMapa();

    // Verificar periódicamente hasta que el mapa esté disponible
    const interval = setInterval(checkMapa, 100);

    return () => clearInterval(interval);
  }, []);

  // Track visibilidad del mapa (para contador/filtrado por viewport si se desea)
  useEffect(() => {
    const interval = setInterval(() => {
      const current = mapaRef.current;
      if (current && Array.isArray(current.fosasVisibles)) {
        setFosasVisiblesEnMapa(current.fosasVisibles);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Cargar datos (una sola vez)
  useEffect(() => {
    // Evitar doble carga en React StrictMode
    if (cargaIniciadaRef.current) return;
    cargaIniciadaRef.current = true;

    const cargar = async () => {
      setCargando(true);
      setError(null);

      try {
        const todas = await cargarFosas();

        const filtradas = todas.filter(
          (f) =>
            typeof f.linea_narrativa === "string" &&
            f.linea_narrativa.trim() &&
            f.linea_narrativa.trim().toLowerCase() !== "null"
        );

        setFosas(filtradas);
        setCargando(false);

        // Si nos pasan una fosa inicial pero aún no está en state, fijarla
        if (initialSelectedFosa) {
          const encontrada = filtradas.find(
            (f) => f.id === initialSelectedFosa.id
          );
          if (encontrada) setSelectedFosa(encontrada);
        }
      } catch (err) {
        setError(err.message || "Error al cargar datos");
        setCargando(false);
      }
    };

    cargar();
  }, []); // Sin dependencias para cargar solo una vez

  // Descripción de categoría
  const descripcionCategoria = useMemo(
    () =>
      categoriaSeleccionada in TEXTOS_CATEGORIA
        ? TEXTOS_CATEGORIA[categoriaSeleccionada]
        : TEXTOS_CATEGORIA["todas"],
    [categoriaSeleccionada]
  );

  // Construir destacados desde JSON_URL (sin fetch por fosa)
  useEffect(() => {
    if (!Array.isArray(fosas) || fosas.length === 0) {
      setFosasConDestacado({});
      setCargandoDestacados(false);
      return;
    }

    const imagenes = {};
    for (const fosa of fosas) {
      if (fosa?.destacado && fosa?.destacado_thumbnail) {
        imagenes[fosa.id] = {
          thumbnail: fosa.destacado_thumbnail,
          tipo: fosa.destacado.tipo,
          url: fosa.destacado.url ?? null,
          id: fosa.destacado.id ?? null,
        };
      }
    }

    setFosasConDestacado(imagenes);
    setCargandoDestacados(false);
  }, [fosas]);

  // Filtrado de fosas
  const fosasFiltradas = useMemo(() => {
    let res = fosas;
    if (categoriaSeleccionada !== "todas") {
      const getSynonyms = (cat) => {
        const c = (cat || "").toLowerCase();
        if (c === "personajes") return ["personajes", "nombres propios"];
        if (c === "represion")
          return ["represion", "represión", "represaliado", "represaliados"];
        if (c === "exhumaciones")
          return [
            "exhumacion",
            "exhumación",
            "exhumaciones",
            "exhumacion temprana",
            "exhumación temprana",
          ];
        return [c];
      };

      const synonyms = getSynonyms(categoriaSeleccionada);
      res = res.filter((f) => {
        const ln = (f.linea_narrativa || "").toLowerCase();
        return synonyms.some((s) => ln.includes(s));
      });
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

  // Ordenación: destacados primero
  const ordenOriginal = useMemo(() => {
    const map = new Map();
    fosasFiltradas.forEach((f, idx) => map.set(f.id, idx));
    return map;
  }, [fosasFiltradas]);

  const fosasOrdenadas = useMemo(() => {
    return [...fosasFiltradas].sort((a, b) => {
      const scoreA = fosasConDestacado[a.id]
        ? 2
        : a.section_id || a.isInDedalo || a.linea_narrativa
        ? 1
        : 0;
      const scoreB = fosasConDestacado[b.id]
        ? 2
        : b.section_id || b.isInDedalo || b.linea_narrativa
        ? 1
        : 0;
      if (scoreA !== scoreB) return scoreB - scoreA;
      return (ordenOriginal.get(a.id) || 0) - (ordenOriginal.get(b.id) || 0);
    });
  }, [fosasFiltradas, fosasConDestacado, ordenOriginal]);

  const toggleVista = () => setMostrarMapa((prev) => !prev);
  const abrirModalFosa = (fosa) => {
    setSelectedFosa(fosa);

    // Hacer zoom hacia la fosa seleccionada
    if (mapaRef.current && mapaRef.current.focusFosa) {
      mapaRef.current.focusFosa(fosa.id);
    }
  };
  const cerrarModalFosa = () => {
    setSelectedFosa(null);
  };

  // Mostrar estado de carga
  if (cargando) {
    return (
      <div className="vista-figura">
        <div
          className="contenido desktop"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <p style={{ color: "white", fontSize: "18px" }}>
            Cargando datos del mapa...
          </p>
        </div>
      </div>
    );
  }

  // Mostrar error si hay
  if (error) {
    return (
      <div className="vista-figura">
        <div
          className="contenido desktop"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <p style={{ color: "#ff6b6b", fontSize: "18px" }}>Error: {error}</p>
        </div>
      </div>
    );
  }

  // Evitar mismatch de hydration
  if (!isHydrated) {
    return (
      <div className="vista-figura">
        <div className="contenido desktop">
          <div className="mitad-texto">
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
                  lista={fosasOrdenadas}
                  map={mapaInstance}
                  descripcion={descripcionCategoria}
                  introVisibleDefault={introVisible}
                  onItemClick={abrirModalFosa}
                  imagenesDestacadas={fosasConDestacado}
                  filtrarPorViewport={false}
                  permitirCambioViewport={false}
                  fosasVisiblesExternas={fosasVisiblesEnMapa}
                />
              </>
            )}
          </div>

          <div className="mitad-figura">
            <MapaFosas
              ref={mapaRef}
              soloNarrativas
              categoria={categoriaSeleccionada}
              selectedFosa={selectedFosa}
              onFosaSelect={abrirModalFosa}
              fosasFiltradas={fosasFiltradas}
            />
          </div>
        </div>
      </div>
    );
  }

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

              {/* dropdown na lista (lado esquerdo) */}
              <BotonesCategorias
                categorias={CATEGORIAS}
                seleccionada={categoriaSeleccionada}
                onChange={setCategoriaSeleccionada}
              />

              <ListaFosasCompleta
                contexto="mapaHistorias"
                lista={fosasOrdenadas}
                map={mapaInstance}
                descripcion={descripcionCategoria}
                introVisibleDefault={introVisible}
                onItemClick={abrirModalFosa}
                imagenesDestacadas={fosasConDestacado}
                filtrarPorViewport={false}
                permitirCambioViewport={false}
                fosasVisiblesExternas={fosasVisiblesEnMapa}
              />
            </>
          )}
        </div>

        <div
          className="mitad-figura"
          style={{
            display: isMobile && !mostrarMapa ? "none" : undefined,
          }}
        >
          {isMobile && (
            <div
              style={{
                position: "absolute",
                top: -50,
                left: 12,
                right: 12,
                zIndex: 1200,
                pointerEvents: "auto",
                padding: "0 6px",
              }}
            >
              <BotonesCategorias
                categorias={CATEGORIAS}
                seleccionada={categoriaSeleccionada}
                onChange={setCategoriaSeleccionada}
              />
            </div>
          )}

          <MapaFosas
            ref={mapaRef}
            soloNarrativas
            categoria={categoriaSeleccionada}
            selectedFosa={selectedFosa}
            onFosaSelect={abrirModalFosa}
            fosasFiltradas={fosasFiltradas}
          />
        </div>

        {isMobile && isHydrated && (
          <button
            id="toggle-vista"
            className="toggle-btn"
            onClick={toggleVista}
          >
            <img
              src={mostrarMapa ? listIconButton.src : mapIconButton.src}
              alt="Icono"
            />
            {mostrarMapa ? "Mostrar lista" : "Mostrar mapa"}
          </button>
        )}
      </div>
    </div>
  );
}
