"use client";

import React, { useMemo } from "react";

/**
 * BreadcrumbFiltros
 * Muestra una línea tipo "Se está mostrando:" seguida de los filtros activos
 * en el orden: Status | CCAA | Provincia | Ciudad | Nombre fosa.
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
  estadosSeleccionados = ["todos"],
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
  const statusLabel = useMemo(() => {
    if (
      !Array.isArray(estadosSeleccionados) ||
      estadosSeleccionados.length === 0
    ) {
      return labelsMap.todos || "Todos";
    }
    if (estadosSeleccionados.includes("todos")) {
      return labelsMap.todos || "Todos";
    }
    return estadosSeleccionados.map((k) => labelsMap[k] || k).join(", ");
  }, [estadosSeleccionados, labelsMap]);

  const items = useMemo(() => {
    const safe = (s) => (s || "").toString().trim();
    return [
      statusLabel,

      safe(ccaa),
      safe(provincia),
      safe(ciudad),
      safe(nombreFosa),
    ].filter(Boolean);
  }, [statusLabel, ciudad, ccaa, provincia, nombreFosa]);

  return (
    <div className={className} role="status" aria-live="polite">
      <span className={`${className}-label`}>Se está mostrando:</span>
      <ul className={`${className}-trail`}>
        {items.length === 0 ? (
          <li className="muted">{labelsMap.todos || "Todos"}</li>
        ) : (
          items.map((txt, i) => {
            const isLast = i === items.length - 1 && i > 0; // nunca convertir el Status en h1
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
          })
        )}
      </ul>
    </div>
  );
}
