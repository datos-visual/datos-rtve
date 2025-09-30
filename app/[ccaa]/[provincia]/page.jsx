import Creditos from "../../../components/common/Creditos";
import { cargarFosas } from "../../lib/datos";
import SobreElProyecto from "../../../components/common/SobreProyecto";
import JsonLdScript from "../../../components/BreadcrumbJsonLd/BreadcrumbJsonLd";
import MapaBuscadorFosas from "../../../components/MapaBuscadorFosas/MapaBuscadorFosas";
import "../../../app/styles/_historias.scss";
import ModuloReportajes from "../../../components/common/ModuloReportajes";
import ModuloNoticias from "../../../components/common/ModuloNoticias";
import ListadoSEO from "../../../components/common/ListadoSEO";
import MenuSwitchClient from "../../../components/MenuSwitchClient/MenuSwitchClient";

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function generateStaticParams() {
  const fosas = await cargarFosas();
  return fosas
    .filter((f) => f.ccaa && f.provincia)
    .map((f) => ({
      ccaa: f.ccaa_seo || slugify(f.ccaa),
      provincia: f.provincia_seo || slugify(f.provincia),
    }));
}

export default async function ProvinciaPage({ params }) {
  const fosas = await cargarFosas();
  const provinciaFosas = fosas.filter(
    (f) =>
      (f.ccaa_seo || slugify(f.ccaa)) === params.ccaa &&
      (f.provincia_seo || slugify(f.provincia)) === params.provincia
  );

  if (!provinciaFosas.length) return <p>No hay fosas en esta provincia</p>;

  // Obtener nombres y URLs
  const ccaaName = provinciaFosas[0]?.ccaa || params.ccaa;
  const provinciaName = provinciaFosas[0]?.provincia || params.provincia;
  const ccaaUrl = `https://www.rtve.es/noticias/fosas-guerra-civil-franquismo/${params.ccaa}/`;
  const provinciaUrl = `https://www.rtve.es/noticias/fosas-guerra-civil-franquismo/${params.ccaa}/${params.provincia}/`;

  // JSON-LD para breadcrumb
  const breadcrumbJsonLd = {
    "@context": "https://schema.org/",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Fosas de la Guerra Civil y el franquismo",
        item: "https://www.rtve.es/noticias/fosas-guerra-civil-franquismo/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `Fosas de ${ccaaName}`,
        item: ccaaUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Fosas de ${provinciaName}`,
        item: provinciaUrl,
      },
    ],
  };

  // JSON-LD para WebPage
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: provinciaUrl,
    name: `Fosas de ${provinciaName} (${ccaaName}) | RTVE.es`,
    description: `Listado de fosas de la Guerra Civil y el franquismo en ${provinciaName}, ${ccaaName}. Proyecto RTVE.es`,
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
              ccaa={params.ccaa}
              provincia={params.provincia}
              fosas={provinciaFosas}
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

          <ModuloReportajes />
          <ModuloNoticias />
          <SobreElProyecto />
          <Creditos />
          <ListadoSEO />
        </section>
      </main>
    </>
  );
}
