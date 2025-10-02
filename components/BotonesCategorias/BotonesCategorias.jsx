"use client";

import React, { useState, useEffect, forwardRef, useRef } from "react";
import { createPortal } from "react-dom";
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

    const toggleRef = useRef(null);
    const menuRef = useRef(null);
    const [menuRect, setMenuRect] = useState(null);

    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth <= 768);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
      // when opening, measure toggle button to position the menu
      if (dropdownOpen && toggleRef.current) {
        const rect = toggleRef.current.getBoundingClientRect();
        setMenuRect({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
          width: Math.max(rect.width, 200),
        });
      }
    }, [dropdownOpen]);

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
            ? "Exhumaciones Tempranas"
            : cat === "lugares"
            ? "Lugares"
            : cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();

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
              minWidth: "clamp(90px, 10vw + 60px, 32%)",
              maxWidth: "clamp(90px, 10vw + 60px, 32%)",
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
            ? "Exhumaciones Tempranas"
            : cat === "lugares"
            ? "Lugares"
            : cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();

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
    

    // MOBILE: render dropdown and overlay into document.body usando portal
    if (isMobile) {
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

      const menu = (
        <div
          ref={menuRef}
          id="dropdown-menu"
          role="menu"
          aria-hidden={!dropdownOpen}
          style={{
            top: menuRect ? menuRect.top : "auto",
            left: menuRect ? menuRect.left : 0,
            width: menuRect ? menuRect.width : "100%",
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
                role="menuitem"
                onClick={() => handleSelect(cat)}
              >
                <img
                  src={
                    ICONOS_POR_DEFECTO[cat]?.src ||
                    ICONOS_POR_DEFECTO[cat] ||
                    ""
                  }
                  alt={cat}
                />
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      );

      const overlay = (
        <div
          onClick={() => setDropdownOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 900,
          }}
        />
      );

      return (
        <div className="categorias-dropdown custom-dropdown" ref={ref}>
          <button
            id="dropdown-toggle"
            ref={toggleRef}
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen((s) => !s);
            }}
            aria-haspopup="menu"
            aria-expanded={dropdownOpen}
            style={{ display: "flex", alignItems: "center", width: "100%" }}
          >
            <span>
              {labelSeleccionada}
            </span>
            <span>&#9662;</span>
          </button>

          {/* Render portal only on client and when open */}
          {typeof document !== "undefined" && dropdownOpen
            ? createPortal(
                <>
                  {overlay}
                  {menu}
                </>,
                document.body
              )
            : null}
        </div>
      );
    }

    // Desktop - estructura normal
    return (
      <div className="botones-categorias normal-version" ref={ref}>
        {renderNormalButtons()}
      </div>
    );
  }
);

BotonesCategorias.displayName = "BotonesCategorias";

export default BotonesCategorias;
