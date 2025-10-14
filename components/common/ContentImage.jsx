"use client";

import React from "react";
import "./ContentImage.scss";

/**
 * ContentImage - Componente para renderizar imágenes con indicadores de tipo de contenido
 * 
 * @param {string} src - URL de la imagen
 * @param {string} alt - Texto alternativo
 * @param {string} tipo - Tipo de contenido: 'video', 'audio', 'foto', null
 * @param {string} className - Clases CSS adicionales
 * @param {Function} onClick - Handler de click
 * @param {Object} props - Props adicionales para el elemento img
 */
const ContentImage = React.memo(function ContentImage({
  src,
  alt,
  tipo = null,
  className = "",
  onClick,
  ...props
}) {
  // Construir clases CSS dinámicamente
  const containerClasses = [
    "content-image",
    tipo ? `content-image--${tipo}` : null,
    className
  ].filter(Boolean).join(" ");

  return (
    <div className={containerClasses} onClick={onClick}>
      <img 
        src={src} 
        alt={alt} 
        loading="lazy"
        {...props} 
      />
      {(tipo === 'video' || tipo === 'audio') && (
        <div className="content-image__overlay" aria-hidden="true" />
      )}
    </div>
  );
});

export default ContentImage;

