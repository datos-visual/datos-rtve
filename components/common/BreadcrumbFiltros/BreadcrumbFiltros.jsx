"use client";

import React, { useMemo } from "react";

/**
 * BreadcrumbFiltros
 * Muestra una línea tipo "Se está mostrando:" seguida de la ubicación activa
 * en el orden: CCAA | Provincia | Ciudad | Nombre fosa.
 *
 * Props
 * - estadosSeleccionados: array de claves de estado ["todos" | "exhumados" | "no-exhumados" | "trasladada"]
 * - ccaa: string
 * - provincia: string
 * - ciudad: string
 * - nombreFosa: string
 * - className: clase base para estilos (por defecto: "filters-breadcrumb")
 * - labelsMap: opcional, para sobrescribir etiquetas de estados
 */
export default function BreadcrumbFiltros({
  estadosSeleccionados = ["todos"], // Ignorado en la UI del breadcrumb a petición
  ciudad = "",
  ccaa = "",
  provincia = "",
  nombreFosa = "",
  className = "filters-breadcrumb",
  labelsMap = {
    exhumados: "Exhumados",
    "no-exhumados": "No exhumados",
    trasladada: "Trasladada a Cuelgamuros",
    todos: "Todos",
  },
}) {
  const items = useMemo(() => {
    const safe = (s) => (s || "").toString().trim();
    // Orden: CCAA | Provincia | Ciudad | Fosa
    return [safe(ccaa), safe(provincia), safe(ciudad), safe(nombreFosa)].filter(
      Boolean
    );
  }, [ciudad, ccaa, provincia, nombreFosa]);

  // Si no hay ningún dato de ubicación, no renderizar nada
  if (items.length === 0) return null;

  return (
    <div className={className} role="status" aria-live="polite">
      <span className={`${className}-label`}>Se está mostrando:</span>
      <ul className={`${className}-trail`}>
        {items.map((txt, i) => {
          const isLast = i === items.length - 1; // la última instancia va como H1
          return (
            <li key={`${txt}-${i}`} className={isLast ? "last" : undefined}>
              {isLast ? (
                <h1
                  className={`${className}-h1`}
                  style={{ display: "inline", margin: 0, font: "inherit" }}
                >
                  {txt}
                </h1>
              ) : (
                txt
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
