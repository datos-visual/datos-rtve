"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import MapaBuscadorFosas from "./MapaBuscadorFosas";
import BreadcrumbFiltros from "../common/BreadcrumbFiltros/BreadcrumbFiltros";

/**
 * Wrapper cliente para usar en páginas server (SEO, rutas /[ccaa]/...)
 * Toma ubicación desde props (URL) y el Status desde el mapa (onFiltrosChange).
 */
export default function MapaBuscadorWithBreadcrumbClient({
  ccaa,
  provincia,
  municipio,
  fosa,
  fosas,
  className = "mapa-fosas_breadcrumb",
}) {
  const [bc, setBc] = useState({
    estadosSeleccionados: ["todos"],
    ccaa: (ccaa || "").trim(),
    provincia: (provincia || "").trim(),
    ciudad: (municipio || "").trim(),
    nombreFosa: (fosa || "").trim(),
  });

  // Sincroniza con cambios de URL/props (navegación entre rutas)
  useEffect(() => {
    setBc((prev) => ({
      ...prev,
      ccaa: (ccaa || "").trim(),
      provincia: (provincia || "").trim(),
      ciudad: (municipio || "").trim(),
      nombreFosa: (fosa || "").trim(),
    }));
  }, [ccaa, provincia, municipio, fosa]);

  // Helpers para mostrar nombres "bonitos"
  const slugify = (str) =>
    (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const displayAliases = {
    "comunitat-valenciana": "Comunidad Valenciana",
    "principado-de-asturias": "Principado de Asturias",
    "illes-balears": "Islas Baleares",
    catalunya: "Cataluña",
    "ciudad-de-ceuta": "Ceuta",
    "ciudad-de-melilla": "Melilla",
    "comunidad-foral-de-navarra": "Navarra",
  };

  const titleCase = (s) =>
    (s || "")
      .split("-")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ");

  const resolvePretty = (tipo, valor) => {
    const v = (valor || "").trim();
    if (!v) return "";
    const targetSlug = slugify(v);

    if (tipo === "ccaa" && displayAliases[targetSlug])
      return displayAliases[targetSlug];

    const arr = Array.isArray(fosas) ? fosas : [];
    for (const f of arr) {
      if (tipo === "ccaa") {
        const s = slugify(f.ccaa_seo || f.ccaa);
        if (s === targetSlug) return f.ccaa || f.ccaa_seo || titleCase(v);
      } else if (tipo === "provincia") {
        const s = slugify(f.provincia_seo || f.provincia);
        if (s === targetSlug)
          return f.provincia || f.provincia_seo || titleCase(v);
      } else if (tipo === "municipio") {
        const s = slugify(f.municipio_seo || f.municipio);
        if (s === targetSlug)
          return f.municipio || f.municipio_seo || titleCase(v);
      } else if (tipo === "fosa") {
        const s = slugify(
          f.fosa_seo || f.title_seo || f.denominacion || f.title
        );
        if (s === targetSlug)
          return (
            f.denominacion ||
            f.title ||
            f.title_seo ||
            f.fosa_seo ||
            titleCase(v)
          );
      }
    }
    return titleCase(v);
  };

  const prettyCiudad = useMemo(
    () => resolvePretty("municipio", bc.ciudad || municipio),
    [bc.ciudad, municipio, fosas]
  );
  const prettyCcaa = useMemo(
    () => resolvePretty("ccaa", bc.ccaa || ccaa),
    [bc.ccaa, ccaa, fosas]
  );
  const prettyProvincia = useMemo(
    () => resolvePretty("provincia", bc.provincia || provincia),
    [bc.provincia, provincia, fosas]
  );
  const prettyFosa = useMemo(
    () => resolvePretty("fosa", bc.nombreFosa || fosa),
    [bc.nombreFosa, fosa, fosas]
  );

  return (
    <>
      <MapaBuscadorFosas
        ccaa={ccaa}
        provincia={provincia}
        municipio={municipio}
        fosa={fosa}
        fosas={fosas}
        onFiltrosChange={useCallback(
          (p) =>
            setBc((prev) => ({
              ...prev,
              estadosSeleccionados: p?.estadosSeleccionados || ["todos"],

              ccaa: p?.ccaa !== undefined ? (p.ccaa || "").trim() : prev.ccaa,
              provincia:
                p?.provincia !== undefined
                  ? (p.provincia || "").trim()
                  : prev.provincia,
              ciudad:
                p?.ciudad !== undefined ? (p.ciudad || "").trim() : prev.ciudad,
              nombreFosa:
                p?.nombreFosa !== undefined
                  ? (p.nombreFosa || "").trim()
                  : prev.nombreFosa,
            })),
          []
        )}
      />
      <BreadcrumbFiltros
        estadosSeleccionados={bc.estadosSeleccionados}
        ccaa={prettyCcaa}
        provincia={prettyProvincia}
        ciudad={prettyCiudad}
        nombreFosa={prettyFosa}
        className={className}
      />
    </>
  );
}
