"use client";

import { useState, useRef, useEffect } from "react";
import "../../app/styles/intro/_introScreen2.scss";
import BotonesCategorias from "../BotonesCategorias/BotonesCategorias";
import { CATEGORIES } from "./config/constants";
import flechaHistorias from "../../app/assets/flecha-historias-2.svg";
import flechaMapas from "../../app/assets/flecha-mapas.svg";

export default function IntroScreen2({ onNavigation }) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const tooltipRef = useRef(null);
  const historiasBtnRef = useRef(null);
  const containerRef = useRef(null);
  const prevBtnRef = useRef(null);
  const nextBtnRef = useRef(null);

  // Inicializar botones de navegación cuando se abre el tooltip
  useEffect(() => {
    if (tooltipVisible && prevBtnRef.current && nextBtnRef.current) {
      prevBtnRef.current.classList.toggle(
        "at-start",
        currentCategoryIndex === 0
      );
      nextBtnRef.current.classList.toggle(
        "at-end",
        currentCategoryIndex === CATEGORIES.length - 1
      );
    }
  }, [tooltipVisible, currentCategoryIndex]);

  const textContent = [
    "La Guerra Civil y el franquismo convirtieron a España en una gran fosa común. En las últimas décadas se han exhumado los restos de más de 18.000 víctimas. Se estima que más de 20.000 siguen en cementerios, cunetas, pozos y otros lugares donde los responsables de sus asesinatos intentaron ocultar los cuerpos o enterrarlos sin dignidad, para prolongar el castigo a ellos y a sus familias.",
    "Además de los muertos en combate o a causa de los bombardeos, 100.000 personas fueron asesinadas por los sublevados y 55.000 por los republicanos durante la guerra. Después y hasta 1946, la dictadura mató a otras 50.000 personas, a menudo tras juicios sumarísimos sin garantías.",
    "Este es el primer mapa audiovisual de las fosas de la Guerra Civil y el franquismo, donde puedes descubrir las 6.000 fosas de España y recuperar la memoria de algunas de las víctimas. Una parte de la historia que yace aún en la tierra.",
  ];

  const toggleTooltip = () => setTooltipVisible(!tooltipVisible);

  const handleClickOutside = (e) => {
    if (
      tooltipVisible &&
      historiasBtnRef.current &&
      tooltipRef.current &&
      !historiasBtnRef.current.contains(e.target) &&
      !tooltipRef.current.contains(e.target)
    ) {
      setTooltipVisible(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape" && tooltipVisible) setTooltipVisible(false);
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [tooltipVisible]);

  const navigate = (direction) => {
    const total = CATEGORIES.length;
    const nextIndex = (currentCategoryIndex + direction + total) % total;
    setCurrentCategoryIndex(nextIndex);

    // Scroll smooth - buscar el contenedor interno que tiene el scroll
    const outerContainer = containerRef.current;
    const scrollContainer = outerContainer?.querySelector(
      ".botones-categorias"
    );
    const buttons = scrollContainer?.querySelectorAll(".btn-cat");

    if (scrollContainer && buttons && buttons[nextIndex]) {
      const target = buttons[nextIndex];
      const scrollLeft =
        target.offsetLeft -
        scrollContainer.clientWidth / 2 +
        target.clientWidth / 2;
      scrollContainer.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }

    // Actualizar visuales - añadir clase highlighted
    buttons?.forEach((btn, i) => {
      btn.classList.toggle("highlighted", i === nextIndex);
    });

    // Actualizar botones de navegación
    if (prevBtnRef.current && nextBtnRef.current) {
      prevBtnRef.current.classList.toggle("at-start", nextIndex === 0);
      nextBtnRef.current.classList.toggle("at-end", nextIndex === total - 1);
    }
  };

  const handleCategoryChange = (category) => {
    if (onNavigation) {
      onNavigation({ action: "category-selected", data: { category } });
    }
    setTooltipVisible(false);
  };

  return (
    <section
      className="info-screen"
      id="screen2"
      aria-label="Información del proyecto"
    >
      <div className="info-content">
        <div className="text-container">
          <div className="info-text-wrapper">
            {textContent.map((text, idx) => (
              <p className="info-text" key={idx}>
                {text}
              </p>
            ))}
          </div>
          <div className="button-wrapper">
            <button
              className={`btn-historias ${tooltipVisible ? "active" : ""}`}
              ref={historiasBtnRef}
              onClick={toggleTooltip}
            >
              <span>Historias</span>
              <img
                src={flechaHistorias?.src || flechaHistorias}
                alt=""
                className={`flecha-btn ${tooltipVisible ? "rotated" : ""}`}
                aria-hidden="true"
              />
            </button>
            <button
              className="primary-btn"
              onClick={() => (window.location.href = "/mapa")}
              data-link="/mapa"
            >
              <span>Mapa de fosas</span>
              <img
                src={flechaMapas?.src || flechaMapas}
                alt=""
                className="flecha-2-btn"
                aria-hidden="true"
              />
            </button>
            <a href="/mapa" data-link="/mapa" className="text-link-btn">
              <span>Saltar introducción</span>
            </a>
          </div>
        </div>

        <div
          className={`tooltip-categorias ${tooltipVisible ? "" : "hidden"}`}
          ref={tooltipRef}
          style={{ display: tooltipVisible ? "block" : "none" }}
        >
          <div className="vista-figura">
            <BotonesCategorias
              categorias={CATEGORIES}
              onCategoryChange={handleCategoryChange}
              useTooltipStyles={true}
              ref={containerRef}
            />
          </div>
          <div className="bottom-navigation">
            <div className="category-navigation">
              <button
                ref={prevBtnRef}
                className="nav-button prev"
                aria-label="Categoría anterior"
                onClick={() => navigate(-1)}
              >
                ‹
              </button>
              <button
                ref={nextBtnRef}
                className="nav-button next"
                aria-label="Siguiente categoría"
                onClick={() => navigate(1)}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="info-footer">
        <p>
          Un proyecto del equipo de RTVE Noticias. © Corporación de Radio y
          Televisión Española 2025
        </p>
      </div>
    </section>
  );
}
