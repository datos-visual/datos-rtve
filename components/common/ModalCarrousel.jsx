"use client";

import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import "../../app/styles/_modalCarrousel.scss";

const ModalCarrousel = forwardRef(function ModalCarrousel(
  { contenidos = [], destacados = [], imagenes = [], videos = [], onClose, startIndex = 0, contentType = "imagenes" },
  ref
) {
  const [visible, setVisible] = useState(false);
  const [idx, setIdx] = useState(0);
  const modalRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  
  // Usar contenidos si están disponibles, sino usar imagenes/videos antiguos
  const items = contenidos.length > 0 ? contenidos : (contentType === "videos" ? videos : imagenes);
  const itemsDestacados = destacados.length > 0;

  // Abrir modal
  const open = (startIdx = 0) => {
    setIdx(startIdx);
    setVisible(true);
  };

  // Cerrar modal
  const close = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  // Navegar entre imágenes/videos/contenidos
  const mostrar = (i) => {
    if (!items.length) return;
    const newIdx = (i + items.length) % items.length;
    setIdx(newIdx);
  };

  // Exponer métodos via ref
  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
      mostrar,
    }),
    [items, contenidos, imagenes, videos, contentType]
  );

  // Exponer métodos para compatibilidad con Web Component
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.open = open;
      modalRef.current.close = close;
      modalRef.current.mostrar = mostrar;
    }
  }, [items, contenidos, imagenes, videos, contentType]);

  // Manejar teclas de navegación y scroll
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case "Escape":
          close();
          break;
        case "ArrowLeft":
          mostrar(idx - 1);
          break;
        case "ArrowRight":
          mostrar(idx + 1);
          break;
      }
    };

    const handleWheel = (e) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        // Scroll hacia abajo - siguiente imagen
        mostrar(idx + 1);
      } else {
        // Scroll hacia arriba - imagen anterior
        mostrar(idx - 1);
      }
    };

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartRef.current.x = touch.clientX;
      touchStartRef.current.y = touch.clientY;
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
    };

    const handleTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const minSwipeDistance = 50;

      // Determinar si es un swipe horizontal o vertical
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Swipe horizontal
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            // Swipe derecha - imagen anterior
            mostrar(idx - 1);
          } else {
            // Swipe izquierda - siguiente imagen
            mostrar(idx + 1);
          }
        }
      } else {
        // Swipe vertical
        if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0) {
            // Swipe abajo - siguiente imagen
            mostrar(idx + 1);
          } else {
            // Swipe arriba - imagen anterior
            mostrar(idx - 1);
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("wheel", handleWheel);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [visible, idx]);

  // Auto-abrir si se pasa startIndex
  useEffect(() => {
    if (startIndex !== 0) {
      open(startIndex);
    }
  }, [startIndex]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={modalRef}
      style={{
        display: "flex",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.85)",
        zIndex: 9999,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          maxWidth: "90vw",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Botón cerrar */}
        <button
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            fontSize: "2rem",
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
          }}
          onClick={close}
        >
          &times;
        </button>

        {/* Carrusel */}
        <div style={{ display: "flex", alignItems: "center", maxWidth: "95vw" }}>
          <button
            style={{
              fontSize: "2rem",
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              margin: "0 12px",
            }}
            onClick={() => mostrar(idx - 1)}
          >
            &#8592;
          </button>
          
          {(() => {
            const currentItem = items[idx];
            
            // Si es un objeto de contenido con tipo
            if (currentItem && typeof currentItem === 'object' && currentItem.tipo) {
              if (currentItem.tipo === 'video' && currentItem.embed) {
                return (
                  <div className="modal-multimedia-content">
                    <iframe
                      src={currentItem.embed}
                      className="multimedia-embed"
                      allowFullScreen
                      frameBorder="0"
                      title={currentItem.titulo || "Video RTVE"}
                    />
                    {currentItem.destacado && (
                      <div className="destacado-badge-modal">
                        ⭐ DESTACADO
                      </div>
                    )}
                    {currentItem.titulo && (
                      <h3 className="multimedia-title">
                        {currentItem.titulo}
                      </h3>
                    )}
                    {currentItem.texto && (
                      <div 
                        className="multimedia-text"
                        dangerouslySetInnerHTML={{ __html: currentItem.texto }}
                      />
                    )}
                  </div>
                );
              } else if (currentItem.tipo === 'audio') {
                return (
                  <div className="modal-multimedia-content">
                    {currentItem.embed ? (
                      // Audio embed de RTVE
                      <iframe
                        src={currentItem.embed}
                        className="multimedia-embed"
                        allowFullScreen
                        frameBorder="0"
                        title={currentItem.titulo || "Audio RTVE"}
                      />
                    ) : (
                      // Fallback: thumbnail + audio player
                      <div className="audio-player-container">
                        <img
                          src={currentItem.thumbnail}
                          alt={currentItem.titulo || 'Audio'}
                        />
                        {currentItem.url && (
                          <audio 
                            controls 
                            src={currentItem.url}
                          />
                        )}
                      </div>
                    )}
                    {currentItem.destacado && (
                      <div className="destacado-badge-modal">
                        ⭐ DESTACADO
                      </div>
                    )}
                    {currentItem.titulo && (
                      <h3 className="multimedia-title">
                        {currentItem.titulo}
                      </h3>
                    )}
                    {currentItem.texto && (
                      <div 
                        className="multimedia-text"
                        dangerouslySetInnerHTML={{ __html: currentItem.texto }}
                      />
                    )}
                  </div>
                );
              } else if (currentItem.tipo === 'foto') {
                return (
                  <img
                    src={currentItem.url || currentItem.thumbnail}
                    alt={currentItem.titulo || 'Foto'}
                    style={{
                      maxWidth: "70vw",
                      maxHeight: "70vh",
                      borderRadius: 8,
                      boxShadow: "0 0 20px #000",
                      transition: "opacity 0.3s ease-in-out",
                      cursor: "pointer",
                    }}
                    onClick={() => mostrar(idx + 1)}
                  />
                );
              }
            }
            
            // Fallback: comportamiento antiguo
            if (contentType === "videos" || (typeof currentItem === 'string' && currentItem.includes('embed'))) {
              return (
                <iframe
                  src={currentItem}
                  style={{
                    width: "80vw",
                    height: "45vw",
                    maxWidth: "1200px",
                    maxHeight: "675px",
                    minWidth: "320px",
                    minHeight: "180px",
                    border: "none",
                    borderRadius: 8,
                    boxShadow: "0 0 20px #000",
                  }}
                  allowFullScreen
                  frameBorder="0"
                  title="Video"
                />
              );
            } else {
              return (
                <img
                  src={currentItem}
                  alt="Imagen carrusel"
                  style={{
                    maxWidth: "70vw",
                    maxHeight: "70vh",
                    borderRadius: 8,
                    boxShadow: "0 0 20px #000",
                    transition: "opacity 0.3s ease-in-out",
                    cursor: "pointer",
                  }}
                  onClick={() => mostrar(idx + 1)}
                />
              );
            }
          })()}
          
          <button
            style={{
              fontSize: "2rem",
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              margin: "0 12px",
            }}
            onClick={() => mostrar(idx + 1)}
          >
            &#8594;
          </button>
        </div>

        {/* Indicador */}
        <div className="modal-navigation-hint">
          <div>
            {idx + 1} / {items.length}
          </div>
          <div className="hint-controls">
            <span>🖱️ Scroll</span>
            <span>👆 Swipe</span>
            <span>⌨️ Flechas</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ModalCarrousel;
