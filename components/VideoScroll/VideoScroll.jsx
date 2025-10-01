"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../../app/styles/_videoScroll.scss";

// Registrar ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

export default function VideoScroll({
  children,
  duration = 23,
  pixelsPerSecond = 150,
  cards = [], // Array de cards con timing
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const videoContainerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isSmallScreen = window.innerWidth <= 768;

      setIsMobile(mobileRegex.test(userAgent) || isSmallScreen);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    const videoContainer = videoContainerRef.current;

    if (!video || !container || !videoContainer) return;

    // Calcular scroll total basado en duración y velocidad
    const totalScrollHeight = duration * pixelsPerSecond;

    // Configurar video
    video.pause();
    video.currentTime = 0;
    video.muted = true;

    // Limpiar ScrollTriggers existentes
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

    // Crear ScrollTrigger para controlar el video
    const scrollTrigger = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: `+=${totalScrollHeight}`, // Scroll proporcional al video
      scrub: 0, // Sincronización inmediata
      pin: false,
      onUpdate: (self) => {
        // Control directo del video basado en progreso del scroll
        const progress = self.progress; // 0 to 1
        const targetTime = progress * duration;

        video.currentTime = targetTime;

        // Ocultar video cuando termine completamente
        if (progress >= 1) {
          videoContainer.style.display = "none"; // Eliminar completamente del layout
        } else {
          videoContainer.style.display = "block";
          videoContainer.style.opacity = "1";
          videoContainer.style.pointerEvents = "none";
          videoContainer.style.visibility = "visible";
        }

        // Controlar visibilidad de cards basado en timing
        cards.forEach((card, index) => {
          const cardElement = document.getElementById(`video-card-${index}`);
          if (cardElement) {
            const showTime = card.showAt || 0; // Tiempo en segundos cuando aparece
            const hideTime = card.hideAt || duration; // Tiempo cuando desaparece

            if (targetTime >= showTime && targetTime < hideTime) {
              cardElement.style.opacity = card.visible !== false ? "1" : "0";
              cardElement.style.transform = "translate(-50%, -50%)";
            } else {
              cardElement.style.opacity = "0";
              cardElement.style.transform = "translate(-50%, -50%)";
            }
          }
        });
      },
      onRefresh: () => {},
    });

    // Cleanup
    return () => {
      scrollTrigger.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [duration, pixelsPerSecond, isMobile]);

  return (
    <div ref={containerRef} className="video-scroll-container">
      {/* Video fijo de fondo */}
      <div
        ref={videoContainerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          zIndex: 1,
          transition: "opacity 0.5s ease-out", // Transición suave al desaparecer
        }}
      >
        <video
          ref={videoRef}
          src={
            isMobile
              ? "/videos/VersionMobile.mp4"
              : "/videos/VersionDesktop.mp4"
          }
          preload="auto"
          muted
          playsInline
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
          }}
          onLoadedMetadata={() => {}}
          onError={(e) => {}}
        />
      </div>

      {/* Cards controladas por VideoScroll */}
      {cards.map((card, index) => (
        <div
          key={index}
          id={`video-card-${index}`}
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: card.zIndex || 60,
            opacity: "0",
            transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
            pointerEvents: card.interactive ? "auto" : "none",
            maxWidth: card.maxWidth || "800px",
            width: "90%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="intro-text"
            style={{
              padding: card.padding || "30px",
              background: card.background || "rgba(255,255,255,0.9)",
              borderRadius: card.borderRadius || "10px",
              backdropFilter: card.backdropFilter || "blur(10px)",
              textAlign: card.textAlign || "center",
              //fontSize: card.fontSize || '18px',
              fontWeight: card.fontWeight || "400",
              color: card.color || "#333",
              fontFamily: card.fontFamily || "__Merriweather_9dd3c0",
            }}
          >
            {card.content}
          </div>
        </div>
      ))}

      {/* Espaciador para crear el scroll necesario */}
      <div
        style={{
          height: `${duration * pixelsPerSecond}px`,
          backgroundColor: "transparent",
        }}
      />

      {/* Contenido que aparece después del video */}
      <div className="content-after-video">{children}</div>
    </div>
  );
}
