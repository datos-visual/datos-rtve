"use client";

import { useEffect, useState } from "react";
import MapaBuscadorFosas from "../../../components/MapaBuscadorFosas/MapaBuscadorFosas";
import styles from "./MapaEmbed.module.scss";

export default function MapaEmbed() {
  const [loaded, setLoaded] = useState(false);
  const [fosas, setFosas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargarDatos() {
      try {
        // Importación dinámica para evitar problemas en SSR
        const { cargarFosas } = await import("../../../app/lib/datos.js");
        const datos = await cargarFosas();
        setFosas(datos);
        setLoaded(true);
        setLoading(false);
      } catch (err) {
        setError("Error al cargar los datos del mapa");
        setLoading(false);
      }
    }

    cargarDatos();
  }, []);

  // Detectar parámetros de URL para posible preselección
  useEffect(() => {
    if (typeof window !== "undefined" && loaded) {
      const params = new URLSearchParams(window.location.search);
      const ccaa = params.get("ccaa");
      const provincia = params.get("provincia");
      const municipio = params.get("municipio");
      const fosaId = params.get("fosa");

      // Si hay parámetros, podemos hacer algo con ellos
      // Por ejemplo, preseleccionar una fosa o ubicación
    }
  }, [loaded]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando mapa de fosas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className={styles.mapaEmbedContainer}>
      <MapaBuscadorFosas fosas={fosas} />

      <div className={styles.attribution}>
        <a
          href="https://www.rtve.es"
          target="_blank"
          rel="noopener noreferrer"
          title="Ir a RTVE.es"
        >
          Mapa de Fosas © RTVE
        </a>
      </div>
    </div>
  );
}
