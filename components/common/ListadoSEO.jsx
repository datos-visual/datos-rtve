"use client";

import { usePathname } from "next/navigation";
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

export default function ListadoSEO({ fosaSeleccionada = null, fosas = [] }) {
  const pathname = usePathname();

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
    } else if (fosas && fosas.length) {
      ccaaList = getUnicos(fosas, "ccaa");
      municipioList = getUnicos(fosas, "municipio");
      provinciaList = getUnicos(fosas, "provincia");
    }
  }

  return (
    <section className="listado-seo">
      <div className="listado-seo-wrapper">
        <h3 className="listado-seo__title">
          Listado de <strong>Comunidades</strong>, <strong>Municipios</strong> y{" "}
          <strong>Provincias</strong>
        </h3>
        <p className="listado-seo__text">
          {ccaaList.length ? capitalizar(ccaaList.join(" / ")) : "-"} /{" "}
          {provinciaList.length ? capitalizar(provinciaList.join(" / ")) : "-"}{" "}
          /{" "}
          {municipioList.length ? capitalizar(municipioList.join(" / ")) : "-"}
          {fosaList.length ? " / " + capitalizar(fosaList.join(" / ")) : ""}
        </p>
      </div>
    </section>
  );
}
