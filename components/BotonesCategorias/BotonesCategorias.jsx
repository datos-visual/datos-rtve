"use client";

import { useState, useEffect, forwardRef } from "react";
import "../../app/styles/_botonesCategorias.scss";

import iconFiltro from "../../app/assets/iconFiltro.svg";
import iconExhumados from "../../app/assets/iconFiltroExhumados.svg";
import iconLugares from "../../app/assets/iconFiltroLugares.svg";
import iconMujeres from "../../app/assets/iconFiltroMujeres.svg";
import iconObjetos from "../../app/assets/iconFiltroObjetos.svg";
import iconPersonajes from "../../app/assets/iconFiltroPersonajes.svg";
import iconRepresion from "../../app/assets/iconFiltroRepresion.svg";
import lineHistoria from "../../app/assets/line-historia.svg";

const ICONOS_POR_DEFECTO = {
  todas: iconFiltro,
  represion: iconRepresion,
  mujeres: iconMujeres,
  lugares: iconLugares,
  personajes: iconPersonajes,
  objetos: iconObjetos,
  Exhumaciones: iconExhumados,
};

const BotonesCategorias = forwardRef(
  (
    {
      categorias,
      seleccionada: seleccionadaProp = "todas",
      onChange,
      onCategoryChange,
      useTooltipStyles = false, // Nuevo prop para usar estilos del tooltip
    },
    ref
  ) => {
    const [seleccionada, setSeleccionada] = useState(seleccionadaProp);
    const [isMobile, setIsMobile] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth <= 768);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const handleSelect = (cat) => {
      setSeleccionada(cat);
      setDropdownOpen(false);
      if (onChange) onChange(cat);
      if (onCategoryChange) onCategoryChange(cat);
    };

    if (!categorias || categorias.length === 0) return null;

    // Renderizar botones para versión TOOLTIP (horizontal scroll)
    const renderTooltipButtons = () => {
      return categorias.map((cat) => {
        const activa = seleccionada === cat;
        const label =
          cat === "Exhumaciones"
            ? "EXHUMACIONES TEMPRANAS"
            : cat === "lugares"
            ? "LUGARES DESTACADOS"
            : capitalize(cat).toUpperCase();

        return (
          <button
            key={cat}
            className={`btn-cat btn-cat--${cat} ${activa ? "activa" : ""}`}
            data-cat={cat}
            onClick={() => handleSelect(cat)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              minWidth: "clamp(90px, 10vw + 60px, 120px)",
              maxWidth: "clamp(90px, 10vw + 60px, 120px)",
              flexShrink: 0,
              gap: "0px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            <img
              src={
                ICONOS_POR_DEFECTO[cat]?.src || ICONOS_POR_DEFECTO[cat] || ""
              }
              alt={cat}
              className="category-icon"
            />
            <span className="category-text">{label}</span>
            <img
              src={lineHistoria?.src || lineHistoria}
              alt=""
              className="category-line"
              aria-hidden="true"
            />
          </button>
        );
      });
    };

    // Renderizar botones para versión NORMAL (mapaHistorias)
    const renderNormalButtons = () => {
      return categorias.map((cat) => {
        const activa = seleccionada === cat;
        const label =
          cat === "Exhumaciones"
            ? "EXHUMACIONES TEMPRANAS"
            : cat === "lugares"
            ? "LUGARES DESTACADOS"
            : capitalize(cat).toUpperCase();

        return (
          <button
            key={cat}
            className={`btn-cat btn-cat--${cat} ${activa ? "activa" : ""}`}
            data-cat={cat}
            onClick={() => handleSelect(cat)}
          >
            <img
              src={
                ICONOS_POR_DEFECTO[cat]?.src || ICONOS_POR_DEFECTO[cat] || ""
              }
              alt={cat}
              className="category-icon"
            />
            <span className="category-text">{label}</span>
            <img
              src={lineHistoria?.src || lineHistoria}
              alt=""
              className="category-line"
              aria-hidden="true"
            />
          </button>
        );
      });
    };

    // Tooltip styles - SIEMPRE usar iconos circulares (tanto desktop como móvil)
    if (useTooltipStyles) {
      return (
        <div className="botones-categorias tooltip-version" ref={ref}>
          <div
            className="botones-categorias"
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "clamp(8px, 3vw, 12px)",
              overflowX: "auto",
              overflowY: "hidden",
              padding: "8px clamp(12px, 4vw, 20px)",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {renderTooltipButtons()}
          </div>
        </div>
      );
    }

    // Mobile (solo cuando NO es tooltip)
    if (isMobile) {
      const iconoSeleccionado =
        ICONOS_POR_DEFECTO[seleccionada]?.src ||
        ICONOS_POR_DEFECTO[seleccionada] ||
        "";
      const labelSeleccionada =
        seleccionada === "Exhumaciones"
          ? "Exhumaciones tempranas"
          : seleccionada === "lugares"
          ? "Lugares destacados"
          : capitalize(seleccionada);

      return (
        <div className="categorias-dropdown custom-dropdown">
          <button
            id="dropdown-toggle"
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(!dropdownOpen);
            }}
          >
            <img
              src={iconoSeleccionado}
              alt={seleccionada}
              style={{ width: 24, height: 24, marginRight: 8 }}
            />
            <span style={{ flex: 1, textAlign: "left" }}>
              {labelSeleccionada}
            </span>
            <span style={{ marginLeft: "auto" }}>&#9662;</span>
          </button>

          {dropdownOpen && (
            <div
              id="dropdown-menu"
              style={{
                position: "absolute",
                top: "110%",
                left: 0,
                width: "100%",
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: 6,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                zIndex: 10,
              }}
            >
              {categorias.map((cat) => {
                const label =
                  cat === "Exhumaciones"
                    ? "Exhumaciones tempranas"
                    : cat === "lugares"
                    ? "Lugares destacados"
                    : capitalize(cat);

                return (
                  <div
                    key={cat}
                    className="dropdown-option"
                    data-cat={cat}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "8px 12px",
                      cursor: "pointer",
                    }}
                    onClick={() => handleSelect(cat)}
                  >
                    <img
                      src={
                        ICONOS_POR_DEFECTO[cat]?.src ||
                        ICONOS_POR_DEFECTO[cat] ||
                        ""
                      }
                      alt={cat}
                      style={{ width: 20, height: 20, marginRight: 8 }}
                    />
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {dropdownOpen && (
            <div
              onClick={() => setDropdownOpen(false)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 5,
              }}
            />
          )}
        </div>
      );
    }

    // Desktop - estructura normal (mapaHistorias)
    return (
      <div className="botones-categorias normal-version" ref={ref}>
        {renderNormalButtons()}
      </div>
    );
  }
);

BotonesCategorias.displayName = "BotonesCategorias";

export default BotonesCategorias;
