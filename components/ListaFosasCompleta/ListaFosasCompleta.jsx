"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import "../../app/styles/_listaFosasCompleta.scss";

import upChevron from "../../app/assets/icon-up-chevron.svg";
import downChevron from "../../app/assets/icon-down-chevron.svg";
import pinLineaNarrativa from "../../app/assets/pinUbicacionLineaNarrativa.svg";

const CONFIGURACIONES_CONTEXTO = {
  mapaHistorias: {
    modoSimple: false,
    introVisible: true,
    mostrarCategoria: true,
    mostrarEstado: false,
    tipoContenido: "historias",
    descripcionDefault: "Seleccionar una línea narrativa para explorar.",
  },
};

const ListaFosasCompleta = React.memo(function ListaFosasCompleta({
  contexto = "mapaHistorias",
  lista,
  fosas, // compatibilidad
  renderListaFosas,
  categoria = "todas",
  descripcion,
  modoSimple,
  introVisibleDefault,
  onItemClick,
  onIntroToggle,
}) {
  const configBase =
    CONFIGURACIONES_CONTEXTO[contexto] ||
    CONFIGURACIONES_CONTEXTO.mapaHistorias;

  // usar `lista` si viene, sino `fosas` (compat)
  const items = useMemo(() => {
    const result = Array.isArray(lista)
      ? lista
      : Array.isArray(fosas)
      ? fosas
      : [];
    console.log("📋 ListaFosasCompleta recibe:", {
      contexto,
      totalItems: result.length,
      categoria,
      ejemplos: result.slice(0, 2).map((item) => ({
        id: item?.id,
        municipio: item?.municipio,
        narrativa: item?.linea_narrativa,
      })),
    });
    return result;
  }, [lista, fosas, contexto, categoria]);

  const config = {
    ...configBase,
    modoSimple: modoSimple ?? configBase.modoSimple,
    descripcionDefault: descripcion || configBase.descripcionDefault,
  };

  const [introVisible, setIntroVisible] = useState(
    introVisibleDefault ?? configBase.introVisible
  );

  useEffect(() => {
    // si el padre controla el introVisible por prop (introVisibleDefault)
    setIntroVisible(introVisibleDefault ?? configBase.introVisible);
  }, [introVisibleDefault, configBase.introVisible]);

  const tituloSeccion = "Resumen de la categoría";

  const mensajeContador = (() => {
    const tipoContenido = config.tipoContenido || "elementos";
    let mensaje = `Se muestran ${items.length} ${tipoContenido}`;
    if (config.mostrarCategoria && categoria && categoria !== "todas") {
      mensaje += ` de ${categoria[0].toUpperCase() + categoria.slice(1)}`;
    }
    return mensaje;
  })();

  const mensajeVacio =
    items.length === 0
      ? "No se encontraron historias para esta categoría."
      : "";

  console.log("🎨 ListaFosasCompleta renderizando:", {
    contexto,
    totalItems: items.length,
    introVisible,
    config: config.tipoContenido,
    mensajeVacio,
  });

  const toggleIntro = () => {
    const nuevo = !introVisible;
    setIntroVisible(nuevo);
    onIntroToggle?.(nuevo);
  };

  // renderer por defecto — devuelve JSX
  const defaultRender = (listaItems = [], callback) => {
    if (!Array.isArray(listaItems) || listaItems.length === 0)
      return <p className="no-resultados">{mensajeVacio}</p>;

    return listaItems.map((fosa) => {
      // seguridad: garantizar id
      const key = fosa?.id ?? Math.random().toString(36).slice(2, 9);
      const ubicacion = [fosa.municipio, fosa.provincia]
        .filter(Boolean)
        .join(" / ");
      const titulo =
        (fosa.title && fosa.title.trim()) ||
        `Historia en ${fosa.municipio || "ubicación desconocida"}`;
      const descripcionItem =
        (fosa.detalle_linea_narrativa && fosa.detalle_linea_narrativa.trim()) ||
        (fosa.status && `Estado: ${fosa.status.trim()}`) ||
        (fosa.event_date && `Fecha: ${fosa.event_date}`) ||
        "Historia con línea narrativa disponible";

      return (
        <div
          className="fosa"
          data-id={fosa.id}
          key={key}
          onClick={() => callback?.(fosa)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") callback?.(fosa);
          }}
        >
          <div className="fosa__img">
            <img
              src={
                fosa.foto ||
                "https://fotografias.larazon.es/clipping/cmsimages02/2024/11/15/93DFFB09-1D04-4088-99A5-94DC549EE9EC/hallada-fosa-comun-cementerio-val-51-victimas-franquismo_98.jpg?crop=1200,675,x0,y113&width=1900&height=1069&optimize=low&format=webply"
              }
              alt={titulo}
            />
          </div>
          <div className="info">
            <p className="ubicacion">
              <strong>{fosa.municipio}</strong> / {fosa.provincia}
            </p>
            <p className="descripcion">{titulo}</p>
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <p
        className="contador"
        dangerouslySetInnerHTML={{ __html: mensajeContador }}
      />
      <div className="lista-fosas" data-contexto={contexto}>
        {!config.modoSimple ? (
          <>
            {contexto === "mapaHistorias" && (
              <div
                className={`intro-fosas ${introVisible ? "visible" : "oculto"}`}
              >
                <h4 className="intro-fosas__title">{tituloSeccion}</h4>
                <p className="intro-fosas__text">{config.descripcionDefault}</p>
                <div className="hide-button">
                  <button className="toggle-intro" onClick={toggleIntro}>
                    <span>
                      {introVisible ? "Menos información" : "Más información"}
                    </span>
                    <Image
                      src={introVisible ? upChevron : downChevron}
                      alt=""
                      width={18}
                      height={18}
                    />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="contador-simple">
            Se muestran {descripcion || `${items.length} resultados`}
          </p>
        )}

        <div className="lista-narrativas">
          {items.length > 0 ? (
            // si se pasó renderListaFosas usarla, sino fallback
            renderListaFosas ? (
              (() => {
                console.log("🔧 Usando renderListaFosas personalizada");
                const result = renderListaFosas(items, onItemClick);
                console.log(
                  "🔧 Resultado de renderListaFosas:",
                  typeof result,
                  result
                );
                // Si es string HTML, convertir a JSX usando dangerouslySetInnerHTML
                if (typeof result === "string") {
                  return <div dangerouslySetInnerHTML={{ __html: result }} />;
                }
                return result;
              })()
            ) : (
              (() => {
                console.log("🔧 Usando defaultRender");
                return defaultRender(items, onItemClick);
              })()
            )
          ) : (
            <p className="no-resultados">{mensajeVacio}</p>
          )}
        </div>
      </div>
    </>
  );
});

export default ListaFosasCompleta;
