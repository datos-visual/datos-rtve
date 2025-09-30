"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Creditos from "../../components/common/Creditos";
import MenuSwitch from "../../components/common/MenuSwitch";
import ModuloNoticias from "../../components/common/ModuloNoticias";
import ModuloReportajes from "../../components/common/ModuloReportajes";
import SobreElProyecto from "../../components/common/SobreProyecto";
import HamburgerMenu from "../../components/HamburgerMenu/HamburgerMenu";
import MapaHistorias from "../../components/MapaHistorias/MapaHistorias";
import "../../app/styles/_historias.scss";
import ListadoSEO from "@/components/common/ListadoSEO";

export default function HistoriasPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const searchParams = useSearchParams();
  const [categoriaInicial, setCategoriaInicial] = useState("todas");

  useEffect(() => {
    const categoriaFromUrl = searchParams.get("categoria");
    if (categoriaFromUrl) {
      console.log('📍 HistoriasPage - Categoría desde URL:', categoriaFromUrl);
      setCategoriaInicial(categoriaFromUrl);
    }
  }, [searchParams]);

  return (
    <main>
      <section className="historias">
        <MenuSwitch onOpenMenu={() => setMenuOpen(true)} />
        <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

        <section style={{ width: "100%" }}>
          <MapaHistorias key={categoriaInicial} initialCategoria={categoriaInicial} />
        </section>
        <div className="historias-intro">
          <h2 className="historias-intro__title">Historias</h2>
          <p className="historias-intro__text">
            Lorem Ipsum is that it has a more-or-less normal distribution of
            there, making it look like readable English. Many desktop publishing
            packages and web page editors now use Lorem Ipsum as etters, as
            opposed to using 'Content here, content here', making it look like
            readable English. Many desktop publishing package and web page
            editors now use Lorem Ipsum as their default model te. Search for
            'lorem ipsum' will uncover many web sites al distribution of
            letters, as opposed to using 'Content here, content here', making it
            look like readable English. Many desktop publishing packages and web
            page editors now use Lorem Ipsum as their default model text, and a
            search for 'lorem ipsum' will uncover many web sites
          </p>
        </div>
        <ModuloReportajes />
        <ModuloNoticias />
        <SobreElProyecto />
        <Creditos />
      </section>
    </main>
  );
}
