import { cargarFosas } from "../../../../lib/datos";
import JsonLdScript from "../../../../../components/BreadcrumbJsonLd/BreadcrumbJsonLd";
import Creditos from "../../../../../components/common/Creditos";
import ModuloNoticias from "../../../../../components/common/ModuloNoticias";
import ModuloReportajes from "../../../../../components/common/ModuloReportajes";
import SobreProyecto from "../../../../../components/common/SobreProyecto";
import ListadoSEOClient from "../../../../../components/ListadoSEOClient/ListadoSEOClient";
import VideoScroll from "../../../../../components/VideoScroll/VideoScroll";
import MapaBuscadorWithBreadcrumbClient from "../../../../../components/MapaBuscadorFosas/MapaBuscadorWithBreadcrumbClient";
import "../../../../styles/_historias.scss";
import MenuSwitchClient from "@/components/MenuSwitchClient/MenuSwitchClient";

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// Alias de CCAA para aceptar variantes en la URL
function normalizeCcaaSlug(slug) {
  const s = String(slug || "").toLowerCase();
  switch (s) {
    case "comunidad-valenciana":
      return "comunitat-valenciana";
    case "asturias":
      return "principado-de-asturias";
    case "principado-de-asturas":
      return "principado-de-asturias";
    case "baleares":
      return "illes-balears";
    case "cataluna":
      return "catalunya";
    case "ceuta":
      return "ciudad-de-ceuta";
    case "melilla":
      return "ciudad-de-melilla";
    case "navarra":
      return "comunidad-foral-de-navarra";
    default:
      return s;
  }
}

export async function generateStaticParams() {
  const fosas = await cargarFosas();
  return fosas
    .filter((f) => f.ccaa && f.provincia && f.municipio && f.denominacion)
    .map((f) => ({
      ccaa: f.ccaa_seo || slugify(f.ccaa),
      provincia: f.provincia_seo || slugify(f.provincia),
      municipio: f.municipio_seo || slugify(f.municipio),
      fosa: f.fosa_seo || slugify(f.denominacion),
    }));
}

export default async function FosaEspecificaPage({ params }) {
  const { ccaa, provincia, municipio, fosa } = params;

  const fosas = await cargarFosas();

  // Filtrar fosas por ubicación y fosa específica
  const municipioFosas = fosas.filter(
    (f) =>
      normalizeCcaaSlug(f.ccaa_seo || slugify(f.ccaa)) ===
        normalizeCcaaSlug(ccaa) &&
      (f.provincia_seo || slugify(f.provincia)) === provincia &&
      (f.municipio_seo || slugify(f.municipio)) === municipio
  );

  const fosaEspecifica = municipioFosas.find(
    (f) => (f.fosa_seo || slugify(f.denominacion)) === fosa
  );

  if (!fosaEspecifica) return <p>Fosa no encontrada</p>;

  // Obtener nombres y URLs
  const ccaaName = fosaEspecifica?.ccaa || params.ccaa;
  const provinciaName = fosaEspecifica?.provincia || params.provincia;
  const municipioName = fosaEspecifica?.municipio || params.municipio;
  const fosaName = fosaEspecifica?.denominacion || params.fosa;

  const ccaaUrl = `https://www.rtve.es/noticias/fosas-guerra-civil-franquismo/${ccaa}/`;
  const provinciaUrl = `https://www.rtve.es/noticias/fosas-guerra-civil-franquismo/${ccaa}/${provincia}/`;
  const municipioUrl = `https://www.rtve.es/noticias/fosas-guerra-civil-franquismo/${ccaa}/${provincia}/${municipio}/`;
  const fosaUrl = `https://www.rtve.es/noticias/fosas-guerra-civil-franquismo/${ccaa}/${provincia}/${municipio}/${fosa}/`;

  const breadcrumbs = [
    {
      name: "Fosas de la Guerra Civil y el franquismo",
      item: "https://www.rtve.es/noticias/fosas-guerra-civil-franquismo/",
    },
    {
      name: `Fosas de ${ccaaName}`,
      item: ccaaUrl,
    },
    {
      name: `Fosas de ${provinciaName}`,
      item: provinciaUrl,
    },
    {
      name: `Fosas de ${municipioName}`,
      item: municipioUrl,
    },
    {
      name: `${fosaName}`,
      item: fosaUrl,
    },
  ];

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
    url: fosaUrl,
    name: `${fosaName} (${municipioName}, ${provinciaName}, ${ccaaName}) | RTVE.es`,
    description: `Información sobre ${fosaName} en ${municipioName}, ${provinciaName}, ${ccaaName}. Proyecto RTVE.es`,
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

  const handleMenuNavigation = (page) => {
    if (page === "historias") {
      router.push("/historias");
    } else if (page === "fosas") {
      router.push("/mapa");
    }
  };

  return (
    <>
      <JsonLdScript jsonLd={breadcrumbJsonLd} />
      <JsonLdScript jsonLd={webPageJsonLd} />
      <main>
        <section className="buscador-mapa-fosas">
          {/* Video de fondo opcional */}
          {/* <VideoScroll
            srcDesktop="/videos/VersionDesktop.mp4"
            srcMobile="/videos/VersionMobile.mp4"
            pixelsPerSecond="200"
          /> */}

          <MenuSwitchClient />

          <section style={{ width: "100%", marginBottom: "160px" }}>
            {/* Componente principal del buscador de fosas con parámetros de ubicación y fosa específica */}
            <MapaBuscadorWithBreadcrumbClient
              ccaa={ccaa}
              provincia={provincia}
              municipio={municipio}
              fosa={fosa}
              fosas={municipioFosas}
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
            </p>
            <p className="buscador-intro__text">
              1. No importa la coordenada: en España no es posible estar a más
              de X kilómetros de una fosa común. Algunas contienen los restos de
              miles de personas; otras son enterramientos individuales.
            </p>
            <p className="buscador-intro__text">
              2. Uno de cada XX municipios españoles tiene en su terreno al
              menos una fosa de la Guerra Civil o el franquismo. Se han exhumado
              1.300 de las 6.000 registradas actualmente.
            </p>
            <p className="buscador-intro__text">
              3. La exhumación en Priaranza del Bierzo (León) en el año 2000
              marcó un hito en la preservación de la memoria democrática. Desde
              entonces se han recuperado los restos de más de 18.000 personas,
              de las cuales solo se han podido identificar unas 700.
            </p>
            <p className="buscador-intro__text">
              4. A medida que continúan las prospecciones, el número de fosas
              sigue aumentando. Es probable que algunos de los desaparecidos no
              se lleguen a encontrar nunca.
            </p>
          </div>

          <ModuloReportajes style={{ zIndex: 999 }} />
          <ModuloNoticias style={{ zIndex: 999 }} />
          <SobreProyecto style={{ zIndex: 999 }} />
          <Creditos style={{ zIndex: 999 }} />
          <ListadoSEOClient style={{ zIndex: 999 }} />
        </section>
      </main>
    </>
  );
}
