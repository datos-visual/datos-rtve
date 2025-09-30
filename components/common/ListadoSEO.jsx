"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cargarFosas } from "../../app/lib/datos";
import "../../app/styles/_listadoSEO.scss";

// Utilidad para obtener valores únicos de un campo
function getUnicos(arr, key) {
  return [...new Set(arr.map((item) => item[key]).filter(Boolean))];
}

// Extrae /ccaa/prov/mun/ y opcionalmente /fosa/ de la URL
function getURLParts(pathname) {
  const match = pathname.match(
    /^\/([^\/]+)\/([^\/]+)\/([^\/]+)(?:\/([^\/]+))?\/?$/
  );
  if (match) {
    return {
      ccaa: match[1].replace(/-/g, " "),
      provincia: match[2].replace(/-/g, " "),
      municipio: match[3].replace(/-/g, " "),
      fosa: match[4] ? match[4].replace(/-/g, " ") : null,
    };
  }
  return null;
}

// Capitalizar la primera letra de cada palabra
const capitalizar = (str) => str.replace(/\b\w/g, (l) => l.toUpperCase());

// Capitalizar solo la primera letra del texto
const capitalizarPrimera = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

// Convertir nombre a formato URL (reemplazar espacios por guiones y minúsculas)
const toUrlFormat = (str) => {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/á/g, "a")
    .replace(/é/g, "e")
    .replace(/í/g, "i")
    .replace(/ó/g, "o")
    .replace(/ú/g, "u")
    .replace(/ñ/g, "n")
    .replace(/ü/g, "u");
};

export default function ListadoSEO({ fosaSeleccionada = null, fosas = [] }) {
  const pathname = usePathname();
  const [fosasData, setFosasData] = useState(fosas);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Marcar como montado para evitar hidratación incorrecta
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cargar datos si no se pasaron como prop
  useEffect(() => {
    if (mounted && !fosas.length && !fosasData.length) {
      setLoading(true);
      cargarFosas()
        .then((data) => {
          setFosasData(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error cargando fosas:", error);
          setLoading(false);
        });
    }
  }, [mounted, fosas, fosasData.length]);

  // No renderizar nada hasta que esté montado (evita problemas de hidratación)
  if (!mounted) {
    return null;
  }

  let ccaaList = [];
  let municipioList = [];
  let provinciaList = [];
  let fosaList = [];

  if (fosaSeleccionada) {
    ccaaList = [fosaSeleccionada.ccaa].filter(Boolean);
    municipioList = [fosaSeleccionada.municipio].filter(Boolean);
    provinciaList = [fosaSeleccionada.provincia].filter(Boolean);
    fosaList = [fosaSeleccionada.title].filter(Boolean);
  } else {
    const urlParts = getURLParts(pathname);
    if (urlParts) {
      ccaaList = [urlParts.ccaa];
      provinciaList = [urlParts.provincia];
      municipioList = [urlParts.municipio];
      if (urlParts.fosa) {
        fosaList = [urlParts.fosa];
      }
    } else if (fosasData && fosasData.length) {
      ccaaList = getUnicos(fosasData, "ccaa");
      municipioList = getUnicos(fosasData, "municipio");
      provinciaList = getUnicos(fosasData, "provincia");
    }
  }

  // Obtener todas las comunidades autónomas únicas de los datos
  const todasCCAA =
    fosasData && fosasData.length
      ? getUnicos(fosasData, "ccaa").sort((a, b) => a.localeCompare(b))
      : [];

  // Obtener todas las provincias únicas y agruparlas por CCAA
  const provinciasAgrupadas = {};
  const todasProvincias = [];

  if (fosasData && fosasData.length) {
    fosasData.forEach((fosa) => {
      if (fosa.ccaa && fosa.provincia) {
        if (!provinciasAgrupadas[fosa.ccaa]) {
          provinciasAgrupadas[fosa.ccaa] = new Set();
        }
        provinciasAgrupadas[fosa.ccaa].add(fosa.provincia);
        todasProvincias.push(fosa.provincia);
      }
    });
  }

  const provinciasUnicas = [...new Set(todasProvincias)].sort((a, b) =>
    a.localeCompare(b)
  );

  return (
    <section className="listado-seo">
      <div className="listado-seo-wrapper">
        <h3 className="listado-seo__title">
          Listado de <strong>Comunidades Autónomas</strong>
        </h3>
        <p className="listado-seo__text">
          {loading
            ? "Cargando comunidades autónomas..."
            : todasCCAA.length > 0
            ? todasCCAA.map((ccaa, index) => (
                <span key={ccaa}>
                  <Link href={`/${toUrlFormat(ccaa)}`}>
                    {capitalizarPrimera(ccaa)}
                  </Link>
                  {index < todasCCAA.length - 1 && " / "}
                </span>
              ))
            : "No hay datos disponibles"}
        </p>

        <h3 className="listado-seo__title" style={{ marginTop: "32px" }}>
          Listado de <strong>Provincias</strong>
        </h3>
        <p className="listado-seo__text">
          {loading
            ? "Cargando provincias..."
            : provinciasUnicas.length > 0
            ? provinciasUnicas.map((provincia, index) => {
                // Encontrar la CCAA correspondiente a esta provincia
                const ccaa = Object.keys(provinciasAgrupadas).find((c) =>
                  provinciasAgrupadas[c].has(provincia)
                );
                return (
                  <span key={provincia}>
                    <Link
                      href={`/${toUrlFormat(ccaa)}/${toUrlFormat(provincia)}`}
                    >
                      {capitalizarPrimera(provincia)}
                    </Link>
                    {index < provinciasUnicas.length - 1 && " / "}
                  </span>
                );
              })
            : "No hay datos disponibles"}
        </p>
      </div>
    </section>
  );
}
