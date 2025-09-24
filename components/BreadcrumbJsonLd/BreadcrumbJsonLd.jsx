import React from "react";

/**
 * Componente genérico para inyectar cualquier JSON-LD en el <head>.
 * @param {object} jsonLd - Objeto JSON-LD a inyectar.
 */
export default function JsonLdScript({ jsonLd }) {
  if (!jsonLd) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
