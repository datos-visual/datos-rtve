"use client";

import { useState, useEffect } from "react";
import { cargarFosas } from "../../../../components/mapa/js/datos";
import { useRouter, useParams } from "next/navigation";
import JsonLdScript from "../../../../components/BreadcrumbJsonLd/BreadcrumbJsonLd";
import Creditos from "../../../../components/common/Creditos";
import ModuloNoticias from "../../../../components/common/ModuloNoticias";
import ModuloReportajes from "../../../../components/common/ModuloReportajes";
import SobreProyecto from "../../../../components/common/SobreProyecto";
import ListadoSEO from "../../../../components/common/ListadoSEO";
import MapaBuscadorFosas from "../../../../components/MapaBuscadorFosas/MapaBuscadorFosas";
import "../../../../app/styles/_historias.scss";
import MenuSwitchClient from "@/components/MenuSwitchClient/MenuSwitchClient";

export default function UbicacionPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [fosas, setFosas] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();

  // Extraer parámetros de la URL dinámica
  const { ccaa, provincia, municipio } = params;

  // Obtener parámetros adicionales de query string si existen
  const [urlParams, setUrlParams] = useState({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      setUrlParams({
        ccaa: ccaa || searchParams.get("ccaa"),
        provincia: provincia || searchParams.get("provincia"),
        municipio: municipio || searchParams.get("municipio"),
        fosa: searchParams.get("fosa"),
      });
    }
  }, [ccaa, provincia, municipio]);

  // Cargar y filtrar fosas
  useEffect(() => {
    async function fetchFosas() {
      setLoading(true);
      const todas = await cargarFosas();
      // Normalizar función
      const normalizar = (str) =>
        (str || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/\s+/g, "-")
          .replace(/[\u0300-\u036f]/g, "");
      const ccaaNorm = normalizar(ccaa);
      const provinciaNorm = normalizar(provincia);
      const municipioNorm = normalizar(municipio);
      const filtradas = todas.filter(
        (f) =>
          normalizar(f.ccaa_seo || f.ccaa) === ccaaNorm &&
          normalizar(f.provincia_seo || f.provincia) === provinciaNorm &&
          normalizar(f.municipio_seo || f.municipio) === municipioNorm
      );
      setFosas(filtradas);
      setLoading(false);
    }
    fetchFosas();
  }, [ccaa, provincia, municipio]);

  // Construir breadcrumbs dinámicos
  const ccaaUrl = urlParams.ccaa
    ? `https://www.rtve.es/noticias/fosas-guerra-civil-franquismo/${urlParams.ccaa}/`
    : undefined;
  const provinciaUrl =
    urlParams.ccaa && urlParams.provincia
      ? `https://www.rtve.es/noticias/fosas-guerra-civil-franquismo/${urlParams.ccaa}/${urlParams.provincia}/`
      : undefined;
  const municipioUrl =
    urlParams.ccaa && urlParams.provincia && urlParams.municipio
      ? `https://www.rtve.es/noticias/fosas-guerra-civil-franquismo/${urlParams.ccaa}/${urlParams.provincia}/${urlParams.municipio}/`
      : undefined;

  const breadcrumbs = [
    {
      name: "Fosas de la Guerra Civil y el franquismo",
      item: "https://www.rtve.es/noticias/fosas-guerra-civil-franquismo/",
    },
  ];
  if (urlParams.ccaa) {
    breadcrumbs.push({
      name: `Fosas de ${urlParams.ccaa}`,
      item: ccaaUrl,
    });
  }
  if (urlParams.provincia) {
    breadcrumbs.push({
      name: `Fosas de ${urlParams.provincia}`,
      item: provinciaUrl,
    });
  }
  if (urlParams.municipio) {
    breadcrumbs.push({
      name: `Fosas de ${urlParams.municipio}`,
      item: municipioUrl,
    });
  }

  // JSON-LD para breadcrumb
  const breadcrumbJsonLd = {
    "@context": "https://schema.org/",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((bc, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: bc.name,
      item: bc.item,
    })),
  };

  // JSON-LD para WebPage
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: municipioUrl,
    name: urlParams.municipio
      ? `Fosas de ${urlParams.municipio} (${urlParams.provincia}, ${urlParams.ccaa}) | RTVE.es`
      : "Fosas | RTVE.es",
    description: urlParams.municipio
      ? `Listado de fosas de la Guerra Civil y el franquismo en ${urlParams.municipio}, ${urlParams.provincia}, ${urlParams.ccaa}. Proyecto RTVE.es`
      : "Listado de fosas de la Guerra Civil y el franquismo. Proyecto RTVE.es",
    isPartOf: { "@id": "https://www.rtve.es/#website" },
    publisher: {
      "@type": "Organization",
      name: "RTVE.es",
      url: "https://www.rtve.es/",
      logo: {
        "@type": "ImageObject",
        url: "https://img2.rtve.es/css/rtve.commons/rtve.header.footer/i/logoRTVE.png",
      },
    },
  };

  return (
    <>
      <JsonLdScript jsonLd={breadcrumbJsonLd} />
      <JsonLdScript jsonLd={webPageJsonLd} />
      <main>
        <section className="buscador-mapa-fosas">
          <MenuSwitchClient />
          <section style={{ width: "100%", marginBottom: "160px" }}>
            <MapaBuscadorFosas
              ccaa={urlParams.ccaa}
              provincia={urlParams.provincia}
              municipio={urlParams.municipio}
              fosa={urlParams.fosa}
              fosas={fosas}
            />
          </section>

          {/* Contenido informativo */}
          <div className="buscador-intro" style={{ zIndex: 999 }}>
            <h2 className="buscador-intro__title">Buscador de fosas</h2>
            <p className="buscador-intro__text">
              La Guerra Civil y el franquismo convirtieron a España en una gran
              fosa común. En las últimas décadas se han exhumado los restos de
              más de 18.000 víctimas. Se estima que más de 20.000 siguen en
              cementerios, cunetas, pozos y otros lugares donde los responsables
              de sus asesinatos intentaron ocultar los cuerpos o enterrarlos sin
              dignidad, para prolongar el castigo a ellos y a sus familias.
            </p>
            <p className="buscador-intro__text">
              Además de los muertos en combate o a causa de los bombardeos,
              100.000 personas fueron asesinadas por los sublevados y 55.000 por
              los republicanos durante la guerra. Después y hasta 1946, la
              dictadura mató a otras 50.000 personas, a menudo tras juicios
              sumarísimos sin garantías.
            </p>
            <p className="buscador-intro__text">
              Este es el primer mapa audiovisual de las fosas de la Guerra Civil
              y el franquismo, donde puedes descubrir las 6.000 fosas de España
              y recuperar la memoria de algunas de las víctimas. Una parte de la
              historia que yace aún en la tierra.
              <br />
              <br />
              1. No importa la coordenada: en España no es posible estar a más
              de X kilómetros de una fosa común. Algunas contienen los restos de
              miles de personas; otras son enterramientos individuales.
              <br />
              2. Uno de cada XX municipios españoles tiene en su terreno al
              menos una fosa de la Guerra Civil o el franquismo. Se han exhumado
              1.300 de las 6.000 registradas actualmente.
              <br />
              3. La exhumación en Priaranza del Bierzo (León) en el año 2000
              marcó un hito en la preservación de la memoria democrática. Desde
              entonces se han recuperado los restos de más de 18.000 personas,
              de las cuales solo se han podido identificar unas 700.
              <br />
              4. A medida que continúan las prospecciones, el número de fosas
              sigue aumentando. Es probable que algunos de los desaparecidos no
              se lleguen a encontrar nunca.
            </p>
          </div>

          <ModuloReportajes style={{ zIndex: 999 }} />
          <ModuloNoticias style={{ zIndex: 999 }} />
          <SobreProyecto style={{ zIndex: 999 }} />
          <Creditos style={{ zIndex: 999 }} />
          <ListadoSEO style={{ zIndex: 999 }} />
        </section>
      </main>
    </>
  );
}
