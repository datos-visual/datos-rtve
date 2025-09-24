"use client";

import IntroUnified from "../components/IntroUnified/IntroUnified";
import JsonLdScript from "../components/BreadcrumbJsonLd/BreadcrumbJsonLd";

export default function Home() {
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
    ],
  };

  // JSON-LD para WebPage (home)
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: "https://www.rtve.es/noticias/fosas-guerra-civil-franquismo/",
    name: "Fosas de la Guerra Civil y el franquismo | RTVE.es",
    description:
      "Listado de fosas de la Guerra Civil y el franquismo en España. Proyecto RTVE.es",
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
    <div>
      <JsonLdScript jsonLd={breadcrumbJsonLd} />
      <JsonLdScript jsonLd={webPageJsonLd} />
      <main>
        <IntroUnified />
      </main>
    </div>
  );
}
