"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Creditos from "../../components/common/Creditos";
import ModuloNoticias from "../../components/common/ModuloNoticias";
import ModuloReportajes from "../../components/common/ModuloReportajes";
import SobreProyecto from "../../components/common/SobreProyecto";
import ListadoSEO from "../../components/common/ListadoSEO";
import HamburgerMenu from "../../components/HamburgerMenu/HamburgerMenu";
import MenuSwitch from "../../components/common/MenuSwitch";
import VideoScroll from "../../components/VideoScroll/VideoScroll";
import MapaBuscadorFosas from "../../components/MapaBuscadorFosas/MapaBuscadorFosas";
import "../styles/_historias.scss";

function FosasPageContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Obtener parámetros de URL para ubicación específica
  const [urlParams, setUrlParams] = useState({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setUrlParams({
        ccaa: params.get("ccaa"),
        provincia: params.get("provincia"),
        municipio: params.get("municipio"),
        fosa: params.get("fosa"),
      });
    }
  }, []);

  const handleMenuNavigation = (page) => {
    if (page === "historias") {
      router.push("/historias");
    } else if (page === "fosas") {
      router.push("/mapa");
    }
  };

  // Configuración de cards que aparecen durante el video
  const videoCards = [
    {
      content: "",
      showAt: 0,
      hideAt: 5,
      visible: false
    },
    {
      content: "Más de 20.000 víctimas siguen en cementerios, cunetas y pozos",
      showAt: 5,
      hideAt: 10,
      background: 'rgba(255,255,255,0.9)',
      fontSize: '20px',
      fontWeight: 'bold'
    },
    {
      content: "Descubre las 6.000 fosas de España y recupera la memoria de las víctimas",
      showAt: 10,
      hideAt: 17,
      background: 'rgba(255,255,255,0.9)',
      fontSize: '18px'
    }
  ];

  return (
    <main>
      <VideoScroll 
        duration={23} 
        cards={videoCards}
      >
        {/* Contenido del mapa */}
        <section className="buscador-mapa-fosas">
          <MenuSwitch
            onOpenMenu={() => setMenuOpen(true)}
            onNavigate={handleMenuNavigation}
          />
          <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

          {/* Componente principal del buscador de fosas */}
          <MapaBuscadorFosas
            ccaa={urlParams.ccaa}
            provincia={urlParams.provincia}
            municipio={urlParams.municipio}
            fosa={urlParams.fosa}
          />

          {/* Contenido informativo */}
          <div className="buscador-intro">
            <h2 className="buscador-intro__title">Buscador de fosas</h2>
            <p className="buscador-intro__text">
              La Guerra Civil y el franquismo convirtieron a España en una gran
              fosa común. En las últimas décadas se han exhumado los restos de más
              de 18.000 víctimas. Se estima que más de 20.000 siguen en
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
              Este es el primer mapa audiovisual de las fosas de la Guerra Civil y
              el franquismo, donde puedes descubrir las 6.000 fosas de España y
              recuperar la memoria de algunas de las víctimas. Una parte de la
              historia que yace aún en la tierra.
              <br />
              <br />
              1. No importa la coordenada: en España no es posible estar a más de
              X kilómetros de una fosa común. Algunas contienen los restos de
              miles de personas; otras son enterramientos individuales.
              <br />
              2. Uno de cada XX municipios españoles tiene en su terreno al menos
              una fosa de la Guerra Civil o el franquismo. Se han exhumado 1.300
              de las 6.000 registradas actualmente.
              <br />
              3. La exhumación en Priaranza del Bierzo (León) en el año 2000 marcó
              un hito en la preservación de la memoria democrática. Desde entonces
              se han recuperado los restos de más de 18.000 personas, de las
              cuales solo se han podido identificar unas 700.
              <br />
              4. A medida que continúan las prospecciones, el número de fosas
              sigue aumentando. Es probable que algunos de los desaparecidos no se
              lleguen a encontrar nunca.
            </p>
          </div>

          <ModuloReportajes />
          <ModuloNoticias />
          <SobreProyecto />
          <Creditos />
          <ListadoSEO />
        </section>
      </VideoScroll>
    </main>
  );
}

export default function FosasPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <FosasPageContent />
    </Suspense>
  );
}