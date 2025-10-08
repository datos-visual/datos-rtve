"use client";

import { useEffect, useRef, useState } from "react";
import "../../app/styles/intro/_introScreen3.scss";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { PERSONAJES_DATA, INTRO_CONFIG } from "./config/constants";
// URLs absolutas del CDN para evitar hashes
const flechaVolver = "https://css.rtve.es/css/rtve.infografias/fosas_franquismo/i/flecha-volver.svg";

// Import personajes images
const personaje5 = "https://css.rtve.es/css/rtve.infografias/fosas_franquismo/i/personajes/5.png";
const personaje6 = "https://css.rtve.es/css/rtve.infografias/fosas_franquismo/i/personajes/6.png";
const personaje7 = "https://css.rtve.es/css/rtve.infografias/fosas_franquismo/i/personajes/7.png";
const personaje8 = "https://css.rtve.es/css/rtve.infografias/fosas_franquismo/i/personajes/8.png";
const personaje9 = "https://css.rtve.es/css/rtve.infografias/fosas_franquismo/i/personajes/9.png";
const personaje10 = "https://css.rtve.es/css/rtve.infografias/fosas_franquismo/i/personajes/10.png";
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
  const contentTit = useRef(null);

  

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
        // 1. Establece los estados iniciales.
        // Asegúrate de que ambos elementos estén en el punto de partida (y=20, opacity=0)
        // si quieres que ambos 'aparezcan'.
        gsap.set(contentRef.current, { opacity: 0, y: 20 });
        // Si contentTit DEBE estar visible al inicio, déjalo en opacity: 1, pero
        // en este ejemplo lo configuraré para que también se mueva/desaparezca.
        gsap.set(contentTit.current, { opacity: 1, y: 0 }); // Dejemos contentTit visible y solo haremos que contentRef aparezca.

        // 2. Crea un Timeline para que ScrollTrigger lo controle.
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#screen3",
                start: "top top",
                end: "+=40%",
                pin: true,
                scrub: true, // Esto vincula el scroll al progreso del timeline
            },
        });

        // 3. Agrega las animaciones al Timeline.
        // Animación de 'desaparición' de contentTit (si quieres que se oculte):
        // Pasa de opacity: 1, y: 0 a opacity: 0, y: -20 (se mueve hacia arriba).
        tl.to(contentTit.current, {
            opacity: 0,
            height: 0, // Se mueve 20px hacia arriba mientras el otro aparece
            duration: 1,
            marginBottom: 0,
        }, 0); // La '0' asegura que comience al mismo tiempo que contentRef

        // Animación de 'aparición' de contentRef:
        // Pasa de y: 20, opacity: 0 (el estado inicial que definiste) a y: 0, opacity: 1.
        tl.to(contentRef.current, {
            opacity: 1,
            y: 0, // Posición final (sube 20px)
            duration: 1, // Duración relativa dentro del timeline (no afecta la velocidad de scroll)
        }, 0); // La '0' asegura que comience al inicio del timeline

        // Guarda la instancia del ScrollTrigger para controlarla más tarde si es necesario
        animationsRef.current.reveal = tl.scrollTrigger;
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
            <h2 className="titulo-destacado" ref={contentTit}>{data.titulo}</h2>
            <p className="personaje-resumen">
              <strong>{data.nombre}</strong> / {data.edad}
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
