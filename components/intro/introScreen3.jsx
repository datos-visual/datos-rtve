"use client";

import { useEffect, useRef, useState } from "react";
import "../../app/styles/intro/_introScreen3.scss";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { PERSONAJES_DATA, INTRO_CONFIG } from "./config/constants";
import flechaVolver from "../../app/assets/flecha-volver.svg";

// Import personajes images
import personaje5 from "../../app/assets/personajes/5.png";
import personaje6 from "../../app/assets/personajes/6.png";
import personaje7 from "../../app/assets/personajes/7.png";
import personaje8 from "../../app/assets/personajes/8.png";
import personaje9 from "../../app/assets/personajes/9.png";
import personaje10 from "../../app/assets/personajes/10.png";
import ScrollButton from "../ScrollButton/ScrollButton";

const PERSONAJES_IMAGES = {
  "5.png": personaje5,
  "6.png": personaje6,
  "7.png": personaje7,
  "8.png": personaje8,
  "9.png": personaje9,
  "10.png": personaje10,
};

gsap.registerPlugin(ScrollTrigger, Draggable);

export default function IntroScreen3({ categoria = "mujeres", onNavigation }) {
  const [currentCategoria, setCurrentCategoria] = useState(categoria);
  const animationsRef = useRef({});
  const sheetRef = useRef(null);
  const handleRef = useRef(null);
  const contentRef = useRef(null);

  const data = PERSONAJES_DATA[currentCategoria];
  if (!data) return null;

  // Cleanup animations
  const cleanupAnimations = () => {
    Object.values(animationsRef.current).forEach((anim) => anim?.kill?.());
    animationsRef.current = {};
  };

  useEffect(() => {
    cleanupAnimations();

    // Desktop reveal
    if (
      window.innerWidth > INTRO_CONFIG.breakpoints.tablet &&
      contentRef.current
    ) {
      gsap.set(contentRef.current, { opacity: 0, y: 20 });
      animationsRef.current.reveal = ScrollTrigger.create({
        trigger: "#screen3",
        start: "top top",
        end: "+=40%",
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          const progress = Math.max(0, Math.min(1, self.progress));
          gsap.to(contentRef.current, {
            opacity: progress,
            y: 20 * (1 - progress),
            duration: 0.1,
            ease: "power2.out",
          });
        },
      });
    }

    // Mobile sheet
    if (
      window.innerWidth <= INTRO_CONFIG.breakpoints.mobile &&
      sheetRef.current &&
      handleRef.current
    ) {
      const sheet = sheetRef.current;
      const handle = handleRef.current;
      const peek = 80;
      const height = Math.min(
        window.innerHeight * 0.9,
        window.innerHeight - 50
      );
      const closedY = height - peek;

      sheet.style.height = `${height}px`;
      gsap.set(sheet, { y: closedY });

      animationsRef.current.draggable = Draggable.create(sheet, {
        type: "y",
        bounds: { minY: 0, maxY: closedY },
        inertia: true,
        onDragEnd: () => {
          const y = gsap.getProperty(sheet, "y");
          const target = y < closedY / 2 ? 0 : closedY;
          gsap.to(sheet, { y: target, duration: 0.3, ease: "power2.out" });
        },
      })[0];

      handle.addEventListener("click", () => {
        const currentY = gsap.getProperty(sheet, "y");
        const target = currentY < closedY / 2 ? closedY : 0;
        gsap.to(sheet, { y: target, duration: 0.3, ease: "power2.out" });
      });
    }

    return () => cleanupAnimations();
  }, [currentCategoria]);

  const handleScrollButtonClick = () => {
    onNavigation?.({
      action: "go-to-historias",
      data: { categoria: currentCategoria },
    });
  };

  return (
    <section className="personaje-screen" id="screen3">
      <div className="personaje-container">
        <a href="/" className="btn-volver">
          <img src={flechaVolver?.src || flechaVolver} alt="" />
          <span>Volver a inicio</span>
        </a>

        <div className="row">
          <div className="mitad-izquierda">
            <p className="categoria-label">{data.categoria}</p>
            <h2 className="titulo-destacado">{data.titulo}</h2>
            <p className="personaje-resumen">
              {data.nombre} / {data.edad}
            </p>

            <div className="continuar-historias">
              <ScrollButton
                label="Conoce más historias"
                animated={true}
                icon="mouse"
                onClick={handleScrollButtonClick}
              />
            </div>

            <div className="personaje-historia" ref={sheetRef}>
              <div className="sheet-handle" ref={handleRef}></div>
              <div className="historia-content" ref={contentRef}>
                <div className="mobile-header">
                  <p className="personaje-resumen-mobile">
                    {data.nombre} / {data.edad}
                  </p>
                  <h2 className="titulo-destacado-mobile">{data.titulo}</h2>
                </div>
                <p className="historia-principal">{data.historia}</p>
                <p className="historia-contexto">{data.contexto}</p>
              </div>
            </div>
          </div>

          <div className="mitad-derecha">
            <div className="personaje-visual">
              <img
                src={
                  PERSONAJES_IMAGES[data.svg]?.src ||
                  PERSONAJES_IMAGES[data.svg] ||
                  `../../assets/personajes/${data.svg}`
                }
                alt={data.nombre}
                className="personaje-img"
              />
            </div>
            <div className="categoria-mobile">{data.categoria}</div>
            <div className="texto-flotante-mobile">{data.categoria}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
